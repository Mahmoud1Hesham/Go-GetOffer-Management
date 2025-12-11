import { buildPermissionMaps, getPermissionMaps, invalidatePermissionMaps } from '@/app/services/auth/permissionMaps.js';
import { getPathsMap } from '@/app/services/maps/appPathsStructure.map.js';

describe('permissionMaps', () => {
  test('builds maps consistent with pathsMap', () => {
    invalidatePermissionMaps();
    const pm = buildPermissionMaps();
    const paths = getPathsMap();

    // every path in pathsMap exists in pathToViewRoles and pathToActionRoles
    for (const [p, entry] of Object.entries(paths)) {
      expect(pm.pathToViewRoles.has(p)).toBe(true);
      expect(pm.pathToActionRoles.has(p)).toBe(true);

      const vArr = entry.viewRoles || [];
      const aArr = entry.actionRoles || [];

      const vset = pm.pathToViewRoles.get(p);
      const aset = pm.pathToActionRoles.get(p);

      for (const r of vArr) expect(vset.has(r)).toBe(true);
      for (const r of aArr) expect(aset.has(r)).toBe(true);
    }
  });

  test('getPermissionMaps returns memoized object', () => {
    const a = getPermissionMaps();
    const b = getPermissionMaps();
    expect(a).toBe(b);
  });
});
