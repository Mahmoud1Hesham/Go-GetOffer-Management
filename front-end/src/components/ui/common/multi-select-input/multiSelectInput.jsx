import MultiSelect from "./multi-select";
import { useSearchParams } from "next/navigation";
import { activities } from "@/utils/interfaces/activities";


export default function MultiSelectInput({ options = activities, value, onValueChange, onBlur, defaultValue ,label="Activity Type",placeholder='Select Activity Types',className, disabled = false }) {
        const searchParams = useSearchParams();
        const lang = searchParams.get("lang") || (typeof i18n !== 'undefined' ? i18n.language : 'en') || "en";
    
    return (
        <div className="relative w-full">
            {/* {
                label && (
            <label
                className={`absolute ${lang === 'en' ? 'left-3' : 'right-3'} mt-1 font-semibold text-sm pointer-events-none transition-all duration-200`}
            >
                {label}
            </label>
                )
            } */}

            <MultiSelect
                options={options}
                placeholder={placeholder}
                searchable={true}
                hideSelectAll={false}
                defaultValue={value || defaultValue}
                onValueChange={onValueChange}
                onBlur={onBlur}
                disabled={disabled}
                emptyIndicator={
                    <div className="text-center p-4 text-muted-foreground">
                        <p className="text-sm">
                            {lang === 'en' ? 'No activities found matching your search' : 'لا يوجد تطابق لقيمة البحث التى تم ادخالها'}
                        </p>
                    </div>
                }
                animationConfig={{
                    badgeAnimation: "bounce",
                    popoverAnimation: "slide",
                }}
                className={`w-full pb-3  shadow-lg ${className}`}
            />
        </div>
    );
}
