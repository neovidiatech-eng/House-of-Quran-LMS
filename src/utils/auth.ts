import type { RouteConfig } from "../pages/AdminDashboard/adminDashboardRoutes";

export interface AuthPermission {
  code?: string | null;
  resource?: string | null;
  method?: string | null;
  name?: string | null;
}

const fixedDashboardPaths: Record<string, string> = {
  teacher: "/teacher-dashboard",
  student: "/student-dashboard",
  parent: "/parent-dashboard",
};

const adminRoles = ["super_admin", "admin"];
const nonAdminDashboardRoles = ["teacher", "student", "parent"];

const routeResources: Record<string, string[]> = {
  dashboard: ["dashboard"],
  admins: ["users", "admins"],
  students: ["students", "users"],
  parents: ["parents", "users"],
  teachers: ["teachers"],
  "teacher-availability": ["teachers"],
  subjects: ["subjects"],
  sessions: ["sessions"],
  agenda: ["calendar", "sessions"],
  exams: ["exams"],
  assignments: ["homework", "assignments"],
  "lms-courses": ["courses", "lectures"],
  "subscription-requests": ["subscriptions"],
  "all-subscriptions": ["subscriptions"],
  plans: ["plans"],
  roles: ["roles"],
  currencies: ["currencies", "finances"],
  expenses: ["expenses", "finances"],
  transactions: ["transactions", "finances"],
  "transaction-requests": ["withdrawals", "finances"],
  requests: ["requests"],
  settings: ["settings"],
};

export const getDashboardPathForRole = (role?: string | null) => {
  if (!role) return "/login";
  return fixedDashboardPaths[role] || "/dashboard";
};

export const isAdminDashboardRole = (role?: string | null) => {
  if (!role) return false;
  return !nonAdminDashboardRoles.includes(role);
};

export const isFullAccessRole = (role?: string | null) => {
  return !!role && adminRoles.includes(role);
};

export const getStoredPermissions = (): AuthPermission[] => {
  const raw =
    localStorage.getItem("permissions") || sessionStorage.getItem("permissions");

  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const hasPermission = (
  resource: string,
  methods: string | string[],
  role: string | null = localStorage.getItem("role"),
  permissions = getStoredPermissions()
) => {
  if (isFullAccessRole(role)) return true;

  const allowedMethods = (Array.isArray(methods) ? methods : [methods]).map(
    (method) => method.toLowerCase()
  );
  const targetResource = resource.toLowerCase();

  return permissions.some((permission) => {
    const permissionResource = permission.resource?.toLowerCase();
    const [codeResource, codeMethod] =
      permission.code?.toLowerCase().split(":") || [];
    const permissionMethod = permission.method?.toLowerCase();

    const resourceMatches =
      permissionResource === targetResource || codeResource === targetResource;

    const methodMatches =
      allowedMethods.includes(permissionMethod || "") ||
      allowedMethods.includes(codeMethod || "");

    return resourceMatches && methodMatches;
  });
};

export const storeAuthPermissions = (
  permissions: AuthPermission[] | undefined,
  rememberMe: boolean
) => {
  localStorage.removeItem("permissions");
  sessionStorage.removeItem("permissions");

  if (!permissions?.length) return;

  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem("permissions", JSON.stringify(permissions));
};

const hasResourcePermission = (
  permissions: AuthPermission[],
  resources: string[]
) => {
  return permissions.some((permission) => {
    const resource = permission.resource?.toLowerCase();
    const codeResource = permission.code?.split(":")[0]?.toLowerCase();

    return resources.some((target) => {
      const normalizedTarget = target.toLowerCase();
      return resource === normalizedTarget || codeResource === normalizedTarget;
    });
  });
};

export const canAccessRoute = (
  route: RouteConfig,
  role: string | null,
  permissions = getStoredPermissions()
) => {
  if (isFullAccessRole(role)) return true;

  const resources = routeResources[route.id];
  if (!resources) return false;

  return hasResourcePermission(permissions, resources);
};

export const filterAdminRoutesByPermissions = (
  routes: RouteConfig[],
  role: string | null = localStorage.getItem("role"),
  permissions = getStoredPermissions()
): RouteConfig[] => {
  if (isFullAccessRole(role)) return routes;

  return routes.reduce<RouteConfig[]>((allowedRoutes, route) => {
    if (route.subItems) {
      const subItems = route.subItems.filter((subItem) =>
        canAccessRoute(subItem, role, permissions)
      );

      if (subItems.length) {
        allowedRoutes.push({ ...route, subItems });
      }

      return allowedRoutes;
    }

    if (canAccessRoute(route, role, permissions)) {
      allowedRoutes.push(route);
    }

    return allowedRoutes;
  }, []);
};

export const getFirstAdminRoutePath = (routes: RouteConfig[]) => {
  for (const route of routes) {
    if (route.subItems?.length) return route.subItems[0].path;
    if (route.element || route.path === "") return route.path;
  }

  return "";
};
