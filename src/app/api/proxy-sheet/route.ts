//@ts-nocheck

import { NextRequest, NextResponse } from "next/server";
import {
    getSheetDataWithGid,
    getSheetDataWithName,
} from "~/lib/googleSheets";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get("url");
    const sheetName = searchParams.get("sheetName")?.trim();

    if (!url) {
        return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
        return NextResponse.json(
            { error: "Invalid Google Sheets URL" },
            { status: 400 },
        );
    }
    const spreadsheetId = match[1];

    try {
        const rows = sheetName
            ? await getSheetDataWithName(spreadsheetId, sheetName)
            : await getSheetDataWithGid(
                  spreadsheetId,
                  parseGidFromUrl(url) ?? 0,
              );

        return NextResponse.json({ rows });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

function parseGidFromUrl(url: string): number | null {
    const gidMatch = url.match(/[#&?]gid=([0-9]+)/);
    return gidMatch ? parseInt(gidMatch[1], 10) : null;
}
