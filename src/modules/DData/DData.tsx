"use client";

import {
    Button,
    Card,
    CardBody,
    Checkbox,
    Select,
    SelectItem,
} from "@nextui-org/react";
import { useState } from "react";

interface AnalysisResult {
    filteredData: any;
    groupedByService: Record<string, any[]>;
    totalServiceGrouped: Record<string, number>;
    groupedByDay: Record<
        string,
        Record<
            string,
            {
                entries: any[];
                warning: boolean;
            }
        >
    >;
    waiverValidation: Record<
        string,
        {
            isValid: boolean;
            errors: string[];
        }
    >;
    groupedByAssociatedService: Record<string, any[]>;
    waiverCount: number;
}

function DData({
    data,
    distinctConsumerNames,
}: {
    data: any;
    distinctConsumerNames: string[];
}) {
    const [selectedConsumer, setSelectedConsumer] = useState<string>("");
    const [multipleEntrances, setMultipleEntrances] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
        null,
    );
    console.log("🚀 ~ DData ~ analysisResult:", analysisResult);

    const validServiceCodes = ["S5130:UC", "S5135:UC", "S5151:UC", "0000-WVR"];

    const validAssociatedServices = [
        "Personal Supports",
        "Life Skills Development 1",
        "Respite",
    ];
    const validDocumentationTypes = [
        "Annual Report",
        "Monthly Summary",
        "Quarterly Summary",
    ];

    const validateWaiverEntry = (row: any) => {
        if (row["Service Code"] === "0000-WVR") {
            const associatedService = row["Associated Service"];
            const documentationType = row["Documentation Type"];

            const isValidService =
                validAssociatedServices.includes(associatedService);
            const isValidDocType =
                validDocumentationTypes.includes(documentationType);

            return {
                isValid: isValidService && isValidDocType,
                errors: [
                    !isValidService &&
                        `Invalid Associated Service: ${associatedService}`,
                    !isValidDocType &&
                        `Invalid Documentation Type: ${documentationType}`,
                ].filter(Boolean),
            };
        }
        return { isValid: true, errors: [] };
    };

    const handleStartAnalysis = () => {
        if (!selectedConsumer) {
            setError("Please select a consumer first");
            return;
        }

        const filteredRows = data.rows.filter(
            (row: any) => row.consumerName === selectedConsumer,
        );
        const filteredData = { ...data, rows: filteredRows };

        // Count total 0000-WVR entries
        const waiverCount = filteredRows.filter(
            (row: any) => row["Service Code"] === "0000-WVR",
        ).length;

        // Validate waiver entries
        const waiverValidation: Record<
            string,
            { isValid: boolean; errors: string[] }
        > = {};
        filteredRows.forEach((row: any, index: number) => {
            const validation = validateWaiverEntry(row);
            if (!validation.isValid) {
                waiverValidation[index] = validation;
            }
        });

        const groupedByService = filteredData.rows.reduce(
            (acc: any, row: any) => {
                const serviceCode =
                    row["Service Code"] || "Not a 0000-WVR service";
                if (!acc[serviceCode]) {
                    acc[serviceCode] = [];
                }
                acc[serviceCode].push(row);
                return acc;
            },
            {},
        );

        const totalServiceGrouped = Object.entries(groupedByService).reduce(
            (acc: any, [serviceCode, rows]: [string, any]) => {
                acc[serviceCode] = rows.reduce((total: number, row: any) => {
                    const units = parseFloat(row["Units"] || "0");
                    return total + (isNaN(units) ? 0 : units);
                }, 0);
                return acc;
            },
            {},
        );

        const groupedByDay = filteredData.rows.reduce((acc: any, row: any) => {
            const serviceCode = row["Service Code"] || "Not a 0000-WVR service";
            const date = row["Date"] || "Not a 0000-WVR service";

            if (!acc[date]) {
                acc[date] = {};
            }
            if (!acc[date][serviceCode]) {
                acc[date][serviceCode] = {
                    entries: [],
                    warning: false,
                };
            }

            acc[date][serviceCode].entries.push(row);
            if (acc[date][serviceCode].entries.length > 1) {
                acc[date][serviceCode].warning = true;
            }

            return acc;
        }, {});

        // Group by Associated Service
        const groupedByAssociatedService = filteredData.rows.reduce(
            (acc: any, row: any) => {
                if (row["Service Code"] === "0000-WVR") {
                    const associatedService =
                        row["Associated Service"] || "Unknown";
                    const date = row["Date"];
                    const docType = row["Documentation Type"];

                    if (!acc[associatedService]) {
                        acc[associatedService] = [];
                    }
                    acc[associatedService].push({
                        date,
                        docType,
                        ...row,
                    });
                }
                return acc;
            },
            {},
        );

        const result = {
            filteredData,
            groupedByService,
            totalServiceGrouped,
            groupedByDay,
            waiverValidation,
            groupedByAssociatedService,
            waiverCount,
        };

        setAnalysisResult(result);
        console.log("🚀 ~ Analysis Results:", result);
    };

    return (
        <Card>
            <CardBody className="p-6">
                <h4 className="mb-4 text-lg font-semibold text-gray-800">
                    Actions for{" "}
                    {selectedConsumer && (
                        <span className="text-md inline-flex items-center rounded-md bg-primary-100 px-2.5 py-0.5 text-primary-800">
                            {selectedConsumer}
                        </span>
                    )}
                </h4>
                <div className="flex flex-col gap-4">
                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}
                    <div className="flex items-center justify-between gap-4">
                        <Select
                            label="Select Consumer"
                            placeholder="Choose a consumer"
                            value={selectedConsumer}
                            onChange={(e) => {
                                setSelectedConsumer(e.target.value);
                                if (e.target.value.trim() !== "") setError("");
                            }}
                            className="max-w-xs"
                        >
                            {distinctConsumerNames.map((name) => (
                                <SelectItem key={name} value={name}>
                                    {name}
                                </SelectItem>
                            ))}
                        </Select>
                        <Checkbox
                            isSelected={multipleEntrances}
                            onValueChange={setMultipleEntrances}
                        >
                            Multiple entrances of same service allowed
                        </Checkbox>
                    </div>
                    <Button
                        color="primary"
                        className="mt-2 h-16 text-lg font-semibold"
                        onClick={handleStartAnalysis}
                    >
                        Start Analysis
                    </Button>

                    {analysisResult !== null && (
                        <div className="mt-6">
                            <h5 className="mb-3 text-lg font-semibold">
                                Analysis Results
                            </h5>

                            {Object.keys(analysisResult.waiverValidation)
                                .length > 0 && (
                                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
                                    <h6 className="mb-2 font-medium text-red-700">
                                        Waiver Entry Validation Errors
                                    </h6>
                                    {Object.entries(
                                        analysisResult.waiverValidation,
                                    ).map(([index, validation]) => (
                                        <div
                                            key={index}
                                            className="mb-2 text-red-600"
                                        >
                                            {validation.errors.map(
                                                (error, i) => (
                                                    <p key={i}>{error}</p>
                                                ),
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="rounded-lg border border-gray-200 p-4">
                                <h6 className="mb-2 font-medium">
                                    Total Services Units
                                </h6>
                                {Object.entries(
                                    analysisResult.totalServiceGrouped,
                                ).map(([service, total]) => (
                                    <div
                                        key={service}
                                        className={`flex justify-between border-b border-gray-100 px-2 py-2 ${
                                            !validServiceCodes.includes(service)
                                                ? "bg-red-50"
                                                : ""
                                        }`}
                                    >
                                        <span
                                            className={`${
                                                !validServiceCodes.includes(
                                                    service,
                                                )
                                                    ? "text-red-600"
                                                    : "text-gray-600"
                                            }`}
                                        >
                                            {service}
                                        </span>
                                        <span className="font-medium">
                                            {total}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 rounded-lg border border-gray-200 p-4">
                                <h6 className="mb-2 font-medium">
                                    Services Grouped by Type
                                </h6>
                                {Object.entries(
                                    analysisResult.groupedByService,
                                ).map(([service, items]) => (
                                    <div
                                        key={service}
                                        className={`flex justify-between border-b border-gray-100 px-2 py-2 ${
                                            !validServiceCodes.includes(service)
                                                ? "bg-red-50"
                                                : ""
                                        }`}
                                    >
                                        <span
                                            className={`${
                                                !validServiceCodes.includes(
                                                    service,
                                                )
                                                    ? "text-red-600"
                                                    : "text-gray-600"
                                            }`}
                                        >
                                            {service}
                                        </span>
                                        <span className="font-medium">
                                            {items.length} entries
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 rounded-lg border border-gray-200 p-4">
                                <h6 className="mb-2 font-medium">
                                    Associated Services
                                </h6>
                                {Object.entries(
                                    analysisResult.groupedByAssociatedService,
                                ).map(([service, items]) => (
                                    <div key={service}>
                                        <div
                                            className={`flex justify-between border-b border-gray-100 px-2 py-2 ${
                                                !validAssociatedServices.includes(
                                                    service,
                                                ) ||
                                                items.length !==
                                                    analysisResult.waiverCount
                                                    ? "bg-red-50"
                                                    : ""
                                            }`}
                                        >
                                            <span
                                                className={`${
                                                    !validAssociatedServices.includes(
                                                        service,
                                                    ) ||
                                                    items.length !==
                                                        analysisResult.waiverCount
                                                        ? "text-red-600"
                                                        : "text-gray-600"
                                                }`}
                                            >
                                                {service}
                                            </span>
                                            <span className="font-medium">
                                                {items.length} entries{" "}
                                                {items.length !==
                                                    analysisResult.waiverCount &&
                                                    `(Expected: ${analysisResult.waiverCount})`}
                                            </span>
                                        </div>
                                        {items.map(
                                            (item: any, index: number) => (
                                                <div
                                                    key={index}
                                                    className="ml-4 border-b border-gray-100 px-2 py-1 text-sm"
                                                >
                                                    <div className="text-gray-600">
                                                        Date: {item.date}
                                                    </div>
                                                    <div
                                                        className={`${
                                                            !item.docType
                                                                ? "text-red-600"
                                                                : "text-gray-600"
                                                        }`}
                                                    >
                                                        Doc Type:{" "}
                                                        {item.docType ||
                                                            "No document type"}
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 rounded-lg border border-gray-200 p-4">
                                <h6 className="mb-2 font-medium">
                                    Services by Day
                                </h6>
                                {Object.entries(analysisResult.groupedByDay)
                                    .sort()
                                    .map(([date, services]) => (
                                        <div key={date} className="mb-4">
                                            <h6 className="mb-2 bg-primary/10 px-3 py-2 text-lg font-semibold text-primary">
                                                {date}
                                            </h6>
                                            {Object.entries(services).map(
                                                ([service, data]) => (
                                                    <div
                                                        key={`${date}-${service}`}
                                                        className={`flex justify-between border-b border-gray-100 px-2 py-2 ${
                                                            !multipleEntrances &&
                                                            data.warning
                                                                ? "bg-red-50"
                                                                : ""
                                                        }`}
                                                    >
                                                        <span
                                                            className={`${
                                                                !multipleEntrances &&
                                                                data.warning
                                                                    ? "text-red-600"
                                                                    : "text-gray-600"
                                                            }`}
                                                        >
                                                            {service}
                                                        </span>
                                                        <span className="font-medium">
                                                            {
                                                                data.entries
                                                                    .length
                                                            }{" "}
                                                            entries
                                                        </span>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            </CardBody>
        </Card>
    );
}

export default DData;
