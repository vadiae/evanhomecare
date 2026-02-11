//@ts-nocheck
"use client";

import {
    Accordion,
    AccordionItem,
    Button,
    Card,
    CardBody,
    Chip,
    Input,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from "@heroui/react";
import React, { useRef, useState } from "react";
import {
    FiDatabase,
    FiDownload,
    FiRefreshCw,
    FiSearch,
    FiUpload,
} from "react-icons/fi";
import { Title } from "~/components/Titles/Title";
import { parseCSV } from "./utils/csvParser";
import { handleFileUpload as handleJsonUpload } from "./utils/fileUtils";
import type { ProcessedData } from "./utils/types";
import {
    areServiceCodesEqual,
    normalizeServiceCode,
} from "./utils/serviceUtils";
import {
    parseSpreadsheetData,
    type ParsedSpreadsheetData,
} from "./utils/spreadsheetParser";
import { type DataRow } from "./types";

interface AnalysisResult {
    id: string;
    name: string;
    service: string;
    date: string;
    dayOfWeek: string;
    expectedUnits: number;
    actualUnits: number;
    status: "MATCH" | "MISSING_IN_JSON" | "UNIT_MISMATCH" | "MISSING_IN_SHEET";
}

export default function Analyzer2() {
    // Spreadsheet state
    const [url, setUrl] = useState(
        "https://docs.google.com/spreadsheets/d/1jnUcqGQHB9JhvoaReOwqN418BqE-dGhElqg7oQAvgdE/edit?gid=853307044#gid=853307044",
    );
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [results, setResults] = useState<AnalysisResult[]>([]);

    // JSON state
    const [jsonFile, setJsonFile] = useState<File | null>(null);
    const [jsonData, setJsonData] = useState<ProcessedData | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const csvInputRef = useRef<HTMLInputElement>(null);

    // Parsed spreadsheet data (structured)
    const [parsedData, setParsedData] = useState<ParsedSpreadsheetData | null>(
        null,
    );
    const [parseLoading, setParseLoading] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [showMatches, setShowMatches] = useState(false);

    const handleJsonSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.name.endsWith(".json")) {
            setJsonFile(file);
            void processJsonFile(file);
        }
    };

    const processJsonFile = async (file: File) => {
        setLoading(true);
        setError("");
        try {
            const data = await handleJsonUpload(file);
            setJsonData(data);

            // Auto-fill dates if not set
            if (!startDate && data.startDate) setStartDate(data.startDate);
            if (!endDate && data.endDate) setEndDate(data.endDate);
        } catch (err: unknown) {
            setError(
                err instanceof Error ? err.message : "Failed to process JSON",
            );
            setJsonFile(null);
        } finally {
            setLoading(false);
        }
    };

    const handleParseSpreadsheet = async () => {
        setParseLoading(true);
        setError("");
        setParsedData(null);
        setResults([]);

        try {
            const proxyUrl = `/api/proxy-sheet?url=${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl);
            if (!response.ok) {
                const errData = (await response.json()) as { error?: string };
                throw new Error(
                    errData.error ??
                        `Failed to fetch spreadsheet. Status: ${response.status}`,
                );
            }

            const data = (await response.json()) as { rows?: unknown[][] };
            const rows: string[][] = (data.rows ?? []).map((row) =>
                row.map((cell) =>
                    cell === null || cell === undefined ? "" : String(cell),
                ),
            );

            const parsed = parseSpreadsheetData(rows);
            setParsedData(parsed);
            console.log("Parsed spreadsheet data:", parsed);
        } catch (err: unknown) {
            console.error(err);
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setParseLoading(false);
        }
    };

    const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setParseLoading(true);
        setError("");
        setParsedData(null);
        setResults([]);

        try {
            const text = await file.text();
            const rows = parseCSV(text);
            const parsed = parseSpreadsheetData(rows);
            setParsedData(parsed);
            console.log("Parsed CSV data:", parsed);
        } catch (err: unknown) {
            console.error(err);
            setError(
                err instanceof Error ? err.message : "Failed to parse file",
            );
        } finally {
            setParseLoading(false);
        }
    };

    const handleAnalyze = () => {
        if (!startDate || !endDate) {
            setError("Please select a date range.");
            return;
        }
        if (!parsedData || parsedData.customers.length === 0) {
            setError("Please parse the spreadsheet first (step 2).");
            return;
        }
        if (!jsonData) {
            setError("Please upload a JSON file first (step 1).");
            return;
        }

        setLoading(true);
        setError("");
        setResults([]);

        try {
            // Helper to parse ANY date string into a local Date object
            const parseLocal = (dateStr: string): Date | null => {
                if (!dateStr) return null;
                // Handle YYYY-MM-DD
                const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
                if (isoMatch) {
                    const d = new Date(
                        Number(isoMatch[1]),
                        Number(isoMatch[2]) - 1,
                        Number(isoMatch[3]),
                    );
                    return isNaN(d.getTime()) ? null : d;
                }
                // Handle MM/DD/YYYY or M/D/YYYY
                const slashMatch = dateStr.match(
                    /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/,
                );
                if (slashMatch) {
                    const d = new Date(
                        Number(slashMatch[3]),
                        Number(slashMatch[1]) - 1,
                        Number(slashMatch[2]),
                    );
                    return isNaN(d.getTime()) ? null : d;
                }
                const d = new Date(dateStr);
                return isNaN(d.getTime()) ? null : d;
            };

            // Helper to format a Date object as YYYY-MM-DD in local time
            const formatLocalISO = (date: Date): string => {
                const y = date.getFullYear();
                const m = String(date.getMonth() + 1).padStart(2, "0");
                const d = String(date.getDate()).padStart(2, "0");
                return `${y}-${m}-${d}`;
            };

            const start = parseLocal(startDate);
            const end = parseLocal(endDate);

            if (!start || !end) {
                setError("Invalid start or end date.");
                return;
            }

            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);

            // 1. Index Actual Data (JSON) by ID -> Date -> ServiceCode
            const actualDataMap = new Map<
                string,
                { name: string; dates: Map<string, Map<string, number>> }
            >();

            (jsonData.rows as DataRow[]).forEach((row) => {
                const consumerName =
                    row.consumerName || row["Consumer Name"] || "";
                const idMatch = consumerName.match(/\(([^)]+)\)/);
                const id = idMatch ? idMatch[1] : null;

                if (!id) return;

                const dateStr = row.Date || row.date;
                const serviceCode = row["Service Code"] || row.serviceCode;
                const unitsVal = row.Units || row.units || "0";
                const units = parseFloat(String(unitsVal));

                if (!dateStr || !serviceCode) return;

                const dateObj = parseLocal(dateStr);
                if (!dateObj || isNaN(dateObj.getTime())) return;
                // Normalize date to YYYY-MM-DD using local time
                const dateKey = formatLocalISO(dateObj);

                if (!actualDataMap.has(id)) {
                    // Extract name without the ID part (e.g. "John Doe (123)" -> "John Doe")
                    const nameOnly =
                        consumerName.split("(")[0]?.trim() || consumerName;
                    actualDataMap.set(id, { name: nameOnly, dates: new Map() });
                }
                const customerEntry = actualDataMap.get(id)!;
                const dateMap = customerEntry.dates;

                if (!dateMap.has(dateKey)) {
                    dateMap.set(dateKey, new Map());
                }
                const serviceMap = dateMap.get(dateKey)!;

                serviceMap.set(
                    serviceCode,
                    (serviceMap.get(serviceCode) || 0) + units,
                );
            });

            // 1.1 Add Failed Customers to map if they have no rows
            jsonData.failedCustomerNames.forEach((name) => {
                const idMatch = name.match(/\(([^)]+)\)/);
                const id = idMatch ? idMatch[1] : `FAILED_${name}`;

                if (!actualDataMap.has(id)) {
                    const nameOnly = name.split("(")[0]?.trim() || name;
                    actualDataMap.set(id, { name: nameOnly, dates: new Map() });
                }
            });

            const results: AnalysisResult[] = [];
            const visitedActualEntries = new Set<string>(); // ID|Date|Service

            // 2. Iterate Expected Data (Spreadsheet)
            for (const customer of parsedData.customers) {
                const customerId = customer.id;

                for (const service of customer.services) {
                    const serviceTypeRaw = service.serviceType;

                    for (const dayMap of Object.values(service.daysByWeek)) {
                        for (const [dateKey, entry] of Object.entries(dayMap)) {
                            if (entry.units === 0) continue;

                            const actualDate =
                                parseLocal(dateKey) ?? parseLocal(entry.date);
                            if (!actualDate) continue;

                            if (actualDate >= start && actualDate <= end) {
                                const isoDate = actualDate
                                    .toISOString()
                                    .split("T")[0]!;
                                const expectedUnits = entry.units;

                                let actualUnits = 0;
                                let status: AnalysisResult["status"] =
                                    "MISSING_IN_JSON";
                                let matchedServiceCode = "";

                                if (actualDataMap.has(customerId)) {
                                    const dateMap =
                                        actualDataMap.get(customerId)!.dates;
                                    if (dateMap.has(isoDate)) {
                                        const serviceMap =
                                            dateMap.get(isoDate)!;

                                        // Lookup using startsWith
                                        // e.g. JSON has "S5130:XX", Sheet has "S5130"
                                        for (const [
                                            code,
                                            units,
                                        ] of serviceMap.entries()) {
                                            if (
                                                areServiceCodesEqual(
                                                    code,
                                                    serviceTypeRaw,
                                                )
                                            ) {
                                                matchedServiceCode = code;
                                                actualUnits = units;
                                                break;
                                            }
                                        }

                                        if (matchedServiceCode) {
                                            visitedActualEntries.add(
                                                `${customerId}|${isoDate}|${matchedServiceCode}`,
                                            );
                                        }
                                    }
                                }

                                if (actualUnits > 0) {
                                    if (actualUnits === expectedUnits) {
                                        status = "MATCH";
                                    } else {
                                        status = "UNIT_MISMATCH";
                                    }
                                }

                                results.push({
                                    id: customerId,
                                    name: customer.name,
                                    service: serviceTypeRaw,
                                    date: isoDate,
                                    dayOfWeek: entry.dayName,
                                    expectedUnits,
                                    actualUnits,
                                    status,
                                });
                            }
                        }
                    }
                }
            }

            // 3. Find extra entries (Missing in Sheet)
            for (const [imgId, data] of actualDataMap) {
                const knownCustomer = parsedData.customers.find(
                    (c) => c.id === imgId,
                );

                for (const [dateStr, serviceMap] of data.dates) {
                    const dateObj = parseLocal(dateStr);
                    if (!dateObj) continue;
                    dateObj.setHours(0, 0, 0, 0);

                    if (dateObj >= start && dateObj <= end) {
                        for (const [svcCode, units] of serviceMap) {
                            if (
                                !visitedActualEntries.has(
                                    `${imgId}|${dateStr}|${svcCode}`,
                                )
                            ) {
                                results.push({
                                    id: imgId,
                                    name: knownCustomer
                                        ? knownCustomer.name
                                        : data.name,
                                    service: svcCode,
                                    date: dateStr,
                                    dayOfWeek: dateObj.toLocaleDateString(
                                        "en-US",
                                        { weekday: "long" },
                                    ),
                                    expectedUnits: 0,
                                    actualUnits: units,
                                    status: "MISSING_IN_SHEET",
                                });
                            }
                        }
                    }
                }
            }

            results.sort((a, b) => {
                const dateDiff =
                    new Date(a.date).getTime() - new Date(b.date).getTime();
                if (dateDiff !== 0) return dateDiff;
                return a.name.localeCompare(b.name);
            });

            setResults(results);
        } catch (err: unknown) {
            console.error(err);
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const formatDateForDisplay = (isoDate: string) => {
        if (!isoDate) return "";
        // Handle full ISO strings by taking only the date part
        const datePart = isoDate.split("T")[0]!;
        const parts = datePart.split("-");
        if (parts.length !== 3) return isoDate;
        // YYYY-MM-DD -> MM-DD-YYYY
        return `${parts[1]}-${parts[2]}-${parts[0]}`;
    };

    const filteredResults = results.filter(
        (r) =>
            (showMatches || r.status !== "MATCH") &&
            (r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.service.toLowerCase().includes(searchQuery.toLowerCase())),
    );

    // Group results by ID -> then by Service
    interface ServiceGroup {
        results: AnalysisResult[];
    }
    interface CustomerGroup {
        name: string;
        serviceGroups: Record<string, ServiceGroup>;
        errorCount: number;
    }

    const groupedResults = filteredResults.reduce(
        (acc, result) => {
            if (!acc[result.id]) {
                acc[result.id] = {
                    name: result.name,
                    serviceGroups: {},
                    errorCount: 0,
                };
            }
            const customerGroup = acc[result.id]!;

            const serviceKey = normalizeServiceCode(result.service);
            if (!customerGroup.serviceGroups[serviceKey]) {
                customerGroup.serviceGroups[serviceKey] = { results: [] };
            }
            customerGroup.serviceGroups[serviceKey]!.results.push(result);

            if (result.status !== "MATCH") {
                customerGroup.errorCount++;
            }
            return acc;
        },
        {} as Record<string, CustomerGroup>,
    );

    const sortedGroups = Object.entries(groupedResults).sort(([, a], [, b]) =>
        a.name.localeCompare(b.name),
    );

    return (
        <div className="space-y-6">
            <Title title="Data Analysis" />
            <Card className="border-0 bg-gradient-to-br from-primary/5 to-transparent p-4 shadow-lg">
                <CardBody className="gap-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-primary/10 p-2">
                            <FiDatabase className="h-6 w-6 text-primary" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            Analysis 2.0 Setup
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* 1. JSON Upload */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                1. Upload Original JSON
                            </label>
                            <div className="flex flex-col gap-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".json"
                                    onChange={handleJsonSelect}
                                    className="hidden"
                                />
                                <Button
                                    onPress={() =>
                                        fileInputRef.current?.click()
                                    }
                                    variant="bordered"
                                    color="primary"
                                    startContent={<FiUpload />}
                                    className="w-full justify-start"
                                >
                                    Select JSON File
                                </Button>
                                {jsonFile && (
                                    <div className="flex flex-wrap gap-2">
                                        <Chip
                                            color="success"
                                            variant="flat"
                                            size="sm"
                                        >
                                            {jsonFile.name} (
                                            {jsonData?.distinctConsumerNames
                                                .length || 0}{" "}
                                            consumers)
                                        </Chip>
                                        {jsonData?.startDate &&
                                            jsonData?.endDate && (
                                                <Chip
                                                    color="primary"
                                                    variant="flat"
                                                    size="sm"
                                                >
                                                    Detected:{" "}
                                                    {formatDateForDisplay(
                                                        jsonData.startDate,
                                                    )}{" "}
                                                    to{" "}
                                                    {formatDateForDisplay(
                                                        jsonData.endDate,
                                                    )}
                                                </Chip>
                                            )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. Parse Spreadsheet */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                2. Parse Spreadsheet
                            </label>
                            <Input
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="Google Sheets URL"
                                startContent={
                                    <span className="text-sm text-gray-400">
                                        URL
                                    </span>
                                }
                            />
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                                <Button
                                    onPress={handleParseSpreadsheet}
                                    variant="bordered"
                                    color="secondary"
                                    startContent={<FiRefreshCw />}
                                    isLoading={parseLoading}
                                    className="w-full justify-start sm:w-auto"
                                >
                                    Parse Spreadsheet
                                </Button>
                                <span className="text-xs text-gray-500">
                                    or
                                </span>
                                <input
                                    ref={csvInputRef}
                                    type="file"
                                    accept=".csv"
                                    className="hidden"
                                    onChange={handleCsvUpload}
                                />
                                <Button
                                    onPress={() => csvInputRef.current?.click()}
                                    variant="bordered"
                                    color="secondary"
                                    startContent={<FiUpload />}
                                    className="w-full justify-start sm:w-auto"
                                >
                                    Upload CSV
                                </Button>
                            </div>
                            {parsedData && (
                                <Chip color="success" variant="flat" size="sm">
                                    {parsedData.customers.length} customers,{" "}
                                    {parsedData.customers.reduce(
                                        (acc, c) => acc + c.services.length,
                                        0,
                                    )}{" "}
                                    service blocks
                                </Chip>
                            )}
                        </div>
                    </div>

                    {/* 3. Date Range */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            3. Analysis Date Range
                        </label>
                        <div className="flex gap-4">
                            <Input
                                type="date"
                                label="Start"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="flex-1"
                            />
                            <Input
                                type="date"
                                label="End"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="flex-1"
                            />
                        </div>
                    </div>

                    {/* Action */}
                    <div className="flex justify-end pt-4">
                        <Button
                            color="primary"
                            size="lg"
                            onPress={handleAnalyze}
                            isLoading={loading}
                            className="w-full font-semibold shadow-md sm:w-auto"
                        >
                            {loading ? "Analyzing..." : "Run Analysis"}
                        </Button>
                    </div>

                    {error && (
                        <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Results Table */}
            {results.length > 0 && (
                <Card className="border-0 p-4 shadow-lg">
                    <CardBody>
                        <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Results
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {results.length} records found in
                                    spreadsheet
                                </p>
                            </div>
                            <Button
                                size="sm"
                                color="secondary"
                                variant="flat"
                                startContent={<FiDownload />}
                                onPress={() => {
                                    const csv = [
                                        "ID,Name,Service,Date,Sheet,JSON,Status",
                                        ...results.map(
                                            (r) =>
                                                `${r.id},"${r.name}","${
                                                    r.service
                                                }",${formatDateForDisplay(
                                                    r.date,
                                                )},${r.expectedUnits},${
                                                    r.actualUnits
                                                },${r.status}`,
                                        ),
                                    ].join("\n");
                                    const blob = new Blob([csv], {
                                        type: "text/csv",
                                    });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement("a");
                                    a.href = url;
                                    a.download = "analysis_result.csv";
                                    a.click();
                                }}
                            >
                                Export CSV
                            </Button>
                        </div>

                        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                            <Input
                                placeholder="Search by name or service..."
                                startContent={<FiSearch />}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="max-w-md"
                            />
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">
                                    Show Matches
                                </span>
                                <input
                                    type="checkbox"
                                    checked={showMatches}
                                    onChange={(e) =>
                                        setShowMatches(e.target.checked)
                                    }
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                            </div>
                        </div>

                        <Accordion selectionMode="multiple" variant="splitted">
                            {sortedGroups.map(([id, group]) => (
                                <AccordionItem
                                    key={id}
                                    title={
                                        <div className="flex w-full items-center justify-between pr-4">
                                            <div className="flex items-center gap-3">
                                                <span className="font-semibold text-gray-800">
                                                    {group.name}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    (ID: {id})
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <Chip
                                                    size="sm"
                                                    color="danger"
                                                    variant="flat"
                                                >
                                                    {group.errorCount} Issues
                                                </Chip>
                                            </div>
                                        </div>
                                    }
                                >
                                    <div className="space-y-6 pb-4">
                                        {Object.entries(
                                            group.serviceGroups,
                                        ).map(([serviceName, serviceGroup]) => (
                                            <div
                                                key={serviceName}
                                                className="space-y-2"
                                            >
                                                <div className="flex items-center gap-2 px-2">
                                                    <Chip
                                                        size="sm"
                                                        variant="flat"
                                                        color="primary"
                                                        className="font-bold"
                                                    >
                                                        {serviceName}
                                                    </Chip>
                                                    <span className="text-xs text-gray-400">
                                                        (
                                                        {
                                                            serviceGroup.results
                                                                .length
                                                        }{" "}
                                                        issues)
                                                    </span>
                                                </div>
                                                <div className="overflow-x-auto rounded-lg border border-gray-100">
                                                    <Table
                                                        aria-label="Analysis Segment"
                                                        removeWrapper
                                                        shadow="none"
                                                    >
                                                        <TableHeader>
                                                            <TableColumn>
                                                                Status
                                                            </TableColumn>
                                                            <TableColumn>
                                                                Date
                                                            </TableColumn>
                                                            <TableColumn>
                                                                Day
                                                            </TableColumn>
                                                            <TableColumn align="center">
                                                                Sheet
                                                            </TableColumn>
                                                            <TableColumn align="center">
                                                                JSON
                                                            </TableColumn>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {serviceGroup.results.map(
                                                                (
                                                                    row: AnalysisResult,
                                                                    i: number,
                                                                ) => (
                                                                    <TableRow
                                                                        key={i}
                                                                    >
                                                                        <TableCell>
                                                                            <Chip
                                                                                size="sm"
                                                                                variant="flat"
                                                                                color={
                                                                                    row.status ===
                                                                                    "MATCH"
                                                                                        ? "success"
                                                                                        : row.status ===
                                                                                            "MISSING_IN_JSON"
                                                                                          ? "danger"
                                                                                          : row.status ===
                                                                                              "MISSING_IN_SHEET"
                                                                                            ? "warning"
                                                                                            : "danger" // UNIT_MISMATCH
                                                                                }
                                                                            >
                                                                                {row.status.replace(
                                                                                    /_/g,
                                                                                    " ",
                                                                                )}
                                                                            </Chip>
                                                                        </TableCell>
                                                                        <TableCell className="text-sm">
                                                                            {formatDateForDisplay(
                                                                                row.date,
                                                                            )}
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            {
                                                                                row.dayOfWeek
                                                                            }
                                                                        </TableCell>
                                                                        <TableCell className="text-center font-medium">
                                                                            {
                                                                                row.expectedUnits
                                                                            }
                                                                        </TableCell>
                                                                        <TableCell className="text-center font-medium">
                                                                            {
                                                                                row.actualUnits
                                                                            }
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ),
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionItem>
                            ))}
                        </Accordion>

                        {filteredResults.length === 0 && (
                            <div className="py-8 text-center text-gray-500">
                                No results match your search
                            </div>
                        )}
                    </CardBody>
                </Card>
            )}
        </div>
    );
}
