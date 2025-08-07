"use client";

import { Button, Card, CardBody, Chip, Spinner } from "@heroui/react";
import React, { useRef, useState } from "react";
import { FiDatabase, FiUpload } from "react-icons/fi";
import { Title } from "~/components/Titles/Title";
import Analyzer from "~/modules/Analysis/analyzer/Analyzer";
import TabsSection from "~/modules/Analysis/components/TabsSection";
import UserData from "~/modules/Analysis/admin/UserData";

interface JsonData {
    headers: string[];
    rows: any[][];
    consumerNames?: string[];
    reportDate?: string;
    recordsAmount?: number;
}

export default function AnalysisSection({
    user,
}: {
    user: { email: string; name: string; role: string } | null;
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [headers, setHeaders] = useState<string[]>([]);
    const [rows, setRows] = useState<any[][]>([]);
    const [error, setError] = useState<string>("");
    const [distinctConsumerNames, setDistinctConsumerNames] = useState<
        string[]
    >([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.name.endsWith(".json")) {
            setSelectedFile(file);
            void handleFileUpload(file);
        }
    };

    const handleFileUpload = async (file: File) => {
        setIsLoading(true);
        setError("");
        setRows([]);
        setHeaders([]);
        setDistinctConsumerNames([]);
        try {
            const text = await file.text();
            const jsonData: JsonData = JSON.parse(text);

            await processJsonData(jsonData);
        } catch (error) {
            setError("Error loading JSON file: " + (error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const processJsonData = async (jsonData: JsonData) => {
        try {
            setHeaders(jsonData.headers);
            setRows(jsonData.rows);

            if (jsonData.consumerNames) {
                setDistinctConsumerNames(jsonData.consumerNames);
            }
        } catch (error) {
            console.error("Error processing JSON data:", error);
            setError("Error processing JSON data: " + (error as Error).message);
        }
    };

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

                        {user && user.role === "admin" && <UserData />}

                        <Title
                            title="Data Analysis"
                            subtitle="Upload, analyze, and visualize your JSON data"
                        />

                        <div className="mb-8 grid gap-4 md:grid-cols-2">
                            <Card className="bg-gradient-to-br from-primary/5 to-transparent">
                                <CardBody className="p-8">
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="flex items-center gap-3">
                                            <FiDatabase className="h-8 w-8 text-primary" />
                                            <h3 className="text-xl font-semibold text-gray-800">
                                                Upload JSON File
                                            </h3>
                                        </div>

                                        <div className="flex flex-col items-center gap-4">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".json"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                            />
                                            <Button
                                                color="primary"
                                                variant="bordered"
                                                startContent={<FiUpload />}
                                                onClick={() =>
                                                    fileInputRef.current?.click()
                                                }
                                                className="min-w-[200px]"
                                            >
                                                Choose JSON File
                                            </Button>
                                            {selectedFile && (
                                                <Chip
                                                    color="success"
                                                    variant="flat"
                                                >
                                                    {selectedFile.name}
                                                </Chip>
                                            )}
                                        </div>
                                        {error && (
                                            <div className="w-full rounded-lg border border-red-200 bg-red-50 p-3">
                                                <p className="text-sm text-red-600">
                                                    {error}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardBody>
                            </Card>

                            <Card>
                                <CardBody className="p-6">
                                    <h4 className="mb-4 text-lg font-semibold text-gray-800">
                                        How to Use:
                                    </h4>
                                    <ul className="space-y-2 text-sm text-gray-700">
                                        <li>
                                            • Use the file input to upload any
                                            .json file with your data
                                        </li>
                                        <li>
                                            • The JSON should contain headers,
                                            rows, and consumerNames
                                        </li>
                                        <li>
                                            • Works entirely in the browser - no
                                            server required
                                        </li>
                                    </ul>
                                </CardBody>
                            </Card>
                        </div>

                        {isLoading && (
                            <div className="flex justify-center py-8">
                                <Spinner size="lg" color="primary" />
                            </div>
                        )}

                        {rows?.length > 0 && (
                            <Analyzer
                                data={{ rows, columns: headers }}
                                distinctConsumerNames={distinctConsumerNames}
                            />
                        )}

                        <TabsSection
                            distinctConsumerNames={distinctConsumerNames}
                            rows={rows}
                        />

                        {!rows && isLoading === false && (
                            <Card className="mt-6">
                                <CardBody className="p-6">
                                    <div className="text-center text-gray-500">
                                        <FiDatabase className="mx-auto mb-4 h-12 w-12 opacity-50" />
                                        <h4 className="mb-2 text-lg font-semibold">
                                            Invalid Data Format
                                        </h4>
                                        <p className="text-sm">
                                            The uploaded file does not contain
                                            valid data. Please ensure your JSON
                                            file includes the required data
                                            structure.
                                        </p>
                                    </div>
                                </CardBody>
                            </Card>
                        )}

                        {rows?.length === 0 && (
                            <Card className="mt-6">
                                <CardBody className="p-6">
                                    <div className="text-center text-gray-500">
                                        <FiDatabase className="mx-auto mb-4 h-12 w-12 opacity-50" />
                                        <h4 className="mb-2 text-lg font-semibold">
                                            No Data Available
                                        </h4>
                                        <p className="text-sm">
                                            Upload a JSON file to view and
                                            analyze the data.
                                        </p>
                                    </div>
                                </CardBody>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
