"use server";

import { db } from "@/lib/firebase/firebase";
import { BookingItem } from "./bookings";

export interface AdminStats {
  totalBookings: number;
  totalRevenue: number;
  activeSlotsCount: number;
  packagesCount: number;
  recentBookings: BookingItem[];
}

/**
 * Compute admin dashboard metrics from collections
 */
export async function getAdminStatsAction(): Promise<AdminStats> {
  try {
    const [bookingsSnap, slotsSnap, packagesSnap] = await Promise.all([
      db.collection("bookings").orderBy("createdAt", "desc").limit(10).get(),
      db.collection("slots").where("status", "==", "available").get(),
      db.collection("packages").get(),
    ]);

    const totalBookingsSnap = await db.collection("bookings").count().get();
    const totalBookings = totalBookingsSnap.data().count;

    const recentBookings: BookingItem[] = [];
    let estimatedRevenue = 0;

    bookingsSnap.forEach((doc) => {
      const data = doc.data();
      recentBookings.push({
        id: doc.id, // Always use doc.id
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        phone: data.phone || "",
        street: data.street || "",
        city: data.city || "",
        postCode: data.postCode || "",
        licenseNumber: data.licenseNumber || "",
        licenseClass: data.licenseClass || "",
        licenseExpiry: data.licenseExpiry || "",
        packageId: data.packageId || "",
        packageName: data.packageName || "",
        packagePrice: data.packagePrice || "",
        slotId: data.slotId || "",
        slotDate: data.slotDate || "",
        slotTime: data.slotTime || "",
        slotInstructor: data.slotInstructor || "",
        alreadyPurchased: data.alreadyPurchased || "no",
        bookedRoadTest: data.bookedRoadTest || "no",
        roadTestDate: data.roadTestDate,
        roadTestLocation: data.roadTestLocation,
        additionalNotes: data.additionalNotes,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus,
        cardLast4: data.cardLast4,
        createdAt: data.createdAt || "",
      });

      const priceVal = parseFloat(String(data.packagePrice || "").replace(/[^0-9.]/g, "")) || 0;
      estimatedRevenue += priceVal;
    });

    return {
      totalBookings,
      totalRevenue: estimatedRevenue,
      activeSlotsCount: slotsSnap.size,
      packagesCount: packagesSnap.size,
      recentBookings,
    };
  } catch (error) {
    console.error("getAdminStatsAction error:", error);
    return {
      totalBookings: 0,
      totalRevenue: 0,
      activeSlotsCount: 0,
      packagesCount: 0,
      recentBookings: [],
    };
  }
}
