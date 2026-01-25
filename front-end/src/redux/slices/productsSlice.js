import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    products: []
}

function mapProductItem(item = {}) {
    return {
        id: item.id ?? null,
        name: item.name ?? null,
        isTax: item.isTax ?? false,
        imageUrl: item.imageUrl ?? null,
        imagePublicId: item.imagePublicId ?? null,
        productVariants: Array.isArray(item.productVariants) ? item.productVariants : [],
        brands: Array.isArray(item.brands) ? item.brands : [],
        subCategories: Array.isArray(item.subCategories) ? item.subCategories : [],
        categories: Array.isArray(item.categories) ? item.categories : [],
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
