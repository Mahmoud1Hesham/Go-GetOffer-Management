import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    products: []
}

function mapProductItem(item = {}) {
    // normalize brand/subcategory/category shapes coming from new API
    const brandsArr = (Array.isArray(item.brands) && item.brands.length)
        ? item.brands
        : (item.brandWithAllNameResponse || item._raw?.brandWithAllNameResponse ? [item.brandWithAllNameResponse || item._raw?.brandWithAllNameResponse] : []);

    const subCategoriesArr = (Array.isArray(item.subCategories) && item.subCategories.length)
        ? item.subCategories
        : (item.subCategoryWithAllNameResponse ? [item.subCategoryWithAllNameResponse] : (item.brandWithAllNameResponse?.subCategoryWithAllNameResponse ? [item.brandWithAllNameResponse.subCategoryWithAllNameResponse] : []));

    const categoriesArr = (Array.isArray(item.categories) && item.categories.length)
        ? item.categories
        : (item.categoryWithAllNameResponse ? [item.categoryWithAllNameResponse] : (subCategoriesArr[0]?.categoryWithAllNameResponse ? [subCategoriesArr[0].categoryWithAllNameResponse] : []));

    return {
        id: item.id ?? null,
        name: item.name ?? null,
        isTax: item.isTax ?? false,
        imageUrl: item.imageUrl ?? null,
        imagePublicId: item.imagePublicId ?? null,
        productVariants: Array.isArray(item.productVariants) ? item.productVariants : [],
        brands: brandsArr,
        subCategories: subCategoriesArr,
        categories: categoriesArr,
        _raw: item
    }
}

const productsSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        setProducts: (state, action) => {
            state.products = action.payload.map(mapProductItem)
        },
        clearProducts: (state) => {
            state.products = []
        }
    }
})

export const { setProducts, clearProducts } = productsSlice.actions
export const selectProducts = state => state.products.products
export default productsSlice.reducer
