import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "~/db/db";
import { JobApplications } from "~/db/schema";

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
            .from(JobApplications)
            .where(eq(JobApplications.password, password as string))
            .limit(1);

        const isValid = user.length > 0;

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
