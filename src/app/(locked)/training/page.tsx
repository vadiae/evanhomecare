"use client";

import { CustomNavbar } from "~/components/Navbar/Navbar";
import { TrainingWithLock } from "~/modules/Training";

// Force dynamic rendering - prevent static generation
export const dynamic = "force-dynamic";

export default function Training() {
    return (
        <main>
            <CustomNavbar />
            <TrainingWithLock />
        </main>
    );
}
