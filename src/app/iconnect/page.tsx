"use client";

import { Button, Card, CardBody, Chip, Spinner } from "@nextui-org/react";
import React, { useEffect, useRef, useState } from "react";
import { FiDatabase, FiUpload } from "react-icons/fi";
import { Title } from "~/components/Titles/Title";
import DData from "~/modules/DData/DData";
import JoinResults from "~/modules/DData/JoinResults";
import TabsSection from "~/modules/DData/TabsSection";
import { CustomNavbar } from "~/modules/Navbar/Navbar";

interface TableInfo {
    name: string;
    columns: ColumnInfo[];
    rowCount: number;
}

interface ColumnInfo {
    name: string;
    type: string;
    notNull: boolean;
    defaultValue: string | null;
    primaryKey: boolean;
}

interface QueryResult {
    columns: string[];
    rows: any[][];
    rowCount: number;
}

interface SQLDatabase {
    exec: (sql: string) => any[];
    export: () => Uint8Array;
}

interface SQLModule {
    Database: new (data?: Uint8Array) => SQLDatabase;
}

declare global {
    interface Window {
        SQL: SQLModule;
        initSqlJs: (options: {
            locateFile: (file: string) => string;
        }) => Promise<any>;
    }
}

function dataTreatment(data: QueryResult): QueryResult {
    if (!data || !data.rows) return data;

    const convertedRows = data.rows.map((row: any[]) => {
        const rowObject: any = {};
        data.columns.forEach((column: string, index: number) => {
            rowObject[column] = row[index];
        });
        return rowObject;
    });

    return {
        ...data,
        rows: convertedRows,
    };
}

export default function IConnectPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [tables, setTables] = useState<TableInfo[]>([]);
    const [selectedTable, setSelectedTable] = useState<string>("");
    const [tableData, setTableData] = useState<QueryResult | null>(null);
    const [joinResult, setJoinResult] = useState<QueryResult | null>(null);
    const [db, setDb] = useState<any>(null);
    const [error, setError] = useState<string>("");
    const [distinctConsumerNames, setDistinctConsumerNames] = useState<
        string[]
    >([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const initSqlJs = async () => {
            try {
                if (window.SQL) return;

                const script = document.createElement("script");
                script.src =
                    "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js";
                script.async = true;

                script.onload = async () => {
                    try {
                        const initSqlJs = window.initSqlJs;
                        window.SQL = await initSqlJs({
                            locateFile: (file: string) =>
                                `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`,
                        });
                    } catch (err) {
                        setError(
                            "Failed to initialize SQL.js: " +
                                (err as Error).message,
                        );
                    }
                };

                script.onerror = () => {
                    setError("Failed to load SQL.js from CDN");
                };

                document.head.appendChild(script);
            } catch (err) {
                setError("Failed to load SQL.js: " + (err as Error).message);
            }
        };
        void initSqlJs();
    }, []);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (
            file &&
            (file.name.endsWith(".db") ||
                file.name.endsWith(".sqlite") ||
                file.name.endsWith(".sqlite3"))
        ) {
            setSelectedFile(file);
            void handleFileUpload(file);
        }
    };

    const handleFileUpload = async (file: File) => {
        setIsLoading(true);
        setError("");
        try {
            if (!window.SQL) {
                throw new Error("SQL.js not loaded yet");
            }

            const arrayBuffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);

            const database = new window.SQL.Database(uint8Array);
            setDb(database);

            await processDatabaseData(database);
        } catch (error) {
            console.error("Error processing database:", error);
            setError("Error loading database: " + (error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const processDatabaseData = async (database: SQLDatabase) => {
        try {
            const tablesResult = database.exec(`
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name NOT LIKE 'sqlite_%'
                ORDER BY name
            `);

            const tableInfos: TableInfo[] = [];

            for (const tableRow of (tablesResult[0]?.values as any[]) || []) {
                const tableName = tableRow[0] as string;

                const columnsResult = database.exec(
                    `PRAGMA table_info(${tableName})`,
                );
                const columns: ColumnInfo[] = [];

                if (columnsResult[0]) {
                    for (const columnRow of columnsResult[0].values as any[]) {
                        columns.push({
                            name: columnRow[1] as string,
                            type: columnRow[2] as string,
                            notNull: Boolean(columnRow[3]),
                            defaultValue: columnRow[4] as string | null,
                            primaryKey: Boolean(columnRow[5]),
                        });
                    }
                }

                const countResult = database.exec(
                    `SELECT COUNT(*) as count FROM ${tableName}`,
                );
                const rowCount =
                    ((countResult[0]?.values as any[])?.[0]?.[0] as number) ||
                    0;

                tableInfos.push({
                    name: tableName,
                    columns,
                    rowCount,
                });
            }

            setTables(tableInfos);

            if (tableInfos.length > 0) {
                setSelectedTable(tableInfos[0]?.name || "");

                const firstTableData = database.exec(
                    `SELECT * FROM "${tableInfos[0]?.name}"`,
                );
                if (firstTableData[0]) {
                    setTableData({
                        columns: firstTableData[0].columns,
                        rows: firstTableData[0].values,
                        rowCount: firstTableData[0].values.length,
                    });
                }

                const tableNames = tableInfos.map((t) => t.name);
                if (
                    tableNames.includes("clients") &&
                    tableNames.includes("data")
                ) {
                    const joinResult = database.exec(`
                        SELECT 
                            clients.*,
                            data.* 
                        FROM clients
                        INNER JOIN data ON clients.consumerName = data.consumerName
                        ORDER BY clients.consumerName
                    `);
                    if (joinResult[0]) {
                        setJoinResult(
                            dataTreatment({
                                columns: joinResult[0].columns,
                                rows: joinResult[0].values,
                                rowCount: joinResult[0].values.length,
                            }),
                        );
                    }
                }

                // Get distinct consumerNames
                try {
                    const distinctResult = database.exec(`
                        SELECT DISTINCT consumerName 
                        FROM clients 
                        WHERE consumerName IS NOT NULL 
                        ORDER BY consumerName
                    `);
                    if (distinctResult[0]?.values) {
                        const names = (distinctResult[0].values as any[]).map(
                            (row) => row[0] as string,
                        );
                        setDistinctConsumerNames(names);
                    }
                } catch (error) {
                    console.log("Could not get distinct consumerNames:", error);
                }
            }
        } catch (error) {
            console.error("Error processing database data:", error);
            setError(
                "Error processing database data: " + (error as Error).message,
            );
        }
    };

    const handleTableSelect = async (tableName: string) => {
        if (!db) return;

        setSelectedTable(tableName);
        setIsLoading(true);

        try {
            const result = db.exec(`SELECT * FROM "${tableName}"`);

            if (result[0]) {
                setTableData({
                    columns: result[0].columns,
                    rows: result[0].values,
                    rowCount: result[0].values.length,
                });
            }
        } catch (error) {
            console.error("Error loading table data:", error);
            setError("Error loading table data: " + (error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const downloadData = (data: QueryResult, filename: string) => {
        const csvContent = [
            data.columns.join(","),
            ...data.rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <main>
            <CustomNavbar />
            <div className="flex w-full flex-col items-center">
                <div className="w-full max-w-[1440px] px-5 pb-20 sm:px-10">
                    <div className="mx-auto max-w-7xl sm:py-10">
                        <Title
                            title="iConnect Database Viewer"
                            subtitle="Upload, analyze, and visualize your database"
                        />

                        <div className="mb-8 grid gap-4 md:grid-cols-2">
                            <Card className="bg-gradient-to-br from-primary/5 to-transparent">
                                <CardBody className="p-8">
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="flex items-center gap-3">
                                            <FiDatabase className="h-8 w-8 text-primary" />
                                            <h3 className="text-xl font-semibold text-gray-800">
                                                Upload Database File
                                            </h3>
                                        </div>

                                        <div className="flex flex-col items-center gap-4">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".db,.sqlite,.sqlite3"
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
                                                Choose Database File
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
                                            .db, .sqlite, or .sqlite3 file
                                        </li>
                                        <li>
                                            • Browse tables by clicking the
                                            table name buttons
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

                        {joinResult && (
                            <DData
                                data={joinResult}
                                distinctConsumerNames={distinctConsumerNames}
                            />
                        )}

                        <TabsSection
                            tables={tables}
                            selectedTable={selectedTable}
                            tableData={tableData}
                            isLoading={isLoading}
                            onTableSelect={handleTableSelect}
                            onDownloadData={downloadData}
                        />

                        <JoinResults
                            joinResult={joinResult}
                            onDownloadData={downloadData}
                        />

                        {!joinResult && tables.length > 0 && (
                            <Card className="mt-6">
                                <CardBody className="p-6">
                                    <div className="text-center text-gray-500">
                                        <FiDatabase className="mx-auto mb-4 h-12 w-12 opacity-50" />
                                        <h4 className="mb-2 text-lg font-semibold">
                                            No Join Results Available
                                        </h4>
                                        <p className="text-sm">
                                            The join operation couldn't be
                                            performed. Check the browser console
                                            for more details.
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
