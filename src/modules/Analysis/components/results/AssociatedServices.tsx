import React from "react";
import { ConsumerAnalysisResult, DataRow } from "../../analyzer/types";

interface AssociatedServicesProps {
    consumerResult: ConsumerAnalysisResult;
    validAssociatedServices: string[];
}

export const AssociatedServices: React.FC<AssociatedServicesProps> = ({
    consumerResult,
    validAssociatedServices,
}) => {
    return (
        <div className="rounded-lg border border-gray-200 p-4">
            <div className="mb-2 w-max rounded-md bg-primary px-2 text-lg font-semibold text-white">
                <h6 className="">Servicios Asociados</h6>
            </div>
            {Object.entries(
                consumerResult.analysis.groupedByAssociatedService,
            ).map(([service, items]) => (
                <div key={service}>
                    <div
                        className={`flex justify-between border-b border-gray-100 px-2 py-2 ${
                            !validAssociatedServices.includes(service) ||
                            items.length !== consumerResult.analysis.waiverCount
                                ? "bg-red-50"
                                : ""
                        }`}
                    >
                        <span
                            className={`${
                                !validAssociatedServices.includes(service) ||
                                items.length !==
                                    consumerResult.analysis.waiverCount
                                    ? "text-red-600"
                                    : "text-gray-600"
                            }`}
                        >
                            {service}
                        </span>
                        <span className="font-medium">
                            {items.length}{" "}
                            {items.length === 1 ? "entrada" : "entradas"}{" "}
                        </span>
                    </div>
                    {items.map((item: DataRow, index: number) => (
                        <div
                            key={index}
                            className="ml-4 border-b border-gray-100 px-2 py-1 text-sm"
                        >
                            <div className="text-gray-600">
                                Fecha: {item.date}
                            </div>
                            <div
                                className={`${
                                    // @ts-ignore
                                    !item.docType
                                        ? "text-red-600"
                                        : "text-gray-600"
                                }`}
                            >
                                {/* @ts-ignore */}
                                Tipo de Documento:{" "}
                                {item.docType || "Sin tipo de documento"}
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};
