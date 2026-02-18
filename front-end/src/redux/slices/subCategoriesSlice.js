import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    subCategories: []
}

function mapSubCategoryItem(item = {}) {
    // normalize categories: prefer existing `categories[]`, otherwise use new `categoryWithAllNameResponse` shape
    const rawCategories = (Array.isArray(item.categories) && item.categories.length)
        ? item.categories
        : (item.categoryWithAllNameResponse || item.CategoryWithAllNameResponse ? [item.categoryWithAllNameResponse || item.CategoryWithAllNameResponse] : []);

    return {
        id: item.id ?? null,
        name: item.name ?? null,
        name_AR: item.name_AR ?? null,
        name_EN: item.name_EN ?? null,
        imgUrl: item.imgUrl ?? null,
        imgPublicId: item.imgPublicId ?? null,
        parentCategoryId: item.parentCategoryId ?? item.ParentCategoryId ?? rawCategories[0]?.id ?? null,
        categories: rawCategories,
        subCategoryTranslations: item.subCategoryTranslations ?? item.SubCategoryTranslations ?? item._raw?.subCategoryTranslations ?? item._raw?.SubCategoryTranslations ?? [],
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
