import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    productVariants: []
}

function mapProductVariantItem(item = {}) {
    return {
        id: item.id ?? null,
        productId: item.productId ?? null,
        weightDisplay: item.weightDisplay ?? null,
        imageUrl: item.imageUrl ?? null,
        imagePublicId: item.imagePublicId ?? null,
        isMainImg: item.isMainImg ?? false,
        description: item.description ?? null,
        _raw: item
    }
}

const productVariantsSlice = createSlice({
    name: 'productVariants',
    initialState,
    reducers: {
        setProductVariants: (state, action) => {
            state.productVariants = action.payload.map(mapProductVariantItem)
        },
        clearProductVariants: (state) => {
            state.productVariants = []
        }
    }
})

export const { setProductVariants, clearProductVariants } = productVariantsSlice.actions
export const selectProductVariants = state => state.productVariants.productVariants
export default productVariantsSlice.reducer
