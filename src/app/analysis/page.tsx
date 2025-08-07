"use client";

import { CustomNavbar } from "~/modules/Navbar/Navbar";
import { AnalysisWithLock } from "~/modules/Analysis/DData/AnalysisWithLock";

export default function AnalysisPage() {
    return (
        <main>
            <CustomNavbar />
            <AnalysisWithLock />
        </main>
    );
}
