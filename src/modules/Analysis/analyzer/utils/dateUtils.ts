export const generateDateRange = (
    startDate: string,
    endDate: string,
): string[] => {
    const dates: string[] = [];
    const start = new Date(startDate);
    start.setDate(start.getDate() + 1);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error("Invalid date format");
    }

    const current = new Date(start);
    while (current <= end) {
        const month = String(current.getMonth() + 1).padStart(2, "0");
        const day = String(current.getDate()).padStart(2, "0");
        const year = current.getFullYear();
        dates.push(`${month}/${day}/${year}`);

        current.setDate(current.getDate() + 1);
    }

    return dates;
};
