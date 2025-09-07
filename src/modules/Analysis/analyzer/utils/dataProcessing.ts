import { type ConsumerAnalysisResult, type DataRow } from "../types";
import { validateWaiverEntry } from "./validateWaiverEntry";

export interface JsonData {
    extractionInfo: {
        startDate: string;
        endDate: string;
    };
    headers: string[];
    rows: any[][];
    consumerNames?: string[];
    reportDate?: string;
    recordsAmount?: number;
    startDate?: string;
    endDate?: string;
}

export interface ClientSchedule {
    id: number;
    clientId: string;
    clientName: string;
    startDate: string;
    service: string;
    monday: number | null;
    tuesday: number | null;
    wednesday: number | null;
    thursday: number | null;
    friday: number | null;
    saturday: number | null;
    sunday: number | null;
    multiple: boolean | null;
    createdAt: string;
}

export interface ProcessedData {
    headers: string[];
    rows: any[][];
    distinctConsumerNames: string[];
    startDate: string;
    endDate: string;
}

/**
 * Processes JSON data and extracts relevant information
 */
export const processJsonData = async (
    jsonData: JsonData,
): Promise<ProcessedData> => {
    try {
        const headers = jsonData.headers;
        const rows = jsonData.rows;
        const startDate = jsonData.extractionInfo.startDate || "";
        const endDate = jsonData.extractionInfo.endDate || "";
        const distinctConsumerNames = jsonData.consumerNames || [];

        return {
            headers,
            rows,
            distinctConsumerNames,
            startDate,
            endDate,
        };
    } catch (error) {
        console.error("Error processing JSON data:", error);
        throw new Error(
            "Error processing JSON data: " + (error as Error).message,
        );
    }
};

/**
 * Handles file upload and parsing
 */
export const handleFileUpload = async (file: File): Promise<ProcessedData> => {
    try {
        const text = await file.text();
        const jsonData: JsonData = JSON.parse(text);
        return await processJsonData(jsonData);
    } catch (error) {
        throw new Error("Error loading JSON file: " + (error as Error).message);
    }
};

/**
 * Helper function to generate all dates in range
 */
export const generateDateRange = (
    startDate: string,
    endDate: string,
): string[] => {
    const dates: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Ensure we're working with valid dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error("Invalid date format");
    }

    const current = new Date(start);
    while (current <= end) {
        // Format as MM/DD/YYYY to match your data format
        const month = String(current.getMonth() + 1).padStart(2, "0");
        const day = String(current.getDate()).padStart(2, "0");
        const year = current.getFullYear();
        dates.push(`${month}/${day}/${year}`);

        current.setDate(current.getDate() + 1);
    }

    return dates;
};

/**
 * Initialize the structure with all dates
 */
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

    // Initialize each date with empty object
    allDates.forEach((date) => {
        initialized[date] = {};
    });

    return initialized;
};

/**
 * Create grouped data by day
 */
export const createGroupedByDay = (
    filteredData: { rows: DataRow[] },
    startDate: string,
    endDate: string,
) => {
    if (!startDate || !endDate) {
        return {};
    }

    // Initialize with all dates in range
    const groupedByDay = initializeGroupedData(startDate, endDate);

    // Populate with actual data
    filteredData.rows.forEach((row: DataRow) => {
        const serviceCode = row["Service Code"] || "Not a 0000-WVR service";
        const date = row.date || row.Date || "Not a 0000-WVR service";

        // Skip if date is not in our range (shouldn't happen with proper filtering)
        if (!groupedByDay[date]) {
            return;
        }

        // Initialize service code if it doesn't exist for this date
        if (!groupedByDay[date]![serviceCode]) {
            groupedByDay[date]![serviceCode] = {
                entries: [],
                warning: false,
                totalUnits: 0,
            };
        }

        groupedByDay[date]![serviceCode]!.entries.push(row);
        if (groupedByDay[date]![serviceCode]!.entries.length > 1) {
            groupedByDay[date]![serviceCode]!.warning = true;
        }

        // Calculate total units for this service on this day
        const units = parseFloat(row.units || row.Units || "0");
        groupedByDay[date]![serviceCode]!.totalUnits += isNaN(units)
            ? 0
            : units;
    });

    return groupedByDay;
};

/**
 * Analyzes a single consumer's data
 */
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

    // Count total 0000-WVR entries per associated service
    const waiverCountByService = filteredRows.reduce(
        (acc: Record<string, number>, row: DataRow) => {
            if (row["Service Code"] === "0000-WVR") {
                const associatedService =
                    row["Associated Service"] || "Unknown";
                acc[associatedService] = (acc[associatedService] || 0) + 1;
            }
            return acc;
        },
        {},
    );

    // Get the maximum count among all associated services
    const waiverCount = Math.max(...Object.values(waiverCountByService), 0);

    // Validate waiver entries
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
            const serviceCode = row["Service Code"] || "Not a 0000-WVR service";
            if (!acc[serviceCode]) {
                acc[serviceCode] = [];
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
                const units = parseFloat(row.units || row.Units || "0");
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

    // Group by Associated Service
    const groupedByAssociatedService = filteredData.rows.reduce(
        (acc: Record<string, DataRow[]>, row: DataRow) => {
            if (row["Service Code"] === "0000-WVR") {
                const associatedService =
                    row["Associated Service"] || "Unknown";
                const date = row.date || row.Date;
                const docType = row["Documentation Type"];

                if (!acc[associatedService]) {
                    acc[associatedService] = [];
                }
                acc[associatedService]!.push({
                    date,
                    docType,
                    ...row,
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

interface Activity {
    Date: string;
    "Service Code": string;
    Units?: string | number;
    units?: string | number;
    "Documentation Type"?: string;
    [key: string]: any;
}

interface ScheduleMismatch {
    type?: "NO_SCHEDULE" | "MISSING_ACTIVITY";
    personName: string;
    clientId: string;
    date: string;
    dayOfWeek: string;
    serviceCode: string;
    issue?: string;
    issues?: string[];
    activities: Activity[];
    scheduledUnits: number;
    actualUnits: number;
    activityCount: number;
    schedule?: {
        id: number;
        multiple: boolean;
        startDate: string;
    };
}

/**
 * Analyzes mismatches between scheduled hours and actual activities
 * @param activitiesByPerson - Object with person names as keys, arrays of activities as values
 * @param schedules - Array of schedule objects
 * @returns Object with person names as keys, arrays of mismatch objects as values
 */
export function analyzeScheduleActivityMismatches(
    activitiesByPerson: Record<string, Activity[]>,
    schedules: ClientSchedule[],
): Record<string, ScheduleMismatch[]> {
    const mismatches: ScheduleMismatch[] = [];
    const dayNames = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
    ];

    // Pre-group schedules by clientId for efficient lookup
    const schedulesByClientId = schedules.reduce(
        (acc: Record<string, ClientSchedule[]>, schedule: ClientSchedule) => {
            const clientId = schedule.clientId;
            if (!acc[clientId]) {
                acc[clientId] = [];
            }
            acc[clientId]!.push(schedule);
            return acc;
        },
        {} as Record<string, ClientSchedule[]>,
    );

    // Helper function to get day of week from date string (MM/DD/YYYY)
    function getDayOfWeek(dateString: string): number {
        const parts = dateString.split("/");
        const month = parseInt(parts[0] || "1", 10);
        const day = parseInt(parts[1] || "1", 10);
        const year = parseInt(parts[2] || "0", 10);
        const date = new Date(2000 + year, month - 1, day); // Assuming 2-digit year is 20xx
        return date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    }

    // Helper function to extract client ID from consumer name
    function extractClientId(consumerName: string): string | null {
        const match = consumerName.match(/\((\d+)\)$/);
        return match?.[1] || null;
    }

    // Helper function to get schedule for a specific client, service, and date
    function getScheduleForClientService(
        clientId: string,
        serviceCode: string,
        activityDate: string,
    ): ClientSchedule | null {
        // First check if client has any schedules
        const clientSchedules = schedulesByClientId[clientId];
        if (!clientSchedules || clientSchedules.length === 0) {
            return null;
        }

        // Filter by service code and date, then get most recent
        const filteredSchedules = clientSchedules
            .filter((schedule: ClientSchedule) => {
                const scheduleStart = new Date(schedule.startDate);
                const activityDateObj = new Date(
                    2000 + parseInt(activityDate.split("/")[2]!, 10),
                    parseInt(activityDate.split("/")[0]!, 10) - 1,
                    parseInt(activityDate.split("/")[1]!, 10),
                );

                return (
                    schedule.service === serviceCode &&
                    activityDateObj >= scheduleStart
                );
            })
            .sort(
                (a: ClientSchedule, b: ClientSchedule) =>
                    new Date(b.startDate).getTime() -
                    new Date(a.startDate).getTime(),
            );

        return filteredSchedules[0] || null; // Get most recent schedule
    }

    // Process each person's activities
    Object.entries(activitiesByPerson).forEach(([personName, activities]) => {
        const clientId = extractClientId(personName);
        if (!clientId) return;

        // Group activities by date and service
        const activitiesByDateService: Record<string, Activity[]> = {};

        activities.forEach((activity: Activity) => {
            const key = `${activity.Date}_${activity["Service Code"]}`;
            if (!activitiesByDateService[key]) {
                activitiesByDateService[key] = [];
            }
            activitiesByDateService[key]!.push(activity);
        });

        // Analyze each date-service combination
        Object.entries(activitiesByDateService).forEach(
            ([key, dayActivities]) => {
                const parts = key.split("_");
                const date = parts[0] || "";
                const serviceCode = parts[1] || "";
                const dayOfWeek = getDayOfWeek(date);
                const dayName = dayNames[dayOfWeek]!;

                // Get the applicable schedule
                const schedule = getScheduleForClientService(
                    clientId,
                    serviceCode,
                    date,
                );
                if (!schedule) {
                    const actualUnits = dayActivities.reduce(
                        (sum: number, act: Activity) =>
                            sum +
                            parseFloat(String(act.Units || act.units || 0)),
                        0,
                    );

                    const issues: string[] = [
                        "No se encontró horario para esta combinación de cliente/servicio",
                    ];

                    // Check for zero units even when no schedule is found
                    if (actualUnits === 0 && dayActivities.length > 0) {
                        issues.push(
                            "Activities found with 0 units - activities cannot have 0 units",
                        );
                    }

                    mismatches.push({
                        type: "NO_SCHEDULE",
                        personName,
                        clientId,
                        date,
                        dayOfWeek: dayName,
                        serviceCode,
                        issue: issues.length === 1 ? issues[0] : undefined,
                        issues: issues.length > 1 ? issues : undefined,
                        activities: dayActivities,
                        scheduledUnits: 0,
                        actualUnits,
                        activityCount: dayActivities.length,
                    });
                    return;
                }

                const scheduledUnits =
                    ((schedule as Record<string, any>)[dayName] as number) || 0;
                const actualUnits = dayActivities.reduce(
                    (sum: number, act: Activity) =>
                        sum + parseFloat(String(act.Units || act.units || 0)),
                    0,
                );
                const activityCount = dayActivities.length;

                // Check for mismatches
                const issues: string[] = [];

                // 1. Unidades cero en actividades (siempre es un problema)
                if (actualUnits === 0 && activityCount > 0) {
                    issues.push(
                        `Actividades encontradas con 0 unidades - las actividades no pueden tener 0 unidades`,
                    );
                }

                // 2. Múltiples actividades cuando multiple = false
                if (!schedule.multiple && activityCount > 1) {
                    issues.push(
                        `Múltiples actividades (${activityCount}) encontradas pero el horario no permite múltiples entradas`,
                    );
                }

                // 3. Diferencia de unidades (solo si hay unidades programadas > 0)
                if (
                    scheduledUnits > 0 &&
                    Math.abs(scheduledUnits - actualUnits) > 0.01
                ) {
                    // Usar epsilon pequeño para comparación de punto flotante
                    issues.push(
                        `Diferencia de unidades: programadas ${scheduledUnits}, reales ${actualUnits}`,
                    );
                }

                // 4. Actividades en días con 0 unidades programadas
                if (scheduledUnits === 0 && activityCount > 0) {
                    issues.push(
                        `Actividades encontradas en día con 0 unidades programadas`,
                    );
                }

                // 5. Actividades faltantes cuando hay unidades programadas
                if (scheduledUnits > 0 && activityCount === 0) {
                    issues.push(
                        `No se encontraron actividades para ${scheduledUnits} unidades programadas`,
                    );
                }

                // If there are any issues, add to mismatches
                if (issues.length > 0) {
                    mismatches.push({
                        personName,
                        clientId,
                        date,
                        dayOfWeek: dayName,
                        serviceCode,
                        issues,
                        activities: dayActivities,
                        scheduledUnits,
                        actualUnits,
                        activityCount,
                        schedule: {
                            id: schedule.id,
                            multiple: schedule.multiple || false,
                            startDate: schedule.startDate,
                        },
                    });
                }
            },
        );

        // Also check for missing activities (scheduled days with no activities)
        const relevantSchedules = schedulesByClientId[clientId] || [];

        relevantSchedules.forEach((schedule: ClientSchedule) => {
            dayNames.forEach((dayName: string) => {
                const scheduledUnits = (schedule as Record<string, any>)[
                    dayName
                ] as number;
                if (scheduledUnits > 0) {
                    // Check if there are any activities for this service on this day of the week
                    const hasActivitiesForDay = activities.some(
                        (activity: Activity) => {
                            const activityDayOfWeek = getDayOfWeek(
                                activity.Date,
                            );
                            return (
                                dayNames[activityDayOfWeek] === dayName &&
                                activity["Service Code"] === schedule.service
                            );
                        },
                    );

                    if (!hasActivitiesForDay) {
                        // Find dates that should have activities based on schedule start date
                        const scheduleStart = new Date(schedule.startDate);
                        const today = new Date();

                        // Check recent dates (last 30 days) to see if activities are missing
                        for (
                            let d = new Date(scheduleStart);
                            d <= today &&
                            d >=
                                new Date(
                                    today.getTime() - 30 * 24 * 60 * 60 * 1000,
                                );
                            d.setDate(d.getDate() + 1)
                        ) {
                            if (d.getDay() === dayNames.indexOf(dayName)) {
                                const dateString = `${String(
                                    d.getMonth() + 1,
                                ).padStart(2, "0")}/${String(
                                    d.getDate(),
                                ).padStart(2, "0")}/${String(
                                    d.getFullYear(),
                                ).slice(-2)}`;

                                // Check if this specific date has activities
                                const hasActivityOnDate = activities.some(
                                    (activity: Activity) =>
                                        activity.Date === dateString &&
                                        activity["Service Code"] ===
                                            schedule.service,
                                );

                                if (!hasActivityOnDate) {
                                    mismatches.push({
                                        type: "MISSING_ACTIVITY",
                                        personName,
                                        clientId,
                                        date: dateString,
                                        dayOfWeek: dayName,
                                        serviceCode: schedule.service,
                                        issue: `Actividad faltante para ${scheduledUnits} unidades programadas`,
                                        activities: [],
                                        scheduledUnits,
                                        actualUnits: 0,
                                        activityCount: 0,
                                        schedule: {
                                            id: schedule.id,
                                            multiple:
                                                schedule.multiple || false,
                                            startDate: schedule.startDate,
                                        },
                                    });
                                }
                                break; // Only check one recent occurrence per day of week
                            }
                        }
                    }
                }
            });
        });
    });

    // Group mismatches by person name
    const mismatchesByPerson = mismatches.reduce(
        (
            acc: Record<string, ScheduleMismatch[]>,
            mismatch: ScheduleMismatch,
        ) => {
            const personName = mismatch.personName;
            if (!acc[personName]) {
                acc[personName] = [];
            }
            acc[personName]!.push(mismatch);
            return acc;
        },
        {} as Record<string, ScheduleMismatch[]>,
    );

    // Sort mismatches within each person by date
    Object.keys(mismatchesByPerson).forEach((personName: string) => {
        mismatchesByPerson[personName]!.sort(
            (a: ScheduleMismatch, b: ScheduleMismatch) => {
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            },
        );
    });

    return mismatchesByPerson;
}
