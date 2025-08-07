import React, { useState } from "react";
import { ConsumerAnalysisResult } from "../../analyzer/types";

interface TotalServicesUnitsProps {
    consumerResult: ConsumerAnalysisResult;
    validServiceCodes: string[];
}

export const TotalServicesUnits: React.FC<TotalServicesUnitsProps> = ({
    consumerResult,
    validServiceCodes,
}) => {
    const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ];
    const types = ["S5130:UC", "S5135:UC", "S5151:UC"];

    const [matrix, setMatrix] = useState<number[][]>(
        Array(days.length)
            .fill(null)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            .map(() => Array(types.length).fill(0)),
    );
    const [errors, setErrors] = useState<{
        missingServices: string[];
        unexpectedServices: string[];
        unitMismatches: string[];
        noEntriesForDay: string[];
    }>({
        missingServices: [],
        unexpectedServices: [],
        unitMismatches: [],
        noEntriesForDay: [],
    });
    const [isAnalysisDone, setIsAnalysisDone] = useState(false);

    const handleInputChange = (
        dayIndex: number,
        typeIndex: number,
        value: string,
    ) => {
        const newMatrix = [...matrix];

        if (newMatrix[dayIndex]?.[typeIndex] !== undefined) {
            newMatrix[dayIndex]![typeIndex] = parseInt(value) || 0;
            setMatrix(newMatrix);
        }
    };

    const analyzeData = () => {
        const newErrors = {
            missingServices: [] as string[],
            unexpectedServices: [] as string[],
            unitMismatches: [] as string[],
            noEntriesForDay: [] as string[],
        };
        const groupedByDay = consumerResult.analysis.groupedByDay;

        // First check matrix for any inputs on days without entries
        days.forEach((day, dayIndex) => {
            const hasEntryForDay = Object.entries(groupedByDay).some(
                ([date]) => {
                    const entryDayOfWeek = new Date(date).toLocaleDateString(
                        "en-US",
                        {
                            weekday: "long",
                        },
                    );
                    return entryDayOfWeek === day;
                },
            );

            if (!hasEntryForDay) {
                let hasInputForDay = false;
                types.forEach((service, typeIndex) => {
                    const inputUnits = Number(matrix[dayIndex]?.[typeIndex]);
                    if (inputUnits > 0) {
                        hasInputForDay = true;
                    }
                });

                if (hasInputForDay) {
                    newErrors.noEntriesForDay.push(
                        `${day}: No entries exist for this day of the week`,
                    );
                }
            }
        });

        // Then check existing entries
        Object.entries(groupedByDay).forEach(([date, services]) => {
            const dayOfWeek = new Date(date).toLocaleDateString("en-US", {
                weekday: "long",
            });
            const dayIndex = days.indexOf(dayOfWeek);

            if (dayIndex !== -1) {
                // Check for missing expected services
                types.forEach((expectedService, typeIndex) => {
                    const inputUnits = Number(matrix[dayIndex]?.[typeIndex]);
                    const serviceData = services[expectedService];

                    if (inputUnits > 0 && !serviceData) {
                        newErrors.missingServices.push(
                            `(${date} - ${dayOfWeek}): Expected ${expectedService} with ${inputUnits} units but service was not found`,
                        );
                    }
                });

                // Check actual services against expected
                Object.entries(services).forEach(([service, data]) => {
                    if (service === "0000-WVR") {
                        return;
                    }

                    const typeIndex = types.indexOf(service);

                    if (typeIndex !== -1) {
                        const inputUnits = Number(
                            matrix[dayIndex]?.[typeIndex],
                        );
                        const actualUnits = Number(data.totalUnits);

                        if (inputUnits === 0 && actualUnits > 0) {
                            newErrors.unexpectedServices.push(
                                `(${date} - ${dayOfWeek}): Unexpected service found: ${service} with ${actualUnits} units`,
                            );
                        } else if (inputUnits !== actualUnits) {
                            newErrors.unitMismatches.push(
                                `(${date} - ${dayOfWeek}): Service ${service} has ${actualUnits} units but expected ${inputUnits} units`,
                            );
                        }
                    }
                });
            }
        });

        setErrors(newErrors);
        setIsAnalysisDone(true);

        // Only clear analysis done state after 10 seconds if there are no errors
        if (
            newErrors.missingServices.length === 0 &&
            newErrors.unexpectedServices.length === 0 &&
            newErrors.unitMismatches.length === 0 &&
            newErrors.noEntriesForDay.length === 0
        ) {
            setTimeout(() => {
                setIsAnalysisDone(false);
            }, 10000);
        }
    };

    return (
        <div className="rounded-lg border border-gray-200 p-4">
            <div className="mb-2 w-max rounded-md bg-primary px-2 text-lg font-semibold text-white">
                <h6 className="">Total Services Units</h6>
            </div>

            {Object.entries(consumerResult.analysis.totalServiceGrouped).map(
                ([service, total]) => (
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
                        <span className="font-medium">{total}</span>
                    </div>
                ),
            )}

            <div className="mt-4">
                <table className="w-full border-collapse border border-gray-200">
                    <thead>
                        <tr>
                            <th className="border border-gray-200 bg-gray-50 p-2"></th>
                            {types.map((type) => (
                                <th
                                    key={type}
                                    className="border border-gray-200 bg-gray-50 p-2"
                                >
                                    {type}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {days.map((day, dayIndex) => (
                            <tr key={day}>
                                <td className="border border-gray-200 p-2 font-medium">
                                    {day}
                                </td>
                                {types.map((type, typeIndex) => (
                                    <td
                                        key={type}
                                        className="border border-gray-200 p-1"
                                    >
                                        <input
                                            className="w-full rounded border border-gray-300 p-1 text-center"
                                            min="0"
                                            value={
                                                matrix[dayIndex]?.[typeIndex] ??
                                                0
                                            }
                                            onChange={(e) =>
                                                handleInputChange(
                                                    dayIndex,
                                                    typeIndex,
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="mt-4 flex flex-col gap-4">
                    <button
                        onClick={analyzeData}
                        className="rounded bg-primary px-4 py-2 text-white hover:bg-primary/90"
                    >
                        Analyze Data
                    </button>

                    {isAnalysisDone &&
                    errors.missingServices.length === 0 &&
                    errors.unexpectedServices.length === 0 &&
                    errors.unitMismatches.length === 0 &&
                    errors.noEntriesForDay.length === 0 ? (
                        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                            <p className="text-green-600">No errors found</p>
                        </div>
                    ) : errors.missingServices.length > 0 ||
                      errors.unexpectedServices.length > 0 ||
                      errors.unitMismatches.length > 0 ||
                      errors.noEntriesForDay.length > 0 ? (
                        <div className="space-y-4">
                            <h6 className="font-medium text-red-700">
                                Validation Errors
                            </h6>

                            {errors.noEntriesForDay.length > 0 && (
                                <div className="space-y-2">
                                    <h6 className="font-bold text-red-600">
                                        Missing Days
                                    </h6>
                                    {errors.noEntriesForDay.map(
                                        (error, index) => (
                                            <div
                                                key={index}
                                                className="rounded-lg border border-red-200 bg-red-50 p-3"
                                            >
                                                <p className="text-red-600">
                                                    {error}
                                                </p>
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}

                            {errors.missingServices.length > 0 && (
                                <div className="space-y-2">
                                    <h6 className="font-bold text-red-600">
                                        Missing Services
                                    </h6>
                                    {errors.missingServices.map(
                                        (error, index) => (
                                            <div
                                                key={index}
                                                className="rounded-lg border border-red-200 bg-red-50 p-3"
                                            >
                                                <p className="text-red-600">
                                                    {error}
                                                </p>
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}

                            {errors.unexpectedServices.length > 0 && (
                                <div className="space-y-2">
                                    <h6 className="font-bold text-red-600">
                                        Unexpected Services
                                    </h6>
                                    {errors.unexpectedServices.map(
                                        (error, index) => (
                                            <div
                                                key={index}
                                                className="rounded-lg border border-red-200 bg-red-50 p-3"
                                            >
                                                <p className="text-red-600">
                                                    {error}
                                                </p>
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}

                            {errors.unitMismatches.length > 0 && (
                                <div className="space-y-2">
                                    <h6 className="font-bold text-red-600">
                                        Unit Mismatches
                                    </h6>
                                    {errors.unitMismatches.map(
                                        (error, index) => (
                                            <div
                                                key={index}
                                                className="rounded-lg border border-red-200 bg-red-50 p-3"
                                            >
                                                <p className="text-red-600">
                                                    {error}
                                                </p>
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};
