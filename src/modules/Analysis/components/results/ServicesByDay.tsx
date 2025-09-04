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
    return (
        <div className="rounded-lg border border-gray-200 p-4">
            <div className="mb-2 w-max rounded-md bg-primary px-2 text-lg font-semibold text-white">
                <h6 className="">Servicios por Día</h6>
            </div>
            {Object.entries(consumerResult.analysis.groupedByDay)
                .sort()
                .map(([date, services]) => (
                    <div key={date} className="mb-4">
                        <h6 className="mb-2 flex items-center justify-between rounded-md bg-primary/10 px-3 py-2 text-lg font-semibold text-primary">
                            <span>{date}</span>
                            <span>
                                {new Date(date).toLocaleDateString("es-ES", {
                                    weekday: "short",
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </span>
                        </h6>
                        {Object.entries(services).map(([service, data]) => (
                            <div
                                key={`${date}-${service}`}
                                className={`flex justify-between rounded-md border-b border-gray-100 px-2 py-2 ${
                                    !multipleEntrances && data.warning
                                        ? "rounded-md bg-red-50"
                                        : ""
                                }`}
                            >
                                <span
                                    className={`${
                                        !multipleEntrances && data.warning
                                            ? "rounded-md text-red-600"
                                            : "rounded-md text-gray-600"
                                    }`}
                                >
                                    {service}
                                </span>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="font-medium">
                                        {data.entries.length}{" "}
                                        {data.entries.length === 1
                                            ? "entrada"
                                            : "entradas"}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {data.totalUnits.toFixed(2)} unidades
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
        </div>
    );
};
