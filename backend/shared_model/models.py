from django.db import models
from django.contrib.postgres.fields import ArrayField

class Account(models.Model):
    username = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=255)  

    def __str__(self):
        return self.username

class Official(models.Model):
    ROLE_CHOICES = {
        ('DSWD', 'DSWD'),
        ('VAWDesk', 'VAWDesk'),
        ('Social Worker', 'Social Worker'),
    }

    of_id = models.AutoField(primary_key=True)
    account = models.OneToOneField(Account, on_delete=models.CASCADE)
    of_fname = models.CharField(max_length=50)
    of_lname = models.CharField(max_length=50)
    of_m_initial = models.CharField(max_length=50, null=True, blank=True)
    of_suffix = models.CharField(max_length=50, null=True, blank=True)
    of_sex = models.CharField(max_length=1, null=True, blank=True)
    of_dob = models.DateField(null=True, blank=True)
    of_pob = models.CharField(max_length=255, null=True, blank=True)
    of_address = models.TextField(null=True, blank=True)
    of_contact = models.CharField(max_length=20, null=True, blank=True)
    of_role = models.CharField(max_length=50, choices=ROLE_CHOICES, default=False)
    of_brgy_assigned = models.CharField(max_length=100, null=True, blank=True)
    of_specialization = models.CharField(max_length=100, null=True, blank=True)
    of_photo = models.ImageField(upload_to='photos/')  # Profile image only

    def __str__(self):
        return f"{self.of_fname}, {self.of_lname}"

    @property
    def full_name(self):
        return f"{self.of_fname} {self.of_m_initial or ''}. {self.of_lname} {self.of_suffix or ''}".strip()

class OfficialFaceSample(models.Model):
    official = models.ForeignKey(Official, on_delete=models.CASCADE, related_name='face_samples')
    photo = models.ImageField(upload_to='face_samples/')
    embedding = ArrayField(models.FloatField(), null=True, blank=True)

    def __str__(self):
        return f"FaceSample for {self.official.full_name}"
    
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
    vic_id = models.AutoField(primary_key=True)
    vic_last_name = models.CharField(max_length=100)
    vic_first_name = models.CharField(max_length=100)
    vic_middle_name = models.CharField(max_length=100, blank=True, null=True)
    vic_extension = models.CharField(max_length=10, blank=True, null=True)
    vic_sex = models.CharField(max_length=10, choices=SEX_CHOICES)
    vic_is_SOGIE = models.CharField(max_length=50, choices=SOGIE_CHOICES, default='No')
    vic_birth_date = models.DateField( null=True, blank=True)
    vic_birth_place = models.CharField(max_length=100, null=True, blank=True)

    # if victim is minor, name and contact info of parent/guardian
    # isMinor = models.BooleanField(default=False)

    vic_civil_status = models.CharField(max_length=50, choices=CIVIL_STATUS_CHOICES, default='SINGLE')
    vic_educational_attainment = models.CharField(max_length=50, choices=EDUCATIONAL_ATTAINMENT_CHOICES, default='No Formal Education')
    vic_nationality = models.CharField(max_length=50, choices=NATIONALITY_CHOICES, default='Filipino')
    vic_ethnicity = models.CharField(max_length=50, blank=True, null=True)
    vic_main_occupation = models.CharField(max_length=100, blank=True, null=True)
    vic_monthly_income = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    vic_employment_status = models.CharField(max_length=50, choices=EMPLOYMENT_STATUS_CHOICES, default='Not Applicable')
    vic_migratory_status = models.CharField(max_length=50, choices=MIGRATORY_STATUS_CHOICES, default='Not Applicable')
    vic_religion = models.CharField(max_length=50, choices=RELIGION_CHOICES, default='Roman Catholic')
    # currentAddress = models.CharField(max_length=255)
    vic_is_displaced = models.BooleanField(default=False)
    vic_PWD_type = models.CharField(max_length=50, choices=PWD_CHOICES, default='None')
    vic_contact_number = models.CharField(max_length=15, blank=True, null=True)
    vic_account = models.OneToOneField(Account, on_delete=models.CASCADE, null=True, blank=True)
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
    vic_id = models.ForeignKey(Victim, on_delete=models.CASCADE)
    per_last_name = models.CharField(max_length=100)
    per_first_name = models.CharField(max_length=100)
    per_middle_name = models.CharField(max_length=100, blank=True, null=True)
    per_sex = models.CharField(max_length=10, choices=SEX_CHOICES)
    per_birth_date = models.DateField()
    per_birth_place = models.CharField(max_length=100)

    # if perpetrator is minor, name and contact info of parent/guardian
    # parentGuardianName = models.CharField(max_length=100, blank=True, null=True)

    # nationality = models.CharField(max_length=50)
    per_main_occupation = models.CharField(max_length=100, blank=True, null=True)
    per_religion = models.CharField(max_length=50, choices=RELIGION_CHOICES, default='Roman Catholic')
    # address
    # victimRelationship = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.per_last_name
    
class IncidentInformation(models.Model):  #CASE NI SA DB DESIGN
    TYPE_OF_PLACE = [
        ('Conjugal Home', 'Conjugal Home'),
        ('Evacutaion Area', 'Evacutaion Area'),
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
    
    # violenceType = models.CharField(max_length=100)
    incident_description = models.TextField()
    incident_date = models.DateField()
    incident_time = models.TimeField()
    incident_location = models.CharField(max_length=255, blank=True, null=True)
    type_of_place = models.CharField(max_length=50, choices=TYPE_OF_PLACE)
    is_via_electronic_means = models.BooleanField(default=False)
    electronic_means = models.CharField(max_length=50, blank=True, null=True)
    # isResultOfHarmfulPractice = models.BooleanField(default=False)
    is_conflict_area = models.BooleanField(default=False)
    conflict_area = models.CharField(max_length=50, choices=CONFLICT_AREA_CHOICES, blank=True, null=True)
    is_calamity_area = models.BooleanField(default=False)
    vic_id = models.ForeignKey(Victim, on_delete=models.CASCADE, related_name='incidents')
    of_id = models.ForeignKey(Official, on_delete=models.CASCADE, related_name='handled_incidents',null=True, blank=True)
    perp_id = models.ForeignKey(Perpetrator, on_delete=models.CASCADE,to_field='perp_id', related_name='related_incidents',null=True, blank=True)

    def __str__(self):
        return self.incident_id
    
class Session(models.Model):

    SESSION_STAT =(
        ('Pending', 'Pending'),
        ('Ongoing', 'Ongoing'),
        ('Done', 'Done'),
    )
    sess_id = models.AutoField(primary_key=True)
    sess_date_today = models.DateField(null=True, blank=True)
    sess_type = models.TextField(null=True, blank=True)
    sess_notes = models.TextField(null=True, blank=True)
    sess_created_at = models.DateField(null=True, blank=True)
    sess_updated_at = models.DateField(null=True, blank=True)
    sess_next_sched = models.DateField(null=True, blank=True)
    sess_description = models.TextField(null=True, blank=True)
    sess_status = models.CharField(choices=SESSION_STAT, default='Pending')
    incident_id = models.ForeignKey(IncidentInformation,to_field='incident_id', on_delete=models.CASCADE, related_name='sessions',null=True, blank=True)
    of_id = models.ForeignKey(Official, on_delete=models.CASCADE,to_field='of_id', related_name='sessions_handled',null=True, blank=True)

    def __str__(self):
        return self.sess_id

class Session_Changelog(models.Model):
    sc_changed_timestamp = models.DateTimeField()
    sc_field_changed = models.CharField(max_length=100)
    sc_old_value = models.TextField()
    sc_new_value = models.TextField()
    sc_reason_for_update = models.TextField()
    sess_id = models.ForeignKey(Session,on_delete=models.CASCADE, to_field='sess_id', related_name='changelogs')
    
    def __str__(self):
        return f"Change in {self.sc_field_changed} on {self.sc_changed_timestamp}"

