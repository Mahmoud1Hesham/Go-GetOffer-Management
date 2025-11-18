import { appMap } from "@/app/services/maps/appRolesStructure.map.js";

export function mapUserRole(userFromApi) {
    const roleId = userFromApi.role; // backend returns role
    let divisionId = null;
    let departmentId = null;

    for (const [divKey, divNode] of Object.entries(appMap.divisions)) {
        for (const [depKey, depNode] of Object.entries(divNode.departments)) {
            const headId = depNode.departmentHead?.id || depNode.depHead;
            const employees = depNode.employees?.map(e => e.id) || [];

            if (roleId === headId || employees.includes(roleId)) {
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
