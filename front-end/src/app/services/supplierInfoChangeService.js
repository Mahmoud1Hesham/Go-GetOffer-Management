"use client";

import axiosRequester from "@/lib/axios/axios.js";

/**
 * Supplier Info Change API Service
 * Handles approval and rejection for various supplier profile update types.
 */

const API_BASE = "/api/UserUpdateRequest";

// Mapping of profile update types to their respective API segments
const TYPE_SEGMENTS = {
    "CompanyName": "companyname",
    "Email": "email",
    "PhoneNumber": "phonenumber",
    "MainBranch": "mainbranch"
};

/**
 * Helper to get the correct API segment from the profileUpdateType string.
 * Defaults to "companyname" if not matched.
 */
const getSegment = (type) => {
    // Expected types from backend: "CompanyName", "Email", "PhoneNumber", "MainBranch"
    return TYPE_SEGMENTS[type] || "companyname";
};

/**
 * Approve a supplier info change request.
 * @param {string} id - The request ID.
 * @param {string} profileUpdateType - The type of update (e.g., "CompanyName").
 */
export const approveInfoChange = async (requestId, profileUpdateType) => {
    const segment = getSegment(profileUpdateType);
    const url = `${API_BASE}/Approve-request-${segment}`;
    const response = await axiosRequester.post(url, {
        requestId,
    });
    return response.data;
};

/**
 * Reject a supplier info change request.
 * @param {string} id - The request ID.
 * @param {string} profileUpdateType - The type of update (e.g., "CompanyName").
 * @param {string} adminComment - The reason for rejection.
 */
export const rejectInfoChange = async (requestId, profileUpdateType, adminComment) => {
    const segment = getSegment(profileUpdateType);
    const url = `${API_BASE}/reject-request-${segment}`;
    const response = await axiosRequester.post(url, {
        requestId,
        adminComment
    });
    return response.data;
};
