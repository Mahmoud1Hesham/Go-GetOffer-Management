import { getPathsMap, matchTemplatePath } from '../maps/appPathsStructure.map.js';
import { appMap } from '../maps/appRolesStructure.map.js'; // path to your appMap
import { getPermissionMaps } from '@/app/services/auth/permissionMaps.js';

// local helper: convert label to kebab-case (same logic used when generating paths)
const toKebab = (s) =>
    String(s || '')
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/[_\s]+/g, '-')
        .toLowerCase();

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
const toStr = v => (v === null || typeof v === 'undefined' ? null : String(v));
// build candidate role identifiers from user object (same logic used elsewhere)
function roleCandidates(user) {
    if (!user) return [];
    return [
        user.roleId,
        user.role,
        user.roleKey,
        user?.role?.roleKey,
        user?.role?.id,
    ].filter(Boolean).map(toStr);
}

// shortcuts
function isSuper(user) {
    if (!user) return false;
    const overall = appMap?.overall || {};
    const candidates = [];
    if (overall.SuperAdmin) candidates.push(toId(overall.SuperAdmin));
    if (overall.superAdmin) candidates.push(toId(overall.superAdmin));
    return candidates.some(id => toStr(id) === toStr(user.roleId));
}
function isAdmin(user) {
    return Boolean(user && toStr(toId(appMap.overall?.admin)) === toStr(user.roleId));
}
function isDeptHead(user, deptNode) {
    if (!deptNode || !user) return false;
    return toStr(user.roleId) === toStr(toId(deptNode.departmentHead));
}
function isDivisionHead(user, divNode) {
    if (!divNode || !user) return false;
    return toStr(user.roleId) === toStr(toId(divNode.divisionHead || divNode.devHead));
}
function isDeptEmployee(user, deptNode) {
    if (!deptNode || !user) return false;
    const emps = Array.isArray(deptNode.employees) ? deptNode.employees : (deptNode.empName ? [deptNode.empName] : []);
    return emps.some(e => toStr(typeof e === 'object' ? e.id : e) === toStr(user.roleId));
}

/**
 * canView(user, path)
 * - uses appMap scopes (viewScope) + extras + admin/super rules
 * - user should contain: { roleId, divisionId, departmentId }
 */
export function canView(user, path) {
    if (!user || !path) return false;
    // dev-only debug logging to help trace why permissions fail
    if (process.env.NODE_ENV !== 'prod') {
        try {
            const debugUser = { roleId: user.roleId, role: user.role, roleKey: user.roleKey, divisionId: user.divisionId, departmentId: user.departmentId };
            console.debug('[pathHelpers.canView] user snapshot:', debugUser, 'path:', path);
        } catch (e) {}
    }

    if (isSuper(user)) return true;
    if (isAdmin(user)) {
        // admin is allowed to view most pages (policy); if you want admin to be restricted,
        // remove this early return and rely on extraViewRoles or scopes
        return true;
    }

    // try to map path => division/department
    const tpl = matchTemplatePath(path, getPathsMap());
    if (!tpl) return false;

    // fast explicit-role lookup using precomputed sets
    try {
        const { pathToViewRoles } = getPermissionMaps();
        const vset = pathToViewRoles.get(tpl);
        if (process.env.NODE_ENV !== 'production') {
            try { console.debug('[pathHelpers.canView] tpl=', tpl, 'vset=', vset ? Array.from(vset) : null); } catch (e) {}
        }
        if (vset) {
            const candidates = roleCandidates(user);
            if (process.env.NODE_ENV !== 'production') {
                try { console.debug('[pathHelpers.canView] roleCandidates=', candidates); } catch (e) {}
            }
            for (const rid of candidates) {
                if (vset.has(rid)) return true;
            }
        }
    } catch (_) {
        // fall back to slower path below if permission maps not available
    }

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

    // fast explicit-action lookup using precomputed sets
    try {
        const { pathToActionRoles } = getPermissionMaps();
        const aset = pathToActionRoles.get(tpl);
        if (aset) {
            const candidates = roleCandidates(user);
            for (const rid of candidates) {
                if (aset.has(rid)) return true;
            }
        }
    } catch (_) {
        // fall back to slower path below if permission maps not available
    }
    const mapEntry = getPathsMap()[tpl];

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
export { getPathsMap as getPathsMapSync } from '../maps/appPathsStructure.map.js';
