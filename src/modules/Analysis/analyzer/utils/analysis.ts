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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if ((row as any)["Service Code"] === "0000-WVR") {
                const associatedService =
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    (row as any)["Associated Service"] || "Unknown";
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
            const serviceCode =
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                (row as any)["Service Code"] || "Not a 0000-WVR service";
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (!acc[serviceCode]) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                acc[serviceCode] = [] as DataRow[];
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
                    (row as any).units || (row as any).Units || "0",
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if ((row as any)["Service Code"] === "0000-WVR") {
                const associatedService =
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    (row as any)["Associated Service"] || "Unknown";
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                const date = (row as any).date || (row as any).Date;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                const docType = (row as any)["Documentation Type"];

                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                if (!acc[associatedService]) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    acc[associatedService] = [] as DataRow[];
                }
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                (acc[associatedService] as any)!.push({
                    date,
                    docType,
                    ...(row as any),
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
