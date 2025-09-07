"use client";

import {
    Accordion,
    AccordionItem,
    Button,
    Card,
    CardBody,
    Checkbox,
    Chip,
    Spinner,
} from "@heroui/react";
import { useRef, useState } from "react";
import { FiDatabase, FiUpload } from "react-icons/fi";
import { Title } from "~/components/Titles/Title";
import { AssociatedServices } from "../components/results/AssociatedServices";
import { ScheduleMismatches } from "../components/results/ScheduleMismatches";
import { ServicesByDay } from "../components/results/ServicesByDay";
import { ServicesGroupedByType } from "../components/results/ServicesGroupedByType";
import { WaiverValidationErrors } from "../components/results/WaiverValidationErrors";
import { validAssociatedServices, validServiceCodes } from "./constants";
import { type ConsumerAnalysisResult } from "./types";
import {
    type ClientSchedule,
    type ProcessedData,
    handleFileUpload,
    analyzeConsumer,
    analyzeScheduleActivityMismatches,
} from "./utils/dataProcessing";

interface ScheduleApiResponse {
    schedules: ClientSchedule[];
    success: boolean;
    error?: string;
}

function Analyzer() {
    const [multipleEntrances, setMultipleEntrances] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [analysisResults, setAnalysisResults] = useState<
        ConsumerAnalysisResult[]
    >([]);
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [isAnalyzingPredictive, setIsAnalyzingPredictive] =
        useState<boolean>(false);

    // File upload and data processing states
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [headers, setHeaders] = useState<string[]>([]);
    const [rows, setRows] = useState<any[][]>([]);

    const [distinctConsumerNames, setDistinctConsumerNames] = useState<
        string[]
    >([]);
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    const [mismatches, setMismatches] = useState<Record<string, any[]>>({});

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.name.endsWith(".json")) {
            setSelectedFile(file);
            void processFileUpload(file);
        }
    };

    const processFileUpload = async (file: File) => {
        setIsLoading(true);
        setError("");
        setRows([]);
        setHeaders([]);
        setDistinctConsumerNames([]);
        setStartDate("");
        setEndDate("");

        try {
            const processedData: ProcessedData = await handleFileUpload(file);

            setHeaders(processedData.headers);
            setRows(processedData.rows);
            setStartDate(processedData.startDate);
            setEndDate(processedData.endDate);
            setDistinctConsumerNames(processedData.distinctConsumerNames);
        } catch (error) {
            setError((error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartAnalysis = async () => {
        setIsAnalyzing(true);
        setError("");

        try {
            // Load client schedules for analysis
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

            const results: ConsumerAnalysisResult[] = [];

            for (const consumerName of distinctConsumerNames) {
                const result = analyzeConsumer(
                    consumerName,
                    rows,
                    headers,
                    startDate,
                    endDate,
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

    const handleStartAnalysisPredictive = async () => {
        setIsAnalyzingPredictive(true);
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

            const groupedRows = rows.reduce(
                (acc: Record<string, any[]>, row: any) => {
                    // Extract the ID from consumerName format: "Name, LastName ('someID')"
                    const consumerName =
                        typeof row === "object" &&
                        row !== null &&
                        "consumerName" in row
                            ? String(
                                  (row as Record<string, unknown>).consumerName,
                              )
                            : "";
                    const idMatch =
                        typeof consumerName === "string"
                            ? consumerName.match(/\('([^']+)'\)/)
                            : null;
                    const id = idMatch?.[1] || consumerName;

                    if (typeof id === "string" && id && !acc[id]) {
                        acc[id] = [];
                    }
                    if (typeof id === "string" && id) {
                        acc[id]!.push(row);
                    }
                    return acc;
                },
                {} as Record<string, any[]>,
            );

            const results = analyzeScheduleActivityMismatches(
                groupedRows,
                scheduleData.schedules,
            );

            setMismatches(results as Record<string, any[]>);
        } catch (err) {
            setError("Ocurrió un error durante el análisis predictivo");
            console.error("Predictive analysis error:", err);
        } finally {
            setIsAnalyzingPredictive(false);
        }
    };

    const onCheckboxChange = () => {
        setMultipleEntrances(!multipleEntrances);
        setAnalysisResults([]);
        setMismatches({});
        setIsAnalyzing(false);
        setIsAnalyzingPredictive(false);
        setError("");
    };

    return (
        <div className="space-y-3">
            <Title title="Data Analysis" />

            <div className="mb-8 w-full">
                {/* Upload and Instructions Section */}
                <div className="mb-6 flex flex-col gap-4 lg:gap-6 xl:flex-row">
                    {/* Upload Card - Takes more space on large screens */}
                    <Card className="via-primary/3 border-0 bg-gradient-to-br from-primary/5 to-transparent shadow-lg lg:col-span-2 xl:flex-1">
                        <CardBody className="flex h-full flex-col p-6 sm:p-8">
                            <div className="flex flex-1 flex-col items-center gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-primary/10 p-2">
                                        <FiDatabase className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800 sm:text-xl">
                                        Subir archivo JSON
                                    </h3>
                                </div>

                                <div className="flex w-full flex-col items-center gap-4">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".json"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />

                                    {/* Upload Button */}
                                    <Button
                                        color="primary"
                                        variant="bordered"
                                        startContent={
                                            <FiUpload className="h-4 w-4" />
                                        }
                                        onPress={() =>
                                            fileInputRef.current?.click()
                                        }
                                        className="h-12 w-full min-w-[200px] border-2 text-sm font-medium transition-all duration-200 hover:border-primary-600 sm:w-auto"
                                    >
                                        Escoge un archivo JSON
                                    </Button>

                                    {/* Selected File Indicator */}
                                    {selectedFile && (
                                        <div className="flex w-full items-center justify-center gap-2">
                                            <Chip
                                                color="success"
                                                variant="flat"
                                                startContent={
                                                    <div className="h-2 w-2 rounded-full bg-success" />
                                                }
                                                className="max-w-[250px] truncate"
                                            >
                                                {selectedFile.name}
                                            </Chip>
                                        </div>
                                    )}
                                </div>

                                {/* Error Display */}
                                {error && (
                                    <div className="w-full rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                                                <div className="h-2 w-2 rounded-full bg-red-500" />
                                            </div>
                                            <p className="text-sm leading-relaxed text-red-700">
                                                {error}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardBody>
                    </Card>

                    {/* Instructions Card */}
                    <Card className="border-0 shadow-lg xl:flex-1">
                        <CardBody className="flex h-full flex-col p-6">
                            <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
                                <div className="h-2 w-2 rounded-full bg-primary" />
                                Cómo usar
                            </h4>
                            <ul className="flex-1 space-y-3 text-sm text-gray-600">
                                <li className="flex items-start gap-3">
                                    <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary/60" />
                                    <span>
                                        Usa el selector de archivos para subir
                                        cualquier archivo .json con tus datos
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary/60" />
                                    <span>
                                        El JSON debe contener headers, rows, y
                                        consumerNames
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary/60" />
                                    <span>
                                        Funciona completamente en el navegador -
                                        no requiere servidor
                                    </span>
                                </li>
                            </ul>
                        </CardBody>
                    </Card>

                    {/* Data Analysis Section */}
                    {rows?.length > 0 && (
                        <Card className="border-0 shadow-lg xl:flex-1">
                            <CardBody className="flex h-full flex-col p-6">
                                <div className="flex flex-1 flex-col gap-6">
                                    {/* Header with Consumer Count */}
                                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-full bg-primary/10 p-2">
                                                <FiDatabase className="h-5 w-5 text-primary" />
                                            </div>
                                            <span className="text-xl font-semibold text-gray-800">
                                                Consumidores
                                            </span>
                                            <Chip
                                                size="sm"
                                                color="primary"
                                                variant="flat"
                                                className="font-semibold"
                                            >
                                                {distinctConsumerNames.length}
                                            </Chip>
                                        </div>
                                    </div>

                                    {/* Controls Section */}
                                    <div className="flex flex-col items-start justify-between gap-4 rounded-xl bg-gray-50 p-4 sm:flex-row sm:items-center">
                                        <Checkbox
                                            size="sm"
                                            isSelected={multipleEntrances}
                                            onValueChange={onCheckboxChange}
                                            className="text-sm text-gray-700"
                                        >
                                            <span className="font-medium">
                                                Permitir múltiples entradas
                                            </span>
                                        </Checkbox>

                                        <Button
                                            color="primary"
                                            className="h-11 w-full px-6 text-sm font-semibold shadow-lg transition-all duration-200 hover:shadow-xl sm:w-auto"
                                            onPress={handleStartAnalysis}
                                            isLoading={isAnalyzing}
                                            disabled={isAnalyzing}
                                            startContent={
                                                !isAnalyzing && (
                                                    <div className="h-2 w-2 rounded-full bg-white" />
                                                )
                                            }
                                        >
                                            {isAnalyzing
                                                ? "Analizando..."
                                                : "Análisis por persona"}
                                        </Button>
                                    </div>

                                    <div className="flex flex-col items-start justify-end gap-4 rounded-xl bg-gray-50 p-4 sm:flex-row sm:items-center">
                                        <Button
                                            color="primary"
                                            className="h-11 w-full px-6 text-sm font-semibold shadow-lg transition-all duration-200 hover:shadow-xl sm:w-auto"
                                            onPress={
                                                handleStartAnalysisPredictive
                                            }
                                            isLoading={isAnalyzingPredictive}
                                            disabled={isAnalyzingPredictive}
                                            startContent={
                                                !isAnalyzingPredictive && (
                                                    <div className="h-2 w-2 rounded-full bg-white" />
                                                )
                                            }
                                        >
                                            {isAnalyzingPredictive
                                                ? "Analizando..."
                                                : "Analisis predictivo"}
                                        </Button>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <Card className="border-0 shadow-lg xl:flex-1">
                            <CardBody className="flex h-full flex-col p-8">
                                <div className="flex flex-1 flex-col items-center justify-center gap-4">
                                    <Spinner size="lg" color="primary" />
                                    <p className="text-sm text-gray-600">
                                        Procesando archivo...
                                    </p>
                                </div>
                            </CardBody>
                        </Card>
                    )}

                    {/* Empty States */}
                    {!rows && isLoading === false && (
                        <Card className="border-0 shadow-lg xl:flex-1">
                            <CardBody className="flex h-full flex-col p-8">
                                <div className="flex flex-1 flex-col items-center justify-center text-center">
                                    <div className="mb-6 flex justify-center">
                                        <div className="rounded-full bg-red-50 p-4">
                                            <FiDatabase className="h-12 w-12 text-red-300" />
                                        </div>
                                    </div>
                                    <h4 className="mb-3 text-lg font-semibold text-gray-800">
                                        Formato de datos inválido
                                    </h4>
                                    <p className="mx-auto max-w-md text-sm leading-relaxed text-gray-600">
                                        El archivo subido no contiene datos
                                        válidos. Asegúrate de que tu archivo
                                        JSON incluya la estructura de datos
                                        requerida.
                                    </p>
                                </div>
                            </CardBody>
                        </Card>
                    )}

                    {rows?.length === 0 && (
                        <Card className="border-0 shadow-lg xl:flex-1">
                            <CardBody className="flex h-full flex-col p-8">
                                <div className="flex flex-1 flex-col items-center justify-center text-center">
                                    <div className="mb-6 flex justify-center">
                                        <div className="rounded-full bg-gray-50 p-4">
                                            <FiDatabase className="h-12 w-12 text-gray-300" />
                                        </div>
                                    </div>
                                    <h4 className="mb-3 text-lg font-semibold text-gray-800">
                                        No hay datos disponibles
                                    </h4>
                                    <p className="mx-auto max-w-md text-sm leading-relaxed text-gray-600">
                                        Sube un archivo JSON para ver y analizar
                                        los datos.
                                    </p>
                                </div>
                            </CardBody>
                        </Card>
                    )}
                </div>
            </div>

            {/* Schedule Mismatches Section */}
            {Object.keys(mismatches).length > 0 && (
                <div className="mb-6">
                    <ScheduleMismatches mismatches={mismatches} />
                </div>
            )}

            {/* Compact results section */}
            {analysisResults.length > 0 && (
                <div>
                    <div className="mb-6 mt-10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-blue-50 p-2">
                                <FiDatabase className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800">
                                    Análisis por Persona
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Datos detallados de cada consumidor
                                </p>
                            </div>
                        </div>
                        <Chip
                            size="lg"
                            color="primary"
                            variant="flat"
                            className="font-semibold"
                        >
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
