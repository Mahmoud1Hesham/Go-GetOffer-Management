import * as Yup from "yup";

// ✅ Email Rule (gmail / yahoo / outlook فقط + domains: .com / .net / .edu / .org)
const emailRule = Yup.string()
    .required("Email is required")
    .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(edu|net|com|org)$/i,
        "Email must end with .edu, .net, .com, or .org"
    );

// ✅ Password Rule (Strong Password)
export const passwordRule = Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/\d/, "Password must contain at least one number")
    .matches(/[@$!%*?&]/, "Password must contain at least one special character")
    .trim()

// ✅ Confirm Password Rule
export const confirmPasswordRule = (refFieldName) =>
    Yup.string()
        .required("Confirm Password is required")
        .trim()
        .oneOf([Yup.ref(refFieldName), null], "Passwords must match")

// ✅ Company Name Rule
export const companyNameRule = Yup.string()
    .required("Company name is required")
    .min(2, "Company name must be at least 2 characters")
    .max(50, "Company name must be less than 50 characters")

// ✅ Egyptian Phone Number Rule (010 / 011 / 012 / 015 ويكون 11 رقم)
export const phoneNumberRule = Yup.string()
    .required("Phone number is required")
    .matches(/^(010|011|012|015)[0-9]{8}$/, "Invalid Egyptian phone number")

// ✅ Otp formula
export const otpRule = Yup.string()
    .required("OTP is required")
    .length(6, "OTP must be exactly 6 digits")
    .matches(/^[0-9]+$/, "OTP must be a number")

export const fullNameRule = Yup.string()
    .required("Full name is required")
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name must be less than 50 characters")

export const mainBranchRule = Yup.string()
    .required("Main branch name is required")
    .min(2, "Main branch name must be at least 2 characters")
    .max(50, "Main branch name must be less than 50 characters")

export const activitiesRule = Yup.array()
    .required("Activity type is required")
    .of(Yup.string())
    .min(1, "Select at least one activity")

export const governorateRule = Yup.string()
    .required("Governorate is required");
export const cityRule = Yup.string()
    .required("City is required");
export const addressDetailsRule = Yup.string()
    .required("Address details are required")
    .min(5, "Address details must be at least 5 characters")
    .max(100, "Address details must be less than 100 characters")
export const postalCodeRule = Yup.string()
    .required("Postal code is required")
    .matches(/^[0-9]{5}$/, "Postal code must be exactly 5 digits")

// ================================
// ✅ Schemas
// ================================

// Login
export const loginSchema = Yup.object({
    email: emailRule,
    passwordHash: passwordRule,
});

// Signup
export const signupSchema = Yup.object({
    email: emailRule,
    phoneNumber: phoneNumberRule,
    companyName: companyNameRule,
    passwordHash: passwordRule,
    confirmPassword: confirmPasswordRule("passwordHash"),
});

// Forgot Password otp
export const forgetPasswordOtpVerification = Yup.object({
    Otp: otpRule,
});
// Reset Password
export const resetPasswordSchema = Yup.object({
    NewPassword: passwordRule,
    confirmPassword: confirmPasswordRule("NewPassword"),
});


// Forgot Password
export const forgetPasswordSchema = Yup.object({
    email: emailRule,
});

// OTP Verification
export const otpVerificationSchema = Yup.object({
    Otp: otpRule,
});

export const supplierStepOneSchema = Yup.object({
    fullName: fullNameRule,
    phoneNumbers: Yup.array()
        .of(phoneNumberRule)
        .min(1, "At least one phone number is required")
        .max(3, "You can add up to 3 phone numbers only"),
    mainBranch: mainBranchRule,
    activities: activitiesRule,
});

export const supplierStepThreeSchema = Yup.object({
    governorate: governorateRule,
    city: cityRule,
    addressDetails: addressDetailsRule,
    postalCode: postalCodeRule,
});

export const supplierInfoSchema = Yup.object({
    fullName: fullNameRule,
    phoneNumbers: Yup.array()
        .of(phoneNumberRule)
        .min(1, "At least one phone number is required")
        .max(3, "You can add up to 3 phone numbers only"),
    mainBranch: mainBranchRule,
    activities: activitiesRule,
    governorate: governorateRule,
    city: cityRule,
    addressDetails: addressDetailsRule,
    postalCode: postalCodeRule,
});

// Export rules separately if needed
export const rules = {
    emailRule,
    passwordRule,
    companyNameRule,
    phoneNumberRule,
    otpRule,
    fullNameRule,
    mainBranchRule,
    activitiesRule,
};
