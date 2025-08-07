import { NextResponse } from "next/server";
import { db } from "~/db/db";
import { TrainingLogs } from "~/db/schema";

export async function POST(req: Request): Promise<NextResponse> {
    try {
        const { email, name, videoId, videoTitle } = await req.json();

        if (!email || !name || !videoId || !videoTitle) {
            return NextResponse.json(
                {
                    error: "Missing required fields: email, name, videoId, and videoTitle are required",
                },
                { status: 400 },
            );
        }

        await db.insert(TrainingLogs).values({
            username: name,
            email: email,
            type: "training_video_interaction",
            log: `Watched training video: "${videoTitle}" (ID: ${videoId})`,
        });

        return NextResponse.json({
            success: true,
            message: "Training video interaction logged successfully",
        });
    } catch (error) {
        console.error("Database error while logging training video:", error);
        return NextResponse.json(
            { error: "Failed to log training video interaction" },
            { status: 500 },
        );
    }
}
