// src/config/pathsMap.js
import { appMap } from '@/app/services/maps/appRolesStructure.map.js'; 

// ---------------- utilities ----------------
const toKebab = (s) =>
  String(s || '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase();

const ensureArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);

// memo cache
let _cached = null;

/**
 * generate paths map from appMap
 * returns: {
 *   "/division": { viewRoles:[], actionRoles:[], allowEmployeeReports: false },
 *   "/division/department": {...}
 * }
 */
export function generatePathsFromAppMap(opts = {}) {
  const {
    includeDivisionHead = true,
    includeDepartmentHead = true,
    includeEmployeesInActions = true,
    includeOverallAdmin = true,
    includeOverallSuper = true,
    // allow customizing the division segment prefix (default: 'divisions')
    divisionPrefix = 'divisions',
    // basePath: prefer env var, otherwise default to '/dashboard' per new routing requirement
    basePath = (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_APP_BASE_PATH)
      ? String(process.env.NEXT_PUBLIC_APP_BASE_PATH)
      : '/dashboard'
  } = opts;

  const res = {};

  const overallAdminId = appMap?.overall?.admin?.id || appMap?.overall?.admin;
  const overallSuperId = appMap?.overall?.superAdmin?.id || appMap?.overall?.superAdmin;

  const divisions = appMap?.divisions || {};

  // normalize basePath:
  // - if a full URL is provided (e.g. ngrok), extract its pathname
  // - ensure it starts with a single leading slash and has no trailing slash
  let normalizedBase = '';
  if (basePath) {
    try {
      if (/^https?:\/\//i.test(basePath)) {
        const u = new URL(basePath);
        normalizedBase = u.pathname || '';
      } else {
        normalizedBase = String(basePath || '');
      }
    } catch (e) {
      normalizedBase = String(basePath || '');
    }

    normalizedBase = normalizedBase.replace(/\/$/, '');
    if (normalizedBase === '/') normalizedBase = '';
    if (normalizedBase && !normalizedBase.startsWith('/')) normalizedBase = '/' + normalizedBase;
  }

  for (const [divKey, divNode] of Object.entries(divisions)) {
    const divisionId = divNode.id || divKey;
    // produce paths like: /dashboard/divisions/<division>
    const seg = `/${divisionPrefix}/${toKebab(divisionId)}`;
    const divPath = `${normalizedBase}${seg}`;

    // roles that can view division-level page
    const divViewSet = new Set();
    const divActionSet = new Set();

    if (includeDivisionHead && (divNode.divisionHead?.id || divNode.devHead)) {
      divViewSet.add(divNode.divisionHead?.id || divNode.devHead);
    }
    if (includeOverallAdmin && overallAdminId) divViewSet.add(overallAdminId);
    if (includeOverallSuper && overallSuperId) {
      divViewSet.add(overallSuperId);
      divActionSet.add(overallSuperId);
    }

    // attach defaults for division page
    res[divPath] = {
      viewRoles: Array.from(divViewSet),
      actionRoles: Array.from(divActionSet),
      allowEmployeeReports: Boolean(divNode.allowEmployeeReports) || false
    };

    // departments
    const departments = divNode.departments || {};
    for (const [depKey, depNode] of Object.entries(departments)) {
      const depId = depNode.id || depKey;
      // produce department paths like: /dashboard/divisions/<division>/<department>
      const depSeg = `/${divisionPrefix}/${toKebab(divisionId)}/${toKebab(depId)}`;
      const depPath = `${normalizedBase}${depSeg}`;

      const viewSet = new Set();
      const actionSet = new Set();

      // extras explicitly defined on department (explicit lists)
      const extraView = ensureArray(depNode.extraViewRoles || depNode.viewRoles || []);
      const extraAction = ensureArray(depNode.extraActionRoles || depNode.actionRoles || []);

      // add extra explicit
      extraView.forEach(r => r && viewSet.add(r));
      extraAction.forEach(r => r && actionSet.add(r));

      // division head can view division/department pages (view-only)
      if (includeDivisionHead && (divNode.divisionHead?.id || divNode.devHead)) {
        viewSet.add(divNode.divisionHead?.id || divNode.devHead);
      }

      // department head view-only (unless included in extraAction)
      if (includeDepartmentHead && (depNode.departmentHead?.id || depNode.depHead)) {
        viewSet.add(depNode.departmentHead?.id || depNode.depHead);
      }

      // include overall admin & super in view; super in action
      if (includeOverallAdmin && overallAdminId) viewSet.add(overallAdminId);
      if (includeOverallSuper && overallSuperId) {
        viewSet.add(overallSuperId);
        actionSet.add(overallSuperId);
      }

      // employees: usually in actionRoles and may also be allowed view (depending on policy)
      const employees = Array.isArray(depNode.employees) ? depNode.employees : (depNode.empName ? [depNode.empName] : []);
      for (const e of employees) {
        const eid = typeof e === 'object' ? e.id : e;
        if (!eid) continue;
        // give view to employees (they work in their dept) and actions if configured
        viewSet.add(eid);
        if (includeEmployeesInActions) actionSet.add(eid);
      }

      // if department has allowEmployeeReports === false, we still keep employees in viewSet,
      // but higher-level code (helpers) can check allowEmployeeReports to block report pages.
      const allowEmployeeReports = Boolean(depNode.allowEmployeeReports);

      res[depPath] = {
        viewRoles: Array.from(viewSet),
        actionRoles: Array.from(actionSet),
        allowEmployeeReports
      };
    }
  }

  // Add a management page under /dashboard/management reserved for SuperAdmin only
  try {
    const managementPath = `${normalizedBase}/management`;
    // overallSuperId may be undefined; guard it
    res[managementPath] = {
      viewRoles: overallSuperId ? [overallSuperId] : [],
      actionRoles: overallSuperId ? [overallSuperId] : [],
    };
  } catch (e) {
    // ignore
  }

  return res;
}

/**
 * getPathsMap(opts) - memoized generator
 */
export function getPathsMap(opts = {}) {
  // simple cache: regenerate if opts differ? for now regenerate only if cache absent
  if (_cached) return _cached;
  _cached = generatePathsFromAppMap(opts);
  return _cached;
}

/**
 * utility: find template path that matches a given real path
 * (simple segment-based matching; no regex lib used)
 */
export function matchTemplatePath(realPath, pathsMap = null) {
  const map = pathsMap || getPathsMap();
  if (map[realPath]) return realPath;
  const realSeg = realPath.split('/').filter(Boolean);
  for (const tpl of Object.keys(map)) {
    const tplSeg = tpl.split('/').filter(Boolean);
    if (tplSeg.length !== realSeg.length) continue;
    let ok = true;
    for (let i = 0; i < tplSeg.length; i++) {
      if (tplSeg[i].startsWith(':')) continue;
      if (tplSeg[i] !== realSeg[i]) { ok = false; break; }
    }
    if (ok) return tpl;
  }
  return null;
}

/**
 * getRolesForPath(path)
 */
export function getRolesForPath(path) {
  const map = getPathsMap();
  const tpl = matchTemplatePath(path, map);
  if (!tpl) return { viewRoles: [], actionRoles: [], allowEmployeeReports: false };
  return map[tpl];
}

/**
 * getPathsForRole(roleId)
 */
export function getPathsForRole(roleId) {
  const map = getPathsMap();
  return Object.entries(map)
    .filter(([, entry]) => (entry.viewRoles || []).includes(roleId) || (entry.actionRoles || []).includes(roleId))
    .map(([p]) => p);
}

/**
 * invalidate cache (call if appMap changes at runtime)
 */
export function invalidatePathsCache() {
  _cached = null;
}
