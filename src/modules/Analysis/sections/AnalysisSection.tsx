"use client";

import { Tabs, Tab } from "@heroui/react";
import React, { useState } from "react";
import { FiUsers, FiBarChart } from "react-icons/fi";
import dynamic from "next/dynamic";
import Analyzer from "~/modules/Analysis/analyzer/Analyzer";

const UserData = dynamic(() => import("~/modules/Analysis/admin/UserData"), {
    ssr: false,
});

export default function AnalysisSection({
    user,
}: {
    user: { email: string; name: string; role: string } | null;
}) {
    const [activeTab, setActiveTab] = useState("analysis");

    return (
        <main>
            <div className="flex w-full flex-col items-center">
                <div className="w-full max-w-[1440px] px-5 pb-20 sm:px-10">
                    <div className="mx-auto max-w-7xl sm:py-10">
                        {user && (
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    {user.name[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">
                                        {user.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Tabs Interface */}
                        <Tabs
                            selectedKey={activeTab}
                            onSelectionChange={(key) =>
                                setActiveTab(key as string)
                            }
                            className="mt-10"
                            color="primary"
                            variant="underlined"
                        >
                            <Tab
                                key="analysis"
                                title={
                                    <div className="flex items-center gap-2">
                                        <FiBarChart />
                                        <span>Analysis</span>
                                    </div>
                                }
                            />
                            {user && user.role === "admin" && (
                                <Tab
                                    key="userdata"
                                    title={
                                        <div className="flex items-center gap-2">
                                            <FiUsers />
                                            <span>User Data</span>
                                        </div>
                                    }
                                />
                            )}
                        </Tabs>

                        {/* Tab Content */}
                        {activeTab === "analysis" && <Analyzer />}

                        {activeTab === "userdata" &&
                            user &&
                            user.role === "admin" && <UserData />}
                    </div>
                </div>
            </div>
        </main>
    );
}
