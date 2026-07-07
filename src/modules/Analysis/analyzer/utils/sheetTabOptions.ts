const SHEET_TAB_START_YEAR = 2025;

export function formatSheetTabName(startYear: number): string {
    return `${startYear} - ${startYear + 1}`;
}

export function getDefaultSheetTabName(date: Date = new Date()): string {
    const year = date.getFullYear();
    const isBeforeJuly = date.getMonth() < 6;

    return isBeforeJuly
        ? formatSheetTabName(year - 1)
        : formatSheetTabName(year);
}

export function getSheetTabOptions(date: Date = new Date()): string[] {
    const currentYear = date.getFullYear();
    const options: string[] = [];

    for (
        let startYear = SHEET_TAB_START_YEAR;
        startYear <= currentYear;
        startYear++
    ) {
        options.push(formatSheetTabName(startYear));
    }

    return options;
}
