"use client";

import React from "react";
import dynamic from "next/dynamic";
import { CustomNavbar } from "~/components/Navbar/Navbar";

const JobApplicationWithLock = dynamic(
    () =>
        import("~/modules/JobApplication").then((mod) => ({
            default: mod.JobApplicationWithLock,
        })),
    {
        loading: () => (
            <div className="flex min-h-screen items-center justify-center">
                Loading...
            </div>
        ),
        ssr: false, // Set to true if you want server-side rendering
    },
);

export default function JobApplication() {
    return (
        <main>
            <CustomNavbar />
            <JobApplicationWithLock />
        </main>
    );
}
