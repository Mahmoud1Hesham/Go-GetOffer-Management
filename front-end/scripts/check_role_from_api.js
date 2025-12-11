#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

async function main() {
    const apiResponse = {
    "status": true,
    "message": "Login successful",
    "data": {
        "userId": "2e7bae05-4cd0-4c56-af2f-85611143486e",
        "username": "supplierordertrackingma",
        "avatar": null,
        "branches": [
            {
                "id": "946945ec-a7c9-4bbb-80cf-08de2f65b52c",
                "branchName": "HeadOffice (Maddi)",
                "isActive": true,
                "createdAt": "0001-01-01T00:00:00",
                "isDeleted": false,
                "deletedAt": null
            }
        ],
        "divisions": [],
        "departments": [],
        "role": {
            "id": "f8857c38-6c84-46ab-8e4b-08de352dcd06",
            "roleKey": "SupplierOrderTrackingMA",
            "roleLabel": "Supplier Order Tracking Manager",
            "roleType": "Department Head",
            "createdAt": "0001-01-01T00:00:00",
            "isDeleted": false,
            "deletedAt": null
        },
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbEFkZHJlc3MiOiJzdXBwbGllcm9yZGVydHJhY2tpbmdtYUBnZXRvZmZlcmdyb3VwLmNvbSIsInVzZXIiOiIyZTdiYWUwNS00Y2QwLTRjNTYtYWYyZi04NTYxMTE0MzQ4NmUiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJTdXBwbGllck9yZGVyVHJhY2tpbmdNQSIsImV4cCI6MTc2NTQ2MTc1NSwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo1MDAwIiwiYXVkIjoiaHR0cDovL2xvY2FsaG9zdDo1MDAwIn0.kmevWZxBjh7hcPCHEwR2YQvQTAEI5hnycuzgdqM1QBA"
    },
    "errors": null
}
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error('Usage: node scripts/check_role_from_api.js <API_URL> [method] [payloadJson] [roleJsonPath]');
        console.error('Examples:');
        console.error('  node scripts/check_role_from_api.js https://api.example.com/me');
        console.error('  node scripts/check_role_from_api.js https://api.example.com/staff/login POST "{\"email\":\"a@b.com\",\"password\":\"x\"}" user.roleId');
        process.exit(2);
    }
    const apiUrl = args[0];
    // Respect NEXT_PUBLIC_BASE_URL when a relative path is provided
    const API_BASE = process.env.NEXT_PUBLIC_BASE_URL ? String(process.env.NEXT_PUBLIC_BASE_URL).replace(/\/$/, '') : '';
    if (API_BASE) console.log('Using NEXT_PUBLIC_BASE_URL =', API_BASE);
    const method = (args[1] || 'GET').toUpperCase();
    const rawPayload = args[2] || null;
    // If the caller provided a JSON payload as the third arg, the role path may be the 4th arg
    const roleJsonPath = args[3] || (args[2] && !args[2].startsWith('{') ? args[2] : null) || null;

    const root = path.join(__dirname, '..');
    const appMapPath = path.join(root, 'src', 'app', 'services', 'maps', 'appRolesStructure.map.js');

    // If caller passes a special apiUrl 'fixture' or '--fixture', use the embedded
    // `apiResponse` object defined at the top of this file instead of making a network request.
    const useFixture = apiUrl === 'fixture' || apiUrl === '--fixture';

    function loadAppMap(filePath) {
        const src = fs.readFileSync(filePath, 'utf8');
        // naive extraction: find 'export const appMap = ' and parse the following object literal
        const m = src.match(/export\s+const\s+appMap\s*=\s*(\{[\s\S]*\});?/m);
        if (!m) throw new Error('Could not extract appMap from ' + filePath);
        const objText = m[1];
        // evaluate safely using Function
        const fn = new Function('return ' + objText + ';');
        return fn();
    }

    function collectRoleIds(obj, set = new Set()) {
        if (!obj || typeof obj !== 'object') return set;
        for (const [k, v] of Object.entries(obj)) {
            if (k === 'id' && (typeof v === 'string' || typeof v === 'number')) {
                set.add(String(v));
                continue;
            }
            if (Array.isArray(v)) {
                for (const it of v) collectRoleIds(it, set);
                continue;
            }
            if (v && typeof v === 'object') collectRoleIds(v, set);
        }
        return set;
    }

    let appMap;
    try {
        appMap = loadAppMap(appMapPath);
    } catch (err) {
        console.error('Failed to load appMap:', err && err.message ? err.message : err);
        process.exit(2);
    }

    const roleIds = collectRoleIds(appMap);

    console.log('Loaded appMap from', appMapPath);
    console.log('Found', roleIds.size, 'role IDs in appMap');

    // perform the request (GET or POST/login) OR use fixture
    let res;
    if (useFixture) {
        // emulate a Fetch Response with json() method
        res = {
            ok: true,
            status: 200,
            json: async () => apiResponse,
            text: async () => JSON.stringify(apiResponse),
        };
    } else {
        try {
            const opts = { method };
            if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
                let payloadObj = null;
                if (rawPayload) {
                    try {
                        payloadObj = JSON.parse(rawPayload);
                    } catch (e) {
                        // not JSON — try parsing simple key=value pairs (email=...&password=...)
                        const obj = {};
                        rawPayload.split('&').forEach(pair => {
                            const [k, v] = pair.split('='); if (k) obj[k] = decodeURIComponent(v || '');
                        });
                        payloadObj = obj;
                    }
                }
                opts.headers = { 'Content-Type': 'application/json' };
                if (payloadObj) opts.body = JSON.stringify(payloadObj);
            }
            // Include cookies (credentials) to match axiosRequester behavior (withCredentials: true)
            opts.credentials = 'include';

            // Ensure common headers the app sends: Accept-Language and ngrok header in dev
            opts.headers = opts.headers || {};
            // Default Accept-Language to Arabic when running in Node (matches axiosRequester behavior)
            let acceptLang = 'ar-EG';
            if (typeof window !== 'undefined') {
                try {
                    const urlLang = new URL(window.location.href).searchParams.get('lang');
                    const storedLang = localStorage.getItem('lang') || sessionStorage.getItem('lang');
                    const raw = (urlLang || storedLang || 'ar').toString().toLowerCase();
                    acceptLang = raw.startsWith('ar') ? 'ar-EG' : 'en-US';
                } catch (_) {
                    // keep default
                }
            }
            opts.headers['Accept-Language'] = opts.headers['Accept-Language'] ?? acceptLang;
            if (process.env.MOOD === 'dev') {
                opts.headers['ngrok-skip-browser-warning'] = 'true';
            }

            // If apiUrl is a relative path (starts with '/'), prefix with NEXT_PUBLIC_BASE_URL when available
            const resolvedUrl = apiUrl.startsWith('/') && API_BASE ? (API_BASE + apiUrl) : apiUrl;
            if (resolvedUrl !== apiUrl) console.log('Resolved relative apiUrl to', resolvedUrl);
            res = await fetch(resolvedUrl, opts);
        } catch (err) {
            console.error('Fetch failed:', err && err.message ? err.message : err);
            process.exit(2);
        }
    }

    if (!res.ok) {
        let bodyText = '';
        try {
            bodyText = await res.text();
        } catch (e) {
            bodyText = '<unable to read response body>';
        }
        console.error('API responded with', res.status);
        console.error('Response body:', bodyText);
        process.exit(2);
    }

    let data;
    try {
        data = await res.json();
    } catch (err) {
        console.error('Failed to parse JSON from API response:', err && err.message ? err.message : err);
        process.exit(2);
    }

    function extractByPath(obj, pathStr) {
        if (!pathStr) return null;
        const parts = pathStr.split('.');
        let cur = obj;
        for (const p of parts) {
            if (cur == null) return undefined;
            const idxMatch = p.match(/(.+)\[(\d+)\]$/);
            if (idxMatch) {
                const key = idxMatch[1];
                const idx = Number(idxMatch[2]);
                cur = cur[key];
                if (!Array.isArray(cur)) return undefined;
                cur = cur[idx];
            } else {
                cur = cur[p];
            }
        }
        return cur;
    }

    // try to guess common role fields if user didn't supply one
    const candidates = [];
    if (roleJsonPath) candidates.push(roleJsonPath);
    // prefer roleKey paths (server returns role.roleKey in our fixture)
    candidates.push('roleKey', 'role.roleKey', 'data.role.roleKey', 'data.roleId', 'role', 'user.roleId', 'user.role', 'user.roles[0]', 'roles[0]', 'data.roleId');

    let foundRoles = [];
    for (const c of candidates) {
        const val = extractByPath(data, c);
        if (val !== undefined && val !== null) {
            if (Array.isArray(val)) foundRoles.push(...val.map(x => String(x)));
            else if (typeof val === 'object' && val.id) foundRoles.push(String(val.id));
            else foundRoles.push(String(val));
        }
    }

    // dedupe
    foundRoles = [...new Set(foundRoles)];

    if (foundRoles.length === 0) {
        console.error('Could not locate role id(s) in API response. Response JSON keys:', Object.keys(data).join(', '));
        console.error('You can provide a `roleJsonPath` arg to the script, e.g. `user.roleId`');
        process.exit(2);
    }

    console.log('Role id(s) returned by API:', foundRoles.join(', '));

    // Also collect possible roleKey names from appMap (object keys like 'SuperAdmin')
    function collectKeys(o, set = new Set()) {
        if (!o || typeof o !== 'object') return set;
        for (const [k, v] of Object.entries(o)) {
            if (v && typeof v === 'object') {
                // if this object looks like a role entry (has id) then property key could be a roleKey
                if (v.hasOwnProperty('id')) set.add(String(k));
                collectKeys(v, set);
            }
        }
        return set;
    }

    const roleKeysFromMap = collectKeys(appMap);

    // helper: detect simple UUID-like strings so we can ignore backend GUIDs when roleKey is present
    function looksLikeUuid(s) {
        if (!s || typeof s !== 'string') return false;
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
    }

    const missing = foundRoles.filter(r => !(roleIds.has(r) || roleKeysFromMap.has(r)));

    // If the API returned a roleKey that matched `appMap`, treat that as authoritative
    // and ignore backend GUID-only entries (common when server returns both role.id and role.roleKey).
    const matchedRoleKeys = foundRoles.filter(r => roleKeysFromMap.has(r));
    if (matchedRoleKeys.length > 0) {
        // If everything missing is only UUID-like values, consider this a success.
        const nonUuidMissing = missing.filter(r => !looksLikeUuid(r));
        if (nonUuidMissing.length === 0) {
            console.log('Role key(s) returned by API and matched in appMap:', matchedRoleKeys.join(', '));
            console.log('Ignoring backend GUID-only role ids and treating roleKey as authoritative ✅');
            process.exit(0);
        }
        // Otherwise fall through and report missing non-UUID items.
    }

    if (missing.length === 0) {
        console.log('All returned role id(s) are present in appMap ✅');
        process.exit(0);
    } else {
        console.error('The following role id(s) were NOT found in appMap:', missing.join(', '));
        process.exit(1);
    }
}

main().catch(err => {
    console.error(err);
    process.exit(2);
});
