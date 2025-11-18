// src/helpers/accessHelpers.js
import { getPathsMap, matchTemplatePath } from '../config/pathsMap.js';
import { appMap } from '../config/appRolesStructure.map.js'; // path to your appMap

// helper: get dept node by divisionId & departmentId
function getDeptNode(divisionId, departmentId) {
    const div = appMap?.divisions?.[divisionId];
    if (!div) return null;
    return div.departments?.[departmentId] || null;
}

// helper: get division node by divisionId
function getDivNode(divisionId) {
    return appMap?.divisions?.[divisionId] || null;
}

const toId = v => (v && typeof v === 'object' ? v.id : v);

// shortcuts
function isSuper(user) {
    return Boolean(user && toId(appMap.overall?.superAdmin) === user.roleId);
}
function isAdmin(user) {
    return Boolean(user && toId(appMap.overall?.admin) === user.roleId);
}
function isDeptHead(user, deptNode) {
    if (!deptNode || !user) return false;
    return user.roleId === toId(deptNode.departmentHead);
}
function isDivisionHead(user, divNode) {
    if (!divNode || !user) return false;
    return user.roleId === toId(divNode.divisionHead || divNode.devHead);
}
function isDeptEmployee(user, deptNode) {
    if (!deptNode || !user) return false;
    const emps = Array.isArray(deptNode.employees) ? deptNode.employees : (deptNode.empName ? [deptNode.empName] : []);
    return emps.some(e => (typeof e === 'object' ? e.id : e) === user.roleId);
}

/**
 * canView(user, path)
 * - uses appMap scopes (viewScope) + extras + admin/super rules
 * - user should contain: { roleId, divisionId, departmentId }
 */
export function canView(user, path) {
    if (!user || !path) return false;
    if (isSuper(user)) return true;
    if (isAdmin(user)) {
        // admin is allowed to view most pages (policy); if you want admin to be restricted,
        // remove this early return and rely on extraViewRoles or scopes
        return true;
    }

    // try to map path => division/department
    const tpl = matchTemplatePath(path, getPathsMap());
    if (!tpl) return false;
    const mapEntry = getPathsMap()[tpl];

    // if user role explicitly listed in mapEntry.viewRoles => allow
    if (mapEntry.viewRoles && mapEntry.viewRoles.includes(user.roleId)) return true;

    // else interpret scopes from appMap (preferred)
    const parts = tpl.split('/').filter(Boolean);
    if (parts.length === 1) {
        // division root view
        const divisionId = Object.keys(appMap.divisions).find(k => toKebab(appMap.divisions[k].id || k) === parts[0]) || parts[0];
        const divNode = getDivNode(divisionId);
        if (!divNode) return false;
        // division-level scope: allow division head or members of same division
        if (isDivisionHead(user, divNode)) return true;
        // allow dept heads inside division to view (if their roleId matches)
        // if user belongs to same division, allow viewing division root
        if (user.divisionId && user.divisionId === divisionId) return true;
        return false;
    } else if (parts.length === 2) {
        // department page
        // identify divisionId and departmentId by matching kebab values
        const [divSegment, depSegment] = parts;
        let divisionId = null, departmentId = null;
        for (const [k, v] of Object.entries(appMap.divisions || {})) {
            const divKebab = toKebab(v.id || k);
            if (divKebab === divSegment) {
                divisionId = k;
                // find department by kebab
                for (const [dk, dv] of Object.entries(v.departments || {})) {
                    const depKebab = toKebab(dv.id || dk);
                    if (depKebab === depSegment) {
                        departmentId = dk;
                        break;
                    }
                }
                break;
            }
        }
        if (!divisionId || !departmentId) return false;
        const deptNode = getDeptNode(divisionId, departmentId);
        if (!deptNode) return false;

        // explicit allow-list already checked earlier
        // enforce scopes from deptNode.viewScope
        const scope = deptNode.viewScope || (appMap.divisions[divisionId].viewScope || 'department');

        // department scope: department head or employees of same dept
        if (scope === 'department') {
            if (isDeptHead(user, deptNode)) return true;
            if (isDeptEmployee(user, deptNode)) {
                // check reports flag if path is report (you may need to detect report paths by naming)
                if (!deptNode.allowEmployeeReports) {
                    // optional: if this is a reports path, block. For general pages allow.
                    // We can't detect report pages generically here; the caller can pass a flag or use a route naming convention.
                }
                return true;
            }
            return false;
        }

        // division scope: division head or anyone belonging to same division (view-only)
        if (scope === 'division') {
            if (isDivisionHead(user, appMap.divisions[divisionId])) return true;
            if (user.divisionId && user.divisionId === divisionId) return true;
            return false;
        }

        // company/global
        if (scope === 'company' || scope === 'global') {
            return isAdmin(user) || isSuper(user);
        }

        // specific: rely on explicit lists (already checked)
        return false;
    }

    return false;
}

/**
 * canAct(user, path)
 * - super can act
 * - admin cannot act by default
 * - department employees can act within their department (if actionScope allows)
 * - dept/div heads do NOT act by default unless explicitly in actionRoles/extraActionRoles
 */
export function canAct(user, path) {
    if (!user || !path) return false;
    if (isSuper(user)) return true;
    if (isAdmin(user)) return false; // admin view-only by default

    const tpl = matchTemplatePath(path, getPathsMap());
    if (!tpl) return false;
    const mapEntry = getPathsMap()[tpl];

    // explicit action roles
    if (mapEntry.actionRoles && mapEntry.actionRoles.includes(user.roleId)) return true;

    // derive from appMap scopes for department pages
    const parts = tpl.split('/').filter(Boolean);
    if (parts.length === 2) {
        const [divSegment, depSegment] = parts;
        let divisionId = null, departmentId = null;
        for (const [k, v] of Object.entries(appMap.divisions || {})) {
            const divKebab = toKebab(v.id || k);
            if (divKebab === divSegment) {
                divisionId = k;
                for (const [dk, dv] of Object.entries(v.departments || {})) {
                    const depKebab = toKebab(dv.id || dk);
                    if (depKebab === depSegment) {
                        departmentId = dk;
                        break;
                    }
                }
                break;
            }
        }
        if (!divisionId || !departmentId) return false;
        const deptNode = getDeptNode(divisionId, departmentId);
        if (!deptNode) return false;

        const actionScope = deptNode.actionScope || (appMap.divisions[divisionId].actionScope || 'department');

        if (actionScope === 'department') {
            // employees of the department can act
            if (isDeptEmployee(user, deptNode)) return true;
            return false;
        }

        if (actionScope === 'division') {
            // members of same division can act (if policy allows)
            if (user.divisionId && user.divisionId === divisionId) return true;
            return false;
        }

        if (actionScope === 'company' || actionScope === 'global') {
            // usually only super or explicit extras
            return isSuper(user);
        }

        // specific: already checked explicit actionRoles earlier
        return false;
    }

    // non-department pages: default deny unless explicit actionRoles contains user
    return false;
}

/**
 * utility: expose getPathsMap for consumers
 */
export { getPathsMap as getPathsMapSync } from '../config/pathsMap.js';
