import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '../../lib/axios/axios'

const initialState = {
    categories: []
}

function mapCategoryItem(item = {}) {
    return {
        id: item.id ?? null,
        name: item.name ?? null,
        name_AR: item.name_AR ?? null,
        name_EN: item.name_EN ?? null,
        categoryKey: item.categoryKey ?? null,
        imgUrl: item.imgUrl ?? null,
        imgPublicId: item.imgPublicId ?? null,
        _raw: item
    }
}

const categoriesSlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {
        setCategories: (state, action) => {
            state.categories = action.payload.map(mapCategoryItem)
        },
        clearCategories: (state) => {
            state.categories = []
        }
    }
})

export const { setCategories, clearCategories } = categoriesSlice.actions
export const selectCategories = state => state.categories.categories
export default categoriesSlice.reducer

export const permanentDeleteCategory = createAsyncThunk(
    'categories/permanentDeleteCategory',
    async (id, { rejectWithValue }) => {
        try {
            const res = await axios.delete('/api/category/remove', { data: { CategoryId: id } })
            return res.data
        } catch (err) {
            const message = err?.response?.data?.message || err.message || 'Permanent delete failed'
            return rejectWithValue(message)
        }
    }
)
