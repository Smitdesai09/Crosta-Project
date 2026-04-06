const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

const User = require("./models/userSchema");
const connectDB = require("./config/db");

dotenv.config();

const adminName = process.env.ADMIN_NAME || "Admin";
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

const seedAdmin = async () => {
    try {
        if (!adminEmail || !adminPassword) {
            throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set before seeding an admin user.");
        }

        await connectDB();

        const normalizedEmail = adminEmail.trim().toLowerCase();
        const existingAdmin = await User.findOne({ email: normalizedEmail });

        if (existingAdmin) {
            console.log("Admin already exists.");
            process.exit();
        }

        const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

        const admin = await User.create({
            name: adminName,
            email: normalizedEmail,
            password: hashedPassword,
            role: "admin"
        });

        console.log("Admin created successfully.");
        console.log({
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role
        });

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedAdmin();
