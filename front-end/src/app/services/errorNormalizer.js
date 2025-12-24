// Utils/normalizeErrors.js
export function normalizeErrors(error) {
    if (!error) return {};

    // ✅ axios response format
    const data = error.response?.data;

    if (typeof data === "string") {
        return { general: data };
    }

    if (data?.message && typeof data.message === "string") {
        return { general: data.message };
    }

    if (data?.errors && typeof data.errors === "object") {
        return data.errors;
    }

    return {};
}
