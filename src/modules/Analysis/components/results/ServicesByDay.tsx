import React from "react";
import { type ConsumerAnalysisResult } from "../../analyzer/types";

interface ServicesByDayProps {
    consumerResult: ConsumerAnalysisResult;
    multipleEntrances: boolean;
}

export const ServicesByDay: React.FC<ServicesByDayProps> = ({
    consumerResult,
    multipleEntrances,
}) => {
    console.log("🚀 ~ ServicesByDay ~ consumerResult:", consumerResult);
    return (
        <div className="rounded-lg border border-gray-200 p-3">
            <div className="mb-3 w-max rounded-md bg-primary px-2 py-1 text-base font-semibold text-white">
                <h6>Servicios por Día</h6>
            </div>

            {/* Grid layout for days side by side */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Object.entries(consumerResult.analysis.groupedByDay)
                    .sort()
                    .map(([date, services]) => (
                        <div
                            key={date}
                            className="min-w-0 max-w-xs rounded-md bg-primary/5 p-2"
                        >
                            {/* Compact date header */}
                            <div className="mb-2 flex items-center justify-between border-b border-primary/20 pb-1">
                                <div className="truncate text-sm font-semibold text-primary">
                                    {date}
                                </div>
                                <div className="text-xs text-primary/70">
                                    {new Date(date).toLocaleDateString(
                                        "es-ES",
                                        {
                                            weekday: "short",
                                            day: "numeric",
                                            month: "short",
                                        },
                                    )}
                                </div>
                            </div>

                            {/* Compact services list */}
                            <div className="space-y-1">
                                {Object.keys(services).length === 0 ? (
                                    <div className="rounded px-2 py-2 text-sm italic text-red-600">
                                        No hay servicios para este día
                                    </div>
                                ) : (
                                    Object.entries(services).map(
                                        ([service, data]) => (
                                            <div
                                                key={`${date}-${service}`}
                                                className={`rounded px-2 py-1 text-xs  ${
                                                    !multipleEntrances &&
                                                    data.warning
                                                        ? "bg-red-50 text-red-600"
                                                        : "text-gray-600 hover:bg-gray-50"
                                                }`}
                                            >
                                                <div className="mb-1 truncate text-lg font-bold">
                                                    {service}
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span className="font-semibold">
                                                        {data.entries.length}{" "}
                                                        {data.entries.length ===
                                                        1
                                                            ? "entrada"
                                                            : "entradas"}
                                                    </span>
                                                    <span className="text-gray-500">
                                                        {data.totalUnits.toFixed(
                                                            1,
                                                        )}{" "}
                                                        unidades
                                                    </span>
                                                </div>
                                            </div>
                                        ),
                                    )
                                )}
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};
