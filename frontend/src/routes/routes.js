//src/routes/routes.js
export const ROUTES = {
  LOGIN: "/login",
  MANUAL_LOGIN: "/login/manual",
  REGISTER: "/register",
  RESET_PASSWORD: "/reset-password/:uid/:token",

  // desk officer pages
  DESK_OFFICER: "/desk_officer",
  DESK_OFFICER_REGISTER_VICTIM: "/desk_officer/register_victim",
  DESK_OFFICER_BPO_APPLICATION: "/desk_officer/bpo-application",
  DESK_OFFICER_VICTIM_FACIAL: "/desk_officer/victim_facial",
  DESK_OFFICER_SESSION: "/desk_officer/session",
  DESK_OFFICER_START_SESSION: "/desk_officer/session/start",

  DESK_OFFICER_VICTIMS: "/desk_officer/victims",
  DESK_OFFICER_VICTIM_DETAIL: "/desk_officer/victims/:vic_id",
  DESK_OFFICER_VICTIM_SEARCH: "/desk_officer/victims/search",

  DESK_OFFICER_SOCIAL_WORKERS: "/desk_officer/social-workers",
  DESK_OFFICER_SERVICES: "/desk_officer/services",
  DESK_OFFICER_CASE_RECORDS: "/desk_officer/case-records",
  // DESK_OFFICER_ACCOUNT_MANAGEMENT: "/desk_officer/account-management",
  // DESK_OFFICER_PENDING_ACCOUNT: "/desk_officer/pending-account",
  DESK_OFFICER_VIEW_OFFICIAL: "/desk_officer/officials/:of_id",

  //DSWD
  DSWD: "/dswd",
  DSWD_VAWC_VICTIMS: "/dswd/victims",
  DSWD_VICTIM_DETAIL: "/dswd/victims/:vic_id",
  DSWD_SEARCH_VICTIM: "/dswd/victims/search",
  DSWD_SOCIAL_WORKERS: "/dswd/social-workers",
  DSWD_SOCIAL_WORKERS_DETAILS: "/dswd/social-workers/:of_id",
  DSWD_VAWDESK_OFFICER: "/dswd/vawdesk-officer",
  DSWD_VAWDESK_OFFICER_DETAILS: "/dswd/vawdesk-officer/:of_id",
  DSWD_SERVICES: "/dswd/services",
  DSWD_ACCOUNT_MANAGEMENT: "/dswd/account-management",
  DSWD_VIEW_OFFICIALS: "/dswd/account-management/:of_id",
  DSWD_PENDING_ACCOUNT: "/dswd/account-management/pending",
  DSWD_QUESTIONS: "/dswd/questions",

  // SOCIAL WORKER
  SOCIAL_WORKER: "/social_worker",
  SOCIAL_WORKER_DASHBOARD: "/social_worker",
  SOCIAL_WORKER_REGISTER_VICTIM: "/social_worker/register-victim",

  SOCIAL_WORKER_SCHEDULE: "/social_worker/schedule",

  SOCIAL_WORKER_CASE_RECORDS: "/social_worker/case-records",
  SOCIAL_WORKER_SESSIONS: "/social_worker/sessions",
  SOCIAL_WORKER_VIEW_SESSION: "/social_worker/sessions/:sess_id",
  SOCIAL_WORKER_START_SESSION: "/social_worker/sessions/:sess_id/start",

  SOCIAL_WORKER_SERVICES: "/social_worker/services",

  SOCIAL_WORKER_VICTIMS: "/social_worker/victims",
  SOCIAL_WORKER_VICTIM_DETAIL: "/social_worker/victims/:vic_id",
  SOCIAL_WORKER_SEARCH_FACIAL: "/social_worker/victims/search-facial",

  //nurse
  NURSE_DASHBOARD: "nurse/",
  NURSE_SCHEDULE: "/nurse/schedule",
  NURSE_CASE_RECORDS: "/nurse/case-records",
  NURSE_SESSIONS: "/nurse/sessions",
  NURSE_VIEW_SESSION: "/nurse/sessions/:sess_id",
  NURSE_START_SESSION: "/nurse/sessions/:sess_id/start",
  NURSE_SERVICES: "/nurse/services",
  NURSE_VICTIMS: "/nurse/victims",
  NURSE_VICTIM_DETAIL: "/nurse/victims/:vic_id",
  NURSE_SEARCH_FACIAL: "/nurse/victims/search-facial",

  // psychometrician
  PSYCHOMETRICIAN_DASHBOARD: "psychometrician/",

  // landing page
  LANDING: "/landing",
};
