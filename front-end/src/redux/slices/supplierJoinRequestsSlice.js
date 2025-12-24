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
    const profile = Array.isArray(item.supplierProfile) && item.supplierProfile[0] ? item.supplierProfile[0] : {}
    const branch = Array.isArray(profile.supplierBranches) && profile.supplierBranches[0] ? profile.supplierBranches[0] : {}
    const joinRequest = Array.isArray(profile.profileJoinRequests) && profile.profileJoinRequests[0] ? profile.profileJoinRequests[0] : {}

    return {
        id: item.id ?? null,
        email: item.email ?? null,
        name: item.name ?? null,
        number: item.number ?? null,
        userType: item.userType ?? null,
        type: item.type ?? null,
        requestStatus: item.requestStatus ?? null,
        createdAt: item.createdAt ?? null,

        fullName: profile.fullName ?? null,
        commercialRegistrationDocumentUrl: profile.commercialRegistrationDocumentUrl ?? [],
        commercialRegistrationDocumentPublicId: profile.commercialRegistrationDocumentPublicId ?? [],
        taxCardDocumentUrl: profile.taxCardDocumentUrl ?? [],
        taxCardDocumentPublicId: profile.taxCardDocumentPublicId ?? [],
        activityType: profile.activityType ?? [],
        code: profile.code ?? null,

        branches: profile.supplierBranches ?? [],
        branchId: branch.id ?? null,
        branchName: branch.branchName ?? null,
        governorateId: branch.governorateId ?? null,
        governorate: branch.governorate ?? null,
        cityId: branch.cityId ?? null,
        city: branch.city ?? null,
        addressDetails: branch.addressDetails ?? null,
        postalCode: branch.postalCode ?? null,
        phoneNumbers: branch.phoneNumbers ?? [],

        profileJoinRequestId: joinRequest.id ?? null,
        profileJoinRequestStatus: joinRequest.status ?? null,
        profileJoinRequestAdminComment: joinRequest.rejectionReasons ?? joinRequest.adminComment ?? null,

        _raw: item,
    }
}

const supplierJoinRequestsSlice = createSlice({
    name: 'supplierJoinRequests',
    initialState,
    reducers: {
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
                state.status = action.payload?.status ?? true
                state.message = action.payload?.message ?? ''

                const data = action.payload?.data ?? {}
                state.statusBar = Array.isArray(data.statusBar) ? data.statusBar.map(mapStatusBarItem) : []
                state.items = Array.isArray(data.items) ? data.items.map(mapJoinRequestItem) : []
            })
            .addCase(fetchSupplierJoinRequests.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload || action.error?.message || 'Failed to load supplier join requests'
            })
    },
})

export const { clearSupplierJoinRequestsError, clearSupplierJoinRequests } = supplierJoinRequestsSlice.actions

export const selectStatusBar = (state) => state.supplierJoinRequests.statusBar
export const selectItems = (state) => state.supplierJoinRequests.items
export const selectItemById = (id) => (state) =>
    (state.supplierJoinRequests.items || []).find((it) => it.id === id) || null

export const selectStatusBarByKey = (key) => (state) =>
    (state.supplierJoinRequests.statusBar || []).find((s) => s.statusKey === key) || null

export const selectStatusBarSummary = (state) =>
    (state.supplierJoinRequests.statusBar || []).reduce((acc, it) => {
        acc[it.statusKey] = it.statusBarValue
        return acc
    }, {})

export default supplierJoinRequestsSlice.reducer
