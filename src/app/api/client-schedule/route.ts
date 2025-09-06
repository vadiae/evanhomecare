import { NextResponse } from "next/server";
import { db } from "~/db/db";
import { ClientSchedule } from "~/db/schema";

export async function GET(): Promise<NextResponse> {
    try {
        // Fetch all client schedule data
        const schedules = await db.select().from(ClientSchedule);

        return NextResponse.json({
            schedules,
            success: true,
        });
    } catch (error) {
        console.error("Database error while fetching client schedules:", error);
        return NextResponse.json(
            { error: "Failed to fetch client schedules" },
            { status: 500 },
        );
    }
}
