import * as dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hash } from "bcryptjs";
import * as schema from "./schema";

// Load environment variables
dotenv.config({ path: ".env.local" });

async function seed() {
    console.log("🌱 Starting database seed...\n");

    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql, { schema });

    // Seed Users
    console.log("👤 Seeding users...");
    const hashedPassword = await hash("admin123", 10);

    const users = [
        {
            email: "admin@school.com",
            password: hashedPassword,
            name: "Admin User",
            role: "super_admin" as const,
            phone: "+91 9876543210",
        },
        {
            email: "principal@school.com",
            password: hashedPassword,
            name: "Dr. Sharma",
            role: "admin" as const,
            phone: "+91 9876543211",
        },
        {
            email: "office@school.com",
            password: hashedPassword,
            name: "Office Staff",
            role: "office_staff" as const,
            phone: "+91 9876543212",
        },
        {
            email: "teacher@school.com",
            password: hashedPassword,
            name: "Mrs. Gupta",
            role: "teacher" as const,
            phone: "+91 9876543213",
        },
        {
            email: "student@school.com",
            password: hashedPassword,
            name: "Rahul Sharma",
            role: "student" as const,
            phone: "+91 9876543214",
        },
    ];

    for (const user of users) {
        await db.insert(schema.users).values(user).onConflictDoNothing();
    }
    console.log(`  ✓ Created ${users.length} users\n`);

    // Seed Settings
    console.log("⚙️ Seeding settings...");
    const settings = [
        { key: "school_name", value: "Delhi Public School" },
        { key: "school_code", value: "DPS" },
        { key: "academic_year", value: "2024-2025" },
        { key: "session_start", value: "April" },
        { key: "fee_due_day", value: "10" },
        { key: "late_fee_penalty", value: "5" },
    ];

    for (const setting of settings) {
        await db.insert(schema.settings).values(setting).onConflictDoNothing();
    }
    console.log(`  ✓ Created ${settings.length} settings\n`);

    // Seed Fee Types
    console.log("💰 Seeding fee types...");
    const feeTypes = [
        {
            name: "Tuition Fee",
            description: "Monthly tuition fee",
            amount: "5000.00",
            academicYear: "2024-2025",
            isRecurring: true,
        },
        {
            name: "Transport Fee",
            description: "Monthly transport fee",
            amount: "2500.00",
            academicYear: "2024-2025",
            isRecurring: true,
        },
        {
            name: "Admission Fee",
            description: "One-time admission fee",
            amount: "15000.00",
            academicYear: "2024-2025",
            isRecurring: false,
        },
    ];

    for (const feeType of feeTypes) {
        await db.insert(schema.feeTypes).values(feeType).onConflictDoNothing();
    }
    console.log(`  ✓ Created ${feeTypes.length} fee types\n`);

    console.log("✅ Seed completed successfully!");
    console.log("\n📝 Login credentials:");
    console.log("   Email: admin@school.com");
    console.log("   Password: admin123");
}

seed().catch(console.error);
