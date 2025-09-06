import React from "react";
import { type ConsumerAnalysisResult } from "../../analyzer/types";

interface ServicesGroupedByTypeProps {
    consumerResult: ConsumerAnalysisResult;
    validServiceCodes: string[];
}

export const ServicesGroupedByType: React.FC<ServicesGroupedByTypeProps> = ({
    consumerResult,
    validServiceCodes,
}) => {
    return (
        <div className="rounded-lg border border-gray-200 p-3">
            <div className="mb-3 w-max rounded-md bg-primary px-2 py-1 text-base font-semibold text-white">
                <h6>Servicios Agrupados por Tipo</h6>
            </div>

            {/* Grid layout for services side by side */}
            <div className="grid max-w-7xl grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Object.entries(consumerResult.analysis.groupedByService).map(
                    ([service, items]) => (
                        <div
                            key={service}
                            className={`max-w-xs rounded-md p-2 text-sm ${
                                !validServiceCodes.includes(service)
                                    ? "bg-red-50 text-red-600"
                                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            <div className="mb-1 truncate text-lg font-bold ">
                                {service}
                            </div>
                            <div className="text-xs font-semibold">
                                {items.length}{" "}
                                {items.length === 1 ? "entrada" : "entradas"}
                            </div>
                        </div>
                    ),
                )}
            </div>
        </div>
    );
};
