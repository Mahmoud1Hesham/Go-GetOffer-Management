import axiosRequester from '@/lib/axios/axios.js';
import store from '@/redux/store.js';
import { setCredentials, logout, setAuthLoading } from '@/redux/slices/authSlice.js';
import { mapUserRole } from '@/app/services/workers/userRoleMapper.js';

let _initialized = false;     
let _initPromise = null;      

export function initializeApp() {
    if (_initialized) {
        return Promise.resolve({ ok: true });
    }

    if (_initPromise) {
        return _initPromise;
    }

    _initPromise = (async () => {
        try {
            store.dispatch(setAuthLoading(true));

            const res = await axiosRequester.post('/api/staff/auth/refresh-token', {}, { withCredentials: true });
            const token = res.data?.data?.accessToken;
            const user = res.data?.data?.user;
            if (!token) {
                store.dispatch(logout());
                return { ok: false };
            }

            // map role -> division/department etc
            const mappedUser = mapUserRole(user);
            store.dispatch(setCredentials({ user: mappedUser, token }));

            _initialized = true;
            return { ok: true, user: mappedUser };
        } catch (err) {
            store.dispatch(logout());
            return { ok: false, error: err };
        } finally {
            store.dispatch(setAuthLoading(false));
            _initPromise = null; 
        }
    })();

    return _initPromise;
}
