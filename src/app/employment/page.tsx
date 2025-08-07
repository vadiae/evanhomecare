"use client";

import React from "react";
import { CustomNavbar } from "~/components/Navbar/Navbar";
import { EmploymentSection } from "~/modules/Home/Employment/EmploymentSection";

export default function Employment() {
    return (
        <main>
            <CustomNavbar />

            <div className="flex w-full flex-col items-center">
                <div className="w-full max-w-[1440px] px-5 pb-20 sm:px-10">
                    <EmploymentSection />
                </div>
            </div>
        </main>
    );
}
