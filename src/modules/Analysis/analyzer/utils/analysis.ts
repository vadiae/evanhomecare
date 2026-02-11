import { areServiceCodesEqual, normalizeServiceCode } from "./serviceUtils";
import { type ConsumerAnalysisResult, type DataRow } from "../types";
import { createGroupedByDay } from "./grouping";
import { validateWaiverEntry } from "./validateWaiverEntry";

export const analyzeConsumer = (
    consumerName: string,
    rows: DataRow[],
    headers: string[],
    startDate: string,
    endDate: string,
): ConsumerAnalysisResult => {
    const filteredRows = rows.filter(
        (row: DataRow) => row.consumerName === consumerName,
    );
    const filteredData = {
        rows: filteredRows,
        columns: headers,
        startDate,
        endDate,
    };

    const waiverCountByService = filteredRows.reduce(
        (acc: Record<string, number>, row: DataRow) => {
            if (areServiceCodesEqual(row["Service Code"] || "", "0000-WVR")) {
                const associatedService =
                    row["Associated Service"] || "Unknown";
                acc[associatedService] = (acc[associatedService] || 0) + 1;
            }
            return acc;
        },
        {},
    );

    const waiverCount = Math.max(...Object.values(waiverCountByService), 0);

    const waiverValidation: Record<
        string,
        { isValid: boolean; errors: string[] }
    > = {};
    filteredRows.forEach((row: DataRow, index: number) => {
        const validation = validateWaiverEntry(row);
        if (!validation.isValid) {
            waiverValidation[index.toString()] = validation;
        }
    });

    const groupedByService = filteredData.rows.reduce(
        (acc: Record<string, DataRow[]>, row: DataRow) => {
            const rawServiceCode =
                row["Service Code"] || "Not a 0000-WVR service";
            const serviceCode = normalizeServiceCode(rawServiceCode);
            if (!acc[serviceCode]) {
                acc[serviceCode] = [] as DataRow[];
            }
            acc[serviceCode]!.push(row);
            return acc;
        },
        {},
    );

    const totalServiceGrouped = Object.entries(groupedByService).reduce(
        (
            acc: Record<string, number>,
            [serviceCode, rows]: [string, DataRow[]],
        ) => {
            acc[serviceCode] = rows.reduce((total: number, row: DataRow) => {
                const units = parseFloat(
                    (row.units || row.Units || "0").toString(),
                );
                return total + (isNaN(units) ? 0 : units);
            }, 0);
            return acc;
        },
        {},
    );

    const groupedByDay = createGroupedByDay(
        filteredData,
        startDate || "",
        endDate || "",
    );

    const groupedByAssociatedService = filteredData.rows.reduce(
        (acc: Record<string, DataRow[]>, row: DataRow) => {
            if (areServiceCodesEqual(row["Service Code"] || "", "0000-WVR")) {
                const associatedService =
                    row["Associated Service"] || "Unknown";
                const date = row.date || row.Date;
                const docType = row["Documentation Type"];

                if (!acc[associatedService]) {
                    acc[associatedService] = [] as DataRow[];
                }
                acc[associatedService]!.push({
                    ...row,
                    date,
                    docType,
                });
            }
            return acc;
        },
        {},
    );

    const analysis = {
        filteredData,
        groupedByService,
        totalServiceGrouped,
        groupedByDay,
        waiverValidation,
        groupedByAssociatedService,
        waiverCount,
    };

    const errorCount = Object.keys(waiverValidation).length;
    const hasErrors = errorCount > 0;

    return {
        consumerName,
        analysis,
        hasErrors,
        errorCount,
    };
};
