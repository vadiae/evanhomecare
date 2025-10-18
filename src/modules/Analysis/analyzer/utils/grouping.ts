import { type DataRow } from "../types";
import { generateDateRange } from "./dateUtils";

export const initializeGroupedData = (startDate: string, endDate: string) => {
    const allDates = generateDateRange(startDate, endDate);
    const initialized: Record<
        string,
        Record<
            string,
            {
                entries: DataRow[];
                warning: boolean;
                totalUnits: number;
            }
        >
    > = {};

    allDates.forEach((date) => {
        initialized[date] = {};
    });

    return initialized;
};

export const createGroupedByDay = (
    filteredData: { rows: DataRow[] },
    startDate: string,
    endDate: string,
) => {
    if (!startDate || !endDate) {
        return {} as Record<string, Record<string, any>>;
    }

    const groupedByDay = initializeGroupedData(startDate, endDate);

    filteredData.rows.forEach((row: DataRow) => {
        const serviceCode = row["Service Code"] || "Not a 0000-WVR service";
        const date =
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            (row as any).date || (row as any).Date || "Not a 0000-WVR service";

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (!groupedByDay[date]) {
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (!groupedByDay[date]![serviceCode]) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            groupedByDay[date]![serviceCode] = {
                entries: [],
                warning: false,
                totalUnits: 0,
            };
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        groupedByDay[date]![serviceCode]!.entries.push(row);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (groupedByDay[date]![serviceCode]!.entries.length > 1) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            groupedByDay[date]![serviceCode]!.warning = true;
        }

        const units = parseFloat(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
            (row as any).units || (row as any).Units || "0",
        );
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        groupedByDay[date]![serviceCode]!.totalUnits += isNaN(units)
            ? 0
            : units;
    });

    return groupedByDay;
};
