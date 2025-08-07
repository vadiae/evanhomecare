"use client";

import { CustomNavbar } from "~/components/Navbar/Navbar";
import { AnalysisWithLock } from "~/modules/Analysis/DData/AnalysisWithLock";

export default function AnalysisPage() {
    return (
        <main>
            <CustomNavbar />
            <AnalysisWithLock />
        </main>
    );
}
