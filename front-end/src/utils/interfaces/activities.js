import { TbMug } from "react-icons/tb";
import { LuBoxes } from "react-icons/lu";
import { MdOutlineCleanHands, MdOutlineMedicalServices, MdOutlineFastfood } from "react-icons/md";
import { PiBuildingOfficeBold } from "react-icons/pi";

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
