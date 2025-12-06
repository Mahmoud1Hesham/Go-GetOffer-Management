"use client";
import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
    loginSchema as baseLoginSchema,
    signupSchema as baseSignupSchema,
    forgetPasswordOtpVerification as baseOtpVerify,
    resetPasswordSchema as baseResetPassword,
    forgetPasswordSchema as baseForgetPassword,
    otpVerificationSchema as baseOtpSchema,
    supplierStepOneSchema as baseStepOne,
    supplierStepThreeSchema as baseStepThree,
    supplierInfoSchema as baseReviewPage,
} from "@/app/Validation/ValidationSchemas";

function translateSchema(schema, t) {
    const map = {
        "Email must be Gmail, Yahoo, or Outlook with valid domain (.com, .net, .edu, .org)":
            t("email.allowedProviders"),
        "Email is required": t("email.required"),

        "Password must be at least 8 characters": t("password.min"),
        "Password must contain at least one uppercase letter": t("password.uppercase"),
        "Password must contain at least one lowercase letter": t("password.lowercase"),
        "Password must contain at least one number": t("password.number"),
        "Password must contain at least one special character": t("password.special"),
        "Password is required": t("password.required"),

        "Confirm Password is required": t("confirmPassword.required"),
        "Passwords must match": t("confirmPassword.mismatch"),

        "Company name must be at least 2 characters": t("companyName.min"),
        "Company name must be less than 50 characters": t("companyName.max"),
        "Company name is required": t("companyName.required"),

        "Invalid Egyptian phone number": t("phoneNumber.invalidEgypt"),
        "Phone number is required": t("phoneNumber.required"),

        "OTP must be exactly 6 digits": t("otp.length"),
        "OTP must be a number": t("otp.numberOnly"),
        "OTP is required": t("otp.required"),

        "Full name must be at least 2 characters": t("fullName.min"),
        "Full name must be less than 50 characters": t("fullName.max"),
        "Full name is required": t("fullName.required"),

        "Main branch name must be at least 2 characters": t("mainBranch.min"),
        "Main branch name must be less than 50 characters": t("mainBranch.max"),
        "Main branch name is required": t("mainBranch.required"),

        "Select at least one activity": t("activities.minOne"),
        "Activity type is required": t("activities.required"),

        "Governorate is required": t("governorate.required"),
        "City is required": t("city.required"),

        "Address details must be at least 5 characters": t("addressDetails.min"),
        "Address details must be less than 100 characters": t("addressDetails.max"),
        "Address details are required": t("addressDetails.required"),

        "Postal code must be exactly 5 digits": t("postalCode.exactFive"),
        "Postal code is required": t("postalCode.required"),

        "At least one phone number is required": t("phonesArray.min"),
        "You can add up to 3 phone numbers only": t("phonesArray.max"),
    };

    const translateErr = (err) => {
        if (!err) return err;
        if (err.inner && err.inner.length) {
            err.inner.forEach((e) => {
                e.message = map[e.message] || e.message;
            });
        } else if (err.message) {
            err.message = map[err.message] || err.message;
        }
        return err;
    };

    return {
        async validate(values, opts) {
            try {
                return await schema.validate(values, { ...opts });
            } catch (err) {
                throw translateErr(err);
            }
        },
        async validateAt(path, values, opts) {
            try {
                return await schema.validateAt(path, values, opts);
            } catch (err) {
                throw translateErr(err);
            }
        },
        __base: schema,
    };
}

export function useValidationI18nSchemas() {
    const { t, i18n } = useTranslation(["validation"]);
    const params = useSearchParams();
    const lang = params.get("lang") || i18n.language || "en";

    useEffect(() => {
        if (i18n.language !== lang) i18n.changeLanguage(lang);
    }, [lang]);

    const schemas = useMemo(() => {
        return {
            loginSchema: translateSchema(baseLoginSchema, t),
            signupSchema: translateSchema(baseSignupSchema, t),
            forgetPasswordOtpVerification: translateSchema(baseOtpVerify, t),
            resetPasswordSchema: translateSchema(baseResetPassword, t),
            forgetPasswordSchema: translateSchema(baseForgetPassword, t),
            otpVerificationSchema: translateSchema(baseOtpSchema, t),
            supplierStepOneSchema: translateSchema(baseStepOne, t),
            supplierStepThreeSchema: translateSchema(baseStepThree, t),
            supplierInfoSchema :translateSchema(baseReviewPage,t),
        };
    }, [t, i18n.language]);

    return { schemas, t, i18n };
}
