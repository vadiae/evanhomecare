"use client";

import {
    Accordion,
    AccordionItem,
    Card,
    CardBody,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from "@heroui/react";
import {
    FiAlertTriangle,
    FiCalendar,
    FiClock,
    FiUser,
    FiX,
} from "react-icons/fi";

interface ScheduleMismatch {
    type?: "NO_SCHEDULE" | "MISSING_ACTIVITY";
    personName: string;
    clientId: string;
    date: string;
    dayOfWeek: string;
    serviceCode: string;
    issue?: string;
    issues?: string[];
    activities: any[];
    scheduledUnits: number;
    actualUnits: number;
    activityCount: number;
    schedule?: {
        id: number;
        multiple: boolean;
        startDate: string;
    };
}

export interface ScheduleMismatchesProps {
    mismatches: Record<string, ScheduleMismatch[]>;
    serviceTotalsByPerson?: Record<string, Record<string, number>>;
    globalServiceTotals?: Record<string, number>;
}

export const ScheduleMismatches: React.FC<ScheduleMismatchesProps> = ({
    mismatches,
    serviceTotalsByPerson,
    globalServiceTotals,
}: ScheduleMismatchesProps) => {
    if (!mismatches || Object.keys(mismatches).length === 0) {
        return (
            <Card className="border-0 shadow-lg">
                <CardBody className="p-8">
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="rounded-full bg-green-50 p-4">
                                <FiCalendar className="h-12 w-12 text-green-400" />
                            </div>
                        </div>
                        <h4 className="mb-3 text-lg font-semibold text-gray-800">
                            ¡Sin discrepancias encontradas!
                        </h4>
                        <p className="mx-auto max-w-md text-sm leading-relaxed text-gray-600">
                            Todas las actividades están alineadas con los
                            horarios programados.
                        </p>
                    </div>
                </CardBody>
            </Card>
        );
    }

    const totalMismatches = Object.values(mismatches).reduce(
        (sum, personMismatches) => sum + personMismatches.length,
        0,
    );

    const getMismatchTypeColor = (mismatch: ScheduleMismatch) => {
        if (mismatch.type === "NO_SCHEDULE") return "warning";
        if (mismatch.type === "MISSING_ACTIVITY") return "danger";
        if (mismatch.issues && mismatch.issues.length > 0) return "danger";
        return "default";
    };

    const getMismatchTypeIcon = (mismatch: ScheduleMismatch) => {
        if (mismatch.type === "NO_SCHEDULE") return <FiAlertTriangle />;
        if (mismatch.type === "MISSING_ACTIVITY") return <FiX />;
        return <FiAlertTriangle />;
    };

    const formatDate = (dateString: string) => {
        try {
            const [month, day, year] = dateString.split("/");
            const fullYear = `${year}`;
            const fullMonth = `${month}`;
            const fullDay = `${day}`;

            return new Date(
                parseInt(fullYear),
                parseInt(fullMonth) - 1,
                parseInt(fullDay),
            ).toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch {
            return dateString;
        }
    };

    return (
        <div className="">
            <div className="">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-red-50 p-2">
                            <FiAlertTriangle className="h-6 w-6 text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800">
                                Análisis Predictivo
                            </h3>
                            <p className="text-sm text-gray-600">
                                Actividades que no coinciden con los horarios
                                programados
                            </p>
                        </div>
                    </div>
                    <Chip
                        size="lg"
                        color="danger"
                        variant="flat"
                        className="font-semibold"
                    >
                        {totalMismatches} discrepancias
                    </Chip>
                </div>

                {/* Global Totals Summary */}
                {globalServiceTotals &&
                    Object.keys(globalServiceTotals).length > 0 && (
                        <Card className="mb-4 border border-gray-100 bg-white">
                            <CardBody className="p-4">
                                <div className="mb-2 text-sm font-semibold text-gray-700">
                                    Total global de unidades por servicio
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(globalServiceTotals)
                                        .sort((a, b) =>
                                            a[0].localeCompare(b[0]),
                                        )
                                        .map(([service, total]) => (
                                            <Chip
                                                key={`global-${service}`}
                                                size="sm"
                                                color="secondary"
                                                variant="flat"
                                                className="font-medium"
                                            >
                                                {service}: {total}
                                            </Chip>
                                        ))}
                                </div>
                            </CardBody>
                        </Card>
                    )}

                <Accordion variant="splitted" className="gap-3">
                    {Object.entries(mismatches).map(
                        ([personName, personMismatches]) => (
                            <AccordionItem
                                key={personName}
                                aria-label={`Discrepancias para ${personName}`}
                                classNames={{
                                    base: "px-4 py-3",
                                    title: "text-sm font-medium",
                                    trigger: "py-3",
                                    content: "px-1 pt-2",
                                }}
                                title={
                                    <div className="flex w-full items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <FiUser className="h-4 w-4 text-gray-500" />
                                            <span className="truncate text-sm font-medium">
                                                {personName}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Chip
                                                size="sm"
                                                color="danger"
                                                variant="flat"
                                            >
                                                {personMismatches.length}{" "}
                                                {personMismatches.length === 1
                                                    ? "discrepancia"
                                                    : "discrepancias"}
                                            </Chip>
                                        </div>
                                    </div>
                                }
                            >
                                <div className="space-y-4">
                                    {/* Totals by Service Summary */}
                                    {serviceTotalsByPerson &&
                                        serviceTotalsByPerson[personName] && (
                                            <Card className="border border-gray-100 bg-white">
                                                <CardBody className="p-4">
                                                    <div className="mb-2 text-sm font-semibold text-gray-700">
                                                        Unidades por servicio
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {Object.entries(
                                                            serviceTotalsByPerson[
                                                                personName
                                                            ]!,
                                                        )
                                                            .sort((a, b) =>
                                                                a[0].localeCompare(
                                                                    b[0],
                                                                ),
                                                            )
                                                            .map(
                                                                ([
                                                                    service,
                                                                    total,
                                                                ]) => (
                                                                    <Chip
                                                                        key={`${personName}-${service}`}
                                                                        size="sm"
                                                                        color="primary"
                                                                        variant="flat"
                                                                        className="font-medium"
                                                                    >
                                                                        {
                                                                            service
                                                                        }
                                                                        :{" "}
                                                                        {total}
                                                                    </Chip>
                                                                ),
                                                            )}
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        )}

                                    {personMismatches.map((mismatch, index) => (
                                        <Card
                                            key={index}
                                            className="border border-red-100 bg-red-50/50"
                                        >
                                            <CardBody className="p-4">
                                                <div className="mb-4 flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="rounded-full bg-red-100 p-2">
                                                            {getMismatchTypeIcon(
                                                                mismatch,
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-gray-800">
                                                                {formatDate(
                                                                    mismatch.date,
                                                                )}
                                                            </h4>
                                                            <p className="text-sm text-gray-600">
                                                                {
                                                                    mismatch.dayOfWeek
                                                                }{" "}
                                                                •{" "}
                                                                {
                                                                    mismatch.serviceCode
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Chip
                                                        size="sm"
                                                        color={getMismatchTypeColor(
                                                            mismatch,
                                                        )}
                                                        variant="flat"
                                                    >
                                                        {mismatch.type ===
                                                            "NO_SCHEDULE" &&
                                                            "Sin horario"}
                                                        {mismatch.type ===
                                                            "MISSING_ACTIVITY" &&
                                                            "Actividad faltante"}
                                                        {!mismatch.type &&
                                                            "Discrepancia"}
                                                    </Chip>
                                                </div>

                                                {/* Issue Description */}
                                                <div className="mb-4">
                                                    {mismatch.issue && (
                                                        <p className="text-sm text-red-700">
                                                            {mismatch.issue}
                                                        </p>
                                                    )}
                                                    {mismatch.issues &&
                                                        mismatch.issues.length >
                                                            0 && (
                                                            <ul className="space-y-1">
                                                                {mismatch.issues.map(
                                                                    (
                                                                        issue,
                                                                        issueIndex,
                                                                    ) => (
                                                                        <li
                                                                            key={
                                                                                issueIndex
                                                                            }
                                                                            className="flex items-start gap-2 text-sm text-red-700"
                                                                        >
                                                                            <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
                                                                            <span>
                                                                                {
                                                                                    issue
                                                                                }
                                                                            </span>
                                                                        </li>
                                                                    ),
                                                                )}
                                                            </ul>
                                                        )}
                                                </div>

                                                {/* Units Comparison */}
                                                <div className="mb-4 grid grid-cols-2 gap-4">
                                                    <div className="rounded-lg bg-white p-3">
                                                        <div className="mb-1 flex items-center gap-2">
                                                            <FiClock className="h-4 w-4 text-blue-500" />
                                                            <span className="text-sm font-medium text-gray-700">
                                                                Programado
                                                            </span>
                                                        </div>
                                                        <p className="text-lg font-semibold text-blue-600">
                                                            {
                                                                mismatch.scheduledUnits
                                                            }{" "}
                                                            unidades
                                                        </p>
                                                    </div>
                                                    <div className="rounded-lg bg-white p-3">
                                                        <div className="mb-1 flex items-center gap-2">
                                                            <FiCalendar className="h-4 w-4 text-green-500" />
                                                            <span className="text-sm font-medium text-gray-700">
                                                                Realizado
                                                            </span>
                                                        </div>
                                                        <p className="text-lg font-semibold text-green-600">
                                                            {
                                                                mismatch.actualUnits
                                                            }{" "}
                                                            unidades
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Activities Table */}
                                                {mismatch.activities &&
                                                    mismatch.activities.length >
                                                        0 && (
                                                        <div>
                                                            <h5 className="mb-2 text-sm font-semibold text-gray-700">
                                                                Actividades
                                                                registradas (
                                                                {
                                                                    mismatch.activityCount
                                                                }
                                                                )
                                                            </h5>
                                                            <Table
                                                                aria-label="Activities table"
                                                                removeWrapper
                                                                classNames={{
                                                                    base: "max-h-40 overflow-auto",
                                                                    table: "min-h-[100px]",
                                                                }}
                                                            >
                                                                <TableHeader>
                                                                    <TableColumn>
                                                                        Fecha
                                                                    </TableColumn>
                                                                    <TableColumn>
                                                                        Servicio
                                                                    </TableColumn>
                                                                    <TableColumn>
                                                                        Unidades
                                                                    </TableColumn>
                                                                    <TableColumn>
                                                                        Tipo
                                                                    </TableColumn>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {mismatch.activities.map(
                                                                        (
                                                                            activity,
                                                                            activityIndex,
                                                                        ) => (
                                                                            <TableRow
                                                                                key={
                                                                                    activityIndex
                                                                                }
                                                                            >
                                                                                <TableCell>
                                                                                    {
                                                                                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                                                                                        activity.Date
                                                                                    }
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    {
                                                                                        activity[
                                                                                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                                                                                            "Service Code"
                                                                                        ]
                                                                                    }
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    {
                                                                                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                                                                                        activity.Units ||
                                                                                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                                                                                            activity.units ||
                                                                                            0
                                                                                    }
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    {activity[
                                                                                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                                                                                        "Documentation Type"
                                                                                    ] ||
                                                                                        "N/A"}
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        ),
                                                                    )}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                    )}

                                                {/* Schedule Info */}
                                                {mismatch.schedule && (
                                                    <div className="mt-4 rounded-lg bg-gray-50 p-3">
                                                        <h6 className="mb-2 text-sm font-semibold text-gray-700">
                                                            Información del
                                                            Horario
                                                        </h6>
                                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                                            <div>
                                                                <span className="text-gray-600">
                                                                    ID:
                                                                </span>{" "}
                                                                <span className="font-medium">
                                                                    {
                                                                        mismatch
                                                                            .schedule
                                                                            .id
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-600">
                                                                    Múltiple:
                                                                </span>{" "}
                                                                <span className="font-medium">
                                                                    {mismatch
                                                                        .schedule
                                                                        .multiple
                                                                        ? "Sí"
                                                                        : "No"}
                                                                </span>
                                                            </div>
                                                            <div className="col-span-2">
                                                                <span className="text-gray-600">
                                                                    Inicio:
                                                                </span>{" "}
                                                                <span className="font-medium">
                                                                    {new Date(
                                                                        mismatch.schedule.startDate,
                                                                    ).toLocaleDateString(
                                                                        "es-ES",
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </CardBody>
                                        </Card>
                                    ))}
                                </div>
                            </AccordionItem>
                        ),
                    )}
                </Accordion>
            </div>
        </div>
    );
};
