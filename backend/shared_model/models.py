from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.conf import settings
from django.utils.timezone import now
from fernet_fields import EncryptedCharField, EncryptedDateField, EncryptedIntegerField, EncryptedTextField, EncryptedDateTimeField
from django.contrib.auth import get_user_model
from shared_model.storage import EncryptedFileSystemStorage
from datetime import date

#para ni sa file encryption sa mga filepath
encrypted_storage = EncryptedFileSystemStorage()

CIVIL_STATUS_CHOICES = [
        ('SINGLE', 'Single'),
        ('MARRIED', 'Married'),
        ('WIDOWED', 'Widowed'),
        ('SEPARATED', 'Separated'),
        ('DIVORCED', 'Divorced'),
    ]

# for address
class Province(models.Model):  
    name = models.CharField(max_length=150, unique=True)

    def __str__(self):
        return self.name

class Municipality(models.Model):
    name = models.CharField(max_length=150)
    province = models.ForeignKey(Province, on_delete=models.CASCADE, related_name="municipalities")

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["province", "name"], name="unique_municipality_per_province")
        ]

    def __str__(self):
        return f"{self.name}, {self.province.name}"

class Barangay(models.Model):
    name = models.CharField(max_length=150)
    municipality = models.ForeignKey(Municipality, on_delete=models.CASCADE, related_name="barangays")

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["municipality", "name"], name="unique_barangay_per_municipality")
        ]

    def __str__(self):
        return f"{self.name}, {self.municipality.name}"
    
class Sitio(models.Model):
    name = models.CharField(max_length=150)
    barangay = models.ForeignKey(Barangay, on_delete=models.CASCADE, related_name="sitios")

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["barangay", "name"], name="unique_sitio_per_barangay")
        ]

    def __str__(self):
        return f"{self.name}, {self.barangay.name}"
    
class Street(models.Model):
    name = models.CharField(max_length=150)
    sitio = models.ForeignKey(Sitio, on_delete=models.CASCADE, related_name="streets")

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["sitio", "name"], name="unique_street_per_sitio")
        ]

    def __str__(self):
        return f"{self.name}, {self.sitio.name}"
    
# all purpose address save all[?]
class Address(models.Model):
    province = models.ForeignKey("Province", on_delete=models.PROTECT, null=True, blank=True)
    municipality = models.ForeignKey("Municipality", on_delete=models.PROTECT, null=True, blank=True)
    barangay = models.ForeignKey("Barangay", on_delete=models.PROTECT, null=True, blank=True)
    sitio = models.CharField(max_length=150, null=True, blank=True)
    street = models.CharField(max_length=150, null=True, blank=True)    
     
    def __str__(self):
        parts = [str(x) for x in [self.street, self.sitio, self.barangay, self.municipality, self.province] if x]
        return ", ".join(parts)

#=============================  SYSTEM USER ==============================
class Official(models.Model):
    ROLE_CHOICES = [
        ('DSWD', 'DSWD'),
        ('Social Worker', 'Social Worker'),
        ('Nurse', 'Nurse'),
        ('Psychometrician', 'Psychometrician'),
        ('Home Life', 'Home Life'),

    ]   

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="official", null=True, blank=True)
    of_id = models.AutoField(primary_key=True)
    of_fname = EncryptedCharField(max_length=255)
    of_lname = EncryptedCharField(max_length=255)
    # of_email = models.CharField(max_length=100, blank=True, null=True)
    of_email = EncryptedCharField(max_length=255, blank=True, null=True)
    of_m_initial = EncryptedCharField(max_length=255, null=True, blank=True)
    of_suffix = EncryptedCharField(max_length=255, null=True, blank=True)
    of_sex = EncryptedCharField(max_length=255, null=True, blank=True)
    of_dob = EncryptedDateField(null=True, blank=True)
    of_pob = EncryptedCharField(max_length=255, null=True, blank=True)
    of_contact = EncryptedCharField(max_length=255, null=True, blank=True)
    of_role = models.CharField(max_length=50, choices=ROLE_CHOICES, blank=True, null=True)
    of_specialization = EncryptedCharField(max_length=255, null=True, blank=True)
    of_photo = models.ImageField(upload_to='photos/', null=True, blank=True)
    status = models.CharField(max_length=25, choices=STATUS_CHOICES, default="pending")

    address = models.ForeignKey(Address, on_delete=models.SET_NULL, related_name="official_address", null=True, blank=True)

    #where na baranggay assigned
    of_assigned_barangay = models.ForeignKey(Barangay, on_delete=models.PROTECT, related_name="assigned_officials", null=True, blank=True)

    #para sa soft deletion
    deleted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.of_fname} {self.of_lname}"
    
    @property
    def is_archived(self):
        return self.deleted_at is not None

    @property
    def full_name(self):
        parts = [self.of_fname]
        if self.of_m_initial:
            parts.append(f"{self.of_m_initial}.")
        parts.append(self.of_lname)
        if self.of_suffix:
            parts.append(self.of_suffix)
        return " ".join(parts)


class OfficialFaceSample(models.Model):
    official = models.ForeignKey(Official, on_delete=models.CASCADE, related_name='face_samples')
    photo = models.ImageField(upload_to='face_samples/', storage=encrypted_storage)
    embedding = ArrayField(models.FloatField(), null=True, blank=True)

    def __str__(self):
        return f"FaceSample for {self.official.full_name}"

# =================== OFFICIAL SCHEDULING =====================

class OfficialAvailability(models.Model):
    """
    Defines the recurring preferred working hours per day for each Social Worker 
    Used by Desk Officers to check when officials are available to handle sessions.
    """
    DAY_CHOICES = [
        ("Monday", "Monday"),
        ("Tuesday", "Tuesday"),
        ("Wednesday", "Wednesday"),
        ("Thursday", "Thursday"),
        ("Friday", "Friday"),
        ("Saturday", "Saturday"),
        ("Sunday", "Sunday"),
    ]

    official = models.ForeignKey("Official", on_delete=models.CASCADE, related_name="availabilities")
    day_of_week = models.CharField(max_length=10, choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    remarks = models.CharField(max_length=200, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("official", "day_of_week", "start_time", "end_time")
        ordering = ["official", "day_of_week", "start_time"]

    def __str__(self):
        return f"{self.official.full_name} - {self.day_of_week} ({self.start_time}–{self.end_time})"

class OfficialUnavailability(models.Model):
    """
    Records manual updates where an Official marks themselves unavailable for a range of dates.
    Example: Sick Leave, Holiday, Seminar, etc.
    """
    official = models.ForeignKey("Official", on_delete=models.CASCADE, related_name="unavailabilities")
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.CharField(max_length=100, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ["-start_date"]

    def __str__(self):
        return f"{self.official.full_name} unavailable {self.start_date}–{self.end_date} ({self.reason})"

#==================================

class AuditLog(models.Model):
    ACTION_CHOICES = [
        ("deactivate", "Deactivate"),
        ("reactivate", "Reactivate"),
        ("archive", "Archive"),
        ("update", "Update"),
    ]
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=32, choices=ACTION_CHOICES)
    target_model = models.CharField(max_length=128)
    target_id = models.CharField(max_length=64)
    reason = models.TextField(null=True, blank=True)
    changes = models.JSONField(default=dict, blank=True)  # {field: [old, new]}
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        actor_name = self.get_actor_name()
        target_label = self.get_target_label()
        return f"{self.action.title()} on {target_label} by {actor_name} @ {self.created_at:%Y-%m-%d %H:%M}"

    # --- Helper methods ---
    #para ni sa kinsa nga official ang ga edit
    def get_actor_name(self):
        """Get full name of actor if available."""
        if self.actor and hasattr(self.actor, "official"):
            official = self.actor.official
            if hasattr(official, "full_name"):
                return official.full_name
            return f"{official.of_fname} {official.of_lname}"
        return getattr(self.actor, "username", "Unknown")

    #kani kay kung kinsa nga official ang gi edit
    def get_target_label(self):
        """
        Get a readable label for the target object.
        If it's an Official, return full name.
        Otherwise, return ModelName(ID).
        """
        try:
            #  Example for 'Official' target
            if self.target_model.lower() == "official":
                from shared_model.models import Official
                off = Official.objects.only("of_fname", "of_lname").get(pk=int(self.target_id))
                full_name = getattr(off, "full_name", f"{off.of_fname} {off.of_lname}")
                return f"Official {full_name} (ID: {off.pk})"

            #  Example if you later want to add support for Victim
            elif self.target_model.lower() == "victim":
                from shared_model.models import Victim
                vic = Victim.objects.only("vi_fname", "vi_lname").get(pk=int(self.target_id))
                full_name = getattr(vic, "full_name", f"{vic.vi_fname} {vic.vi_lname}")
                return f"Victim {full_name} (ID: {vic.pk})"

        except Exception:
            pass

        # Default fallback
        return f"{self.target_model}({self.target_id})"

    class Meta:
        verbose_name = "Audit Log"
        verbose_name_plural = "Audit Logs"

#==================================================================================================

# starting here is for forms
class Victim(models.Model): 
    CIVIL_STATUS_CHOICES = [
        ('SINGLE', 'Single'),
        ('MARRIED', 'Married'),
        ('WIDOWED', 'Widowed'),
        ('SEPARATED', 'Separated'),
        ('DIVORCED', 'Divorced'),
    ]

    EDUCATIONAL_ATTAINMENT_CHOICES = [
        ('No Formal Education', 'No Formal Education'),
        ('Elementary Level/Graduate', 'Elementary Level/Graduate'),
        ('Junior High School Level/Graduate', 'Junior High School Level/Graduate'),
        ('Senior High School Level/Graduate', 'Senior High School Level/Graduate'),
        ('Technical/Vocational', 'Technical/Vocational'),
        ('College Level/Graduate', 'College Level/Graduate'),
        ('Post graduate', 'Post graduate'),
    ]
    
    RELIGION_CHOICES = [
        ('Roman Catholic', 'Roman Catholic'),
        ('Islam', 'Islam'),
        ('Evangelicals', 'Evangelicals'),
        ('Protestant', 'Protestant'),
        ('Iglesia ni Cristo', 'Iglesia ni Cristo'),
        ('Others', 'Others'),
    ]
    
    # user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="victim", null=True, blank=True)
    vic_id = models.AutoField(primary_key=True)
    vic_first_name = EncryptedCharField(max_length=512)
    vic_middle_name = EncryptedCharField(max_length=512, blank=True, null=True)
    vic_last_name = EncryptedCharField(max_length=512)
    vic_extension = EncryptedCharField(max_length=512, blank=True, null=True)
    vic_alias = EncryptedCharField(max_length=512, blank=True, null=True)
    vic_sex = EncryptedCharField(max_length=512, default='Female')
    vic_birth_date = EncryptedDateField( null=True, blank=True)
    vic_birth_place = EncryptedCharField(max_length=512, null=True, blank=True)

    vic_civil_status = EncryptedCharField(max_length=512, choices=CIVIL_STATUS_CHOICES, default='SINGLE')
    vic_religion = EncryptedCharField(max_length=512, choices=RELIGION_CHOICES, default='Roman Catholic')
    vic_educational_attainment = EncryptedCharField(max_length=512, choices=EDUCATIONAL_ATTAINMENT_CHOICES, default='No Formal Education')
    vic_last_school_attended = EncryptedCharField(max_length=512, null=True, blank=True)
    vic_last_school_address = EncryptedCharField(max_length=512, null=True, blank=True)
    vic_occupation = EncryptedCharField(max_length=512, blank=True, null=True)
    vic_income = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    vic_skills = EncryptedCharField(max_length=512, blank=True, null=True)
    vic_contact_number = EncryptedCharField(max_length=512, blank=True, null=True)
    vic_provincial_address = EncryptedCharField(max_length=512, blank=True, null=True)
    
    # present address
    address = models.ForeignKey(Address, on_delete=models.SET_NULL, related_name="victim_address", null=True, blank=True)

    vic_account = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True
    )
    # Profile photo (first photo uploaded)
    vic_photo = models.ImageField(upload_to='victim_photos/', null=True, blank=True, storage=encrypted_storage)

    def __str__(self):
        return self.vic_last_name
    @property
    def full_name(self):
        parts = [self.vic_first_name, self.vic_middle_name, self.vic_last_name, self.vic_extension]
        return " ".join(filter(None, parts))
 
class VictimFaceSample(models.Model):
    victim = models.ForeignKey(Victim, on_delete=models.CASCADE, related_name="face_samples")
    photo = models.ImageField(upload_to='victim_face_samples/', storage=encrypted_storage)
    embedding = ArrayField(models.FloatField(), null=True, blank=True)

    def __str__(self):
        return f"FaceSample for {self.victim.vic_first_name} {self.victim.vic_last_name}"

class Perpetrator(models.Model):
    EDUCATIONAL_ATTAINMENT_CHOICES = [
        ('No Formal Education', 'No Formal Education'),
        ('Elementary Level/Graduate', 'Elementary Level/Graduate'),
        ('Junior High School Level/Graduate', 'Junior High School Level/Graduate'),
        ('Senior High School Level/Graduate', 'Senior High School Level/Graduate'),
        ('Technical/Vocational', 'Technical/Vocational'),
        ('College Level/Graduate', 'College Level/Graduate'),
        ('Post graduate', 'Post graduate'),
    ]
    
    perp_id = models.AutoField(primary_key=True)
    per_first_name = EncryptedCharField(max_length=512, blank=True, null=True)
    per_middle_name = EncryptedCharField(max_length=255, blank=True, null=True)
    per_last_name = EncryptedCharField(max_length=512, blank=True, null=True)
    per_extension = EncryptedCharField(max_length=512, blank=True, null=True)
    per_alias = EncryptedCharField(max_length=512, blank=True, null=True)
    per_sex = EncryptedCharField(max_length=255, choices=[
        ('Male', 'Male'),
        ('Female', 'Female')
    ], blank=True, null=True)
    per_birth_date = EncryptedDateField(blank=True, null=True)
    per_birth_place = EncryptedCharField(max_length=512, blank=True, null=True)
    per_religion = EncryptedCharField(max_length=255, blank=True, null=True)
    per_victim_relationship = EncryptedCharField(max_length=255, blank=True, null=True)
    per_educational_attainment = EncryptedCharField(max_length=512, choices=EDUCATIONAL_ATTAINMENT_CHOICES, default='No Formal Education')
    # per_known_address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, blank=True)
    per_contact_number = EncryptedCharField(max_length=512, blank=True, null=True)
    per_occupation = EncryptedCharField(max_length=512, blank=True, null=True)

    def __str__(self):
        return f"{self.per_last_name}, {self.per_first_name}"
  
class ContactPerson(models.Model):
    cont_fname = EncryptedCharField(max_length=512, blank=True, null=True)
    cont_mname = EncryptedCharField(max_length=255, blank=True, null=True)
    cont_lname = EncryptedCharField(max_length=512, blank=True, null=True)
    cont_ext = EncryptedCharField(max_length=512, blank=True, null=True)
    cont_sex = EncryptedCharField(max_length=255, choices=[
        ('Male', 'Male'),
        ('Female', 'Female')
    ], blank=True, null=True)
    cont_birth_date = EncryptedDateField(blank=True, null=True)
    cont_birth_place = EncryptedCharField(max_length=512, blank=True, null=True)
    cont_civil_status = EncryptedCharField(max_length=512, choices=CIVIL_STATUS_CHOICES, default='SINGLE')
    cont_victim_relationship = EncryptedCharField(max_length=255, blank=True, null=True)
    cont_contact_number = EncryptedCharField(max_length=512, blank=True, null=True)
    # cont_prov_address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, blank=True)
    # cont_work_address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, blank=True)

    # new FK to IncidentInformation
    incident = models.ForeignKey("IncidentInformation", on_delete=models.CASCADE, related_name="contact_persons")

class IncidentInformation(models.Model): #Case in the frontend
    VIOLENCE_TYPE = [
        ('Physical Violence', 'Physical Violence'),
        ('Physical Abused', 'Physical Abused'),
        ('Psychological Violence', 'Psychological Violence'),
        ('Psychological Abuse', 'Psychological Abuse'),
        ('Economic Abused', 'Economic Abused'),
        ('Strandee', 'Strandee'),
        ('Sexually Abused', 'Sexually Abused'),
        ('Sexually Exploited', 'Sexually Exploited'),
    ]
    
    INCIDENT_CHOICES = [
        ('Pending','Pending'),
        ('Ongoing','Ongoing'),
        ('Done','Done'),
    ]
    
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    incident_id = models.AutoField(primary_key=True)
    incident_num = EncryptedIntegerField(null=True,blank=True) #case number 1,2,3...
    incident_status= EncryptedCharField(max_length=512, choices=INCIDENT_CHOICES,default='Pending') #case status
    violence_type = EncryptedCharField(max_length=512, choices=VIOLENCE_TYPE, null=True, blank=True)
    violence_subtype = EncryptedCharField(max_length=512, null=True, blank=True)

    incident_date = EncryptedDateField(blank=True, null=True)
    incident_time = models.TimeField(blank=True, null=True)
    incident_location = EncryptedCharField(max_length=512, blank=True, null=True) # Specific landmark (like near jollibee)
    incident_description = EncryptedTextField(blank=True, null=True) # will act as 'problem presented'
    incident_observations_about_survivor = EncryptedTextField(blank=True, null=True)
    incident_circumstances = EncryptedTextField(blank=True, null=True)
    incident_recommendation = EncryptedTextField(blank=True, null=True)

    # foreign keys
    vic_id = models.ForeignKey(Victim, on_delete=models.CASCADE, related_name='incidents')
    perp_id = models.ForeignKey(Perpetrator, on_delete=models.CASCADE,to_field='perp_id', related_name='related_incidents',null=True, blank=True)
    of_id = models.ForeignKey(Official, on_delete=models.SET_NULL, related_name='handled_incidents', null=True, blank=True)
    
    # for address
    province = models.ForeignKey("province", on_delete=models.PROTECT, related_name="incidents", blank=True, null=True)
    municipality = models.ForeignKey("Municipality", on_delete=models.PROTECT, related_name="incidents", blank=True, null=True)
    barangay = models.ForeignKey("Barangay", on_delete=models.PROTECT, related_name="incidents", blank=True, null=True)
    sitio = models.ForeignKey("Sitio", on_delete=models.PROTECT, related_name="incidents", blank=True, null=True)
    street = models.ForeignKey("Street", on_delete=models.SET_NULL, related_name="incidents", null=True, blank=True)


    def save(self, *args, **kwargs):
        # Auto-assign case number if not already set
        if not self.incident_num and self.vic_id_id:
            last_case_num = (
                IncidentInformation.objects
                .filter(vic_id=self.vic_id)
                .order_by("-incident_num")
                .values_list("incident_num", flat=True)
                .first()
            )
            self.incident_num = (last_case_num or 0) + 1

        # Auto-fill hierarchy (same as before)
        if self.street:
            self.sitio = self.street.sitio
            self.barangay = self.street.sitio.barangay
            self.municipality = self.street.sitio.barangay.municipality
            self.city = self.street.sitio.barangay.municipality.province
        elif self.sitio:
            self.barangay = self.sitio.barangay
            self.municipality = self.sitio.barangay.municipality
            self.city = self.sitio.barangay.municipality.province
        elif self.barangay:
            self.municipality = self.barangay.municipality
            self.city = self.barangay.municipality.province
        elif self.municipality:
            self.city = self.municipality.province

        #  Auto-generate victim-specific case number
        if not self.incident_num and self.vic_id:
            # Get the last incident for this victim
            last_incident = (
                IncidentInformation.objects
                .filter(vic_id=self.vic_id)
                .order_by('-incident_num')
                .first()
            )

            # If victim has previous cases, increment, otherwise start at 1
            next_num = (last_incident.incident_num + 1) if last_incident and last_incident.incident_num else 1
            self.incident_num = next_num
        
        super().save(*args, **kwargs)


    def clean(self):
        """Ensure location hierarchy is consistent"""
        from django.core.exceptions import ValidationError
        if self.street and self.sitio and self.street.sitio != self.sitio:
            raise ValidationError("Street must belong to the selected Sitio.")
        if self.sitio and self.barangay and self.sitio.barangay != self.barangay:
            raise ValidationError("Sitio must belong to the selected Barangay.")
        if self.barangay and self.municipality and self.barangay.municipality != self.municipality:
            raise ValidationError("Barangay must belong to the selected Municipality.")
        if self.municipality and self.city and self.municipality.city != self.city:
            raise ValidationError("Municipality must belong to the selected City.")

    def __str__(self):
        return f"Incident {self.incident_id}"

class PhysicalDescription(models.Model):
    pass

class FamilyMember(models.Model):
    fam_fname = models.CharField(max_length=50, blank=True, null=True)
    fam_mname = models.CharField(max_length=50, blank=True, null=True)
    fam_lname = models.CharField(max_length=50, blank=True, null=True)
    fam_extension = models.CharField(max_length=50, blank=True, null=True)
    fam_birth_date = models.DateField( null=True, blank=True)
    fam_sex = models.CharField(max_length=10, null=True, blank=True)
    fam_victim_relationship = models.CharField(max_length=50, null=True, blank=True)
    fam_civil_status = models.CharField(max_length=50, null=True, blank=True)
    fam_educational_attainment = models.CharField(max_length=50, null=True, blank=True)
    fam_occupation = models.CharField(max_length=50, null=True, blank=True)
    fam_income = models.CharField(max_length=50, null=True, blank=True)

    # foreign key
    victim = models.ForeignKey(Victim, on_delete=models.CASCADE, blank=True, null=True) 

class Evidence(models.Model):
    incident = models.ForeignKey(
        "IncidentInformation",
        on_delete=models.CASCADE,
        related_name="evidences"
    )
    file = models.FileField(upload_to="incident_evidences/", storage=encrypted_storage)
    description = EncryptedTextField(blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Evidence {self.id} for Incident {self.incident_id}"
    
#=======================================REPORT================================== 
class MonthlyProgressReport(models.Model):
    REPORT_TYPE_CHOICES = [
        ("Nurse", "Nurse"),
        ("Psychometrician", "Psychometrician"),
        ("Social Worker", "Social Worker"),
    ]

    victim = models.ForeignKey(Victim, on_delete=models.CASCADE, related_name="monthly_reports")
    incident = models.ForeignKey(IncidentInformation, on_delete=models.CASCADE, related_name="monthly_reports")
    report_month = models.DateField()
    report_type = models.CharField(max_length=50, choices=REPORT_TYPE_CHOICES)
    prepared_by = models.ForeignKey(Official, on_delete=models.SET_NULL, null=True, blank=True)

    # Auto-filled victim info
    name = models.CharField(max_length=255)
    sex = models.CharField(max_length=50)
    age = models.IntegerField(null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)

    # Structured medical metrics
    height = models.CharField(max_length=50, blank=True, null=True)
    weight = models.CharField(max_length=50, blank=True, null=True)
    bmi = models.CharField(max_length=50, blank=True, null=True)
    bmi_category = models.CharField(max_length=50, blank=True, null=True)

    # Unified medical summary
    report_info = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.victim:
            self.name = self.victim.full_name
            self.sex = self.victim.vic_sex
            self.date_of_birth = self.victim.vic_birth_date
            if self.victim.vic_birth_date:
                today = date.today()
                self.age = (
                    today.year - self.victim.vic_birth_date.year -
                    ((today.month, today.day) < (self.victim.vic_birth_date.month, self.victim.vic_birth_date.day))
                )

        # Auto-calculate BMI category
        try:
            h = float(self.height)
            w = float(self.weight)
            if self.height and self.weight and self.bmi:
                height_m = h / 100 if self.heightUnit == "cm" else h * 0.3048
                weight_kg = w if self.weightUnit == "kg" else w * 0.453592
                bmi_val = weight_kg / (height_m * height_m)

                if self.age and self.age >= 18:
                    if bmi_val < 18.5:
                        self.bmi_category = "Underweight"
                    elif bmi_val < 25:
                        self.bmi_category = "Normal"
                    elif bmi_val < 30:
                        self.bmi_category = "Overweight"
                    else:
                        self.bmi_category = "Obese"
                else:
                    self.bmi_category = "Age-based BMI not classified"
        except Exception:
            self.bmi_category = None

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.report_type} Report for {self.name} - {self.report_month.strftime('%B %Y')}"

    
#=======================================SESSSION================================== 
class SessionType(models.Model):
    SESSION_TYPES = [
        ('Intake / Initial Assessment', 'Intake / Initial Assessment'),
        ('Case Study / Psychosocial Assessment', 'Case Study / Psychosocial Assessment'),
        ('Intervention Planning / Case Conference', 'Intervention Planning / Case Conference'),
        ('Family Counseling / Reintegration', 'Family Counseling / Reintegration'),
        ('Pyschological Evaluation', 'Pyschological Evaluation'),
        ('Legal Assistance Session', 'Legal Assistance Session'),
        ('Counseling', 'Counseling'),
        ('Follow-up / After Care', 'Follow-up / After Care'),
        ('Termination / Discharge Planning', 'Termination / Discharge Planning'),
        ('Others', 'Others'),
    ]

    name = models.CharField(max_length=100, choices=SESSION_TYPES)

    def __str__(self):
        return self.name

class Session(models.Model):

    SESSION_STAT =[
        ('Pending', 'Pending'),
        ('Ongoing', 'Ongoing'), 
        ('Done', 'Done'),
    ]
    
    sess_id = models.AutoField(primary_key=True)
    sess_num = models.IntegerField(null=True, blank=True)
    sess_status = models.CharField(max_length=512,choices=SESSION_STAT, default='Pending') 
    sess_next_sched = models.DateTimeField(null=True, blank=True) # if scheduled session
    sess_date_today = models.DateTimeField(null=True, blank=True)   #if start now
    sess_location = models.CharField(max_length=512, null=True, blank=True)
    sess_description = models.TextField(null=True, blank=True)
    
    
    # foreign key
    incident_id = models.ForeignKey(IncidentInformation, on_delete=models.CASCADE, related_name='sessions',null=True, blank=True)
    assigned_official = models.ManyToManyField(Official,through='SessionProgress',related_name='official_sessions')
    sess_type = models.ManyToManyField("SessionType", related_name= "sessions")
    
    def all_officials_done(self):
        return not self.progress.filter(is_done=False).exists()

    def __str__(self):
        victim_name = (
            f"{self.incident_id.vic_id.vic_last_name}, {self.incident_id.vic_id.vic_first_name}"
            if self.incident_id and self.incident_id.vic_id
            else "No Victim"
        )
        return f"Session {self.sess_id} - Victim: {victim_name}" 

class SessionProgress(models.Model):
    session = models.ForeignKey('Session', on_delete=models.CASCADE, related_name='progress')
    official = models.ForeignKey('Official', on_delete=models.CASCADE)
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    is_done = models.BooleanField(default=False)

    class Meta:
        unique_together = ('session', 'official')

    def __str__(self):
        return f"{self.official} - {self.session} ({'Done' if self.is_done else 'Pending'})"

#=====Question=====
class QuestionCategory(models.Model):
    """Defines category labels for questions, separated by official role."""
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    role = models.CharField(max_length=50, choices=Official.ROLE_CHOICES)  # reuse roles from Official
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "Question Categories"
        ordering = ["role", "name"]
        unique_together = ("name", "role")

    def __str__(self):
        return f"{self.name} ({self.role})"
  
class Question(models.Model):
    """Holds all questions created by officials, grouped by category and role."""
    ANSWER_TYPES = [
        ('Yes/No', 'Yes/No'),
        ('Text', 'Text'),
    ]

    ques_id = models.AutoField(primary_key=True)
    role = models.CharField(max_length=50,choices=Official.ROLE_CHOICES,null=True,blank=True,help_text="Auto-set from creator’s role.")
    ques_category = models.ForeignKey(QuestionCategory,on_delete=models.SET_NULL,null=True,blank=True,related_name="questions")
    ques_question_text = models.TextField(null=True, blank=True)
    ques_answer_type = models.CharField(max_length=512, choices=ANSWER_TYPES, null=True, blank=True)
    ques_is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=now)
    created_by = models.ForeignKey("Official",on_delete=models.SET_NULL,null=True,blank=True,related_name="created_questions")

    def __str__(self):
        category_name = self.ques_category.name if self.ques_category else "Uncategorized"
        text = (self.ques_question_text or "")[:50]
        return f"[{category_name}] {text}"

class SessionTypeQuestion(models.Model):
    session_number = models.IntegerField()  # 1, 2, 3, 4, 5...
    #Fk
    session_type = models.ForeignKey(SessionType, on_delete=models.CASCADE, related_name="type_questions")
    question = models.ForeignKey('Question', on_delete=models.CASCADE, related_name="type_questions")

    class Meta:
        unique_together = ('session_number', 'session_type', 'question')

class SessionQuestion(models.Model):
    sq_id = models.AutoField(primary_key=True)
    sq_is_required = models.BooleanField(default=False)

    

     # For ad-hoc custom questions
    sq_custom_text = models.TextField(null=True, blank=True)
    sq_custom_answer_type = models.CharField(max_length=512, choices=Question.ANSWER_TYPES, null=True, blank=True)

    # Immutable snapshots of the original Question at the time of hydration
    sq_question_text_snapshot = models.TextField(null=True, blank=True)
    sq_answer_type_snapshot = models.CharField(max_length=512, null=True, blank=True)

    # Direct answer fields
    sq_value = models.TextField(null=True, blank=True)
    sq_note = models.TextField(null=True, blank=True)
    
     # Who answered this question (nullable for unanswered)
    answered_by = models.ForeignKey('Official', on_delete=models.SET_NULL, null=True, blank=True, related_name='answered_session_questions')
    answered_at = models.DateTimeField(null=True, blank=True)
    #foreign keys
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='session_questions')
    question = models.ForeignKey(Question, on_delete=models.PROTECT, related_name='session_questions', null=True, blank=True)

    class Meta:
        unique_together = ('session', 'question')


    def __str__(self):
        text = self.sq_question_text_snapshot or (
            self.question.ques_question_text if self.question else "Custom Question"
        )
        return f"Session {self.session.sess_id} - {text[:50]} -> {self.sq_value or 'No answer'}"

#logging
class ChangeLog(models.Model):
    """
    Tracks all administrative changes in the system.
    Records who made a change, what model/record was affected,
    what kind of action occurred, and a short description.
    """

    ACTION_TYPES = [
        ("CREATE", "Create"),
        ("UPDATE", "Update"),
        ("DELETE", "Deactivate/Activate"),
        ("ASSIGN", "Assign/Reassign"),
    ]

    # Who made the change (Official, usually DSWD Admin)
    user = models.ForeignKey(
        "Official",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="change_logs"
    )

    # The affected model name, e.g. "Question", "SessionTypeQuestion"
    model_name = models.CharField(max_length=100)

    # The primary key of the affected record
    record_id = models.IntegerField()

    # The type of action taken
    action = models.CharField(max_length=20, choices=ACTION_TYPES)

    # Short text summary (e.g., “Deactivated Question 15”, “Changed category from X to Y”)
    description = models.TextField(blank=True, null=True)

    # Optional: store before/after snapshot (JSON) for deep audit
    old_data = models.JSONField(null=True, blank=True)
    new_data = models.JSONField(null=True, blank=True)

    # When the change occurred
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        user_name = self.user.full_name if self.user else "System"
        return f"[{self.model_name}] {self.action} by {user_name}"

#        ====Service====
class ServiceCategory(models.Model):
    CATEGORY_CHOICES = [
        ("Protection Services", "Protection Services"),
        ("Legal Assistance", "Legal Assistance"),
        ("Psycho-Social Services", "Psycho-Social Services"),
        ("Medical Services", "Medical Services"),
        ("Livelihood and Employment Assistance", "Livelihood and Employment Assistance"),
        ("Other Institutions", "Other Institutions"),
    ]
    name = models.CharField(max_length=100, choices=CATEGORY_CHOICES, unique=True)

    def __str__(self):
        return self.name

class Services(models.Model):
    serv_id = models.AutoField(primary_key=True)


    name = models.CharField(max_length=100, default="service")  # org/dept name
    contact_person = models.CharField(max_length=100, default="contact person")
    contact_number = models.CharField(max_length=100, default="contact number")
    is_active = models.BooleanField(default=False)

    #FK
    category = models.ForeignKey(ServiceCategory, on_delete=models.CASCADE, related_name="services")
    # assigned_place = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_place")
    service_address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, blank=True, related_name="service_address")

    def __str__(self):
        return f"{self.name} ({self.category.name})"
    
class ServiceGiven(models.Model):
    SERVICE_STATUS = [
        ('Pending','Pending'),
        ('Done','Done'),
    ]
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name="services_given", null=True, blank=True)
    of_id = models.ForeignKey(Official, on_delete=models.SET_NULL, null=True, blank=True)
    serv_id = models.ForeignKey(Services, on_delete=models.SET_NULL, null=True, blank=True)

    service_pic = models.ImageField(upload_to='service_forms/', null=True, blank=True) 
    service_status = models.CharField(max_length=20, choices=SERVICE_STATUS, default='Pending')
    service_feedback = models.TextField(null=True, blank=True, help_text="Remarks or feedback about the service given")
    def __str__(self):
        return f"{self.serv_id.name if self.serv_id else 'Unknown Service'} for Session {self.session.sess_id}"
#================================================================================= 
User = get_user_model()

class LoginTracker(models.Model):
    STATUS_CHOICES = [
        ("Success", "Success"),
        ("Failed", "Failed"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="login_logs",
        null=True,        #  Allow null for failed logins
        blank=True
    )
    username_attempted = models.CharField(max_length=150, null=True, blank=True)
    role = models.CharField(max_length=50, blank=True, null=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, null=True)
    login_time = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="Success")

    def __str__(self):
        """Readable string for admin and logs."""
        name = self.get_official_name()
        return f"{name} | {self.role or 'Unknown Role'} | {self.status} @ {self.login_time:%Y-%m-%d %H:%M}"

    # -------------------------------
    # 🔽 Helper function at the bottom
    # -------------------------------
    def get_official_name(self):
        """
        Returns linked official's full name if available.
        Falls back to username_attempted or 'Unknown' if user is null.
        """
        try:
            if self.user:
                official = getattr(self.user, "official", None)
                if official and hasattr(official, "full_name"):
                    return official.full_name
                return self.user.username
            elif self.username_attempted:
                return f"{self.username_attempted} (attempted)"
        except Exception:
            pass
        return "Unknown"

    get_official_name.short_description = "Official Name"

    class Meta:
        verbose_name = "Login Tracker"
        verbose_name_plural = "Login Tracker Logs"


