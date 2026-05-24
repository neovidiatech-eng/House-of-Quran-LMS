export interface Permission {
  id: string;
  name: string;
  code?: string | null;
  action?: string | null;
  resource?: string | null;
  method?: string | null;
}

export interface PermissionsData {
  dashboard: Permission[];
  policies: Permission[];
  settings: Permission[];
  users: Permission[];
  roles: Permission[];
  permissions: Permission[];
  courses: Permission[];
  lectures: Permission[];
  sessions: Permission[];
  homework: Permission[];
  exams: Permission[];
  profile: Permission[];
  requests: Permission[];
  withdrawals: Permission[];
  weekly_reports: Permission[];
  subscriptions: Permission[];
  support: Permission[];
  calendar: Permission[];
  plans: Permission[];
  chat: Permission[];
  finances: Permission[];
  ranks: Permission[];
}

export interface PermissionsResponse {
  message: string;
  status: number;
  lang: string;
  data: PermissionsData;
}

export interface CreatePermissionPayload {
  name: string;
  resource: string;
  method: string;
}

export interface PermissionResponse {
  message: string;
  status: number;
  lang: string;
  data: Permission;
}
