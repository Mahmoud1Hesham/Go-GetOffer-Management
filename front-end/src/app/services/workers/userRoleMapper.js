import { appMap } from "@/app/services/maps/appRolesStructure.map.js";

export function mapUserRole(userFromApi) {
    // backend may return role as an object { id, roleKey, roleLabel } or a string
    const rawRole = userFromApi?.role;
    const roleKey = typeof rawRole === 'string' ? rawRole : (rawRole && (rawRole.roleKey || rawRole.id)) || null;

    // map roleKey -> internal app role id if available in appMap.overall
    // appMap.overall may have keys like 'SuperAdmin' with an { id, label }
    let roleId = null;
    try {
        if (roleKey && appMap?.overall && Object.prototype.hasOwnProperty.call(appMap.overall, roleKey)) {
            roleId = appMap.overall[roleKey]?.id || roleKey;
        } else {
            // fallback: if roleKey directly equals some id, use it
            roleId = roleKey;
        }
    } catch (e) {
        roleId = roleKey;
    }

    let divisionId = null;
    let departmentId = null;

    for (const [divKey, divNode] of Object.entries(appMap.divisions || {})) {
        for (const [depKey, depNode] of Object.entries(divNode.departments || {})) {
            const headId = depNode.departmentHead?.id || depNode.depHead;
            const employees = (depNode.employees || []).map(e => (typeof e === 'object' ? e.id : e));

            if (roleId && (roleId === headId || employees.includes(roleId))) {
                divisionId = divKey;
                departmentId = depKey;
            }
        }
    }

    return {
        ...userFromApi,
        roleId,
        divisionId,
        departmentId,
    };
}
