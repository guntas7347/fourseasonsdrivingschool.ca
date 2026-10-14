"use server";

import { db } from "@/lib/firebase/firebase";
import { revalidatePaths } from "@/lib/revalidatePath";
import { generateSlotBookingEmail, logConfirmationEmail } from "@/lib/email";

export interface BookingItem {
  id: string; // Always a genuine Firebase doc.id
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  postCode: string;
  licenseNumber: string;
  licenseClass: string;
  licenseExpiry: string;
  packageId: string;
  packageName: string;
  packagePrice: string;
  slotId: string;
  slotDate: string;
  slotTime: string;
  slotInstructor: string;
  slotTypeName?: string;
  slotTypePrice?: string;
  alreadyPurchased: string;
  bookedRoadTest: string;
  roadTestDate?: string;
  roadTestLocation?: string;
  additionalNotes?: string;
  paymentMethod?: string;
  paymentStatus: "paid" | "pending_dev_mode" | "pay_on_arrival" | "pending_payment" | "refunded";
  paymentIntentId?: string;
  paidAt?: string;
  cardLast4?: string;
  createdAt: string;
}

/**
 * Create a new student booking with a real Firebase doc.id
 */
export async function createBookingAction(
  bookingData: Omit<BookingItem, "id" | "createdAt">,
): Promise<{ success: boolean; bookingId?: string; error?: string }> {
  try {
    const docRef = db.collection("bookings").doc(); // Generates official Firebase doc.id
    const createdAt = new Date().toISOString();

    await docRef.set({
      ...bookingData,
      createdAt,
    });

    // If a slotId was provided, update the slot document in Firestore to booked
    if (bookingData.slotId) {
      try {
        await db
          .collection("slots")
          .doc(bookingData.slotId)
          .set(
            {
              status: "booked",
              bookedBy: {
                name: `${bookingData.firstName} ${bookingData.lastName}`,
                email: bookingData.email,
                phone: bookingData.phone,
                bookingId: docRef.id,
              },
              updatedAt: createdAt,
            },
            { merge: true },
          );
      } catch (err) {
        console.warn("Could not mark slot document as booked:", err);
      }
    }

    // Generate and log confirmation email using /lib/email as requested
    const emailTemplate = generateSlotBookingEmail({
      bookingId: docRef.id,
      customerName: `${bookingData.firstName} ${bookingData.lastName}`,
      email: bookingData.email,
      phone: bookingData.phone,
      date: bookingData.slotDate || new Date().toISOString().split("T")[0],
      time: bookingData.slotTime || "Standard Session",
      instructor: bookingData.slotInstructor,
      slotType:
        bookingData.slotTypeName || bookingData.packageName || "Driving Lesson",
      price: bookingData.slotTypePrice || bookingData.packagePrice,
      pickupAddress: bookingData.street
        ? `${bookingData.street}, ${bookingData.city}`
        : undefined,
      licenseClass: bookingData.licenseClass,
    });

    logConfirmationEmail({
      type: "SLOT_BOOKING",
      to: bookingData.email,
      subject: emailTemplate.subject,
      body: emailTemplate.body,
    });

    await revalidatePaths([
      "/",
      "/bookings",
      "/admin/bookings",
      "/admin/slots",
    ]);
    return { success: true, bookingId: docRef.id };
  } catch (error: any) {
    console.error("createBookingAction error:", error);
    return {
      success: false,
      error: error?.message || "Failed to create booking",
    };
  }
}

/**
 * Fetch all student bookings from Firestore
 */
export async function getBookingsAction(): Promise<BookingItem[]> {
  try {
    const snapshot = await db
      .collection("bookings")
      .orderBy("createdAt", "desc")
      .get();
    const bookings: BookingItem[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      bookings.push({
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
        paymentMethod: data.paymentMethod || "dev_card",
        paymentStatus: data.paymentStatus || "pending_dev_mode",
        cardLast4: data.cardLast4,
        createdAt: data.createdAt || "",
      });
    });

    return bookings;
  } catch (error) {
    console.error("getBookingsAction error:", error);
    return [];
  }
}

/**
 * Fetch a single booking by doc ID
 */
export async function getBookingByIdAction(id: string): Promise<BookingItem | null> {
  try {
    if (!id) return null;
    const doc = await db.collection("bookings").doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data()!;
    return {
      id: doc.id,
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
      paymentMethod: data.paymentMethod || "card",
      paymentStatus: data.paymentStatus || "pending_payment",
      cardLast4: data.cardLast4,
      createdAt: data.createdAt || "",
    };
  } catch (err) {
    console.error("getBookingByIdAction error:", err);
    return null;
  }
}

/**
 * Mark a booking as paid in Firestore (called upon Stripe payment confirmation)
 */
export async function markBookingPaidAction(params: {
  bookingId: string;
  paymentIntentId?: string;
  cardLast4?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    if (!params.bookingId) throw new Error("Missing booking ID");
    const now = new Date().toISOString();

    await db.collection("bookings").doc(params.bookingId).set(
      {
        paymentStatus: "paid",
        paymentMethod: "stripe_card",
        paymentIntentId: params.paymentIntentId || "",
        cardLast4: params.cardLast4 || "",
        paidAt: now,
      },
      { merge: true }
    );

    await revalidatePaths([
      "/",
      "/bookings",
      "/admin/bookings",
      "/admin/slots",
      "/admin/purchased-packages",
    ]);

    return { success: true };
  } catch (error: any) {
    console.error("markBookingPaidAction error:", error);
    return { success: false, error: error?.message || "Failed to update booking status" };
  }
}

