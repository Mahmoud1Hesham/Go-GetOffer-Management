import { TbMug } from "react-icons/tb";
import { LuBoxes } from "react-icons/lu";
import { MdOutlineCleanHands, MdOutlineMedicalServices, MdOutlineFastfood } from "react-icons/md";
import { PiBuildingOfficeBold } from "react-icons/pi";
import MultiSelect from "./multi-select";
import { useSearchParams } from "next/navigation";

export const activities = [
    {
        en: [
            { label: "Cleaning Supplies", value: "cleaning supplies", icon: MdOutlineCleanHands },
            { label: "Medical Supplies", value: "medical supplies", icon: MdOutlineMedicalServices },
            { label: "Buffet", value: "buffet", icon: TbMug },
            { label: "Office Supplies", value: "office supplies", icon: PiBuildingOfficeBold },
            { label: "Food Products", value: "food products", icon: MdOutlineFastfood },
            { label: "Packaging Materials", value: "packaging materials", icon: LuBoxes },
        ]
    },
    {
        ar: [
            { label: "أدوات نضافه", value: "cleaning supplies", icon: MdOutlineCleanHands },
            { label: "أدوات طبية", value: "medical supplies", icon: MdOutlineMedicalServices },
            { label: "بوفيه", value: "buffet", icon: TbMug },
            { label: "أدوات مكتبية", value: "office supplies", icon: PiBuildingOfficeBold },
            { label: "منتجات غذائيه", value: "food products", icon: MdOutlineFastfood },
            { label: "مواد تعبئة وتغليف", value: "packaging materials", icon: LuBoxes },

        ]
    }
];

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
