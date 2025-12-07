import { useState, useRef } from "react";
import { useModal } from "./useModal";
import { useSearchParams } from "next/navigation";

export default function useForm(initialValues, validationSchema, onSubmit) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const validationToken = useRef(0);
    const isSubmittingRef = useRef(false);
    const blurTimer = useRef(null);
    const lastBlurField = useRef(null);
    const { openModal } = useModal();
    const searchParams = useSearchParams();
    const lang = searchParams.get("lang") || (typeof i18n !== 'undefined' && i18n?.language) || "ar";

    const handleChange = async (e) => {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));

        if (touched[name]) {
            try {
                await validationSchema.validateAt(name, { ...values, [name]: value });
                setErrors((prev) => ({ ...prev, [name]: "" }));
            } catch (err) {
                setErrors((prev) => ({ ...prev, [name]: err.message }));
            }
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));

        if (isSubmittingRef.current) return;

        lastBlurField.current = name;
        if (blurTimer.current) clearTimeout(blurTimer.current);

        blurTimer.current = setTimeout(async () => {
            blurTimer.current = null;
            const token = ++validationToken.current;
            try {
                await validationSchema.validateAt(name, values);
                if (isSubmittingRef.current || validationToken.current !== token) return;
                setErrors((prev) => ({ ...prev, [name]: "" }));
            } catch (err) {
                if (isSubmittingRef.current || validationToken.current !== token) return;
                setErrors((prev) => ({ ...prev, [name]: err.message }));
            }
        }, 120);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // cancel pending blur validation and mark submitting
        if (blurTimer.current) {
            clearTimeout(blurTimer.current);
            blurTimer.current = null;
        }

        const runToken = ++validationToken.current;
        isSubmittingRef.current = true;
        try {
            await validationSchema.validate(values, { abortEarly: false });
            if (validationToken.current === runToken) {
                setErrors({});
                onSubmit(values);
            }
            return true;
        } catch (err) {
            console.error("❌ Validation Error (Full):", err);
            const newErrors = {};

            // Group errors by their root path (e.g., 'email', 'phoneNumbers')
            const grouped = {};
            (err.inner || []).forEach((error) => {
                const path = error.path || "";
                const root = path ? path.split(/\.|\[/)[0] : "";
                if (!grouped[root]) grouped[root] = [];
                grouped[root].push({ path, message: error.message, type: error.type });
                // keep exact path mapping for item-level messages
                if (path) newErrors[path] = error.message;
            });

            // For each root, collect unique messages and join them so no single error is preferred
            Object.keys(grouped).forEach((root) => {
                if (!root) return;
                const messages = Array.from(new Set(grouped[root].map((e) => e.message)));
                newErrors[root] = messages.join(" • ");
            });

            if (validationToken.current === runToken) {
                setErrors(newErrors);

                const allTouched = Object.keys(initialValues).reduce(
                    (acc, key) => ({ ...acc, [key]: true }),
                    {}
                );
                setTouched(allTouched);
                openModal({
                    type: "failure",
                    title: lang === 'en' ? "Incomplete Information !" : "معلومات غير مكتملة !",
                    message: lang === 'en' ? "Some fields are empty or invalid, Please fix the highlighted areas to continue." : "يبدو أن كل او بعض اماكن الادخال خاليه او مملوئه بمدخلات خاطئه, يرجى ملئ الاماكن المحدده بمدخلات صحيحه.",
                    actionName: lang === 'en' ? 'Retry' : 'إعادة المحاوله',
                    illustration: 'thumbs'
                });
            }
            return false;
        } finally {
            // ensure the submitting flag is cleared so blur validations resume
            isSubmittingRef.current = false;
        }
    };

    const resetForm = () => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
    };

    return {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        resetForm,
        setErrors,
        setValues,
        setTouched,
    };
}
