"use client";

import React from "react";
import { JobApplicationWithLock } from "~/modules/JobApplication";
import { CustomNavbar } from "~/components/Navbar/Navbar";

export default function JobApplication() {
    return (
        <main>
            <CustomNavbar />
            <JobApplicationWithLock />
        </main>
    );
}
