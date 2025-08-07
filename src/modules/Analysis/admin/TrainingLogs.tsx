"use client";

import React, { useState, useEffect } from "react";
import {
    Button,
    Card,
    CardBody,
    Spinner,
    Pagination,
    Chip,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
} from "@heroui/react";
import { enqueueSnackbar } from "notistack";
import { FiCalendar, FiUser, FiVideo, FiDownload } from "react-icons/fi";

interface TrainingLog {
    id: number;
    username: string;
    email: string;
    type: string;
    log: string;
    createdAt: string;
}

interface TrainingLogsPagination {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

interface TrainingLogsResponse {
    logs: TrainingLog[];
    pagination: TrainingLogsPagination;
    filters: {
        type: string;
        sortBy: string;
        sortOrder: string;
    };
}

export default function TrainingLogs() {
    const [logs, setLogs] = useState<TrainingLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState<TrainingLogsPagination>({
        page: 1,
        limit: 10,
        totalCount: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
    });

    const fetchLogs = async (page: number = pagination.page) => {
        setLoading(true);
        try {
            const response = await fetch(
                `/api/training-logs?page=${page}&limit=${pagination.limit}`,
            );
            const data: TrainingLogsResponse = await response.json();

            if (response.ok) {
                setLogs(data.logs);
                setPagination(data.pagination);
            } else {
                enqueueSnackbar("Failed to fetch training logs", {
                    variant: "error",
                });
            }
        } catch (error) {
            console.error("Error fetching training logs:", error);
            enqueueSnackbar("An error occurred while fetching logs", {
                variant: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchLogs();
    }, []);

    const handlePageChange = (page: number) => {
        setPagination((prev) => ({ ...prev, page }));
        void fetchLogs(page);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "training_video_interaction":
                return "primary";
            case "training_access":
                return "success";
            case "failed_training_access":
                return "danger";
            default:
                return "default";
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "training_video_interaction":
                return <FiVideo className="h-4 w-4" />;
            case "training_access":
                return <FiUser className="h-4 w-4" />;
            default:
                return <FiCalendar className="h-4 w-4" />;
        }
    };

    const exportToCSV = () => {
        const headers = ["Date", "Username", "Email", "Type", "Log"];
        const csvContent = [
            headers.join(","),
            ...logs.map((log) =>
                [
                    `"${formatDate(log.createdAt)}"`,
                    `"${log.username}"`,
                    `"${log.email}"`,
                    `"${log.type}"`,
                    `"${log.log.replace(/"/g, '""')}"`,
                ].join(","),
            ),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `training-logs-${
            new Date().toISOString().split("T")[0]
        }.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button
                    color="primary"
                    variant="flat"
                    startContent={<FiDownload />}
                    onPress={exportToCSV}
                    isDisabled={logs.length === 0}
                >
                    Export CSV
                </Button>
            </div>

            {/* Results Summary */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                    {pagination.totalCount > 0 ? (
                        <>
                            Showing{" "}
                            {(pagination.page - 1) * pagination.limit + 1}-
                            {Math.min(
                                pagination.page * pagination.limit,
                                pagination.totalCount,
                            )}{" "}
                            of {pagination.totalCount} logs
                        </>
                    ) : (
                        "No logs found"
                    )}
                </div>
                <div className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.totalPages}
                </div>
            </div>

            {/* Logs Table */}
            <Card>
                <CardBody className="p-0">
                    {loading ? (
                        <div className="flex h-64 items-center justify-center">
                            <Spinner size="lg" color="primary" />
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="flex h-64 items-center justify-center">
                            <div className="text-center">
                                <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-lg font-medium text-gray-900">
                                    No logs found
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    No training logs are available.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <Table removeWrapper aria-label="Training logs table">
                            <TableHeader>
                                <TableColumn key="createdAt">DATE</TableColumn>
                                <TableColumn key="username">USER</TableColumn>
                                <TableColumn key="email">EMAIL</TableColumn>
                                <TableColumn key="type">TYPE</TableColumn>
                                <TableColumn key="log">LOG</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell>
                                            <div className="text-sm">
                                                {formatDate(log.createdAt)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                                                    {log.username[0]?.toUpperCase()}
                                                </div>
                                                <span className="font-medium">
                                                    {log.username}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-gray-600">
                                                {log.email}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                color={getTypeColor(log.type)}
                                                variant="flat"
                                                startContent={getTypeIcon(
                                                    log.type,
                                                )}
                                                size="sm"
                                            >
                                                {log.type
                                                    .replace("_", " ")
                                                    .replace(/\b\w/g, (l) =>
                                                        l.toUpperCase(),
                                                    )}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-md">
                                                <p
                                                    className="line-clamp-2 text-sm"
                                                    title={log.log}
                                                >
                                                    {log.log}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardBody>
            </Card>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-center">
                    <Pagination
                        total={pagination.totalPages}
                        page={pagination.page}
                        onChange={handlePageChange}
                        showControls
                        color="primary"
                        isDisabled={loading}
                    />
                </div>
            )}
        </div>
    );
}
