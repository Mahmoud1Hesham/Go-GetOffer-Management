import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    brands: []
}

function mapBrandItem(item = {}) {
    return {
        id: item.id ?? null,
        name: item.name ?? null,
        name_AR: item.name_AR ?? null,
        name_EN: item.name_EN ?? null,
        imgUrl: item.imgUrl ?? null,
        imgPublicId: item.imgPublicId ?? null,
        subCategoryId: item.subCategoryId ?? item.SubCategoryId ?? null,
        subCategories: item.subCategories ?? [],
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
