import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '../../lib/axios/axios'

export const fetchSuppliers = createAsyncThunk(
	'supplierManagement/fetchSuppliers',
	async (_, { rejectWithValue }) => {
		try {
			// debug: show axios baseURL and that we're about to call the endpoint
			// eslint-disable-next-line no-console
			console.debug('fetchSuppliers: axios baseURL=', axios.defaults?.baseURL)
			// eslint-disable-next-line no-console
			console.debug('fetchSuppliers: calling /api/SupplierProfile')
			const res = await axios.get('/api/SupplierProfile')
			// eslint-disable-next-line no-console
			console.debug('fetchSuppliers: response status=', res?.status)
			return res.data
		} catch (err) {
			// log full error for debugging in browser
			// eslint-disable-next-line no-console
			console.error('fetchSuppliers: request error', err && (err.response || err.message || err))
			const message = err?.response?.data?.message || err.message || 'Fetch failed'
			return rejectWithValue(message)
		}
	}
)

const initialState = {
	status: false,
	message: '',
	statusBar: [],
	suppliers: [],
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

function mapSupplierItem(item = {}) {
	const profile = Array.isArray(item.supplierProfile) && item.supplierProfile[0] ? item.supplierProfile[0] : {}
	const branch = Array.isArray(profile.supplierBranches) && profile.supplierBranches[0] ? profile.supplierBranches[0] : {}
	const joinRequest = Array.isArray(profile.profileJoinRequests) && profile.profileJoinRequests[0] ? profile.profileJoinRequests[0] : {}

	return {
		supplierId: item.id ?? null,
		email: item.email ?? null,
		companyName: item.name ?? null,
		companyNumber: item.number ?? null,
		type: item.type ?? null,
		isBanned: item.isBanned ?? false,
		isDeleted: item.isDeleted ?? false,
		joinDate: item.createdAt ?? null,

		fullName: profile.fullName ?? null,
		commercialRegistrationDocumentUrl: profile.commercialRegistrationDocumentUrl ?? [],
		commercialRegistrationDocumentPublicId: profile.commercialRegistrationDocumentPublicId ?? [],
		taxCardDocumentUrl: profile.taxCardDocumentUrl ?? [],
		taxCardDocumentPublicId: profile.taxCardDocumentPublicId ?? [],
		categories: profile.activityType ?? [],
		minimumIteamInInvoice: profile.minimumIteamInInvoice ?? null,
		minimumInvoiceAmount: profile.minimumInvoiceAmount ?? null,
		maximumInvoiceAmount: profile.maximumInvoiceAmount ?? null,
		maximumProcessingDays: profile.maximumProcessingDays ?? null,
		hasElectronicInvoice: profile.hasElectronicInvoice ?? false,
		hasDeliveryService: profile.hasDeliveryService ?? false,
		status: profile.status ?? null,
		code: profile.code ?? null,

		branchId: branch.id ?? null,
		branchName: branch.branchName ?? null,
		governorateId: branch.governorateId ?? null,
		governorate: branch.governorate ?? null,
		cityId: branch.cityId ?? null,
		city: branch.city ?? null,
		addressDetails: branch.addressDetails ?? null,
		postalCode: branch.postalCode ?? null,
		phoneNumbers: branch.phoneNumbers ?? [],

		supplierJoinRequestId: joinRequest.id ?? null,
		rejectionReasons: joinRequest.adminComment ?? null,

		// keep original raw item for reference
		_raw: item,
	}
}

const supplierManagementSlice = createSlice({
	name: 'supplierManagement',
	initialState,
	reducers: {
		clearSupplierError(state) {
			state.error = null
		},
		clearSuppliers(state) {
			state.statusBar = []
			state.suppliers = []
			state.message = ''
			state.status = false
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchSuppliers.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(fetchSuppliers.fulfilled, (state, action) => {
				state.loading = false
				state.error = null
				state.status = action.payload?.status ?? true
				state.message = action.payload?.message ?? ''

				const data = action.payload?.data ?? {}
				state.statusBar = Array.isArray(data.statusBar)
					? data.statusBar.map(mapStatusBarItem)
					: []

				state.suppliers = Array.isArray(data.items)
					? data.items.map(mapSupplierItem)
					: []
			})
			.addCase(fetchSuppliers.rejected, (state, action) => {
				state.loading = false
				state.error = action.payload || action.error?.message || 'Failed to load suppliers'
			})
	},
})

export const { clearSupplierError, clearSuppliers } = supplierManagementSlice.actions

export const selectStatusBar = (state) => state.supplierManagement.statusBar
export const selectSuppliers = (state) => state.supplierManagement.suppliers
export const selectSupplierById = (id) => (state) =>
	state.supplierManagement.suppliers.find((s) => s.supplierId === id) || null

export const selectStatusBarByKey = (key) => (state) =>
	(state.supplierManagement.statusBar || []).find((s) => s.statusKey === key) || null

export const selectStatusBarSummary = (state) =>
	(state.supplierManagement.statusBar || []).reduce((acc, it) => {
		acc[it.statusKey] = it.statusBarValue
		return acc
	}, {})

const supplierManagementSliceReducer = supplierManagementSlice.reducer
export default supplierManagementSliceReducer;