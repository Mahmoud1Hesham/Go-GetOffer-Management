import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    subCategories: []
}

function mapSubCategoryItem(item = {}) {
    return {
        id: item.id ?? null,
        name: item.name ?? null,
        name_AR: item.name_AR ?? null,
        name_EN: item.name_EN ?? null,
        imgUrl: item.imgUrl ?? null,
        imgPublicId: item.imgPublicId ?? null,
        parentCategoryId: item.parentCategoryId ?? item.ParentCategoryId ?? null,
        categories: item.categories ?? [],
        subCategoryTranslations: item.subCategoryTranslations ?? item.SubCategoryTranslations ?? [],
        _raw: item
    }
}

const subCategoriesSlice = createSlice({
    name: 'subCategories',
    initialState,
    reducers: {
        setSubCategories: (state, action) => {
            state.subCategories = action.payload.map(mapSubCategoryItem)
        },
        clearSubCategories: (state) => {
            state.subCategories = []
        }
    }
})

export const { setSubCategories, clearSubCategories } = subCategoriesSlice.actions
export const selectSubCategories = state => state.subCategories.subCategories
export default subCategoriesSlice.reducer
