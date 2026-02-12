import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import uiReducer from "./slices/uiSlice.js";
import { modalReducer } from "./slices/modalSlice.js";
import supplierManagementReducer from "./slices/supplierManagementSlice.js";
import supplierJoinRequestsReducer from "./slices/supplierJoinRequestsSlice.js";
import productsManagementReducer from "./slices/productsManagementSlice.js";
import productsReducer from "./slices/productsSlice.js";
import brandsReducer from "./slices/brandsSlice.js";
import categoriesReducer from "./slices/categoriesSlice.js";
import subCategoriesReducer from "./slices/subCategoriesSlice.js";
import productVariantsReducer from "./slices/productVariantsSlice.js";
import { injectStore } from "../lib/axios/axios.js";


export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    modal: modalReducer,
    supplierManagement: supplierManagementReducer || ((state = null) => state),
    supplierJoinRequests: supplierJoinRequestsReducer || ((state = null) => state),
    productsManagement: productsManagementReducer || ((state = null) => state),
    products: productsReducer || ((state = null) => state),
    brands: brandsReducer || ((state = null) => state),
    categories: categoriesReducer || ((state = null) => state),
    subCategories: subCategoriesReducer || ((state = null) => state),
    productVariants: productVariantsReducer || ((state = null) => state),
  },
});

injectStore(store);
