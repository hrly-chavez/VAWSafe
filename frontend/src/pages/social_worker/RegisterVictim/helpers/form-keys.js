export const VICTIM_FIELDS = [
  "vic_first_name",
  "vic_middle_name",
  "vic_last_name",
  "vic_extension",
  "vic_sex",
  "vic_is_SOGIE",
  "vic_specific_sogie",
  "vic_birth_date",
  "vic_birth_place",

  // if victime is minor, indicate guardian information and child class
  "vic_guardian_fname",
  "vic_guardian_mname",
  "vic_guardian_lname",
  "vic_guardian_contact",
  "vic_child_class",

  "vic_civil_status",
  "vic_educational_attainment",
  "vic_nationality",
  "vic_ethnicity",
  "vic_main_occupation",
  "vic_monthly_income",
  "vic_employment_status",
  "vic_migratory_status",
  "vic_religion",
  "vic_current_address",
  "vic_is_displaced",
  "vic_PWD_type",
  "vic_contact_number",
];

export const INCIDENT_KEYS = [
  "violence_type",
  "violence_subtype",
  "incident_description",
  "incident_date",
  "incident_time",
  "incident_location",
  "type_of_place",
  "is_via_electronic_means",
  "electronic_means",
  "is_conflict_area",
  "conflict_area",
  "is_calamity_area",
];

export const PERP_KEYS = [
  "per_first_name",
  "per_middle_name",
  "per_last_name",
  "per_sex",
  "per_birth_date",
  "per_birth_place",

  "per_guardian_first_name",
  "per_guardian_middle_name",
  "per_guardian_last_name",
  "per_guardian_contact",
  "per_guardian_child_category",

  "per_nationality",
  "per_nationality_other",
  "per_occupation",
  "per_religion",
  "per_religion_other",
  "per_relationship_type",
  "per_relationship_subtype",

  // "per_actor_type",
  // "per_state_actor_detail",
  // "per_security_branch",
  // "per_non_state_actor_detail",
];

export const INFORMANT_FIELDS = [
  "informant_name",
  "informant_contact",
  "informant_relationship",
  "informant_address",
  "informant_affiliation",
];