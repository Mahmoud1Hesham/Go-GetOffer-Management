// ensure generated maps include the app client base path used in routes
process.env.NEXT_PUBLIC_APP_BASE_PATH = '/dashboard';

const { buildPermissionMaps, invalidatePermissionMaps } = require('../src/app/services/auth/permissionMaps.js');

const backendResponse = {
    status: true,
    message: 'Login successful',
    data: {
        userId: '2e7bae05-4cd0-4c56-af2f-85611143486e',
        username: 'supplierordertrackingma',
        avatar: null,
        branches: [
            {
                id: '946945ec-a7c9-4bbb-80cf-08de2f65b52c',
                branchName: 'HeadOffice (Maddi)',
                isActive: true,
                createdAt: '0001-01-01T00:00:00',
                isDeleted: false,
                deletedAt: null,
            },
        ],
        divisions: [],
        departments: [],
        role: {
            id: 'f8857c38-6c84-46ab-8e4b-08de352dcd06',
            roleKey: 'SupplierOrderTrackingMA',
            roleLabel: 'Supplier Order Tracking Manager',
            roleType: 'Department Head',
            createdAt: '0001-01-01T00:00:00',
            isDeleted: false,
            deletedAt: null,
        },
        accessToken: 'REDACTED_FOR_TESTS',
    },
    errors: null,
};

describe('permission maps - backend role reporting', () => {
    beforeEach(() => {
        // ensure fresh build
        try { invalidatePermissionMaps(); } catch (e) {}
    });

    test('logs allowed paths for role from backend response', () => {
        const maps = buildPermissionMaps();
        const roleKey = backendResponse?.data?.role?.roleKey || backendResponse?.data?.role?.id;
        const allowed = maps.roleToPaths.get(roleKey) || new Set();
        const arr = Array.from(allowed).sort();

        // Report to test output so CI/user can see which paths are allowed
        // Jest captures console.log and prints it on failure or with --verbose
        console.log(`Allowed paths for role ${roleKey}:`, arr);

        expect(Array.isArray(arr)).toBe(true);
    });
});
