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
			// Fetch all suppliers for offline pagination by requesting a large page size
			const res = await axios.get('/api/SupplierProfile', { params: { pageSize: 10000 } })
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

export const createSupplier = createAsyncThunk(
	'supplierManagement/createSupplier',
	async (payload, { rejectWithValue }) => {
		try {
			const res = await axios.post('/api/supplierprofile/newsupplier', payload);
			return res.data;
		} catch (err) {
			const message = err?.response?.data?.message || err.message || 'Create failed';
			return rejectWithValue(message);
		}
	}
)

export const deleteSupplier = createAsyncThunk(
	'supplierManagement/deleteSupplier',
	async (id, { rejectWithValue }) => {
		try {
			const res = await axios.delete('/api/SupplierProfile', { data: { supplierId: id } ,method: 'DELETE' });
			return res.data;
		} catch (err) {
			const message = err?.response?.data?.message || err.message || 'Delete failed';
			return rejectWithValue(message);
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
	const profile = item.supplierProfile || {}
	
	const branches = Array.isArray(profile.supplierBranches) ? profile.supplierBranches : []
	const branch = branches.find(b => b.main_Branch) || branches[0] || {}
	
	const joinRequests = Array.isArray(profile.supplierJoinRequests) ? profile.supplierJoinRequests : []
	// Assuming the list is chronological, the last one is the latest
	const joinRequest = joinRequests.length > 0 ? joinRequests[joinRequests.length - 1] : {}

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
		activityType: profile.activityType ?? [],
		minimumItemInInvoice: profile.minimumItemInInvoice ?? null,
		minimumInvoiceAmount: profile.minimumInvoiceAmount ?? null,
		maximumInvoiceAmount: profile.maximumInvoiceAmount ?? null,
		maximumProcessingDays: profile.maximumProcessingDays ?? null,
		hasElectronicInvoice: profile.hasElectronicInvoice ?? false,
		hasDeliveryService: profile.hasDeliveryService ?? false,
		status: profile.status ?? null,
		code: profile.code ?? null,

		branches: branches,
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
		rejectionReasons: joinRequest.rejectionReasons ?? joinRequest.adminComment ?? null,

		// keep original raw item for reference
		_raw: item,
	}
}

const supplierManagementSlice = createSlice({
	name: 'supplierManagement',
	initialState,
	reducers: {
		syncSuppliers(state, action) {
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
		},
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
			.addCase(createSupplier.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(createSupplier.fulfilled, (state, action) => {
				state.loading = false
				state.error = null
				state.message = action.payload?.message ?? ''
				// if server returned created item in data.items or data.item, try to append
				const created = action.payload?.data ?? action.payload?.item ?? action.payload
				if (created) {
					try {
						const mapped = mapSupplierItem(created)
						state.suppliers = [mapped, ...(state.suppliers || [])]
					} catch (e) {
						// fallback: do nothing
					}
				}
			})
			.addCase(createSupplier.rejected, (state, action) => {
				state.loading = false
				state.error = action.payload || action.error?.message || 'Failed to create supplier'
			})
			.addCase(deleteSupplier.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(deleteSupplier.fulfilled, (state, action) => {
				state.loading = false
				state.error = null
				// Remove the deleted supplier from the list using the argument passed to the thunk
				state.suppliers = state.suppliers.filter(s => s.supplierId !== action.meta.arg)
			})
			.addCase(deleteSupplier.rejected, (state, action) => {
				state.loading = false
				state.error = action.payload || action.error?.message || 'Failed to delete supplier'
			})
	},
})

export const { clearSupplierError, clearSuppliers, syncSuppliers } = supplierManagementSlice.actions

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