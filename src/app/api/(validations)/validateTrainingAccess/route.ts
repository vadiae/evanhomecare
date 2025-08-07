import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "~/db/db";
import { TrainingData, TrainingLogs } from "~/db/schema";

export async function POST(req: Request): Promise<NextResponse> {
    try {
        const { password } = await req.json();

        if (!password) {
            return NextResponse.json(
                { error: "Password is required" },
                { status: 400 },
            );
        }

        const user = await db
            .select()
            .from(TrainingData)
            .where(eq(TrainingData.password, password as string))
            .limit(1);

        const isValid = user.length > 0;

        if (isValid) {
            await db.insert(TrainingLogs).values({
                username: user[0]?.name || "N/A",
                email: user[0]?.email || "N/A",
                type: "training_access",
                log: "Training access validated",
            });
        } else {
            await db.insert(TrainingLogs).values({
                username: "N/A",
                email: "N/A",
                type: "failed_training_access",
                log: `Training access failed: ${password}`,
            });
        }

        return NextResponse.json({
            isValid,
            email: user[0]?.email || "N/A",
            name: user[0]?.name || "N/A",
        });
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json(
            { error: "Database connection failed" },
            { status: 500 },
        );
    }
}
