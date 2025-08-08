"use client";

import { CustomNavbar } from "~/components/Navbar/Navbar";
import { TrainingWithLock } from "~/modules/Training";

export default function Training() {
    return (
        <main>
            <CustomNavbar />
            <TrainingWithLock />
        </main>
    );
}
