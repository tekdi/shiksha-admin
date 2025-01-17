import { TFunction } from 'i18next';
import pdf from "./../assets/images/PDF.svg";
import epub from "../assets/images/Epub.svg";
import html from "../assets/images/HTML.svg";
import mp4 from "../assets/images/MP4.svg";
import qml from "../assets/images/Qml.svg";
import youtube from "../assets/images/youtube.svg";

// background image 

import bgpdf from "./../assets/images/bgPDF.svg";
import bgepub from "../assets/images/bgEpub.svg";
import bghtml from "../assets/images/bgHtml.svg";
import bgmp4 from "../assets/images/bgMP4.svg";
import bgqml from "../assets/images/bgQml.svg";
import bgyoutube from "../assets/images/bgYouTube.svg";



export const limit: number = 200;
export const metaTags = {
  title: 'Pratham Admin Management App'
 
};

export enum Role {
  STUDENT = "Student",
  TEACHER = "Teacher",
  TEAM_LEADER = "Team Leader",
  TEAM_LEADERS = "Team Leaders",

  ADMIN = "State Admin MME",
  CENTRAL_ADMIN = "Central Admin MME",
  LEARNERS = "Learners",
  FACILITATORS = "Facilitators",
  CONTENT_CREATOR = "Content Creator",
  CONTENT_REVIEWER = "Content Reviewer",
  SCTA = "State Admin SCTA",
  CCTA = "Central Admin CCTA"

}

export enum Status {
  ARCHIVED = "archived",
  ARCHIVED_LABEL = "Archived",
  ACTIVE = "active",
  ACTIVE_LABEL = "Active",
  ALL_LABEL = "All",
  INACTIVE = "InActive",
  PUBLISHED="published",
  DRAFT="draft"
}
export enum SORT {
  ASCENDING = "asc",
  DESCENDING = "desc",
}

export enum Storage {
  USER_DATA = "userData",
  NAME = "name",
  USER_ID = "userId",
}
export enum FormContext {
  USERS = "USERS",
  COHORTS = "cohorts"

}
export enum TelemetryEventType {
  CLICK = 'CLICK',
  SEARCH = 'SEARCH',
  VIEW = 'VIEW',
  RADIO = "RADIO"

}
export enum FormContextType {
  STUDENT = "STUDENT",
  TEACHER = "TEACHER",
  TEAM_LEADER = "TEAM LEADER",
  ADMIN = "ADMIN",
  ADMIN_CENTER = "ADMIN_CENTER",
  COHORT = "cohort",
  CONTENT_CREATOR = "CONTENT CREATOR"
}

export enum RoleId {
  STUDENT = "493c04e2-a9db-47f2-b304-503da358d5f4",
  TEACHER = "3bde0028-6900-4900-9d05-eeb608843718",
  TEAM_LEADER = "9dd9328f-1bc7-444f-96e3-c5e1daa3514a",
  ADMIN = "ee482faf-8a41-45fe-9656-5533dd6a787c",
  SCTA = "f972a14e-afdb-4502-8ede-cf1fcf171e46"
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
  DISTRICT = "DISTRICT",
  STATE="STATE"
}

export enum FormValues {
  FEMALE = "FEMALE",
  MALE = "MALE",
  REGULAR = "REGULAR",
  REMOTE = "REMOTE"
}

export enum InputTypes {
  CHECKBOX = "checkbox",
  RADIO = "radio",
  NUMERIC = "numeric",
  TEXT = "text",
}
export enum apiCatchingDuration {
  GETREADFORM = 36000000,
}


export const QueryKeys = {
  USER_READ: "userRead",
  FIELD_OPTION_READ: "fieldOptionRead",
  MY_COHORTS: "myCohorts",
  GET_COHORT_LIST: "getcohortList",
  GET_STATE_COHORT_LIST: "getStateCohortList",

  GET_COHORT_MEMBER_LIST: "getCohortMemberList",
}


export const monthColors: any = {
  "Jan": "#99CCFF",
  "Mar": "#D9B2FF",
  "Apr": "#FFABAB",
  "May": "#FFABAB",
  "Jun": "#FFABAB",
  "Jul": "#FFABAB",
  "Aug": "#FFABAB",
  "Sep": "#FFABAB",
  "Oct": "#FFD6D6",
  "Nov": "#FFD6D6",
  "Dec": "#FFD6D6"
};

export enum ResourceType {
  LEARNER_PRE_REQUISITE = "prerequisite",
  LEARNER_POST_REQUISITE = "postrequisite",
  FACILITATOR_REQUISITE = "facilitator-requisite",
}

import { StaticImageData } from "next/image"; // Import StaticImageData for type safety with images

export enum ContentType {
  PDF = "application/pdf",
  EPUB = "application/epub",
  HTML = "application/vnd.ekstep.html-archive",
  VIDEO_MP4 = "video/mp4",
  QUESTION_SET = "application/vnd.sunbird.questionset",
  H5P = "application/vnd.ekstep.h5p-archive",
  YOUTUBE_VIDEO = "video/youtube",
  YOUTUBE_X_VIDEO = "video/x-youtube",
  WEBM_VIDEO = "video/webm",
  VND = "application/vnd.ekstep.content-collection"
}




export type FileType = {
  [key in ContentType]: {
    name: string;
    imgPath: StaticImageData;
    BgImgPath?: StaticImageData;
  };
};

// Create the mapping object with enum keys
export const ContentCardsTypes: FileType = {
  [ContentType.PDF]: { name: "PDF", imgPath: pdf, BgImgPath: bgpdf },
  [ContentType.EPUB]: { name: "EPUB", imgPath: epub, BgImgPath: bgepub },
  [ContentType.HTML]: { name: "HTML", imgPath: html, BgImgPath: bghtml },
  [ContentType.VIDEO_MP4]: { name: "Video", imgPath: mp4, BgImgPath: bgmp4 },
  [ContentType.QUESTION_SET]: { name: "Question Set", imgPath: qml, BgImgPath: bgqml },
  [ContentType.H5P]: { name: "H5P", imgPath: html, BgImgPath: bghtml },
  [ContentType.YOUTUBE_X_VIDEO]: { name: "YouTube", imgPath: youtube, BgImgPath: bgyoutube },
  [ContentType.YOUTUBE_VIDEO]: { name: "YouTube", imgPath: youtube, BgImgPath: bgyoutube },
  [ContentType.WEBM_VIDEO]: { name: "WEBM", imgPath: mp4, BgImgPath: bgmp4 },
  [ContentType.VND]: { name: "WEBM", imgPath: html, BgImgPath: bghtml },
};