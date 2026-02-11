const DAYS_OF_WEEK = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

const months = {
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

function parseDateHeader(dateStr, year) {
    const parts = dateStr.split("-");
    const day = parseInt(parts[0] || "1", 10);
    const monthStr = parts[1] || "";
    const month = months[monthStr] ?? 0;
    return new Date(parseInt(year, 10), month, day);
}

function calculateYear(
    weekStartDateStr,
    weekNum,
    firstWeekStartDateStr,
    headerYear,
) {
    const firstMonthStr = firstWeekStartDateStr.split("-")[1] || "";
    const firstMonthValue = months[firstMonthStr] ?? 0;

    const currentMonthStr = weekStartDateStr.split("-")[1] || "";
    const currentMonthValue = months[currentMonthStr] ?? 0;
    const weekNumValue = parseInt(weekNum, 10);

    let yearValue = parseInt(headerYear, 10);
    if (firstMonthValue >= 6) {
        if (currentMonthValue >= 6) {
            yearValue -= 1;
        }
    } else {
        if (currentMonthValue === 11 && weekNumValue < 10) {
            yearValue -= 1;
        }
    }
    return yearValue;
}

function test(weekNum, startDateStr, firstWeekStartDateStr, headerYear) {
    const effectiveYear = calculateYear(
        startDateStr,
        weekNum,
        firstWeekStartDateStr,
        headerYear,
    );
    const weekStartDate = parseDateHeader(
        startDateStr,
        effectiveYear.toString(),
    );

    console.log(
        `Week ${weekNum}, Start: ${startDateStr}, First: ${firstWeekStartDateStr}, Year: ${headerYear} => Effective Year: ${effectiveYear}, Week Start: ${weekStartDate.toDateString()}`,
    );

    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
        const dayDate = new Date(weekStartDate);
        dayDate.setDate(dayDate.getDate() + dayIdx);
        const m = String(dayDate.getMonth() + 1).padStart(2, "0");
        const d = String(dayDate.getDate()).padStart(2, "0");
        const dateStr = `${m}-${d}-${dayDate.getFullYear()}`;
        if (dateStr.includes("01-31") || dateStr.includes("01-05")) {
            console.log(
                `  Found ${dateStr}: is a ${dayDate.toLocaleDateString(
                    "en-US",
                    { weekday: "long" },
                )} (Idx: ${dayIdx})`,
            );
        }
    }
}

console.log("Improved Logic Tests (Header 2026):");
console.log("\nFiscal Year Budget (Starts July):");
test("1", "07-Jul", "07-Jul", "2026"); // Should be July 2025
test("27", "05-Jan", "07-Jul", "2026"); // Should be Jan 2026
test("31", "26-Jan", "07-Jul", "2026"); // Jan 31 2026

console.log("\nSession 2 Budget (Starts Dec/Jan):");
test("1'", "29-Dec", "29-Dec", "2026"); // Should be Dec 2025
test("2'", "05-Jan", "29-Dec", "2026"); // Should be Jan 2026 (Jan 5 2026 is Monday)
