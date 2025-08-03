"use client";

import {
    Accordion,
    AccordionItem,
    Button,
    Card,
    CardBody,
    Checkbox,
    Chip,
} from "@nextui-org/react";
import { useState } from "react";
import {
    WaiverValidationErrors,
    TotalServicesUnits,
    ServicesGroupedByType,
    AssociatedServices,
    ServicesByDay,
} from "./AnalysisComponents";

interface DataRow {
    consumerName?: string;
    serviceCode?: string;
    associatedService?: string;
    documentationType?: string;
    units?: string;
    date?: string;
    "Service Code"?: string;
    "Associated Service"?: string;
    "Documentation Type"?: string;
    Units?: string;
    Date?: string;
    [key: string]: any;
}

interface DataStructure {
    rows: DataRow[];
    columns?: string[];
    rowCount?: number;
}

interface AnalysisResult {
    filteredData: DataStructure;
    groupedByService: Record<string, DataRow[]>;
    totalServiceGrouped: Record<string, number>;
    groupedByDay: Record<
        string,
        Record<
            string,
            {
                entries: DataRow[];
                warning: boolean;
                totalUnits: number;
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
    groupedByAssociatedService: Record<string, DataRow[]>;
    waiverCount: number;
}

interface ConsumerAnalysisResult {
    consumerName: string;
    analysis: AnalysisResult;
    hasErrors: boolean;
    errorCount: number;
}

function DData({
    data,
    distinctConsumerNames,
}: {
    data: DataStructure;
    distinctConsumerNames: string[];
}) {
    const [multipleEntrances, setMultipleEntrances] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [analysisResults, setAnalysisResults] = useState<
        ConsumerAnalysisResult[]
    >([]);
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

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

    const validateWaiverEntry = (row: DataRow) => {
        if (row["Service Code"] === "0000-WVR") {
            const associatedService = row["Associated Service"];
            const documentationType = row["Documentation Type"];

            const isValidService = validAssociatedServices.includes(
                associatedService || "",
            );
            const isValidDocType = validDocumentationTypes.includes(
                documentationType || "",
            );

            return {
                isValid: isValidService && isValidDocType,
                errors: [
                    !isValidService &&
                        `Invalid Associated Service: ${associatedService}`,
                    !isValidDocType &&
                        `Invalid Documentation Type: ${documentationType}`,
                ].filter((error): error is string => Boolean(error)),
            };
        }
        return { isValid: true, errors: [] };
    };

    const analyzeConsumer = (consumerName: string): ConsumerAnalysisResult => {
        const filteredRows = data.rows.filter(
            (row: DataRow) => row.consumerName === consumerName,
        );
        const filteredData = { ...data, rows: filteredRows };

        // Count total 0000-WVR entries per associated service
        const waiverCountByService = filteredRows.reduce(
            (acc: Record<string, number>, row: DataRow) => {
                if (row["Service Code"] === "0000-WVR") {
                    const associatedService =
                        row["Associated Service"] || "Unknown";
                    acc[associatedService] = (acc[associatedService] || 0) + 1;
                }
                return acc;
            },
            {},
        );

        // Get the maximum count among all associated services
        const waiverCount = Math.max(...Object.values(waiverCountByService), 0);

        // Validate waiver entries
        const waiverValidation: Record<
            string,
            { isValid: boolean; errors: string[] }
        > = {};
        filteredRows.forEach((row: DataRow, index: number) => {
            const validation = validateWaiverEntry(row);
            if (!validation.isValid) {
                waiverValidation[index.toString()] = validation;
            }
        });

        const groupedByService = filteredData.rows.reduce(
            (acc: Record<string, DataRow[]>, row: DataRow) => {
                const serviceCode =
                    row["Service Code"] || "Not a 0000-WVR service";
                if (!acc[serviceCode]) {
                    acc[serviceCode] = [];
                }
                acc[serviceCode]!.push(row);
                return acc;
            },
            {},
        );

        const totalServiceGrouped = Object.entries(groupedByService).reduce(
            (
                acc: Record<string, number>,
                [serviceCode, rows]: [string, DataRow[]],
            ) => {
                acc[serviceCode] = rows.reduce(
                    (total: number, row: DataRow) => {
                        const units = parseFloat(row.units || row.Units || "0");
                        return total + (isNaN(units) ? 0 : units);
                    },
                    0,
                );
                return acc;
            },
            {},
        );

        const groupedByDay = filteredData.rows.reduce(
            (
                acc: Record<
                    string,
                    Record<
                        string,
                        {
                            entries: DataRow[];
                            warning: boolean;
                            totalUnits: number;
                        }
                    >
                >,
                row: DataRow,
            ) => {
                const serviceCode =
                    row["Service Code"] || "Not a 0000-WVR service";
                const date = row.date || row.Date || "Not a 0000-WVR service";

                if (!acc[date]) {
                    acc[date] = {};
                }
                if (!acc[date]![serviceCode]) {
                    acc[date]![serviceCode] = {
                        entries: [],
                        warning: false,
                        totalUnits: 0,
                    };
                }

                acc[date]![serviceCode]!.entries.push(row);
                if (acc[date]![serviceCode]!.entries.length > 1) {
                    acc[date]![serviceCode]!.warning = true;
                }

                // Calculate total units for this service on this day
                const units = parseFloat(row.units || row.Units || "0");
                acc[date]![serviceCode]!.totalUnits += isNaN(units) ? 0 : units;

                return acc;
            },
            {},
        );

        // Group by Associated Service
        const groupedByAssociatedService = filteredData.rows.reduce(
            (acc: Record<string, DataRow[]>, row: DataRow) => {
                if (row["Service Code"] === "0000-WVR") {
                    const associatedService =
                        row["Associated Service"] || "Unknown";
                    const date = row.date || row.Date;
                    const docType = row["Documentation Type"];

                    if (!acc[associatedService]) {
                        acc[associatedService] = [];
                    }
                    acc[associatedService]!.push({
                        date,
                        docType,
                        ...row,
                    });
                }
                return acc;
            },
            {},
        );

        const analysis = {
            filteredData,
            groupedByService,
            totalServiceGrouped,
            groupedByDay,
            waiverValidation,
            groupedByAssociatedService,
            waiverCount,
        };

        const errorCount = Object.keys(waiverValidation).length;
        const hasErrors = errorCount > 0;

        return {
            consumerName,
            analysis,
            hasErrors,
            errorCount,
        };
    };

    const handleStartAnalysis = async () => {
        setIsAnalyzing(true);
        setError("");

        try {
            const results: ConsumerAnalysisResult[] = [];

            for (const consumerName of distinctConsumerNames) {
                const result = analyzeConsumer(consumerName);
                results.push(result);
            }

            setAnalysisResults(results);
        } catch (err) {
            setError("An error occurred during analysis");
            console.error("Analysis error:", err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const onCheckboxChange = () => {
        setMultipleEntrances(!multipleEntrances);
        setAnalysisResults([]);
        setIsAnalyzing(false);
        setError("");
    };

    return (
        <Card className="focus-within:outline-none">
            <CardBody className="p-6">
                <h4 className="mb-4 text-lg font-semibold text-gray-800">
                    Analysis for All Consumers
                </h4>
                <div className="flex flex-col gap-4">
                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                                Total Consumers: {distinctConsumerNames.length}
                            </span>
                            <Chip size="sm" color="primary" variant="flat">
                                {distinctConsumerNames.length}
                            </Chip>
                        </div>
                        <Checkbox
                            isSelected={multipleEntrances}
                            onValueChange={onCheckboxChange}
                        >
                            Multiple entrances of same service allowed
                        </Checkbox>
                    </div>
                    <Button
                        color="primary"
                        className="mt-2 h-16 text-lg font-semibold"
                        onClick={handleStartAnalysis}
                        isLoading={isAnalyzing}
                        disabled={isAnalyzing}
                    >
                        {isAnalyzing
                            ? "Analyzing..."
                            : "Start Analysis for All Consumers"}
                    </Button>

                    {analysisResults.length > 0 && (
                        <div className="mt-6">
                            <h5 className="mb-3 text-lg font-semibold">
                                Analysis Results ({analysisResults.length}{" "}
                                consumers)
                            </h5>

                            <Accordion variant="splitted">
                                {analysisResults.map(
                                    (consumerResult, index) => (
                                        <AccordionItem
                                            key={consumerResult.consumerName}
                                            aria-label={`Analysis for ${consumerResult.consumerName}`}
                                            classNames={{
                                                base: "focus-within:outline-none",
                                                title: "focus-within:outline-none",
                                                trigger:
                                                    "focus-within:outline-none",
                                                titleWrapper:
                                                    "focus-within:outline-none",
                                            }}
                                            title={
                                                <div className="flex w-full items-center justify-between">
                                                    <span className="font-medium">
                                                        {
                                                            consumerResult.consumerName
                                                        }
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        {consumerResult.hasErrors && (
                                                            <Chip
                                                                size="sm"
                                                                color="danger"
                                                                variant="flat"
                                                            >
                                                                {
                                                                    consumerResult.errorCount
                                                                }{" "}
                                                                errors
                                                            </Chip>
                                                        )}
                                                        <Chip
                                                            size="sm"
                                                            color="primary"
                                                            variant="flat"
                                                        >
                                                            {
                                                                consumerResult
                                                                    .analysis
                                                                    .filteredData
                                                                    .rows.length
                                                            }{" "}
                                                            Entries
                                                        </Chip>
                                                    </div>
                                                </div>
                                            }
                                        >
                                            <div className="space-y-4">
                                                <WaiverValidationErrors
                                                    consumerResult={
                                                        consumerResult
                                                    }
                                                />

                                                <TotalServicesUnits
                                                    consumerResult={
                                                        consumerResult
                                                    }
                                                    validServiceCodes={
                                                        validServiceCodes
                                                    }
                                                />

                                                <ServicesGroupedByType
                                                    consumerResult={
                                                        consumerResult
                                                    }
                                                    validServiceCodes={
                                                        validServiceCodes
                                                    }
                                                />

                                                <AssociatedServices
                                                    consumerResult={
                                                        consumerResult
                                                    }
                                                    validAssociatedServices={
                                                        validAssociatedServices
                                                    }
                                                />

                                                <ServicesByDay
                                                    consumerResult={
                                                        consumerResult
                                                    }
                                                    multipleEntrances={
                                                        multipleEntrances
                                                    }
                                                />
                                            </div>
                                        </AccordionItem>
                                    ),
                                )}
                            </Accordion>
                        </div>
                    )}
                </div>
            </CardBody>
        </Card>
    );
}

export default DData;
