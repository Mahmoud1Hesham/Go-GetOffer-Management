import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    brands: []
}

function mapBrandItem(item = {}) {
    // normalize subCategories: prefer existing `subCategories[]`, otherwise accept `subCategoryWithAllNameResponse`
    const rawSubCategories = (Array.isArray(item.subCategories) && item.subCategories.length)
        ? item.subCategories
        : (item.subCategoryWithAllNameResponse || item.SubCategoryWithAllNameResponse ? [item.subCategoryWithAllNameResponse || item.SubCategoryWithAllNameResponse] : []);

    // ensure each subCategory has a `categories[]` array (fallback from categoryWithAllNameResponse)
    const normalizedSubCategories = rawSubCategories.map(sc => {
        const scCategories = (Array.isArray(sc.categories) && sc.categories.length)
            ? sc.categories
            : (sc.categoryWithAllNameResponse || sc.CategoryWithAllNameResponse ? [sc.categoryWithAllNameResponse || sc.CategoryWithAllNameResponse] : []);
        return { ...sc, categories: scCategories };
    });

    return {
        id: item.id ?? null,
        name: item.name ?? null,
        name_AR: item.name_AR ?? null,
        name_EN: item.name_EN ?? null,
        imgUrl: item.imgUrl ?? null,
        imgPublicId: item.imgPublicId ?? null,
        subCategoryId: item.subCategoryId ?? item.SubCategoryId ?? normalizedSubCategories[0]?.id ?? null,
        subCategories: normalizedSubCategories,
        brandTranslations: item.brandTranslations ?? item.BrandTranslations ?? [],
        _raw: item
    }
}

const brandsSlice = createSlice({
    name: 'brands',
    initialState,
    reducers: {
        setBrands: (state, action) => {
            state.brands = action.payload.map(mapBrandItem)
        },
        clearBrands: (state) => {
            state.brands = []
        }
    }
})

export const { setBrands, clearBrands } = brandsSlice.actions
export const selectBrands = state => state.brands.brands
export default brandsSlice.reducer
