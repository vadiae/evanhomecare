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

export async function getSheetDataWithGid(
    spreadsheetId: string,
    gid: number = 0,
) {
    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });

    try {
        // 1. Get Spreadsheet Metadata to find the sheet name
        const metadata = await sheets.spreadsheets.get({
            spreadsheetId,
        });

        const sheet = metadata.data.sheets?.find(
            (s) => s.properties?.sheetId === gid,
        );

        let range = "";
        if (sheet && sheet.properties?.title) {
            range = `'${sheet.properties.title}'`; // Quote the title in case of spaces
        } else {
            // Fallback to first sheet if GID not found, or throw?
            // If GID 0 is not found (unlikely), use the first one.
            if (metadata.data.sheets && metadata.data.sheets.length > 0) {
                const firstSheet = metadata.data.sheets[0];
                if (firstSheet.properties?.title) {
                    range = `'${firstSheet.properties.title}'`;
                }
            }
        }

        if (!range) {
            throw new Error("Could not determine sheet name.");
        }

        // 2. Fetch values
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range, // Fetch all data from that sheet
        });

        return response.data.values;
    } catch (error: any) {
        console.error("Error fetching from Google Sheets:", error);
        throw new Error(
            error.message || "Failed to fetch data from Google Sheets",
        );
    }
}
