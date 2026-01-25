import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '../../lib/axios/axios'
import { setBrands } from './brandsSlice'
import { setCategories } from './categoriesSlice'
import { setSubCategories } from './subCategoriesSlice'
import { setProductVariants } from './productVariantsSlice'
import { setProducts } from './productsSlice'

export const syncProductData = (items) => (dispatch) => {
	const allBrands = new Map()
	const allCategories = new Map()
	const allSubCategories = new Map()
	const allVariants = new Map()

	items.forEach(item => {
		if (Array.isArray(item.brands)) {
			item.brands.forEach(b => {
				if (b.id) allBrands.set(b.id, b)
			})
		}
		if (Array.isArray(item.categories)) {
			item.categories.forEach(c => {
				if (c.id) allCategories.set(c.id, c)
			})
		}
		if (Array.isArray(item.subCategories)) {
			item.subCategories.forEach(s => {
				if (s.id) allSubCategories.set(s.id, s)
			})
		}
		if (Array.isArray(item.productVariants)) {
			item.productVariants.forEach(v => {
				if (v.id) allVariants.set(v.id, v)
			})
		}
	})

	dispatch(setBrands(Array.from(allBrands.values())))
	dispatch(setCategories(Array.from(allCategories.values())))
	dispatch(setSubCategories(Array.from(allSubCategories.values())))
	dispatch(setProductVariants(Array.from(allVariants.values())))
	dispatch(setProducts(items))
}

export const fetchProducts = createAsyncThunk(
	'productsManagement/fetchProducts',
	async (_, { dispatch, rejectWithValue }) => {
		try {
			// debug: show axios baseURL and that we're about to call the endpoint
			// eslint-disable-next-line no-console
			console.debug('fetchProducts: axios baseURL=', axios.defaults?.baseURL)
			// eslint-disable-next-line no-console
			console.debug('fetchProducts: calling /api/catalog/search')
			// Fetch all products
			const res = await axios.get('/api/catalog/search', { params: { pageSize: 10000 } })
			// eslint-disable-next-line no-console
			console.debug('fetchProducts: response status=', res?.status)

			const data = res.data?.data || {}
			const items = Array.isArray(data.items) ? data.items : []

			// Extract and dispatch parts
			dispatch(syncProductData(items))

			return res.data
		} catch (err) {
			// log full error for debugging in browser
			// eslint-disable-next-line no-console
			console.error('fetchProducts: request error', err && (err.response || err.message || err))
			const message = err?.response?.data?.message || err.message || 'Fetch failed'
			return rejectWithValue(message)
		}
	}
)

export const deleteProduct = createAsyncThunk(
	'productsManagement/deleteProduct',
	async (id, { rejectWithValue }) => {
		try {
			const res = await axios.delete('/api/product', { data: { Id: id } })
			return res.data
		} catch (err) {
			const message = err?.response?.data?.message || err.message || 'Delete failed'
			return rejectWithValue(message)
		}
	}
)

export const updateProduct = createAsyncThunk(
	'productsManagement/updateProduct',
	async (data, { rejectWithValue }) => {
		try {
			const res = await axios.put('/api/product', data)
			return res.data
		} catch (err) {
			const message = err?.response?.data?.message || err.message || 'Update failed'
			return rejectWithValue(message)
		}
	}
)

const initialState = {
	status: false,
	message: '',
	statusBar: [],
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

const productsManagementSlice = createSlice({
	name: 'productsManagement',
	initialState,
	reducers: {
		clearProductError(state) {
			state.error = null
		},
		clearProductsManagement(state) {
			state.statusBar = []
			state.message = ''
			state.status = false
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchProducts.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(fetchProducts.fulfilled, (state, action) => {
				state.loading = false
				state.error = null
				state.status = action.payload?.status ?? true
				state.message = action.payload?.message ?? ''

				const data = action.payload?.data ?? {}
				state.statusBar = Array.isArray(data.statusBar)
					? data.statusBar.map(mapStatusBarItem)
					: []
			})
			.addCase(fetchProducts.rejected, (state, action) => {
				state.loading = false
				state.error = action.payload || action.error?.message || 'Failed to load products'
			})
			.addCase(deleteProduct.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(deleteProduct.fulfilled, (state, action) => {
				state.loading = false
				state.error = null
				state.message = action.payload?.message ?? 'Product deleted successfully'
			})
			.addCase(deleteProduct.rejected, (state, action) => {
				state.loading = false
				state.error = action.payload || action.error?.message || 'Failed to delete product'
			})
			.addCase(updateProduct.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(updateProduct.fulfilled, (state, action) => {
				state.loading = false
				state.error = null
				state.message = action.payload?.message ?? 'Product updated successfully'
			})
			.addCase(updateProduct.rejected, (state, action) => {
				state.loading = false
				state.error = action.payload || action.error?.message || 'Failed to update product'
			})
	},
})

export const { clearProductError, clearProductsManagement } = productsManagementSlice.actions

export const selectStatusBar = (state) => state.productsManagement.statusBar

export const selectStatusBarByKey = (key) => (state) =>
	(state.productsManagement.statusBar || []).find((s) => s.statusKey === key) || null

export const selectStatusBarSummary = (state) =>
	(state.productsManagement.statusBar || []).reduce((acc, it) => {
		acc[it.statusKey] = it.statusBarValue
		return acc
	}, {})

const productsManagementSliceReducer = productsManagementSlice.reducer
export default productsManagementSliceReducer;
