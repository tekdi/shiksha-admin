export enum Role {
  STUDENT = "Student",
  TEACHER = "Teacher",
  TEAM_LEADER = "Team Leader",
  TEAM_LEADERS = "Team Leaders",

  ADMIN = "Admin",
  LEARNERS = "Students",
  FACILITATORS = "Teachers",
}

export enum Status {
  ARCHIVED = "archived",
  ARCHIVED_LABEL = "Archived",
  ACTIVE = "active",
  ACTIVE_LABEL = "Active",
  ALL_LABEL = "All",
  INACTIVE = "InActive",
}
export enum SORT {
  ASCENDING = "asc",
  DESCENDING = "desc",
}

export enum Storage {
  NAME = "name",
  USER_ID = "userId",
}
export enum FormContext {
  USERS = "USERS",
}

export enum FormContextType {
  STUDENT = "STUDENT",
  TEACHER = "TEACHER",
  TEAM_LEADER = "TEAM LEADER",
  ADMIN = "ADMIN",
  ADMIN_CENTER = "ADMIN_CENTER",
}

export enum RoleId {
  STUDENT = "3eb5d425-f0f1-4d99-a27d-85ec63101bcc",
  TEACHER = "f9646ef7-4c3b-4fa0-90ba-e24019ae686f",
  TEAM_LEADER = "9dd9328f-1bc7-444f-96e3-c5e1daa3514a",
  ADMIN = "8c5b082b-5793-495f-9e07-0b118db16ee9",
}

export enum DataKey {
  UPDATED_AT = "updatedAt",
  CREATED_AT = "createdAt",
  ACTIONS = "actions",
  CREATED_BY = "createdBy",
  UPDATED_BY = "updatedBy",
  STATUS = "status",
  NAME = "name",
  ACTIVE_MEMBER = "totalActiveMembers",
  ARCHIVED_MEMBERS = "totalArchivedMembers",
  CENTERS = "centers",
  MOBILE = "mobile",
  CLASS_NAME = "className",
}

export enum DateFormat {
  YYYY_MM_DD = "yyyy-MM-dd",
}

export enum Numbers {
  ZERO = 0,
  ONE = 1,
  FIVE = 5,
  TEN = 10,
  FIFTEEN = 15,
  TWENTY = 20,
}

export enum CohortTypes {
  COHORT = "COHORT",
  BLOCK = "BLOCK",
  SCHOOL = "SCHOOL",
}

export enum FormValues {
  FEMALE = "FEMALE",
  MALE = "MALE",
}

export enum InputTypes {
  CHECKBOX = "checkbox",
  RADIO = "radio",
  NUMERIC = "numeric",
  TEXT = "text",
  DROPDOWN = "drop_down"
}
export enum apiCatchingDuration {
  GETREADFORM = 36000000,
}

export enum passwordKeys {
  OBLF = "@oblf",
}

export const QueryKeys = {
  USER_READ: "userRead",
  FIELD_OPTION_READ: "fieldOptionRead",
  MY_COHORTS: "myCohorts",
  GET_COHORT_LIST: "getcohortList",
  GET_COHORT_MEMBER_LIST: "getCohortMemberList",
  GET_CLUSTER_DATA: "getClustersData",
  GET_SCHOOLS_DATA:"getSchoolsData",
  GET_COHORT_SEARCH_BLOCK:"getCohortSearchBlock",
 
};
