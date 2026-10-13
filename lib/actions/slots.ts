"use server";

import { db } from "@/lib/firebase/firebase";
import { revalidatePaths } from "@/lib/revalidatePath";

export interface SlotItem {
  id: string; // Always a genuine Firebase doc.id
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  time: string; // e.g. "08:30 AM – 10:00 AM"
  duration: string; // e.g. "90 mins"
  instructor: string;
  status: "available" | "booked" | "reserved";
  available: boolean;
  slotTypeId?: string;
  slotTypeName?: string;
  slotTypePrice?: string;
  bookedBy?: {
    name: string;
    email: string;
    phone: string;
    bookingId?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface SlotTypeItem {
  id: string; // Genuine Firebase doc.id
  name: string; // Slot Type Name (e.g. Standard 90-Min Lesson)
  price: string; // Formatted price (e.g. $110)
  numericPrice: number; // Numeric value
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Fetch slots for a specific date or all dates from Firestore (Live data)
 */
export async function getSlotsAction(filterDate?: string): Promise<SlotItem[]> {
  try {
    let query: FirebaseFirestore.Query = db.collection("slots");
    if (filterDate) {
      query = query.where("date", "==", filterDate);
    }
    const snapshot = await query.get();
    const slots: SlotItem[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const time = data.time || `${data.startTime} – ${data.endTime}`;
      slots.push({
        id: doc.id, // Always use doc.id
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        time,
        duration: data.duration || "90 mins",
        instructor: data.instructor || "Chief Instructor",
        status: data.status || "available",
        available: data.status === "available",
        bookedBy: data.bookedBy,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });

    // Sort by date, then by startTime
    slots.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });

    return slots;
  } catch (error) {
    console.error("getSlotsAction error:", error);
    return [];
  }
}

/**
 * Fetch all distinct dates that have available slots in Firestore
 */
export async function getAvailableSlotDatesAction(): Promise<string[]> {
  try {
    const snapshot = await db
      .collection("slots")
      .where("status", "==", "available")
      .get();

    const dateSet = new Set<string>();
    snapshot.forEach((doc) => {
      const d = doc.data();
      if (d.date) {
        dateSet.add(d.date);
      }
    });

    return Array.from(dateSet).sort();
  } catch (error) {
    console.error("getAvailableSlotDatesAction error:", error);
    return [];
  }
}

/**
 * Create a new single instructor time slot with a real Firebase doc.id
 */
export async function createSlotAction(slotData: {
  date: string;
  startTime: string;
  endTime: string;
  duration?: string;
  instructor?: string;
  status?: "available" | "booked" | "reserved";
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const docRef = db.collection("slots").doc(); // Always generate doc.id
    const time = `${slotData.startTime} – ${slotData.endTime}`;
    const now = new Date().toISOString();

    await docRef.set({
      date: slotData.date,
      startTime: slotData.startTime,
      endTime: slotData.endTime,
      time,
      duration: slotData.duration || "90 mins",
      instructor: slotData.instructor || "Gary S. (Senior Instructor)",
      status: slotData.status || "available",
      createdAt: now,
    });

    await revalidatePaths(["/", "/bookings", "/admin/slots"]);
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error("createSlotAction error:", error);
    return { success: false, error: error?.message || "Failed to create slot" };
  }
}

/**
 * Create multiple instructor slots in batch with real Firebase doc.id
 */
export async function createBatchSlotsAction(
  slots: Array<{
    date: string;
    startTime: string;
    endTime: string;
    duration?: string;
    instructor?: string;
    status?: "available" | "booked" | "reserved";
  }>
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    if (!slots || slots.length === 0) {
      return { success: false, count: 0, error: "No slots provided." };
    }

    const now = new Date().toISOString();
    // Firestore supports up to 500 writes per batch
    const batchSize = 400;
    let savedCount = 0;

    for (let i = 0; i < slots.length; i += batchSize) {
      const chunk = slots.slice(i, i + batchSize);
      const batch = db.batch();

      for (const slotData of chunk) {
        const docRef = db.collection("slots").doc(); // Always generate official Firebase doc.id
        const time = `${slotData.startTime} – ${slotData.endTime}`;
        batch.set(docRef, {
          date: slotData.date,
          startTime: slotData.startTime,
          endTime: slotData.endTime,
          time,
          duration: slotData.duration || "90 mins",
          instructor: slotData.instructor || "Gary S. (Senior Instructor)",
          status: slotData.status || "available",
          createdAt: now,
        });
        savedCount++;
      }

      await batch.commit();
    }

    await revalidatePaths(["/", "/bookings", "/admin/slots"]);
    return { success: true, count: savedCount };
  } catch (error: any) {
    console.error("createBatchSlotsAction error:", error);
    return { success: false, count: 0, error: error?.message || "Batch creation failed" };
  }
}

/**
 * Update slot status by its Firebase doc.id
 */
export async function updateSlotStatusAction(
  id: string,
  status: "available" | "booked" | "reserved",
  bookedBy?: SlotItem["bookedBy"]
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id) throw new Error("Missing slot doc.id");
    const updateData: Record<string, any> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (bookedBy) {
      updateData.bookedBy = bookedBy;
    }
    await db.collection("slots").doc(id).set(updateData, { merge: true });
    await revalidatePaths(["/", "/bookings", "/admin/slots"]);
    return { success: true };
  } catch (error: any) {
    console.error("updateSlotStatusAction error:", error);
    return { success: false, error: error?.message || "Failed to update slot status" };
  }
}

/**
 * Delete a slot by its Firebase doc.id
 */
export async function deleteSlotAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id) throw new Error("Missing slot doc.id");
    await db.collection("slots").doc(id).delete();
    await revalidatePaths(["/", "/bookings", "/admin/slots"]);
    return { success: true };
  } catch (error: any) {
    console.error("deleteSlotAction error:", error);
    return { success: false, error: error?.message || "Failed to delete slot" };
  }
}

// Default slot types template
const DEFAULT_SLOT_TYPES: Omit<SlotTypeItem, "id">[] = [
  {
    name: "Standard 90-Min Lesson",
    price: "$110",
    numericPrice: 110,
  },
  {
    name: "Mock ICBC Road Test (90 min)",
    price: "$125",
    numericPrice: 125,
  },
  {
    name: "Highway & Merging Practice (90 min)",
    price: "$115",
    numericPrice: 115,
  },
  {
    name: "Parallel & Stall Parking Intensive",
    price: "$110",
    numericPrice: 110,
  },
  {
    name: "Road Test Warm-Up & Car Rental",
    price: "$230",
    numericPrice: 230,
  },
];

async function ensureDefaultSlotTypesSeeded(): Promise<SlotTypeItem[]> {
  try {
    const snapshot = await db.collection("slot_types").orderBy("numericPrice", "asc").get();
    if (!snapshot.empty) {
      const items: SlotTypeItem[] = [];
      snapshot.forEach((doc) => {
        const d = doc.data();
        items.push({
          id: doc.id,
          name: d.name || "",
          price: d.price || `$${d.numericPrice || 0}`,
          numericPrice: Number(d.numericPrice) || 0,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        });
      });
      return items;
    }

    // Seed defaults with real Firebase doc.id
    const seededList: SlotTypeItem[] = [];
    const batch = db.batch();
    const now = new Date().toISOString();

    for (const template of DEFAULT_SLOT_TYPES) {
      const docRef = db.collection("slot_types").doc();
      const item: SlotTypeItem = {
        ...template,
        id: docRef.id,
        createdAt: now,
      };
      batch.set(docRef, {
        name: item.name,
        price: item.price,
        numericPrice: item.numericPrice,
        createdAt: now,
      });
      seededList.push(item);
    }

    await batch.commit();
    return seededList;
  } catch (err) {
    console.error("ensureDefaultSlotTypesSeeded error:", err);
    return DEFAULT_SLOT_TYPES.map((t) => ({
      ...t,
      id: db.collection("slot_types").doc().id,
    }));
  }
}

/**
 * Fetch all slot types from Firestore
 */
export async function getSlotTypesAction(): Promise<SlotTypeItem[]> {
  try {
    const types = await ensureDefaultSlotTypesSeeded();
    return types;
  } catch (error) {
    console.error("getSlotTypesAction error:", error);
    return [];
  }
}

/**
 * Create a new slot type with genuine Firebase doc.id
 */
export async function createSlotTypeAction(data: {
  name: string;
  price?: string;
  numericPrice: number;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const docRef = db.collection("slot_types").doc();
    const numeric = Number(data.numericPrice) || 0;
    const formattedPrice = data.price?.startsWith("$") ? data.price : `$${numeric}`;
    const now = new Date().toISOString();

    await docRef.set({
      name: data.name.trim(),
      price: formattedPrice,
      numericPrice: numeric,
      createdAt: now,
    });

    await revalidatePaths(["/", "/bookings", "/admin/slots"]);
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error("createSlotTypeAction error:", error);
    return { success: false, error: error?.message || "Failed to create slot type" };
  }
}

/**
 * Update an existing slot type by doc.id
 */
export async function updateSlotTypeAction(
  id: string,
  data: { name: string; price?: string; numericPrice: number }
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id) throw new Error("Missing slot type doc.id");
    const numeric = Number(data.numericPrice) || 0;
    const formattedPrice = data.price?.startsWith("$") ? data.price : `$${numeric}`;

    await db.collection("slot_types").doc(id).set(
      {
        name: data.name.trim(),
        price: formattedPrice,
        numericPrice: numeric,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    await revalidatePaths(["/", "/bookings", "/admin/slots"]);
    return { success: true };
  } catch (error: any) {
    console.error("updateSlotTypeAction error:", error);
    return { success: false, error: error?.message || "Failed to update slot type" };
  }
}

/**
 * Delete a slot type by doc.id
 */
export async function deleteSlotTypeAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id) throw new Error("Missing slot type doc.id");
    await db.collection("slot_types").doc(id).delete();
    await revalidatePaths(["/", "/bookings", "/admin/slots"]);
    return { success: true };
  } catch (error: any) {
    console.error("deleteSlotTypeAction error:", error);
    return { success: false, error: error?.message || "Failed to delete slot type" };
  }
}
