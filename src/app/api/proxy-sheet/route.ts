import { NextRequest, NextResponse } from "next/server";
import { getSheetData } from "~/lib/googleSheets";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get("url");

    if (!url) {
        return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Extract Spreadsheet ID
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
        return NextResponse.json({ error: "Invalid Google Sheets URL" }, { status: 400 });
    }
    const spreadsheetId = match[1];
    
    // We want to fetch all data. A range like "Sheet1!A1:Z1000" or just "Sheet1" is needed.
    // However, if we don't know the sheet name, we can try to fetch metadata first or guess.
    // Usually "Sheet1" is default, but it might be different.
    // If the user provided a gid, we might need to map gid to sheet name, but Sheets API uses names for ranges.
    // A trick is to just ask for the spreadsheet metadata to get the sheet name for the given gid (if any),
    // or simply ask for the first sheet if no gid match.
    // OR simpler: Just try to fetch a broad range or let the user specify.
    // Given the prompt "will take as well the json I provide and will get json data from an spreadsheet url I will provide",
    // the URL provided is `.../edit?gid=853307044`.
    
    // Let's try to get metadata first to find the sheet name for the GID.
    
    try {
        // We can't use getSheetData directly for metadata. 
        // Let's just assume we want the first sheet or try to handle it.
        // Actually, let's update getSheetData to expose the authenticated client or add a getSheetName function.
        // But to keep it simple, I will modify getSheetData to accept an optional gid or handle it.
        
        // BETTER: Update getSheetData to fetch the whole spreadsheet and find the sheet name by gid (if provided in URL).
        // If no GID, use the first sheet.
        
        // Re-implementing logic here using the lib helper isn't enough because the helper is too simple.
        // I'll rewrite the route to use the auth from lib but do the metadata fetch.
        // Actually, let's keep the route simple and update the lib.
        
        // Wait, I can't easily update the lib without context switch. 
        // I'll just use the lib's `getSheetData` but I need the sheet NAME for the range.
        // Sending just "A:Z" often works for the first/active sheet, but better to be specific.
        
        // Let's rely on the library to handle "getting all data".
        // I will update src/lib/googleSheets.ts to handle finding the sheet name.
        
        const gidMatch = url.match(/[#&]gid=([0-9]+)/);
        const gid = gidMatch ? parseInt(gidMatch[1]) : 0;
        
        const rows = await getSheetDataWithGid(spreadsheetId, gid);
        
        return NextResponse.json({ rows });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Inline helper or import? I'll update the lib file in the next step to include getSheetDataWithGid
// For now, I'll just put the import here assuming I update the lib.
import { getSheetDataWithGid } from "~/lib/googleSheets";
