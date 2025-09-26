from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.conf import settings
from django.utils.timezone import now

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

# for system users
class Official(models.Model):
    ROLE_CHOICES = [
        ('DSWD', 'DSWD'),
        ('VAWDesk', 'VAWDesk'),
        ('Social Worker', 'Social Worker'),
    ]   

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="official", null=True, blank=True)
    of_id = models.AutoField(primary_key=True)
    of_fname = models.CharField(max_length=50)
    of_lname = models.CharField(max_length=50)
    of_email = models.CharField(max_length=100, blank=True, null=True)
    of_m_initial = models.CharField(max_length=50, null=True, blank=True)
    of_suffix = models.CharField(max_length=50, null=True, blank=True)
    of_sex = models.CharField(max_length=1, null=True, blank=True)
    of_dob = models.DateField(null=True, blank=True)
    of_pob = models.CharField(max_length=255, null=True, blank=True)
    of_contact = models.CharField(max_length=20, null=True, blank=True)
    of_role = models.CharField(max_length=50, choices=ROLE_CHOICES, blank=True, null=True)
    of_specialization = models.CharField(max_length=100, null=True, blank=True)
    of_photo = models.ImageField(upload_to='photos/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    province = models.ForeignKey("Province", on_delete=models.PROTECT, related_name="officials", null=True, blank=True)
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

# starting here is for forms
class Informant(models.Model):
    inf_fname = models.CharField(max_length=50, blank=True, null=True)
    inf_mname = models.CharField(max_length=50, blank=True, null=True)
    inf_lname = models.CharField(max_length=50, blank=True, null=True)
    inf_extension = models.CharField(max_length=50, blank=True, null=True)
    inf_birth_date = models.DateField(blank=True, null=True)
    inf_relationship_to_victim = models.CharField(max_length=50, blank=True, null=True)
    inf_contact = models.CharField(max_length=11, blank=True, null=True)
    inf_occupation = models.CharField(max_length=50, blank=True, null=True)
    
    # foreign key
    inf_address = models.ForeignKey(Address, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f"{self.inf_fname} {self.inf_lname}" if self.inf_fname else "Unnamed Informant"

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

    CHILD_CLASS = [
        ("Orphan", "Orphan"),
        ("Unaccompanied", "Unaccompanied"),
        ("Separated", "Separated"),
        ("Vulnerable", "Vulnerable"),
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
        ('Learning Disability', 'Learning Disability'),
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
    vic_specific_sogie = models.CharField(max_length=50, blank=True, null=True)
    vic_birth_date = models.DateField( null=True, blank=True)
    vic_birth_place = models.CharField(max_length=100, null=True, blank=True)

    # if victime is minor, indicate guardian information and child class
    vic_guardian_fname = models.CharField(max_length=100, blank=True, null=True)
    vic_guardian_mname = models.CharField(max_length=100, blank=True, null=True)
    vic_guardian_lname = models.CharField(max_length=100, blank=True, null=True)
    vic_guardian_contact = models.CharField(max_length=100, blank=True, null=True)
    vic_child_class = models.CharField(max_length=50, choices=CHILD_CLASS, default="Orphan")

    vic_civil_status = models.CharField(max_length=50, choices=CIVIL_STATUS_CHOICES, default='SINGLE')
    vic_educational_attainment = models.CharField(max_length=50, choices=EDUCATIONAL_ATTAINMENT_CHOICES, default='No Formal Education')
    vic_nationality = models.CharField(max_length=50, choices=NATIONALITY_CHOICES, default='Filipino')
    vic_ethnicity = models.CharField(max_length=50, blank=True, null=True)
    vic_main_occupation = models.CharField(max_length=100, blank=True, null=True)
    vic_monthly_income = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    vic_employment_status = models.CharField(max_length=50, choices=EMPLOYMENT_STATUS_CHOICES, default='Not Applicable')
    vic_migratory_status = models.CharField(max_length=50, choices=MIGRATORY_STATUS_CHOICES, default='Not Applicable')
    vic_religion = models.CharField(max_length=50, choices=RELIGION_CHOICES, default='Roman Catholic')
    vic_current_address = models.CharField(max_length=100, default="Homeless")
    vic_is_displaced = models.BooleanField(default=False)
    vic_PWD_type = models.CharField(max_length=50, choices=PWD_CHOICES, default='None')
    vic_contact_number = models.CharField(max_length=15, blank=True, null=True)
    
    province = models.ForeignKey("province", on_delete=models.PROTECT, related_name="victims", blank=True, null=True)
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
    @property
    def full_name(self):
        parts = [self.vic_first_name, self.vic_middle_name, self.vic_last_name, self.vic_extension]
        return " ".join(filter(None, parts))
 
class VictimFaceSample(models.Model):
    victim = models.ForeignKey(Victim, on_delete=models.CASCADE, related_name="face_samples")
    photo = models.ImageField(upload_to='victim_face_samples/')
    embedding = ArrayField(models.FloatField(), null=True, blank=True)

    def __str__(self):
        return f"FaceSample for {self.victim.vic_first_name} {self.victim.vic_last_name}"

class Perpetrator(models.Model):
    RELATIONSHIP_TO_VICTIM = [
        ('Personal/Family', 'Personal/Family'),
        ('Persons of Authority', 'Persons of Authority'),
        ('State Actor', 'State Actor'),
        ('Non-State Actor', 'Non-State Actor'),
        ('Stranger/Unknown', 'Stranger/Unknown'),
    ]

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
    
    # if perpetrator is minor, indicate guardian information and child class
    per_guardian_first_name = models.CharField(max_length=100, blank=True, null=True)
    per_guardian_middle_name = models.CharField(max_length=100, blank=True, null=True)
    per_guardian_last_name = models.CharField(max_length=100, blank=True, null=True)
    per_guardian_contact = models.CharField(max_length=50, blank=True, null=True)
    per_guardian_child_category = models.CharField(max_length=50, blank=True, null=True)
    
    per_nationality = models.CharField(max_length=50, blank=True, null=True)
    per_main_occupation = models.CharField(max_length=100, blank=True, null=True)
    per_religion = models.CharField(max_length=50, blank=True, null=True)
    per_current_address = models.CharField(max_length=100, default="Homeless")

    # relationship to victim
    per_relationship_type = models.CharField(max_length=50, choices=RELATIONSHIP_TO_VICTIM, blank=True, null=True)
    per_relationship_subtype = models.CharField(max_length=100, blank=True, null=True)
    
    per_contact = models.IntegerField(null=True,blank=True)

    def __str__(self):
        return f"{self.per_last_name}, {self.per_first_name}"
  
class IncidentInformation(models.Model): #Case in the frontend
    VIOLENCE_TYPE = [
        ('Intimate partner violence against women and their children', 'Intimate partner violence against women and their children'),
        ('Rape', 'Rape'),
        ('Trafficking in persons', 'Trafficking in persons'),
        ('Sexual harassment', 'Sexual harassment'),
        ('Child abuse, exploitation, and discrimination', 'Child abuse, exploitation, and discrimination'),
        ('Gender-based Streets and Public Spaces Sexual Harassment', 'Gender-based Streets and Public Spaces Sexual Harassment'),
        ('Photo and video voyeurism', 'Photo and video voyeurism'),
        ('Child pornography', 'Child pornography'),
        ('Acts of lasciviousness', 'Acts of lasciviousness'),
        ('Concubinage', 'Concubinage'),
    ]

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
    
    INCIDENT_CHOICES = [
        ('Pending','Pending'),
        ('Ongoing','Ongoing'),
        ('Done','Done'),
    ]
    
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    incident_id = models.AutoField(primary_key=True)
    incident_num = models.IntegerField(null=True,blank=True) #case number
    incident_status= models.CharField(max_length=20, choices=INCIDENT_CHOICES,default='Pending') #case status
    violence_type = models.CharField(max_length=100, choices=VIOLENCE_TYPE, null=True, blank=True)
    violence_subtype = models.CharField(max_length=100, null=True, blank=True)
    
    incident_description = models.TextField(blank=True, null=True)
    incident_date = models.DateField(blank=True, null=True)
    incident_time = models.TimeField(blank=True, null=True)
    incident_location = models.CharField(max_length=255, blank=True, null=True) # Specific landmark (like near jollibee)
    type_of_place = models.CharField(max_length=50, choices=TYPE_OF_PLACE, blank=True, null=True)
    is_via_electronic_means = models.BooleanField(default=False)
    electronic_means = models.CharField(max_length=50, blank=True, null=True)
    is_conflict_area = models.BooleanField(default=False)
    conflict_area = models.CharField(max_length=50, choices=CONFLICT_AREA_CHOICES, blank=True, null=True)
    is_calamity_area = models.BooleanField(default=False)

    # foreign keys
    informant = models.ForeignKey(Informant, on_delete=models.CASCADE, null=True, blank=True)
    vic_id = models.ForeignKey(Victim, on_delete=models.CASCADE, related_name='incidents')
    perp_id = models.ForeignKey(Perpetrator, on_delete=models.CASCADE,to_field='perp_id', related_name='related_incidents',null=True, blank=True)
    of_id = models.ForeignKey(Official, on_delete=models.SET_NULL, related_name='handled_incidents',null=True, blank=True)
    
    # for address
    province = models.ForeignKey("province", on_delete=models.PROTECT, related_name="incidents", blank=True, null=True)
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

    def __str__(self):
        return f"Incident {self.incident_id}"

class BPOApplication(models.Model):
    commission_date = models.DateTimeField()
    consent_circumstances = models.TextField(blank=True, null=True)

    incident = models.ForeignKey(IncidentInformation, on_delete=models.CASCADE, blank=True, null=True)

class BPOApplicationVictimChildrenList(models.Model):
    fname = models.CharField(max_length=50, blank=True, null=True)
    mname = models.CharField(max_length=50, blank=True, null=True)
    lname = models.CharField(max_length=50, blank=True, null=True)
    extension = models.CharField(max_length=50, blank=True, null=True)
    birth_date = models.DateField( null=True, blank=True)
    sex = models.CharField(max_length=10, null=True, blank=True)

    # foreign key
    bpo_application = models.ForeignKey(BPOApplication, on_delete=models.CASCADE, blank=True, null=True) 

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
    
    sess_id = models.AutoField(primary_key=True)
    sess_num = models.IntegerField(null=True, blank=True)
    sess_status = models.CharField(max_length=20,choices=SESSION_STAT, default='Pending') 
    sess_next_sched = models.DateTimeField(null=True, blank=True) # if scheduled session
    sess_date_today = models.DateTimeField(null=True, blank=True)   #if start right away
    sess_location = models.CharField(max_length=200, null=True, blank=True)
    sess_description = models.TextField(null=True, blank=True)
    sess_type = models.ManyToManyField("SessionType", related_name="sessions")
    
    # foreign key
    incident_id = models.ForeignKey(IncidentInformation,to_field='incident_id', on_delete=models.CASCADE, related_name='sessions',null=True, blank=True)
    assigned_official = models.ForeignKey("Official",on_delete=models.SET_NULL,related_name="assigned_sessions",null=True,blank=True)

    def __str__(self):
        victim_name = (
            f"{self.incident_id.vic_id.vic_last_name}, {self.incident_id.vic_id.vic_first_name}"
            if self.incident_id and self.incident_id.vic_id
            else "No Victim"
        )
        return f"Session {self.sess_id} - Victim: {victim_name}" 
    
class SessionType(models.Model):
    SESSION_TYPES = [
        ('Intake / Initial Assessment', 'Intake / Initial Assessment'),
        ('Counseling', 'Counseling'),
        ('Follow-up', 'Follow-up'),
        ('Legal Support','Legal Support'),
        ('Shelter / Reintegration','Shelter / Reintegration'),
        ('Case Closure','Case Closure'),
    ]
    name = models.CharField(max_length=100, choices=SESSION_TYPES)

    def __str__(self):
        return self.name
        
class SessionTypeQuestion(models.Model):
    session_number = models.IntegerField()  # 1, 2, 3, 4, 5.
    session_type = models.ForeignKey(SessionType, on_delete=models.CASCADE, related_name="type_questions")
    question = models.ForeignKey('Question', on_delete=models.CASCADE, related_name="type_questions")

    class Meta:
        unique_together = ('session_number', 'session_type', 'question')

class Question(models.Model): #HOLDER FOR ALL QUESTIONS
    ANSWER_TYPES = [
        ('Yes/No', 'Yes/No'),
        ('Text', 'Text'),
        ('Multiple Choice', 'Multiple Choice')
    ]
    QUESTION_CATEGORIES = [
        ('Safety Assessment','Safety Assessment'),
        ('Physical Health Assessment','Physical Health Assessment'),
        ('Emotional / Psychological Assessment','Emotional / Psychological Assessment'),
        ('Social & Family Support Assessment','Social & Family Support Assessment'),
        ('Financial / Livelihood Assessment','Financial / Livelihood Assessment'),
        ('Legal / Protective Measures','Legal / Protective Measures'),
    ]
    ques_id = models.AutoField(primary_key=True)
    ques_category = models.CharField(choices=QUESTION_CATEGORIES, max_length=100, null=True, blank=True)
    ques_question_text = models.TextField(null=True, blank=True)
    ques_answer_type = models.CharField(max_length=20, choices=ANSWER_TYPES, null=True, blank=True)
    ques_is_active = models.BooleanField(default=False)
    created_at  = models.DateTimeField(default=now)
    created_by = models.ForeignKey(Official, on_delete=models.SET_NULL,null=True,blank=True,related_name="created_questions")
    

    def __str__(self):
        category = self.ques_category or "Uncategorized"
        text = (self.ques_question_text or "")[:50]
        return f"[{category}] {text}"

class SessionQuestion(models.Model):
    sq_id = models.AutoField(primary_key=True)
    sq_is_required = models.BooleanField(default=False)

    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='session_questions')
    question = models.ForeignKey(Question, on_delete=models.PROTECT, related_name='session_questions', null=True, blank=True)

     # For ad-hoc custom questions
    sq_custom_text = models.TextField(null=True, blank=True)
    sq_custom_answer_type = models.CharField(max_length=20, choices=Question.ANSWER_TYPES, null=True, blank=True)

    # Direct answer fields
    sq_value = models.TextField(null=True, blank=True)
    sq_note = models.TextField(null=True, blank=True)

    class Meta:
        unique_together = ('session', 'question')

    def __str__(self):
        if self.question:
            return f"Session {self.session.sess_id} - Q {self.question.ques_id} -> {self.sq_value or 'No answer'}"
        return f"Session {self.session.sess_id} - Custom Q -> {self.sq_value or 'No answer'}"

# newly added
class Evidence(models.Model):
    incident = models.ForeignKey(
        "IncidentInformation",
        on_delete=models.CASCADE,
        related_name="evidences"
    )
    file = models.FileField(upload_to="incident_evidences/")
    description = models.TextField(blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Evidence {self.id} for Incident {self.incident_id}"

class Services(models.Model):
    '''
    assigned_place refers to which barangay the service can be acquired
    REASONING: lahi lahi man ug lugar ang barangay nya dili baya pareho tanan service location
    
    service_address refers to where the specific service is located
    '''

    CATEGORY_CHOICES = [
        ("Protection", "Protection"),
        ("Legal", "Legal"),
        ("Pyscho-Social", "Pyscho-Social"),
        ("Medical", "Medical"),
        ("Medico-Legal", "Medico-Legal"),
        ("Livelihood and Employment", "Livelihood and Employment"),
        ("Others", "Others")
    ]
    assigned_place = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_place")
    service_address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, blank=True, related_name="service_address")

    name = models.CharField(max_length=100, default="service") 
    contact_person = models.CharField(max_length=100, default="contact person")
    contact_number = models.CharField(max_length=100, default="contact number")
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES, default="Others")