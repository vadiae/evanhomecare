"use client";

import React from "react";
import { ApryseWithLock } from "~/modules/ApryseModule/ApryseWithLock";
import { CustomNavbar } from "~/components/Navbar/Navbar";

export default function JobApplication() {
    return (
        <main>
            <CustomNavbar />
            <ApryseWithLock />
        </main>
    );
}
