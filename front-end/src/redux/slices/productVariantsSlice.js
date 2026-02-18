import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    productVariants: []
}

function mapProductVariantItem(item = {}) {
    // normalize weight/description which may come either as:
    // - flat fields: weightDisplay / description
    // - language-specific fields: weightDisplay_AR / weightDisplay_EN / description_AR / description_EN
    // - translations array: productVariantTranslations[{ languageCode, weightDisplay, description }]

    const translations = Array.isArray(item.productVariantTranslations) ? item.productVariantTranslations : [];
    const tAr = translations.find(t => String(t.languageCode).toLowerCase().startsWith('ar')) || translations[0] || {};
    const tEn = translations.find(t => String(t.languageCode).toLowerCase().startsWith('en')) || translations[0] || {};

    const weightDisplay = item.weightDisplay || item.weightDisplay_AR || item.weightDisplay_EN || tAr.weightDisplay || tEn.weightDisplay || null;
    const description = item.description || item.description_AR || item.description_EN || tAr.description || tEn.description || null;

    return {
        id: item.id ?? null,
        productId: item.productId ?? null,
        weightDisplay: weightDisplay,
        imageUrl: item.imageUrl ?? item.imgUrl ?? null,
        imagePublicId: item.imagePublicId ?? null,
        isMainImg: item.isMainImg ?? false,
        description: description,
        productVariantTranslations: translations,
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
