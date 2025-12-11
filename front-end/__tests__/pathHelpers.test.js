import { canView, canAct } from '@/app/services/workers/pathHelpers.worker.js';
import { appMap } from '@/app/services/maps/appRolesStructure.map.js';
import { mapUserRole } from '@/app/services/workers/userRoleMapper.js';

describe('pathHelpers basic rules', () => {
  test('super user can view and act any path (backend roleKey)', () => {
    // simulate backend response containing a role object with roleKey
    const backendUser = { role: { roleKey: 'SuperAdmin' } };
    const mapped = mapUserRole(backendUser);
    // ensure mapping produced an internal roleId
    expect(mapped.roleId).toBeDefined();
    expect(canView(mapped, '/')).toBe(true);
    expect(canAct(mapped, '/')).toBe(true);
  });

  test('admin can view but not act by default (backend roleKey)', () => {
    const backendAdmin = { role: 'admin' };
    const mappedAdmin = mapUserRole(backendAdmin);
    expect(mappedAdmin.roleId).toBeDefined();
    expect(canView(mappedAdmin, '/')).toBe(true);
    expect(canAct(mappedAdmin, '/')).toBe(false);
  });
});
