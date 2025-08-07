"use client";

import {
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
import { useState } from "react";
import { FiDownload, FiEye, FiSearch, FiTable, FiUsers } from "react-icons/fi";

interface TabsSectionProps {
    distinctConsumerNames: string[];
    rows: any[][];
}

export default function TabsSection({
    distinctConsumerNames,
    rows,
}: TabsSectionProps) {
    const [activeTab, setActiveTab] = useState<
        "consumers" | "data" | "general"
    >("consumers");
    const [isVisible, setIsVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };

    if (!distinctConsumerNames?.length && !rows?.length) {
        return null;
    }

    const headers = rows[0] ? Object.keys(rows[0]) : [];

    const filteredRows = rows.filter((row) =>
        Object.values(row).some((value) =>
            String(value).toLowerCase().includes(searchQuery.toLowerCase()),
        ),
    );

    return (
        <div className="mb-6 mt-6">
            <div className="mb-6 flex flex-wrap gap-2">
                <Button
                    variant={activeTab === "consumers" ? "solid" : "bordered"}
                    color="primary"
                    startContent={<FiUsers />}
                    onClick={() => setActiveTab("consumers")}
                >
                    Consumers
                </Button>
                <Button
                    variant={activeTab === "data" ? "solid" : "bordered"}
                    color="primary"
                    startContent={<FiTable />}
                    onClick={() => setActiveTab("data")}
                >
                    Data
                </Button>
            </div>

            {activeTab === "consumers" && (
                <Card>
                    <CardBody className="p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h4 className="text-lg font-semibold text-gray-800">
                                Consumer Names
                            </h4>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {distinctConsumerNames.map((name, index) => (
                                <Card key={index} className="bg-primary/5">
                                    <CardBody className="p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-gray-800">
                                                {name}
                                            </span>
                                            <Chip
                                                size="sm"
                                                variant="flat"
                                                color="primary"
                                            >
                                                #{index + 1}
                                            </Chip>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                        <p className="mt-4 text-sm text-gray-600">
                            Total: {distinctConsumerNames.length} consumers
                        </p>
                    </CardBody>
                </Card>
            )}

            {activeTab === "data" && (
                <Card>
                    <CardBody className="p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h4 className="text-lg font-semibold text-gray-800">
                                Data Records
                            </h4>
                            <Button
                                size="sm"
                                color="secondary"
                                startContent={<FiDownload />}
                                onClick={() => {
                                    const csvContent = [
                                        headers.join(","),
                                        ...rows.map((row) =>
                                            headers
                                                .map(
                                                    (header) =>
                                                        `"${
                                                            row[
                                                                header as keyof typeof row
                                                            ]
                                                        }"`,
                                                )
                                                .join(","),
                                        ),
                                    ].join("\n");
                                    const blob = new Blob([csvContent], {
                                        type: "text/csv",
                                    });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement("a");
                                    a.href = url;
                                    a.download = "data.csv";
                                    a.click();
                                    URL.revokeObjectURL(url);
                                }}
                            >
                                Export CSV
                            </Button>
                        </div>

                        <div className="mb-4 space-y-2 text-sm text-gray-500">
                            <div className="flex flex-wrap gap-4">
                                <p>Total Records: {rows?.length}</p>
                                <p>Filtered Records: {filteredRows?.length}</p>
                                <p>Columns: {headers?.length}</p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <Input
                                startContent={<FiSearch />}
                                placeholder="Search in all columns..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full"
                            />
                        </div>

                        <div className="max-h-96 overflow-auto">
                            <Table aria-label="Data records">
                                <TableHeader>
                                    {headers.map((header) => (
                                        <TableColumn key={header}>
                                            {header}
                                        </TableColumn>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {filteredRows.map((row, index) => (
                                        <TableRow key={index}>
                                            {headers.map(
                                                (header, cellIndex) => {
                                                    const value =
                                                        row[
                                                            header as keyof typeof row
                                                        ];
                                                    return (
                                                        <TableCell
                                                            key={cellIndex}
                                                        >
                                                            {value !== null &&
                                                            value !== undefined
                                                                ? String(value)
                                                                : "NULL"}
                                                        </TableCell>
                                                    );
                                                },
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardBody>
                </Card>
            )}

            {activeTab === "general" && (
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardBody className="p-6">
                            <h4 className="mb-4 text-lg font-semibold text-gray-800">
                                Data Overview
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Total Consumers:
                                    </span>
                                    <span className="font-semibold">
                                        {distinctConsumerNames.length}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Total Records:
                                    </span>
                                    <span className="font-semibold">
                                        {rows?.length.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Total Columns:
                                    </span>
                                    <span className="font-semibold">
                                        {headers?.length}
                                    </span>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody className="p-6">
                            <h4 className="mb-4 text-lg font-semibold text-gray-800">
                                Column Details
                            </h4>
                            <div className="space-y-2">
                                {headers.map((header, index) => (
                                    <div
                                        key={header}
                                        className="rounded-lg border p-3"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">
                                                {header}
                                            </span>
                                            <Chip size="sm" variant="flat">
                                                #{index + 1}
                                            </Chip>
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
