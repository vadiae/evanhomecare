import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

import { heroui } from "@heroui/react";

export default {
    content: [
        "./src/**/*.tsx",
        "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                transparent: "transparent",
                current: "currentColor",
                primary: "#2A809C",
                secondary: "#547DA7",
            },
            fontFamily: {
                sans: ["var(--font-sans)", ...fontFamily.sans],
            },
        },
    },
    plugins: [heroui()],
} satisfies Config;
