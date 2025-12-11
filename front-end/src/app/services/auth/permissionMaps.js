import { getPathsMap } from '../maps/appPathsStructure.map.js';

let _cached = null;

function asEntries(paths) {
    // support plain object or Map
    if (!paths) return [];
    if (paths instanceof Map) return Array.from(paths.entries());
    if (typeof paths === 'object') return Object.entries(paths);
    return [];
}

function normalizeRoleId(id) {
    if (!id && id !== 0) return null;
    return String(id).trim();
}

/**
 * buildPermissionMaps()
 * - pathToViewRoles: Map<pathTemplate, Set<roleId>>
 * - pathToActionRoles: Map<pathTemplate, Set<roleId>>
 * - roleToPaths: Map<roleId, Set<pathTemplate>>
 * - roleToActionPaths: Map<roleId, Set<pathTemplate>>
 * Memoized to avoid recomputing on every permission check.
 */
export function buildPermissionMaps() {
    if (_cached) return _cached;

    const paths = getPathsMap();
    const pathToViewRoles = new Map();
    const pathToActionRoles = new Map();
    const roleToPaths = new Map();
    const roleToActionPaths = new Map();

    for (const [p, entry] of asEntries(paths)) {
        const viewRoles = Array.isArray(entry?.viewRoles) ? entry.viewRoles : (entry?.viewRoles ? [entry.viewRoles] : []);
        const actionRoles = Array.isArray(entry?.actionRoles) ? entry.actionRoles : (entry?.actionRoles ? [entry.actionRoles] : []);

        const vset = new Set(viewRoles.filter(Boolean).map(normalizeRoleId));
        const aset = new Set(actionRoles.filter(Boolean).map(normalizeRoleId));

        pathToViewRoles.set(p, vset);
        pathToActionRoles.set(p, aset);

        for (const r of vset) {
            if (!r) continue;
            if (!roleToPaths.has(r)) roleToPaths.set(r, new Set());
            roleToPaths.get(r).add(p);
        }

        for (const r of aset) {
            if (!r) continue;
            if (!roleToPaths.has(r)) roleToPaths.set(r, new Set());
            roleToPaths.get(r).add(p);

            if (!roleToActionPaths.has(r)) roleToActionPaths.set(r, new Set());
            roleToActionPaths.get(r).add(p);
        }
    }

    _cached = { pathToViewRoles, pathToActionRoles, roleToPaths, roleToActionPaths, pathsMap: paths };
    return _cached;
}

export function invalidatePermissionMaps() {
    _cached = null;
}

export function getPermissionMaps() {
    return buildPermissionMaps();
}
