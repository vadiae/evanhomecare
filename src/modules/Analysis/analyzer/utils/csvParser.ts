export const parseCSV = (text: string): string[][] => {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = "";
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"') {
            if (insideQuotes && nextChar === '"') {
                currentCell += '"';
                i++;
            } else {
                insideQuotes = !insideQuotes;
            }
        } else if (char === "," && !insideQuotes) {
            currentRow.push(currentCell);
            currentCell = "";
        } else if ((char === "\r" || char === "\n") && !insideQuotes) {
            if (char === "\r" && nextChar === "\n") {
                i++;
            }
            currentRow.push(currentCell);
            rows.push(currentRow);
            currentRow = [];
            currentCell = "";
        } else {
            currentCell += char;
        }
    }

    if (currentCell || currentRow.length > 0) {
        currentRow.push(currentCell);
        rows.push(currentRow);
    }

    return rows;
};
