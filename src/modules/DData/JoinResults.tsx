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
import { FiDownload } from "react-icons/fi";

interface QueryResult {
    columns: string[];
    rows: any[][];
    rowCount: number;
}

interface JoinResultsProps {
    joinResult: QueryResult | null;
    onDownloadData: (data: QueryResult, filename: string) => void;
}

export default function JoinResults({
    joinResult,
    onDownloadData,
}: JoinResultsProps) {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };

    if (!joinResult) {
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
                    Show Join Results (Clients + Data)
                </Button>
            </div>
        );
    }

    return (
        <div className="mb-6 mt-6">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                    Join Results (Clients + Data)
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

            <Card>
                <CardBody className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-gray-800">
                            Join Results (Clients + Data)
                        </h4>
                        <Button
                            size="sm"
                            color="secondary"
                            startContent={<FiDownload />}
                            onClick={() =>
                                onDownloadData(joinResult, "join_results.csv")
                            }
                        >
                            Export CSV
                        </Button>
                    </div>
                    <div className="max-h-96 overflow-auto">
                        <Table aria-label="Join results">
                            <TableHeader>
                                {joinResult.columns.map((column) => (
                                    <TableColumn key={column}>
                                        {column}
                                    </TableColumn>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {joinResult.rows
                                    .slice(0, 100)
                                    .map((row, index) => (
                                        <TableRow key={index}>
                                            {joinResult.columns.map(
                                                (column, cellIndex) => (
                                                    <TableCell key={cellIndex}>
                                                        {row[column] !== null &&
                                                        row[column] !==
                                                            undefined
                                                            ? String(
                                                                  row[column],
                                                              )
                                                            : "NULL"}
                                                    </TableCell>
                                                ),
                                            )}
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                        {joinResult.rows.length > 100 && (
                            <p className="mt-2 text-sm text-gray-500">
                                Showing first 100 rows of {joinResult.rowCount}{" "}
                                total rows
                            </p>
                        )}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
