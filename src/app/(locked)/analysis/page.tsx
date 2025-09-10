"use client";

import { CustomNavbar } from "~/components/Navbar/Navbar";
import { AnalysisWithLock } from "~/modules/Analysis";

// Force dynamic rendering - prevent static generation
export const dynamic = "force-dynamic";

export default function AnalysisPage() {
    return (
        <main>
            <CustomNavbar />
            <AnalysisWithLock />
        </main>
    );
}
