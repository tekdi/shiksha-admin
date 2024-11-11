export interface State {
  value: string;
  label: string;
}

export interface FieldOption {
  label: string;
  value: string;
}

export interface Field {
  name: string;
  type: "text" | "numeric" | "drop_down" | "checkbox" | "radio" | "email";
  label: string;
  order: string;
  coreField: number;
  dependsOn: string | boolean | null;
  isEditable: boolean;
  isPIIField: boolean | null;
  validation?: string[];
  placeholder: string;
  isMultiSelect: boolean;
  maxSelections: number | null;
  sourceDetails: Record<string, any>;
  options: FieldOption[];
  hint?: string | null;
  pattern?: string | null;
  maxLength?: number | null;
  minLength?: number | null;
  fieldId: string;
  required?: boolean;
  default: string | number;
  isRequired?: boolean;
}
export interface TenantCohortRoleMapping {
  tenantId: string;
  roleId: string;
}

export interface CustomField {
  fieldId: string;
  value: string;
  isRequired?: boolean;
}
export interface FormData {
  formid?: string;
  title?: string;
  fields?: Field[];
}
export interface createUserParam {
  username: string;
  name: string;
  email: string;
  password: string;
  tenantCohortRoleMapping: TenantCohortRoleMapping[];
  customFields: CustomField[];
}
export interface SendCredentialsRequest {
  isQueue: boolean;
  context: string;
  key: string;
  replacements?: object;
  email?: {
    receipients: any[];
  };
    push?: {
    receipients: any[];
  };
}

export interface CohortMemberList {
  limit: number;
  offset: number;
  filters: {
    cohortId: string;
    role?: string;
    status?: string[];
  };
  sort?: string[];
}

export interface CoursePlannerMetaData {
  subject: string;
  class: string;
  state: any;
  board: string;
  type: string;

  medium: string;
}

export interface GetTargetedSolutionsParams {
  subject: string;
  state: string;

  medium: string;
  class: string;
  board: string;
  type: string;
}

export interface GetSolutionDetailsParams {
  id: string;
  role: string;
}

export interface GetUserProjectTemplateParams {
  templateId: string;
  solutionId: string;
  role: string;
}

export interface AcademicYear {
  id: string;
  session: string;
  isActive: string;
}

export interface Pdata {
  id: string;
  pid?: string;
  ver?: string;
}

export interface ContextRollup {
  l1?: string;
  l2?: string;
  l3?: string;
  l4?: string;
}

export interface Cdata {
  type: string;
  id: string;
}

export interface ObjectRollup {
  l1?: string;
  l2?: string;
  l3?: string;
  l4?: string;
}

export interface Context {
  mode?: string;
  authToken?: string;
  sid?: string;
  did?: string;
  uid?: string;
  channel: string;
  pdata: Pdata;
  contextRollup?: ContextRollup;
  tags?: string[];
  cdata?: Cdata[];
  timeDiff?: number;
  objectRollup?: ObjectRollup;
  host?: string;
  endpoint?: string;
  dispatcher?: object;
  partner?: any[];
  contentId: string;
  dims?: any[];
  app?: string[];
  userData?: {
    firstName: string;
    lastName: string;
  };
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Config {
  toolBar?: {
    showZoomButtons?: boolean;
    showPagesButton?: boolean;
    showPagingButtons?: boolean;
    showSearchButton?: boolean;
    showRotateButton?: boolean;
  };
  sideMenu?: {
    showShare?: boolean;
    showDownload?: boolean;
    showReplay?: boolean;
    showExit?: boolean;
    showPrint?: boolean;
  };
  [propName: string]: any;
}

export interface Metadata {
  identifier: string;
  name: string;
  artifactUrl: string;
  streamingUrl?: string;
  compatibilityLevel?: number;
  pkgVersion?: number;
  isAvailableLocally?: boolean;
  basePath?: string;
  baseDir?: string;
}
export interface PlayerConfig {
  context?: Context;
  config?: Config;
  metadata?: Metadata;
  data?: any;
}
