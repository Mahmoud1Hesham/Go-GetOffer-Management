import { createSlice } from '@reduxjs/toolkit'

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
