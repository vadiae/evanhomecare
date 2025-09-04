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
        <div className="rounded-lg border border-gray-200 p-4">
            <div className="mb-2 w-max rounded-md bg-primary px-2 text-lg font-semibold text-white">
                <h6 className="">Servicios Agrupados por Tipo</h6>
            </div>
            {Object.entries(consumerResult.analysis.groupedByService).map(
                ([service, items]) => (
                    <div
                        key={service}
                        className={`flex justify-between border-b border-gray-100 px-2 py-2 ${
                            !validServiceCodes.includes(service)
                                ? "bg-red-50"
                                : ""
                        }`}
                    >
                        <span
                            className={`${
                                !validServiceCodes.includes(service)
                                    ? "text-red-600"
                                    : "text-gray-600"
                            }`}
                        >
                            {service}
                        </span>
                        <span className="font-medium">
                            {items.length}{" "}
                            {items.length === 1 ? "entrada" : "entradas"}
                        </span>
                    </div>
                ),
            )}
        </div>
    );
};
