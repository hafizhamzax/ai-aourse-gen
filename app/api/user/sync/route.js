import { db } from "@/configs/db";
import { Users } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { user } = await req.json();

        if (!user || !user.email) {
            return NextResponse.json({ error: "Invalid user data" }, { status: 400 });
        }

        // Check if user already exists in DB
        const result = await db.select().from(Users)
            .where(eq(Users.email, user.email));

        if (result?.length === 0) {
            // Check if any users exist at all to determine the first user
            const allUsers = await db.select().from(Users).limit(1);
            const role = allUsers.length === 0 ? 'admin' : 'user';

            // Add user to DB
            const newUser = await db.insert(Users).values({
                name: user.name,
                email: user.email,
                imageUrl: user.imageUrl,
                role: role
            }).returning();

            return NextResponse.json({ result: newUser[0] });
        }

        return NextResponse.json({ result: result[0] });

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
