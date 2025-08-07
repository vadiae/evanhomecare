"use client";

import { CustomNavbar } from "~/components/Navbar/Navbar";
import { TrainingWithLock } from "~/modules/TrainingModule/TrainingWithLock";

export default function Training() {
    return (
        <main>
            <CustomNavbar />
            <TrainingWithLock />
        </main>
    );
}
