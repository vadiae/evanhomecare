import { and, desc, eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
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

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const body = await request.json();

        const {
            clientId,
            clientName,
            service,
            startDate,
            endDate,
            monday,
            tuesday,
            wednesday,
            thursday,
            friday,
            saturday,
            sunday,
            multiple,
        } = body ?? {};

        if (!clientId || !clientName || !service || !startDate || !endDate) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 },
            );
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const newStart = new Date(startDate);

        const [latestExisting] = await db
            .select()
            .from(ClientSchedule)
            .where(
                and(
                    eq(ClientSchedule.clientId, clientId as string),
                    eq(ClientSchedule.service, service as string),
                ),
            )
            .orderBy(desc(ClientSchedule.endDate))
            .limit(1);

        if (latestExisting) {
            const adjustedPrevEnd = new Date(newStart);
            adjustedPrevEnd.setDate(adjustedPrevEnd.getDate() - 1);

            await db
                .update(ClientSchedule)
                .set({ endDate: adjustedPrevEnd })
                .where(eq(ClientSchedule.id, latestExisting.id));
        }

        const [created] = await db
            .insert(ClientSchedule)
            .values({
                clientId,
                clientName,
                service,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                monday: monday ?? null,
                tuesday: tuesday ?? null,
                wednesday: wednesday ?? null,
                thursday: thursday ?? null,
                friday: friday ?? null,
                saturday: saturday ?? null,
                sunday: sunday ?? null,
                multiple: multiple ?? null,
            })
            .returning();

        return NextResponse.json({ success: true, schedule: created });
    } catch (error) {
        console.error("Database error while creating client schedule:", error);
        return NextResponse.json(
            { error: "Failed to create client schedule" },
            { status: 500 },
        );
    }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
    try {
        const body = await request.json();
        const { id, ...updates } = body ?? {};

        if (!id) {
            return NextResponse.json(
                { error: "Missing required field: id" },
                { status: 400 },
            );
        }

        const allowedFields: Record<string, unknown> = {};
        const fields = [
            "clientId",
            "clientName",
            "service",
            "startDate",
            "endDate",
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
            "multiple",
        ];

        for (const key of fields) {
            if (key in updates) {
                const value = (updates as Record<string, unknown>)[key];
                if (key === "startDate" || key === "endDate") {
                    allowedFields[key] = value ? new Date(String(value)) : null;
                } else {
                    allowedFields[key] = value;
                }
            }
        }

        const [updated] = await db
            .update(ClientSchedule)
            .set(allowedFields)
            .where(eq(ClientSchedule.id, id as number))
            .returning();

        return NextResponse.json({ success: true, schedule: updated });
    } catch (error) {
        console.error("Database error while updating client schedule:", error);
        return NextResponse.json(
            { error: "Failed to update client schedule" },
            { status: 500 },
        );
    }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
    try {
        const body = await request.json();
        const { id } = body ?? {};

        if (!id) {
            return NextResponse.json(
                { error: "Missing required field: id" },
                { status: 400 },
            );
        }

        const [deleted] = await db
            .delete(ClientSchedule)
            .where(eq(ClientSchedule.id, id as number))
            .returning();

        return NextResponse.json({ success: true, schedule: deleted });
    } catch (error) {
        console.error("Database error while deleting client schedule:", error);
        return NextResponse.json(
            { error: "Failed to delete client schedule" },
            { status: 500 },
        );
    }
}
