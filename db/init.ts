import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";
import * as schema from "./schema";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function initializeDatabase() {
    console.log("🚀 Initializing database...\n");

    try {
        // Check if admin user already exists
        const existingAdmin = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.email, "admin@school.com"))
            .limit(1);

        if (existingAdmin.length === 0) {
            // Create default admin user
            console.log("📝 Creating default admin user...");

            const hashedPassword = await hash("Admin@123", 12);

            await db.insert(schema.users).values({
                email: "admin@school.com",
                password: hashedPassword,
                name: "Super Admin",
                role: "super_admin",
                phone: "+91 9876543210",
                isActive: true,
            });

            console.log("✅ Default admin user created successfully!");
            console.log("   Email: admin@school.com");
            console.log("   Password: Admin@123");
            console.log("   Role: super_admin\n");
        } else {
            console.log("ℹ️  Admin user already exists, skipping creation.\n");
        }

        // Create a sample office staff user
        const existingStaff = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.email, "staff@school.com"))
            .limit(1);

        if (existingStaff.length === 0) {
            console.log("📝 Creating sample office staff user...");

            const hashedPassword = await hash("Staff@123", 12);

            await db.insert(schema.users).values({
                email: "staff@school.com",
                password: hashedPassword,
                name: "Office Staff",
                role: "office_staff",
                phone: "+91 9876543211",
                isActive: true,
            });

            console.log("✅ Office staff user created!");
            console.log("   Email: staff@school.com");
            console.log("   Password: Staff@123");
            console.log("   Role: office_staff\n");
        }

        // Create a sample teacher user
        const existingTeacher = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.email, "teacher@school.com"))
            .limit(1);

        if (existingTeacher.length === 0) {
            console.log("📝 Creating sample teacher user...");

            const hashedPassword = await hash("Teacher@123", 12);

            await db.insert(schema.users).values({
                email: "teacher@school.com",
                password: hashedPassword,
                name: "John Teacher",
                role: "teacher",
                phone: "+91 9876543212",
                isActive: true,
            });

            console.log("✅ Teacher user created!");
            console.log("   Email: teacher@school.com");
            console.log("   Password: Teacher@123");
            console.log("   Role: teacher\n");
        }

        console.log("🎉 Database initialization complete!");
        console.log("\n📌 You can now log in with any of the following accounts:");
        console.log("   1. admin@school.com / Admin@123 (Super Admin)");
        console.log("   2. staff@school.com / Staff@123 (Office Staff)");
        console.log("   3. teacher@school.com / Teacher@123 (Teacher)");
        console.log("\n💡 After logging in, you can start adding real students, manage fees, and more!");

    } catch (error) {
        console.error("❌ Error initializing database:", error);
        process.exit(1);
    }
}

initializeDatabase();
