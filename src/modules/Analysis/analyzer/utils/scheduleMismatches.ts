import { type ClientSchedule } from "./types";

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
        endDate: string;
    };
}

// Parses dates in MM/DD/YY or MM/DD/YYYY formats into a Date object.
function parseMDY(dateString: string): Date {
    const parts = dateString.split("/");
    const month = parseInt(parts[0] || "1", 10);
    const day = parseInt(parts[1] || "1", 10);
    const yearPart = parts[2] || "0";
    const yearNum = parseInt(yearPart, 10);
    const fullYear = yearPart.length <= 2 ? 2000 + yearNum : yearNum;
    return new Date(fullYear, month - 1, day);
}

function getDayOfWeek(dateString: string): number {
    const date = parseMDY(dateString);
    return date.getDay();
}

function extractClientId(consumerName: string): string | null {
    const match = consumerName.match(/\((\d+)\)$/);
    return match?.[1] || null;
}

const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
];

export function analyzeScheduleActivityMismatches(
    activitiesByPerson: Record<string, Activity[]>,
    schedules: ClientSchedule[],
): Record<string, ScheduleMismatch[]> {
    const mismatches: ScheduleMismatch[] = [];

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

    function getScheduleForClientService(
        clientId: string,
        serviceCode: string,
        activityDate: string,
    ): ClientSchedule | null {
        const clientSchedules = schedulesByClientId[clientId];

        if (!clientSchedules || clientSchedules.length === 0) {
            return null;
        }

        const activityDateObj = parseMDY(activityDate);

        const applicableSchedules = clientSchedules.filter(
            (schedule: ClientSchedule) => {
                if (schedule.service !== serviceCode) {
                    return false;
                }

                const scheduleStart = new Date(schedule.startDate);
                const scheduleEnd = new Date(schedule.endDate);

                return (
                    activityDateObj >= scheduleStart &&
                    activityDateObj <= scheduleEnd
                );
            },
        );

        if (applicableSchedules.length > 0) {
            return (
                applicableSchedules.sort(
                    (a: ClientSchedule, b: ClientSchedule) =>
                        new Date(b.startDate).getTime() -
                        new Date(a.startDate).getTime(),
                )[0] || null
            );
        }

        return null;
    }

    Object.entries(activitiesByPerson).forEach(([personName, activities]) => {
        const clientId = extractClientId(personName);
        if (!clientId) return;

        const activitiesByDateService: Record<string, Activity[]> = {};

        activities.forEach((activity: Activity) => {
            const key = `${activity.Date}_${activity["Service Code"]}`;
            if (!activitiesByDateService[key]) {
                activitiesByDateService[key] = [];
            }
            activitiesByDateService[key]!.push(activity);
        });

        Object.entries(activitiesByDateService).forEach(
            ([key, dayActivities]) => {
                const parts = key.split("_");
                const date = parts[0] || "";
                const serviceCode = parts[1] || "";
                const dayOfWeek = getDayOfWeek(date);
                const dayName = dayNames[dayOfWeek]!;

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

                const issues: string[] = [];

                if (actualUnits === 0 && activityCount > 0) {
                    issues.push(
                        `Actividades encontradas con 0 unidades - las actividades no pueden tener 0 unidades`,
                    );
                }

                if (!schedule.multiple && activityCount > 1) {
                    issues.push(
                        `Múltiples actividades (${activityCount}) encontradas pero el horario no permite múltiples entradas`,
                    );
                }

                if (
                    scheduledUnits > 0 &&
                    Math.abs(scheduledUnits - actualUnits) > 0.01
                ) {
                    issues.push(
                        `Diferencia de unidades: programadas ${scheduledUnits}, reales ${actualUnits}`,
                    );
                }

                if (scheduledUnits === 0 && activityCount > 0) {
                    issues.push(
                        `Actividades encontradas en día con 0 unidades programadas`,
                    );
                }

                if (scheduledUnits > 0 && activityCount === 0) {
                    issues.push(
                        `No se encontraron actividades para ${scheduledUnits} unidades programadas`,
                    );
                }

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
                            endDate: schedule.endDate,
                        },
                    });
                }
            },
        );

        const relevantSchedules = schedulesByClientId[clientId] || [];

        relevantSchedules.forEach((schedule: ClientSchedule) => {
            dayNames.forEach((dayName: string) => {
                const scheduledUnits = (schedule as Record<string, any>)[
                    dayName
                ] as number;
                if (scheduledUnits > 0) {
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
                        const scheduleStart = new Date(schedule.startDate);
                        const today = new Date();

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
                                            endDate: schedule.endDate,
                                        },
                                    });
                                }
                                break;
                            }
                        }
                    }
                }
            });
        });
    });

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

    Object.keys(mismatchesByPerson).forEach((personName: string) => {
        mismatchesByPerson[personName]!.sort(
            (a: ScheduleMismatch, b: ScheduleMismatch) => {
                return parseMDY(a.date).getTime() - parseMDY(b.date).getTime();
            },
        );
    });

    return mismatchesByPerson;
}
