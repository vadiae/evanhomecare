"use client";

import {
    Button,
    Card,
    CardBody,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from "@nextui-org/react";
import React, { useState } from "react";
import { FiDatabase, FiDownload, FiEye, FiTable } from "react-icons/fi";

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

interface TabsSectionProps {
    tables: TableInfo[];
    selectedTable: string;
    tableData: QueryResult | null;
    isLoading: boolean;
    onTableSelect: (tableName: string) => void;
    onDownloadData: (data: QueryResult, filename: string) => void;
}

export default function TabsSection({
    tables,
    selectedTable,
    tableData,
    isLoading,
    onTableSelect,
    onDownloadData,
}: TabsSectionProps) {
    const [activeTab, setActiveTab] = useState<"tables" | "analysis">("tables");
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };

    if (!tables.length) {
        return null;
    }

    if (!isVisible) {
        return (
            <div className="mb-6 mt-6">
                <Button
                    color="primary"
                    variant="bordered"
                    onClick={toggleVisibility}
                    className="h-16 w-full text-lg font-semibold"
                >
                    Show Database Tables & Analysis
                </Button>
            </div>
        );
    }

    return (
        <div className="mb-6 mt-6">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                    Database Tables & Analysis
                </h3>
                <Button
                    size="sm"
                    color="secondary"
                    variant="bordered"
                    onClick={toggleVisibility}
                >
                    Hide
                </Button>
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
                <Button
                    variant={activeTab === "tables" ? "solid" : "bordered"}
                    color="primary"
                    startContent={<FiTable />}
                    onClick={() => setActiveTab("tables")}
                >
                    Tables
                </Button>
                <Button
                    variant={activeTab === "analysis" ? "solid" : "bordered"}
                    color="primary"
                    startContent={<FiEye />}
                    onClick={() => setActiveTab("analysis")}
                >
                    Analysis
                </Button>
            </div>

            {activeTab === "tables" && (
                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-1">
                        <CardBody className="p-6">
                            <h4 className="mb-4 text-lg font-semibold text-gray-800">
                                Database Tables
                            </h4>
                            <div className="space-y-2">
                                {tables.map((table) => (
                                    <Button
                                        key={table.name}
                                        variant={
                                            selectedTable === table.name
                                                ? "solid"
                                                : "bordered"
                                        }
                                        color="primary"
                                        className="w-full justify-start"
                                        onClick={() =>
                                            onTableSelect(table.name)
                                        }
                                    >
                                        <FiTable className="mr-2" />
                                        {table.name}
                                        <Chip
                                            size="sm"
                                            variant="flat"
                                            className="ml-auto"
                                        >
                                            {table.rowCount}
                                        </Chip>
                                    </Button>
                                ))}
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="lg:col-span-2">
                        <CardBody className="p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-gray-800">
                                    {selectedTable} Table
                                </h4>
                                {tableData && (
                                    <Button
                                        size="sm"
                                        color="secondary"
                                        startContent={<FiDownload />}
                                        onClick={() =>
                                            onDownloadData(
                                                tableData,
                                                `${selectedTable}.csv`,
                                            )
                                        }
                                    >
                                        Export CSV
                                    </Button>
                                )}
                            </div>

                            {tableData && (
                                <div className="max-h-96 overflow-auto">
                                    <Table aria-label={`${selectedTable} data`}>
                                        <TableHeader>
                                            {tableData.columns.map((column) => (
                                                <TableColumn key={column}>
                                                    {column}
                                                </TableColumn>
                                            ))}
                                        </TableHeader>
                                        <TableBody>
                                            {tableData.rows
                                                .slice(0, 100)
                                                .map((row, index) => (
                                                    <TableRow key={index}>
                                                        {Array.isArray(row)
                                                            ? row.map(
                                                                  (
                                                                      cell,
                                                                      cellIndex,
                                                                  ) => (
                                                                      <TableCell
                                                                          key={
                                                                              cellIndex
                                                                          }
                                                                      >
                                                                          {cell !==
                                                                              null &&
                                                                          cell !==
                                                                              undefined
                                                                              ? String(
                                                                                    cell,
                                                                                )
                                                                              : "NULL"}
                                                                      </TableCell>
                                                                  ),
                                                              )
                                                            : tableData.columns.map(
                                                                  (
                                                                      column,
                                                                      cellIndex,
                                                                  ) => (
                                                                      <TableCell
                                                                          key={
                                                                              cellIndex
                                                                          }
                                                                      >
                                                                          {row[
                                                                              column
                                                                          ] !==
                                                                              null &&
                                                                          row[
                                                                              column
                                                                          ] !==
                                                                              undefined
                                                                              ? String(
                                                                                    row[
                                                                                        column
                                                                                    ],
                                                                                )
                                                                              : "NULL"}
                                                                      </TableCell>
                                                                  ),
                                                              )}
                                                    </TableRow>
                                                ))}
                                        </TableBody>
                                    </Table>
                                    {tableData.rows.length > 100 && (
                                        <p className="mt-2 text-sm text-gray-500">
                                            Showing first 100 rows of{" "}
                                            {tableData.rowCount} total rows
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </div>
            )}

            {activeTab === "analysis" && (
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardBody className="p-6">
                            <h4 className="mb-4 text-lg font-semibold text-gray-800">
                                Database Overview
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Total Tables:
                                    </span>
                                    <span className="font-semibold">
                                        {tables.length}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Total Records:
                                    </span>
                                    <span className="font-semibold">
                                        {tables
                                            .reduce(
                                                (sum, table) =>
                                                    sum + table.rowCount,
                                                0,
                                            )
                                            .toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody className="p-6">
                            <h4 className="mb-4 text-lg font-semibold text-gray-800">
                                Table Details
                            </h4>
                            <div className="space-y-2">
                                {tables.map((table) => (
                                    <div
                                        key={table.name}
                                        className="rounded-lg border p-3"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">
                                                {table.name}
                                            </span>
                                            <Chip size="sm" variant="flat">
                                                {table.rowCount} rows
                                            </Chip>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-600">
                                            {table.columns.length} columns
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                </div>
            )}
        </div>
    );
}
