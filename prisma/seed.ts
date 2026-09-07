import { prisma } from "../src/lib/prisma"
import bcrypt from "bcrypt"

const hash = (pw: string) => bcrypt.hash(pw, 10)

async function main() {
    console.log("🌱 Seeding database...")

    const adminPassword = await hash("Admin123")
    const dispatcherPassword = await hash("Dispatch123")
    const patientPassword = await hash("Patient123")

    await prisma.user.upsert({
        where: { email: "admin@medrush.com" },
        update: {},
        create: {
            email: "admin@medrush.com",
            password: adminPassword,
            name: "System Admin",
            role: "ADMIN"
        }
    })

    const dispatcher = await prisma.user.upsert({
        where: { email: "dispatcher@medrush.com" },
        update: {},
        create: {
            email: "dispatcher@medrush.com",
            password: dispatcherPassword,
            name: "Rahim Dispatcher",
            role: "DISPATCHER"
        }
    })

    const patient = await prisma.user.upsert({
        where: { email: "patient@medrush.com" },
        update: {},
        create: {
            email: "patient@medrush.com",
            password: patientPassword,
            name: "Karim Patient",
            phone: "+8801700000000",
            role: "PATIENT"
        }
    })

    await prisma.ambulance.upsert({
        where: { vehicleNumber: "DHAKA-METRO-1001" },
        update: {},
        create: {
            vehicleNumber: "DHAKA-METRO-1001",
            type: "Basic Life Support",
            capacity: 4,
            stationZone: "Gulshan"
        }
    })
    await prisma.ambulance.upsert({
        where: { vehicleNumber: "DHAKA-METRO-1002" },
        update: {},
        create: {
            vehicleNumber: "DHAKA-METRO-1002",
            type: "Advanced Life Support",
            capacity: 6,
            stationZone: "Dhanmondi"
        }
    })

    const driverUser = await prisma.user.upsert({
        where: { email: "driver@medrush.com" },
        update: {},
        create: {
            email: "driver@medrush.com",
            password: dispatcherPassword,
            name: "Salam Driver",
            phone: "+8801700000001",
            role: "DISPATCHER"
        }
    })

    await prisma.driver.upsert({
        where: { userId: driverUser.id },
        update: {},
        create: {
            userId: driverUser.id,
            name: "Salam Driver",
            phone: "+8801700000002",
            licenseNo: "DL-2024-001"
        }
    })

    await prisma.hospital.createMany({
        data: [
            { name: "Dhaka Medical College Hospital", address: "Dhaka", contact: "+880200000001", services: "Emergency, ICU" },
            { name: "Apollo Hospital Dhaka", address: "Bashundhara", contact: "+880200000002", services: "Cardiac, ICU" }
        ],
        skipDuplicates: true
    })

    await prisma.dispatchRequest.upsert({
        where: { id: "seed-request-001" },
        update: {},
        create: {
            id: "seed-request-001",
            patientId: patient.id,
            priority: "CRITICAL",
            patientName: "Karim Patient",
            contact: "+8801700000000",
            pickupLocation: "Gulshan 2, Dhaka",
            note: "Chest pain, needs immediate attention"
        }
    })

    console.log("✅ Seed complete")
    console.log("--- Demo Credentials ---")
    console.log("Admin     : admin@medrush.com / Admin123")
    console.log("Dispatcher: dispatcher@medrush.com / Dispatch123")
    console.log("Patient   : patient@medrush.com / Patient123")
    console.log("Driver    : driver@medrush.com / Dispatch123")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
