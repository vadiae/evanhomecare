import { NextResponse } from "next/server";
import { db } from "~/db/db";
import { TrainingLogs } from "~/db/schema";
import { count, desc } from "drizzle-orm";

export async function GET(req: Request): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const offset = (page - 1) * limit;

        // Get total count
        const totalCountResult = await db
            .select({ count: count() })
            .from(TrainingLogs);

        const totalCount = totalCountResult[0]?.count || 0;

        // Get logs with pagination
        const logs = await db
            .select()
            .from(TrainingLogs)
            .limit(limit)
            .offset(offset)
            .orderBy(desc(TrainingLogs.createdAt));

        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json({
            logs,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
            filters: {
                type: "",
                sortBy: "createdAt",
                sortOrder: "desc",
            },
        });
    } catch (error) {
        console.error("Database error while fetching training logs:", error);
        return NextResponse.json(
            { error: "Failed to fetch training logs" },
            { status: 500 },
        );
    }
}
