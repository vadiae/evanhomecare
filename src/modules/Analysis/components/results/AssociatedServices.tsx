import React from "react";
import {
    type ConsumerAnalysisResult,
    type DataRow,
} from "../../analyzer/types";

interface AssociatedServicesProps {
    consumerResult: ConsumerAnalysisResult;
    validAssociatedServices: string[];
}

export const AssociatedServices: React.FC<AssociatedServicesProps> = ({
    consumerResult,
    validAssociatedServices,
}) => {
    const hasData =
        consumerResult.analysis.groupedByAssociatedService &&
        Object.keys(consumerResult.analysis.groupedByAssociatedService).length >
            0;

    if (!hasData) {
        return (
            <div className="rounded-lg border border-gray-200 p-3">
                <div className="mb-3 w-max rounded-md bg-primary px-2 py-1 text-base font-semibold text-white">
                    <h6>Servicios Asociados</h6>
                </div>
                <div className="py-6 text-center text-gray-500">
                    <p className="text-sm">
                        No hay servicios asociados para mostrar
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-gray-200 p-3">
            <div className="mb-3 w-max rounded-md bg-primary px-2 py-1 text-base font-semibold text-white">
                <h6>Servicios Asociados</h6>
            </div>

            {/* Grid layout for services side by side */}
            <div className="grid max-w-7xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(
                    consumerResult.analysis.groupedByAssociatedService,
                ).map(([service, items]) => (
                    <div key={service} className="max-w-md">
                        {/* Service header card */}
                        <div
                            className={`rounded-t-md p-2 text-sm ${
                                !validAssociatedServices.includes(service) ||
                                items.length !==
                                    consumerResult.analysis.waiverCount
                                    ? "bg-red-50 text-red-600"
                                    : "bg-gray-50 text-gray-600"
                            }`}
                        >
                            <div className="mb-1 truncate font-medium">
                                {service}
                            </div>
                            <div className="text-xs font-semibold">
                                {items.length}{" "}
                                {items.length === 1 ? "entrada" : "entradas"}
                            </div>
                        </div>

                        {/* Service entries */}
                        <div className="rounded-b-md border border-t-0 border-gray-200 bg-white">
                            {items.map((item: DataRow, index: number) => (
                                <div
                                    key={index}
                                    className="border-b border-gray-100 p-2 text-xs last:border-b-0"
                                >
                                    <div className="mb-1 text-gray-600">
                                        <span className="font-medium">
                                            Fecha:
                                        </span>{" "}
                                        {item.date}
                                    </div>
                                    <div
                                        className={`${
                                            // @ts-ignore
                                            !item.docType
                                                ? "text-red-600"
                                                : "text-gray-600"
                                        }`}
                                    >
                                        <span className="font-medium">
                                            Tipo:
                                        </span>{" "}
                                        {/* @ts-ignore */}
                                        {item.docType ||
                                            "Sin tipo de documento"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
