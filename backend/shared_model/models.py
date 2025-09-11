from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.conf import settings

class City(models.Model):
    name = models.CharField(max_length=150, unique=True)

    def __str__(self):
        return self.name

class Municipality(models.Model):
    name = models.CharField(max_length=150)
    city = models.ForeignKey(City, on_delete=models.CASCADE, related_name="municipalities")

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["city", "name"], name="unique_municipality_per_city")
        ]

    def __str__(self):
        return f"{self.name}, {self.city.name}"

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
    
class Official(models.Model):
    ROLE_CHOICES = [
        ('DSWD', 'DSWD'),
        ('VAWDesk', 'VAWDesk'),
        ('Social Worker', 'Social Worker'),
    ]

    # this is the new models for the accept and reject official
    # STATUS_CHOICES = [
    #     ("pending", "Pending"),
    #     ("approved", "Approved"),
    #     ("rejected", "Rejected"),
    # ]

    # status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    
    #change user nga dili modawat ug default ug null kay ako rha ni gi test para sa authorization ug authentication
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="official", null=True, blank=True)
    of_id = models.AutoField(primary_key=True)
    of_fname = models.CharField(max_length=50)
    of_lname = models.CharField(max_length=50)
    of_m_initial = models.CharField(max_length=50, null=True, blank=True)
    of_suffix = models.CharField(max_length=50, null=True, blank=True)
    of_sex = models.CharField(max_length=1, null=True, blank=True)
    of_dob = models.DateField(null=True, blank=True)
    of_pob = models.CharField(max_length=255, null=True, blank=True)
    of_contact = models.CharField(max_length=20, null=True, blank=True)
    of_role = models.CharField(max_length=50, choices=ROLE_CHOICES, blank=True, null=True)
    of_specialization = models.CharField(max_length=100, null=True, blank=True)
    of_photo = models.ImageField(upload_to='photos/', null=True, blank=True)

    city = models.ForeignKey("City", on_delete=models.PROTECT, related_name="officials", null=True, blank=True)
    municipality = models.ForeignKey("Municipality", on_delete=models.PROTECT, related_name="officials", null=True, blank=True)
    barangay = models.ForeignKey("Barangay", on_delete=models.PROTECT, related_name="officials", null=True, blank=True)
    sitio = models.ForeignKey("Sitio", on_delete=models.PROTECT, related_name="officials", null=True, blank=True)
    street = models.ForeignKey("Street", on_delete=models.SET_NULL, null=True, blank=True, related_name="officials") 

    #where na baranggay assigned
    of_assigned_barangay = models.ForeignKey(Barangay, on_delete=models.PROTECT, related_name="assigned_officials", null=True, blank=True)


    def __str__(self):
        return f"{self.of_fname} {self.of_lname}"

    @property
    def full_name(self):
        middle = f"{self.of_m_initial or ''}."
        return f"{self.of_fname} {middle} {self.of_lname} {self.of_suffix or ''}".strip()


class OfficialFaceSample(models.Model):
    official = models.ForeignKey(Official, on_delete=models.CASCADE, related_name='face_samples')
    photo = models.ImageField(upload_to='face_samples/')
    embedding = ArrayField(models.FloatField(), null=True, blank=True)

    def __str__(self):
        return f"FaceSample for {self.official.full_name}"
    
class Victim(models.Model):
    CIVIL_STATUS_CHOICES = [
        ('SINGLE', 'Single'),
        ('MARRIED', 'Married'),
        ('WIDOWED', 'Widowed'),
        ('SEPARATED', 'Separated'),
        ('DIVORCED', 'Divorced'),
    ]

    SOGIE_CHOICES = [
        ('Yes', 'Yes'),
        ('No', 'No'),
        ('Does not want to identify', 'Does not want to identify'),
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

    NATIONALITY_CHOICES = [
        ('Filipino', 'Filipino'),
        ('Others', 'Others'),
    ]

    EMPLOYMENT_STATUS_CHOICES = [
        ('Employed', 'Employed'),
        ('Self-employed', 'Self-employed'),
        ('Unemployed', 'Unemployed'),
        ('Informal Sector', 'Informal Sector'),
        ('Not Applicable', 'Not Applicable'),
    ]

    MIGRATORY_STATUS_CHOICES = [
        ('Current OFW', 'Current OFW'),
        ('Former/Returning OFW', 'Former/Returning OFW'),
        ('Seeking employment abroad', 'Seeking employment abroad'),
        ('Not Applicable', 'Not Applicable'),
    ]

    PWD_CHOICES = [
        ('None', 'None'),
        ('Deaf or Hard of Hearing', 'Deaf or Hard of Hearing'),
        ('Intellectual Disability', 'Intellectual Disability'),
        ('Learning DIsability', 'Learning DIsability'),
        ('Mental Disability', 'Menatl Disability'),
        ('Orthopedic Disability', 'Orthopedic Disability'),
        ('Physical Disability', 'Physical Disability'),
        ('Psychological Disability', 'Psychological Disability'),
        ('Speech and Language Disability', 'Speech and Language Disability'),
        ('Visual Disability', 'Visual Disability'),
    ]
    SEX_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
    ]
    RELIGION_CHOICES = [
        ('Roman Catholic', 'Roman Catholic'),
        ('Islam', 'Islam'),
        ('Evangelicals', 'Evangelicals'),
        ('Protestant', 'Protestant'),
        ('Iglesia ni Cristo', 'Iglesia ni Cristo'),
        ('Others', 'Others'),
    ]
    vic_id = models.AutoField(primary_key=True)
    vic_last_name = models.CharField(max_length=100)
    vic_first_name = models.CharField(max_length=100)
    vic_middle_name = models.CharField(max_length=100, blank=True, null=True)
    vic_extension = models.CharField(max_length=10, blank=True, null=True)
    vic_sex = models.CharField(max_length=10, choices=SEX_CHOICES)
    vic_is_SOGIE = models.CharField(max_length=50, choices=SOGIE_CHOICES, default='No')
    vic_birth_date = models.DateField( null=True, blank=True)
    vic_birth_place = models.CharField(max_length=100, null=True, blank=True)
    vic_civil_status = models.CharField(max_length=50, choices=CIVIL_STATUS_CHOICES, default='SINGLE')
    vic_educational_attainment = models.CharField(max_length=50, choices=EDUCATIONAL_ATTAINMENT_CHOICES, default='No Formal Education')
    vic_nationality = models.CharField(max_length=50, choices=NATIONALITY_CHOICES, default='Filipino')
    vic_ethnicity = models.CharField(max_length=50, blank=True, null=True)
    vic_main_occupation = models.CharField(max_length=100, blank=True, null=True)
    vic_monthly_income = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    vic_employment_status = models.CharField(max_length=50, choices=EMPLOYMENT_STATUS_CHOICES, default='Not Applicable')
    vic_migratory_status = models.CharField(max_length=50, choices=MIGRATORY_STATUS_CHOICES, default='Not Applicable')
    vic_religion = models.CharField(max_length=50, choices=RELIGION_CHOICES, default='Roman Catholic')
    vic_is_displaced = models.BooleanField(default=False)
    vic_PWD_type = models.CharField(max_length=50, choices=PWD_CHOICES, default='None')
    vic_contact_number = models.CharField(max_length=15, blank=True, null=True)
    
    city = models.ForeignKey("City", on_delete=models.PROTECT, related_name="victims", blank=True, null=True)
    municipality = models.ForeignKey("Municipality", on_delete=models.PROTECT, related_name="victims", blank=True, null=True)
    barangay = models.ForeignKey("Barangay", on_delete=models.PROTECT, related_name="victims", blank=True, null=True)
    sitio = models.ForeignKey("Sitio", on_delete=models.PROTECT, related_name="victims", blank=True, null=True)
    street = models.ForeignKey("Street", on_delete=models.SET_NULL, related_name="victims", null=True, blank=True)

    vic_account = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True
    )
    # Profile photo (first photo uploaded)
    vic_photo = models.ImageField(upload_to='victim_photos/', null=True, blank=True)

    def __str__(self):
        return self.vic_last_name
 
class VictimFaceSample(models.Model):
    victim = models.ForeignKey(Victim, on_delete=models.CASCADE, related_name="face_samples")
    photo = models.ImageField(upload_to='victim_face_samples/')
    embedding = ArrayField(models.FloatField(), null=True, blank=True)

    def __str__(self):
        return f"FaceSample for {self.victim.vic_first_name} {self.victim.vic_last_name}"

class Perpetrator(models.Model):
    perp_id = models.AutoField(primary_key=True)
    per_first_name = models.CharField(max_length=100)
    per_middle_name = models.CharField(max_length=100, blank=True, null=True)
    per_last_name = models.CharField(max_length=100)
    per_sex = models.CharField(max_length=10, choices=[
        ('Male', 'Male'),
        ('Female', 'Female')
    ], blank=True, null=True)
    per_birth_date = models.DateField(blank=True, null=True)
    per_birth_place = models.CharField(max_length=255, blank=True, null=True)
    per_contact = models.IntegerField(null=True,blank=True)
    per_nationality = models.CharField(max_length=50, blank=True, null=True)
    per_occupation = models.CharField(max_length=100, blank=True, null=True)
    per_religion = models.CharField(max_length=50, blank=True, null=True)
    per_relationship_category = models.CharField(max_length=50, blank=True, null=True) # should be relationship-to-victim?
    per_relationship_detail = models.CharField(max_length=100, blank=True, null=True)
    per_guardian_first_name = models.CharField(max_length=100, blank=True, null=True)
    per_guardian_middle_name = models.CharField(max_length=100, blank=True, null=True)
    per_guardian_last_name = models.CharField(max_length=100, blank=True, null=True)
    per_guardian_contact = models.CharField(max_length=50, blank=True, null=True)
    per_guardian_child_category = models.CharField(max_length=50, blank=True, null=True)
    def __str__(self):
        return f"{self.per_last_name}, {self.per_first_name}"
  
class IncidentInformation(models.Model):   
    TYPE_OF_PLACE = [
        ('Conjugal Home', 'Conjugal Home'),
        ('Evacutaion Area', 'Evacutaion Area'),
        ('Evacuation Area', 'Evacuation Area'), 
        ('Malls/Hotels', 'Malls/Hotels'),
        ('Perpetrator\'s Home', 'Perpetrator\'s Home'),
        ('Public Utility Vehicle', 'Public Utility Vehicle'),
        ('Victim\'s Home', 'Victim\'s Home'),
        ('Workplace', 'Workplace'),
    ]

    CONFLICT_AREA_CHOICES = [
        ('Insurgency', 'Insurgency'),
        ('Violent Extremism', 'Violent Extremism'),
        ('Tribal Violence', 'Tribal Violence'),
        ('Political Violence', 'Political Violence'),
        ('Rido', 'Rido'),
        ('Others', 'Others'),
    ]
    incident_id = models.AutoField(primary_key=True)
    incident_description = models.TextField()
    incident_date = models.DateField()
    incident_time = models.TimeField()
    incident_location = models.CharField(max_length=255, blank=True, null=True) # Specific landmark (like near jollibee)
    type_of_place = models.CharField(max_length=50, choices=TYPE_OF_PLACE)
    is_via_electronic_means = models.BooleanField(default=False)
    electronic_means = models.CharField(max_length=50, blank=True, null=True)
    is_conflict_area = models.BooleanField(default=False)
    conflict_area = models.CharField(max_length=50, choices=CONFLICT_AREA_CHOICES, blank=True, null=True)
    is_calamity_area = models.BooleanField(default=False)
    vic_id = models.ForeignKey(Victim, on_delete=models.CASCADE, related_name='incidents')
    of_id = models.ForeignKey(Official, on_delete=models.SET_NULL, related_name='handled_incidents',null=True, blank=True)
    perp_id = models.ForeignKey(Perpetrator, on_delete=models.SET_NULL,to_field='perp_id', related_name='related_incidents',null=True, blank=True)

    city = models.ForeignKey("City", on_delete=models.PROTECT, related_name="incidents", blank=True, null=True)
    municipality = models.ForeignKey("Municipality", on_delete=models.PROTECT, related_name="incidents", blank=True, null=True)
    barangay = models.ForeignKey("Barangay", on_delete=models.PROTECT, related_name="incidents", blank=True, null=True)
    sitio = models.ForeignKey("Sitio", on_delete=models.PROTECT, related_name="incidents", blank=True, null=True)
    street = models.ForeignKey("Street", on_delete=models.SET_NULL, related_name="incidents", null=True, blank=True)

    def save(self, *args, **kwargs):
        # Auto-fill hierarchy like in Victim & Official
        if self.street:
            self.sitio = self.street.sitio
            self.barangay = self.street.sitio.barangay
            self.municipality = self.street.sitio.barangay.municipality
            self.city = self.street.sitio.barangay.municipality.city
        elif self.sitio:
            self.barangay = self.sitio.barangay
            self.municipality = self.sitio.barangay.municipality
            self.city = self.sitio.barangay.municipality.city
        elif self.barangay:
            self.municipality = self.barangay.municipality
            self.city = self.barangay.municipality.city
        elif self.municipality:
            self.city = self.municipality.city

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

    # violence_type 
    # specific_violence_type
    # others

    def __str__(self):
        return f"Incident {self.incident_id}"
    
class CaseReport(models.Model):  #ADMINISTRATIVE INFORMATION
    victim = models.OneToOneField(Victim, on_delete=models.CASCADE, related_name="case_report")

    handling_org = models.CharField(max_length=255,null=True, blank=True)
    office_address = models.CharField(max_length=255,null=True, blank=True)
    report_type = models.CharField(max_length=255,null=True, blank=True)

    def __str__(self):
        return f"CaseReport for {self.victim.vic_last_name}, {self.victim.vic_first_name}"
    
class Session(models.Model):

    SESSION_STAT =[
        ('Pending', 'Pending'),
        ('Ongoing', 'Ongoing'),
        ('Done', 'Done'),
    ]
    SESSION_TYPES = [
        ('Counseling', 'Counseling'),
        ('Interview', 'Interview'),
        ('Follow-up', 'Follow-up'),
    ]
    sess_id = models.AutoField(primary_key=True)
    sess_num = models.IntegerField(null=True, blank=True)
    sess_status = models.CharField(max_length=20,choices=SESSION_STAT, default='Pending') 
    sess_next_sched = models.DateTimeField(null=True, blank=True) # if scheduled session
    sess_date_today = models.DateTimeField(null=True, blank=True)   #if start right away
    sess_mental_note = models.TextField(null=True,blank=True)
    sess_physical_note = models.TextField(null=True,blank=True)
    sess_financial_note = models.TextField(null=True,blank=True)
    sess_location = models.CharField(max_length=200, null=True, blank=True)
    sess_type = models.CharField(max_length=50, choices=SESSION_TYPES, null=True, blank=True)
    sess_updated_at = models.DateField(null=True, blank=True)
    sess_description = models.TextField(null=True, blank=True)  
    incident_id = models.ForeignKey(IncidentInformation,to_field='incident_id', on_delete=models.CASCADE, related_name='sessions',null=True, blank=True)
    

    def __str__(self):
        victim_name = (
            f"{self.incident_id.vic_id.vic_last_name}, {self.incident_id.vic_id.vic_first_name}"
            if self.incident_id and self.incident_id.vic_id
            else "No Victim"
        )
        return f"Session {self.sess_id} - Victim: {victim_name}" 
    
class Session_Changelog(models.Model):
    sc_changed_timestamp = models.DateTimeField()
    sc_field_changed = models.CharField(max_length=100)
    sc_old_value = models.TextField()
    sc_new_value = models.TextField()
    sc_reason_for_update = models.TextField()
    sess_id = models.ForeignKey(Session,on_delete=models.CASCADE, to_field='sess_id', related_name='changelogs')
    
    def __str__(self):
        return f"Change in {self.sc_field_changed} on {self.sc_changed_timestamp}"

