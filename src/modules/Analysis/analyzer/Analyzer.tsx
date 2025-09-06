"use client";

import {
    Accordion,
    AccordionItem,
    Button,
    Card,
    CardBody,
    Checkbox,
    Chip,
} from "@heroui/react";
import { useState } from "react";
import { AssociatedServices } from "../components/results/AssociatedServices";
import { ServicesByDay } from "../components/results/ServicesByDay";
import { ServicesGroupedByType } from "../components/results/ServicesGroupedByType";
import { WaiverValidationErrors } from "../components/results/WaiverValidationErrors";
import { validAssociatedServices, validServiceCodes } from "./constants";
import { type ConsumerAnalysisResult, type DataRow } from "./types";
import { validateWaiverEntry } from "./utils/validateWaiverEntry";

interface ClientSchedule {
    id: number;
    clientId: string;
    clientName: string;
    startDate: string;
    service: string;
    monday: number | null;
    tuesday: number | null;
    wednesday: number | null;
    thursday: number | null;
    friday: number | null;
    saturday: number | null;
    sunday: number | null;
    multiple: boolean | null;
    createdAt: string;
}

interface ScheduleApiResponse {
    schedules: ClientSchedule[];
    success: boolean;
    error?: string;
}

interface DataStructure {
    rows: DataRow[];
    columns?: string[];
    rowCount?: number;
    startDate?: string;
    endDate?: string;
}

function Analyzer({
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

    const analyzeConsumer = (
        consumerName: string,
        schedules: ClientSchedule[],
    ): ConsumerAnalysisResult => {
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

        // Helper function to generate all dates in range
        const generateDateRange = (
            startDate: string,
            endDate: string,
        ): string[] => {
            const dates: string[] = [];
            const start = new Date(startDate);
            const end = new Date(endDate);

            // Ensure we're working with valid dates
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                throw new Error("Invalid date format");
            }

            const current = new Date(start);
            while (current <= end) {
                // Format as MM/DD/YYYY to match your data format
                const month = String(current.getMonth() + 1).padStart(2, "0");
                const day = String(current.getDate()).padStart(2, "0");
                const year = current.getFullYear();
                dates.push(`${month}/${day}/${year}`);

                current.setDate(current.getDate() + 1);
            }

            return dates;
        };

        // Initialize the structure with all dates
        const initializeGroupedData = (startDate: string, endDate: string) => {
            const allDates = generateDateRange(startDate, endDate);
            const initialized: Record<
                string,
                Record<
                    string,
                    {
                        entries: DataRow[];
                        warning: boolean;
                        totalUnits: number;
                    }
                >
            > = {};

            // Initialize each date with empty object
            allDates.forEach((date) => {
                initialized[date] = {};
            });

            return initialized;
        };

        // Your updated groupedByDay function
        const createGroupedByDay = (
            filteredData: { rows: DataRow[] },
            startDate: string,
            endDate: string,
        ) => {
            if (!startDate || !endDate) {
                return {};
            }

            // Initialize with all dates in range
            const groupedByDay = initializeGroupedData(startDate, endDate);

            // Populate with actual data
            filteredData.rows.forEach((row: DataRow) => {
                const serviceCode =
                    row["Service Code"] || "Not a 0000-WVR service";
                const date = row.date || row.Date || "Not a 0000-WVR service";

                // Skip if date is not in our range (shouldn't happen with proper filtering)
                if (!groupedByDay[date]) {
                    return;
                }

                // Initialize service code if it doesn't exist for this date
                if (!groupedByDay[date]![serviceCode]) {
                    groupedByDay[date]![serviceCode] = {
                        entries: [],
                        warning: false,
                        totalUnits: 0,
                    };
                }

                groupedByDay[date]![serviceCode]!.entries.push(row);
                if (groupedByDay[date]![serviceCode]!.entries.length > 1) {
                    groupedByDay[date]![serviceCode]!.warning = true;
                }

                // Calculate total units for this service on this day
                const units = parseFloat(row.units || row.Units || "0");
                groupedByDay[date]![serviceCode]!.totalUnits += isNaN(units)
                    ? 0
                    : units;
            });

            return groupedByDay;
        };

        const groupedByDay = createGroupedByDay(
            filteredData,
            data.startDate || "",
            data.endDate || "",
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
            const response = await fetch("/api/client-schedule");
            const scheduleData: ScheduleApiResponse = await response.json();

            if (!scheduleData.success) {
                console.error(
                    "Failed to load client schedules:",
                    scheduleData.error,
                );
                setError("Failed to load client schedules");
                return;
            }

            console.log("Loaded client schedules:", scheduleData.schedules);

            const results: ConsumerAnalysisResult[] = [];

            for (const consumerName of distinctConsumerNames) {
                const result = analyzeConsumer(
                    consumerName,
                    scheduleData.schedules,
                );
                results.push(result);
            }

            setAnalysisResults(results);
        } catch (err) {
            setError("Ocurrió un error durante el análisis");
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
        <div className="space-y-3">
            {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
                    <p className="text-xs text-red-600">{error}</p>
                </div>
            )}

            <Card>
                <CardBody className="p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 self-start">
                            <span className="text-xl font-semibold text-gray-800">
                                Consumidores
                            </span>
                            <Chip size="sm" color="primary" variant="flat">
                                {distinctConsumerNames.length}
                            </Chip>
                        </div>

                        <div className="flex flex-col  gap-3">
                            <Checkbox
                                size="sm"
                                isSelected={multipleEntrances}
                                onValueChange={onCheckboxChange}
                                className="text-sm text-gray-700"
                            >
                                Permitir múltiples entradas
                            </Checkbox>

                            <Button
                                color="primary"
                                className="h-10 text-sm font-medium"
                                onPress={handleStartAnalysis}
                                isLoading={isAnalyzing}
                                disabled={isAnalyzing}
                            >
                                {isAnalyzing
                                    ? "Analizando..."
                                    : "Iniciar Análisis"}
                            </Button>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Compact results section */}
            {analysisResults.length > 0 && (
                <div>
                    <div className="mb-3 mt-5 flex items-center gap-2">
                        <h5 className="text-base font-semibold">
                            Datos por persona
                        </h5>
                        <Chip size="sm" color="default" variant="flat">
                            {analysisResults.length}{" "}
                            {analysisResults.length === 1
                                ? "consumidor"
                                : "consumidores"}
                        </Chip>
                    </div>

                    <Accordion variant="splitted" className="gap-2">
                        {analysisResults.map((consumerResult, index) => (
                            <AccordionItem
                                key={consumerResult.consumerName}
                                aria-label={`Análisis para ${consumerResult.consumerName}`}
                                classNames={{
                                    base: "px-3 py-2",
                                    title: "text-sm",
                                    trigger: "py-2",
                                    titleWrapper: "",
                                    content: "px-1 pt-2",
                                }}
                                title={
                                    <div className="flex w-full items-center justify-between">
                                        <span className="truncate text-sm font-medium">
                                            {index + 1}.{" "}
                                            {consumerResult.consumerName}
                                        </span>
                                        <div className="ml-2 flex items-center gap-2">
                                            {consumerResult.hasErrors && (
                                                <Chip
                                                    size="sm"
                                                    color="danger"
                                                    variant="flat"
                                                >
                                                    {consumerResult.errorCount}{" "}
                                                    {consumerResult.errorCount ===
                                                    1
                                                        ? "error"
                                                        : "errores"}
                                                </Chip>
                                            )}
                                            <Chip
                                                size="sm"
                                                color="primary"
                                                variant="flat"
                                            >
                                                {
                                                    consumerResult.analysis
                                                        .filteredData.rows
                                                        .length
                                                }{" "}
                                                {consumerResult.analysis
                                                    .filteredData.rows
                                                    .length === 1
                                                    ? "entrada"
                                                    : "entradas"}
                                            </Chip>
                                        </div>
                                    </div>
                                }
                            >
                                <div className="space-y-3">
                                    <WaiverValidationErrors
                                        consumerResult={consumerResult}
                                    />

                                    {/* Grid layout for component sections */}
                                    <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                                        <ServicesGroupedByType
                                            consumerResult={consumerResult}
                                            validServiceCodes={
                                                validServiceCodes
                                            }
                                        />
                                        <AssociatedServices
                                            consumerResult={consumerResult}
                                            validAssociatedServices={
                                                validAssociatedServices
                                            }
                                        />
                                    </div>

                                    <ServicesByDay
                                        consumerResult={consumerResult}
                                        multipleEntrances={multipleEntrances}
                                    />
                                </div>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            )}
        </div>
    );
}

export default Analyzer;
