"use client";

import { CustomNavbar } from "~/components/Navbar/Navbar";
import { AnalysisWithLock } from "~/modules/Analysis";

export default function AnalysisPage() {
    return (
        <main>
            <CustomNavbar />
            <AnalysisWithLock />
        </main>
    );
}
