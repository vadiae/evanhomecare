//@ts-nocheck

import { google } from "googleapis";

function getAuth() {
    if (
        !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
        !process.env.GOOGLE_PRIVATE_KEY
    ) {
        throw new Error(
            "Missing Google Service Account credentials. Please add GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY to your .env file.",
        );
    }

    return new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        },
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
}

function quoteSheetTitle(title: string): string {
    return `'${title.replace(/'/g, "''")}'`;
}

async function getSpreadsheetSheets(spreadsheetId: string) {
    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });
    const metadata = await sheets.spreadsheets.get({ spreadsheetId });
    return metadata.data.sheets ?? [];
}

async function fetchSheetValuesByTitle(
    spreadsheetId: string,
    sheetTitle: string,
) {
    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: quoteSheetTitle(sheetTitle),
    });

    return response.data.values;
}

export async function getSheetData(spreadsheetId: string, range: string) {
    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        return response.data.values;
    } catch (error: any) {
        console.error("Error fetching from Google Sheets:", error);
        throw new Error(
            error.message || "Failed to fetch data from Google Sheets",
        );
    }
}

export async function getSheetDataWithName(
    spreadsheetId: string,
    sheetName: string,
) {
    try {
        const allSheets = await getSpreadsheetSheets(spreadsheetId);
        const availableNames = allSheets
            .map((sheet) => sheet.properties?.title)
            .filter((title): title is string => Boolean(title));

        const matchedSheet = allSheets.find(
            (sheet) => sheet.properties?.title === sheetName,
        );

        if (!matchedSheet?.properties?.title) {
            throw new Error(
                `Sheet "${sheetName}" not found. Available sheets: ${availableNames.join(", ")}`,
            );
        }

        return fetchSheetValuesByTitle(
            spreadsheetId,
            matchedSheet.properties.title,
        );
    } catch (error: any) {
        console.error("Error fetching from Google Sheets:", error);
        throw new Error(
            error.message || "Failed to fetch data from Google Sheets",
        );
    }
}

export async function getSheetDataWithGid(
    spreadsheetId: string,
    gid: number = 0,
) {
    try {
        const allSheets = await getSpreadsheetSheets(spreadsheetId);
        const sheet = allSheets.find((s) => s.properties?.sheetId === gid);

        let sheetTitle = sheet?.properties?.title;
        if (!sheetTitle && allSheets.length > 0) {
            sheetTitle = allSheets[0]?.properties?.title;
        }

        if (!sheetTitle) {
            throw new Error("Could not determine sheet name.");
        }

        return fetchSheetValuesByTitle(spreadsheetId, sheetTitle);
    } catch (error: any) {
        console.error("Error fetching from Google Sheets:", error);
        throw new Error(
            error.message || "Failed to fetch data from Google Sheets",
        );
    }
}
