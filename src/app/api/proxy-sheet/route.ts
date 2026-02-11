//@ts-nocheck

import { NextRequest, NextResponse } from "next/server";
import { getSheetData } from "~/lib/googleSheets";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get("url");

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
        const gidMatch = url.match(/[#&]gid=([0-9]+)/);
        const gid = gidMatch ? parseInt(gidMatch[1]) : 0;

        const rows = await getSheetDataWithGid(spreadsheetId, gid);

        return NextResponse.json({ rows });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { getSheetDataWithGid } from "~/lib/googleSheets";
