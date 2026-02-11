// --- Parsed spreadsheet types ---
export interface WeekColumn {
    weekNumber: string;
    startDate: string;
    endDate: string;
    unitsColIndex: number;
    priceColIndex: number;
}

export interface DayWeekEntry {
    dayName: string; // from column E (Monday, Tuesday, ...)
    date: string; // from column F (mm/dd/yyyy)
    weekNumber: string;
    weekStartDate: string;
    weekEndDate: string;
    units: number;
    price: number;
}

/** Week number (1-52) -> date mm/dd/yyyy (from F) -> entry */
export interface ServiceBlock {
    serviceType: string;
    daysByWeek: Record<string, Record<string, DayWeekEntry>>;
}

export interface ParsedCustomer {
    id: string;
    name: string;
    services: ServiceBlock[];
}

export interface ParsedSpreadsheetData {
    customers: ParsedCustomer[];
    /** Mapping: date (mm/dd/yyyy) -> week number */
    dateToWeekNumber: Record<string, number>;
}

// --- Spreadsheet parser constants ---
export const DAYS_OF_WEEK = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];
const CUSTOMER_BLOCK_SIZE = 8;
const FIRST_DATA_COL = 6; // Column G (0-based)

export function parseDateHeader(dateStr: string, year: string): Date {
    const months: Record<string, number> = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11,
    };
    // Expected format: DD-MMM (e.g., 01-Jan)
    const parts = dateStr.split("-");
    const day = parseInt(parts[0] || "1", 10);
    const monthStr = parts[1] || "";
    const month = months[monthStr] ?? 0;
    return new Date(parseInt(year, 10), month, day);
}

export function parseSpreadsheetData(rows: string[][]): ParsedSpreadsheetData {
    if (rows.length < 5) {
        throw new Error(
            "Spreadsheet must have at least 5 rows (headers + 1 customer).",
        );
    }

    const year = rows[0]?.[3]?.trim() || new Date().getFullYear().toString();
    const weekRow = rows[1]; // Row 2: week numbers
    const startRow = rows[2]; // Row 3: start dates
    const endRow = rows[3]; // Row 4: end dates

    if (!weekRow || !startRow || !endRow) {
        throw new Error("Missing header rows for weeks/dates (rows 2-4).");
    }

    const months: Record<string, number> = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11,
    };

    // Parse week columns from G (index 6) onwards in pairs of 2
    const maxCol = Math.max(weekRow.length, startRow.length, endRow.length);
    const weeks: WeekColumn[] = [];

    for (let col = FIRST_DATA_COL; col < maxCol; col += 2) {
        const weekNum = weekRow[col]?.trim() ?? "";
        const start = startRow[col]?.trim() ?? "";
        const end = endRow[col]?.trim() ?? "";

        // Only allow week numbers 1-52; skip footer columns (UNITS, Month, Hours, etc.)
        const weekNumInt = parseInt(weekNum, 10);
        if (isNaN(weekNumInt) || weekNumInt < 1 || weekNumInt > 52) continue;

        weeks.push({
            weekNumber: weekNum,
            startDate: start,
            endDate: end,
            unitsColIndex: col,
            priceColIndex: col + 1,
        });
    }

    if (weeks.length === 0) {
        throw new Error("No week columns found in columns G onwards.");
    }

    // Parse customer blocks starting from row 5 (index 4)
    const customers: ParsedCustomer[] = [];
    const customerMap = new Map<string, ParsedCustomer>();

    for (
        let i = 4;
        i + CUSTOMER_BLOCK_SIZE <= rows.length;
        i += CUSTOMER_BLOCK_SIZE
    ) {
        const firstRow = rows[i];
        if (!firstRow) continue;

        const id = firstRow[0]?.trim() ?? "";
        const name = firstRow[1]?.trim() ?? "";

        // Service type is on (customer start + 1), column D (index 3)
        const secondRow = rows[i + 1];
        const serviceType = secondRow?.[3]?.trim() ?? "";

        if (!id && !name) continue; // skip empty blocks

        // daysByWeek: week number -> date (mm/dd/yyyy) -> entry
        const daysByWeek: Record<string, Record<string, DayWeekEntry>> = {};

        for (const week of weeks) {
            daysByWeek[week.weekNumber] = {};

            const parts = week.startDate.split("-");
            const d = parseInt(parts[0] || "1", 10);
            const currentMonthStr = parts[1] || "";
            const m = months[currentMonthStr] ?? 0;

            const dayNames = [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
            ];
            // Get the day name for this week's first day from the first customer row
            // The row for the first day of the week is rows[i] (index 4 initially)
            const firstDayName = rows[i]?.[4]?.trim() || "";
            const targetDayIdx = dayNames.indexOf(firstDayName);

            let yearValue = parseInt(year, 10);
            if (targetDayIdx !== -1) {
                // Check if current year, prev year, or next year matches the day name
                const candidates = [yearValue, yearValue - 1, yearValue + 1];
                for (const y of candidates) {
                    if (new Date(y, m, d).getDay() === targetDayIdx) {
                        yearValue = y;
                        break;
                    }
                }
            }

            const effectiveYear = yearValue.toString();

            const weekStartDate = parseDateHeader(
                week.startDate,
                effectiveYear,
            );

            for (let dayIdx = 0; dayIdx < DAYS_OF_WEEK.length; dayIdx++) {
                const dayRow = rows[i + dayIdx];
                const dayName =
                    dayRow?.[4]?.trim() ?? DAYS_OF_WEEK[dayIdx] ?? "";

                // Calculate date from week start
                const dayDate = new Date(weekStartDate);
                dayDate.setDate(dayDate.getDate() + dayIdx);

                const m = String(dayDate.getMonth() + 1).padStart(2, "0");
                const d = String(dayDate.getDate()).padStart(2, "0");
                const dateStr = `${m}-${d}-${dayDate.getFullYear()}`;

                const key = dateStr || dayName; // fallback to dayName if date empty

                daysByWeek[week.weekNumber]![key] = {
                    dayName,
                    date: dateStr,
                    weekNumber: week.weekNumber,
                    weekStartDate: week.startDate,
                    weekEndDate: week.endDate,
                    units: dayRow
                        ? parseFloat(dayRow[week.unitsColIndex] ?? "") || 0
                        : 0,
                    price: dayRow
                        ? parseFloat(dayRow[week.priceColIndex] ?? "") || 0
                        : 0,
                };
            }
        }

        const serviceBlock: ServiceBlock = { serviceType, daysByWeek };

        // Group by customer (same ID/name can appear with different services)
        const key = id || name;
        const existing = customerMap.get(key);
        if (existing) {
            existing.services.push(serviceBlock);
        } else {
            const customer: ParsedCustomer = {
                id,
                name,
                services: [serviceBlock],
            };
            customerMap.set(key, customer);
            customers.push(customer);
        }
    }

    // Build date -> week number mapping from all entries
    const dateToWeekNumber: Record<string, number> = {};
    for (const customer of customers) {
        for (const service of customer.services) {
            for (const dayMap of Object.values(service.daysByWeek)) {
                for (const entry of Object.values(dayMap)) {
                    if (entry.date) {
                        dateToWeekNumber[entry.date] = parseInt(
                            entry.weekNumber,
                            10,
                        );
                    }
                }
            }
        }
    }

    return { customers, dateToWeekNumber };
}
