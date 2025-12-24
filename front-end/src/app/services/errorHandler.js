// Utility function to extract error messages consistently
export function getErrorMessage(err, fallback = "Something went wrong") {
    if (err?.response?.data?.message) {
        return err.response.data.message; 
    }
    if (err?.message) {
        return err.message;
    }
    return fallback;
}
