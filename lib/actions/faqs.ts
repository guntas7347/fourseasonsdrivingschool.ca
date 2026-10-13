"use server";

import { db } from "@/lib/firebase/firebase";
import { revalidatePaths } from "@/lib/revalidatePath";

export interface FaqItem {
  id: string; // Always a genuine Firebase doc.id
  question: string;
  answer: string;
  order: number;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

const DEFAULT_FAQS: Omit<FaqItem, "id">[] = [
  {
    question: "What do I need to bring for my first driving lesson?",
    answer:
      "You must have your valid ICBC Driver's License (Class 7L, Class 7N, or Class 5) with you during every lesson. Wear comfortable closed-toe footwear and corrective glasses or contacts if required on your license.",
    order: 1,
    category: "General",
  },
  {
    question: "Do you provide car rental for the ICBC road test?",
    answer:
      "Yes, our certified dual-brake vehicles are available for your road test. Our package includes a 45-minute warm-up drive right before your test appointment to get your nerves settled.",
    order: 2,
    category: "Road Test",
  },
  {
    question: "Can I request free pick-up and drop-off?",
    answer:
      "Yes! We provide complimentary doorstep pick-up and drop-off anywhere in Surrey (Guildford, Newton, Fleetwood, Cloverdale), North Delta, Langley, and White Rock.",
    order: 3,
    category: "Services",
  },
  {
    question: "How does the online registration and scheduling work?",
    answer:
      "Simply fill out the form above. Once submitted, our team reviews your preferred package and availability and contacts you within 24 hours to finalize your first session time.",
    order: 4,
    category: "Booking",
  },
  {
    question: "How many lessons do I need before taking the Class 7 or Class 5 test?",
    answer:
      "This depends on your prior experience. Beginners usually take between 8 to 12 lessons to master defensive driving and ICBC road test maneuvers, whereas experienced drivers taking Class 5 often need 2 to 4 brush-up sessions.",
    order: 5,
    category: "Training",
  },
];

async function ensureDefaultFaqsSeeded(): Promise<FaqItem[]> {
  try {
    const snapshot = await db.collection("faqs").orderBy("order", "asc").get();
    if (!snapshot.empty) {
      const list: FaqItem[] = [];
      snapshot.forEach((doc) => {
        const d = doc.data();
        list.push({
          id: doc.id,
          question: d.question || "",
          answer: d.answer || "",
          order: Number(d.order) || 0,
          category: d.category || "General",
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        });
      });
      return list;
    }

    // Seed defaults with real Firebase doc.id
    const batch = db.batch();
    const seeded: FaqItem[] = [];
    const now = new Date().toISOString();

    for (const item of DEFAULT_FAQS) {
      const docRef = db.collection("faqs").doc();
      const faqData: FaqItem = {
        ...item,
        id: docRef.id,
        createdAt: now,
      };
      batch.set(docRef, {
        question: faqData.question,
        answer: faqData.answer,
        order: faqData.order,
        category: faqData.category,
        createdAt: now,
      });
      seeded.push(faqData);
    }

    await batch.commit();
    return seeded;
  } catch (err) {
    console.error("ensureDefaultFaqsSeeded error:", err);
    return DEFAULT_FAQS.map((f) => {
      const docRef = db.collection("faqs").doc();
      return {
        ...f,
        id: docRef.id,
      };
    });
  }
}

/**
 * Fetch all FAQs from Firestore ordered by order ascending
 */
export async function getFaqsAction(): Promise<FaqItem[]> {
  try {
    const faqs = await ensureDefaultFaqsSeeded();
    return faqs;
  } catch (error) {
    console.error("getFaqsAction error:", error);
    return [];
  }
}

/**
 * Create a new FAQ entry with a real Firebase doc.id
 */
export async function createFaqAction(
  data: Omit<FaqItem, "id" | "createdAt" | "updatedAt">
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const docRef = db.collection("faqs").doc();
    const now = new Date().toISOString();

    await docRef.set({
      question: data.question,
      answer: data.answer,
      order: Number(data.order) || 1,
      category: data.category || "General",
      createdAt: now,
    });

    await revalidatePaths(["/", "/admin/faqs"]);
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error("createFaqAction error:", error);
    return { success: false, error: error?.message || "Failed to create FAQ" };
  }
}

/**
 * Update an existing FAQ by its Firebase doc.id
 */
export async function updateFaqAction(
  id: string,
  data: Partial<Omit<FaqItem, "id">>
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id) throw new Error("Missing FAQ doc.id");
    const updatePayload: Record<string, any> = { ...data };
    if (data.order !== undefined) {
      updatePayload.order = Number(data.order);
    }
    updatePayload.updatedAt = new Date().toISOString();

    await db.collection("faqs").doc(id).set(updatePayload, { merge: true });
    await revalidatePaths(["/", "/admin/faqs"]);
    return { success: true };
  } catch (error: any) {
    console.error("updateFaqAction error:", error);
    return { success: false, error: error?.message || "Failed to update FAQ" };
  }
}

/**
 * Delete an FAQ by its Firebase doc.id
 */
export async function deleteFaqAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id) throw new Error("Missing FAQ doc.id");
    await db.collection("faqs").doc(id).delete();
    await revalidatePaths(["/", "/admin/faqs"]);
    return { success: true };
  } catch (error: any) {
    console.error("deleteFaqAction error:", error);
    return { success: false, error: error?.message || "Failed to delete FAQ" };
  }
}
