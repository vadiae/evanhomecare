import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import db from "~/db/db";
import { AnalyserData, JobApplications, TrainingData } from "~/db/schema";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const table = searchParams.get("table");
        const userRole = searchParams.get("role");

        // Check if user has admin role
        if (userRole !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized: Admin role required" },
                { status: 403 },
            );
        }

        let users;
        switch (table) {
            case "analyser":
                users = await db.select().from(AnalyserData);
                break;
            case "jobApplications":
                users = await db.select().from(JobApplications);
                break;
            case "training":
                users = await db.select().from(TrainingData);
                break;
            default:
                return NextResponse.json(
                    { error: "Invalid table parameter" },
                    { status: 400 },
                );
        }

        return NextResponse.json({ users });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 },
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { table, name, email, password, userRole } = body;

        if (!table || !name || !email || !password) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 },
            );
        }

        // Check if user has admin role
        if (userRole !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized: Admin role required" },
                { status: 403 },
            );
        }

        let result;
        switch (table) {
            case "analyser":
                result = await db
                    .insert(AnalyserData)
                    .values({
                        name,
                        email,
                        password,
                        role: "user",
                    })
                    .returning();
                break;
            case "jobApplications":
                result = await db
                    .insert(JobApplications)
                    .values({
                        name,
                        email,
                        password,
                    })
                    .returning();
                break;
            case "training":
                result = await db
                    .insert(TrainingData)
                    .values({
                        name,
                        email,
                        password,
                    })
                    .returning();
                break;
            default:
                return NextResponse.json(
                    { error: "Invalid table parameter" },
                    { status: 400 },
                );
        }

        return NextResponse.json({ user: result[0] });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 },
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { table, id, name, email, password, userRole } = body;

        if (!table || !id) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 },
            );
        }

        // Check if user has admin role
        if (userRole !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized: Admin role required" },
                { status: 403 },
            );
        }

        // Check if user being updated is admin (only for analyser table which has roles)
        if (table === "analyser") {
            const existingUser = await db
                .select()
                .from(AnalyserData)
                .where(eq(AnalyserData.id, id))
                .limit(1);

            if (existingUser[0]?.role === "admin") {
                return NextResponse.json(
                    { error: "Cannot update admin users" },
                    { status: 403 },
                );
            }
        }

        const updateData: any = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (password) updateData.password = password;

        let result;
        switch (table) {
            case "analyser":
                result = await db
                    .update(AnalyserData)
                    .set(updateData)
                    .where(eq(AnalyserData.id, id))
                    .returning();
                break;
            case "jobApplications":
                result = await db
                    .update(JobApplications)
                    .set(updateData)
                    .where(eq(JobApplications.id, id))
                    .returning();
                break;
            case "training":
                result = await db
                    .update(TrainingData)
                    .set(updateData)
                    .where(eq(TrainingData.id, id))
                    .returning();
                break;
            default:
                return NextResponse.json(
                    { error: "Invalid table parameter" },
                    { status: 400 },
                );
        }

        return NextResponse.json({ user: result[0] });
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json(
            { error: "Failed to update user" },
            { status: 500 },
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const { table, id, userRole } = body;

        if (!table || !id) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 },
            );
        }

        // Check if user has admin role
        if (userRole !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized: Admin role required" },
                { status: 403 },
            );
        }

        // Check if user being deleted is admin (only for analyser table which has roles)
        if (table === "analyser") {
            const existingUser = await db
                .select()
                .from(AnalyserData)
                .where(eq(AnalyserData.id, id))
                .limit(1);

            if (existingUser[0]?.role === "admin") {
                return NextResponse.json(
                    { error: "Cannot delete admin users" },
                    { status: 403 },
                );
            }
        }

        let result;
        switch (table) {
            case "analyser":
                result = await db
                    .delete(AnalyserData)
                    .where(eq(AnalyserData.id, id))
                    .returning();
                break;
            case "jobApplications":
                result = await db
                    .delete(JobApplications)
                    .where(eq(JobApplications.id, id))
                    .returning();
                break;
            case "training":
                result = await db
                    .delete(TrainingData)
                    .where(eq(TrainingData.id, id))
                    .returning();
                break;
            default:
                return NextResponse.json(
                    { error: "Invalid table parameter" },
                    { status: 400 },
                );
        }

        return NextResponse.json({ success: true, deletedUser: result[0] });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json(
            { error: "Failed to delete user" },
            { status: 500 },
        );
    }
}
