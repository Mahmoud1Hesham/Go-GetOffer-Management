import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosRequester from '../../lib/axios/axios'

export const fetchSupplierJoinRequests = createAsyncThunk(
    'supplierJoinRequests/fetch',
    async (_, { rejectWithValue }) => {
        try {
            const res = await axiosRequester.get('/api/SupplierJoinRequest')
            return res.data
        } catch (err) {
            // prefer server-provided message when available
            const msg = err?.response?.data?.message || err.message || 'Failed to fetch supplier join requests'
            return rejectWithValue(msg)
        }
    }
)

const initialState = {
    status: false,
    message: '',
    statusBar: [],
    items: [],
    loading: false,
    error: null,
}

function mapStatusBarItem(item = {}) {
    return {
        statusKey: item.id ?? null,
        statusBarValue: item.value ?? null,
        statusBarNote: item.note ?? null,
    }
}

function mapJoinRequestItem(item = {}) {
    // Pass through the item directly so consumers can map it as needed based on the new structure
    return {
        ...item,
        _raw: item
    };
}

const supplierJoinRequestsSlice = createSlice({
    name: 'supplierJoinRequests',
    initialState,
    reducers: {
        syncSupplierJoinRequests(state, action) {
            state.loading = false
            state.error = null
            
            const payload = action.payload || {};
            // Handle both structure with .data wrapper and direct structure
            const data = payload.data || payload; 
            
            state.status = payload.status ?? true
            state.message = payload.message ?? ''

            const statusBarList = Array.isArray(payload.statusBar) ? payload.statusBar : (Array.isArray(data.statusBar) ? data.statusBar : []);
            state.statusBar = statusBarList.map(mapStatusBarItem);

            const itemsList = Array.isArray(payload.items) ? payload.items : (Array.isArray(data.items) ? data.items : []);
            state.items = itemsList.map(mapJoinRequestItem);
        },
        clearSupplierJoinRequestsError(state) {
            state.error = null
        },
        clearSupplierJoinRequests(state) {
            state.statusBar = []
            state.items = []
            state.message = ''
            state.status = false
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSupplierJoinRequests.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchSupplierJoinRequests.fulfilled, (state, action) => {
                state.loading = false
                state.error = null
                
                const payload = action.payload || {};
                const data = payload.data || payload; 

                state.status = payload.status ?? true
                state.message = payload.message ?? ''

                const statusBarList = Array.isArray(payload.statusBar) ? payload.statusBar : (Array.isArray(data.statusBar) ? data.statusBar : []);
                state.statusBar = statusBarList.map(mapStatusBarItem);

                const itemsList = Array.isArray(payload.items) ? payload.items : (Array.isArray(data.items) ? data.items : []);
                state.items = itemsList.map(mapJoinRequestItem);
            })
            .addCase(fetchSupplierJoinRequests.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload || action.error?.message || 'Failed to load supplier join requests'
            })
    },
})

export const { clearSupplierJoinRequestsError, clearSupplierJoinRequests, syncSupplierJoinRequests } = supplierJoinRequestsSlice.actions

export const selectStatusBar = (state) => state.supplierJoinRequests.statusBar
export const selectItems = (state) => state.supplierJoinRequests.items
export const selectItemById = (id) => (state) =>
    (state.supplierJoinRequests.items || []).find((it) => it.requestId === id || it.id === id) || null

export const selectStatusBarByKey = (key) => (state) =>
    (state.supplierJoinRequests.statusBar || []).find((s) => s.statusKey === key) || null

export const selectStatusBarSummary = (state) =>
    (state.supplierJoinRequests.statusBar || []).reduce((acc, it) => {
        acc[it.statusKey] = it.statusBarValue
        return acc
    }, {})

export default supplierJoinRequestsSlice.reducer
