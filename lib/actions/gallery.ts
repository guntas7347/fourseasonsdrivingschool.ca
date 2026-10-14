"use server";

import { db } from "@/lib/firebase/firebase";
import { revalidatePaths } from "@/lib/revalidatePath";
import { deleteImage } from "@/lib/cloudinary";

export interface GalleryItem {
  id: string; // Always a genuine Firebase doc.id
  url: string; // Cloudinary URL or direct image URL
  publicId?: string; // Cloudinary asset public ID
  title: string;
  category:
    | "Student Passes"
    | "Training Cars"
    | "Lessons & Road Tests"
    | "Safety & Dual Control"
    | "General";
  description?: string;
  studentName?: string;
  location?: string;
  featured?: boolean;
  createdAt: string;
  updatedAt?: string;
}

const DEFAULT_GALLERY_IMAGES: Omit<GalleryItem, "id" | "createdAt">[] = [
  {
    url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80",
    title: "Class 5 First-Attempt Road Test Pass!",
    category: "Student Passes",
    studentName: "Gurpreet S.",
    location: "Surrey 152nd St ICBC",
    description:
      "Congratulations Gurpreet on clearing your Class 5 test on the first attempt with zero driving errors!",
    featured: true,
  },
  {
    url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
    title: "Modern Dual-Brake Safety Training Car",
    category: "Training Cars",
    location: "Surrey Headquarters",
    description:
      "Fully inspected dual-brake safety control vehicle for complete student safety during road lessons.",
    featured: true,
  },
  {
    url: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1200&q=80",
    title: "Class 7N Road Test Success!",
    category: "Student Passes",
    studentName: "Jessica M.",
    location: "Langley ICBC Test Centre",
    description:
      "Proud moment as Jessica successfully passed her 'N' driving test after our 5-lesson confidence package.",
    featured: true,
  },
  {
    url: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80",
    title: "Highway Merging & Scan Maneuvers",
    category: "Lessons & Road Tests",
    location: "Hwy 10 & Fraser Hwy, Surrey",
    description:
      "Hands-on instruction on mirror-signal-shoulder checks, blind spots, and safe lane transitions.",
    featured: false,
  },
  {
    url: "https://images.unsplash.com/photo-1489824904134-891ab64532f1?auto=format&fit=crop&w=1200&q=80",
    title: "Dual-Control Instructor Cockpit & Mirrors",
    category: "Safety & Dual Control",
    location: "Four Seasons Dual-Control Vehicle",
    description:
      "Commercial dual-brake pedal installation and auxiliary wide-angle mirrors certified under BC Motor Vehicle Act.",
    featured: false,
  },
  {
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80",
    title: "First-Time Driver License Celebration",
    category: "Student Passes",
    studentName: "Amanpreet K.",
    location: "Surrey ICBC Driver Licensing",
    description:
      "Amanpreet with her official passing report from ICBC examiner after mastering reverse stall parking.",
    featured: true,
  },
  {
    url: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1200&q=80",
    title: "Pre-Trip Inspection & Safety Vehicle Walkaround",
    category: "Lessons & Road Tests",
    location: "Delta / Surrey Boundary",
    description:
      "Teaching students the essential ICBC pre-trip safety inspection, tire checks, and signal verifications.",
    featured: false,
  },
  {
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80",
    title: "New Driver Class 7 Pass!",
    category: "Student Passes",
    studentName: "Navneet S.",
    location: "Newton ICBC Centre",
    description:
      "Smiles all around after a flawless road test in Newton. Ready for safe independent driving!",
    featured: false,
  },
];

/**
 * Seed initial gallery images if collection is empty
 */
async function seedInitialGalleryIfEmpty() {
  try {
    const snapshot = await db.collection("gallery").limit(1).get();
    if (snapshot.empty) {
      const batch = db.batch();
      const now = new Date().toISOString();

      for (const item of DEFAULT_GALLERY_IMAGES) {
        const docRef = db.collection("gallery").doc(); // Genuine doc.id
        batch.set(docRef, {
          ...item,
          createdAt: now,
          updatedAt: now,
        });
      }
      await batch.commit();
    }
  } catch (err) {
    console.error("Error seeding initial gallery images:", err);
  }
}

/**
 * Fetch all gallery images from Firestore
 */
export async function getGalleryImagesAction(
  category?: string,
): Promise<GalleryItem[]> {
  try {
    await seedInitialGalleryIfEmpty();

    let query: FirebaseFirestore.Query = db
      .collection("gallery")
      .orderBy("createdAt", "desc");
    if (category && category !== "All") {
      query = query.where("category", "==", category);
    }

    const snapshot = await query.get();
    const images: GalleryItem[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      images.push({
        id: doc.id,
        url: data.url,
        publicId: data.publicId || "",
        title: data.title || "Four Seasons Gallery Image",
        category: data.category || "General",
        description: data.description || "",
        studentName: data.studentName || "",
        location: data.location || "Surrey, BC",
        featured: Boolean(data.featured),
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt,
      });
    });

    return images;
  } catch (error) {
    console.error("getGalleryImagesAction error:", error);
    return [];
  }
}

/**
 * Create a new gallery image in Firestore with genuine doc.id
 */
export async function createGalleryImageAction(
  data: Omit<GalleryItem, "id" | "createdAt" | "updatedAt">,
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    if (!data.url?.trim()) {
      return { success: false, error: "Image URL is required." };
    }
    if (!data.title?.trim()) {
      return { success: false, error: "Title is required." };
    }

    const docRef = db.collection("gallery").doc(); // Always genuine doc.id
    const now = new Date().toISOString();

    await docRef.set({
      url: data.url.trim(),
      publicId: data.publicId?.trim() || "",
      title: data.title.trim(),
      category: data.category || "Student Passes",
      description: data.description?.trim() || "",
      studentName: data.studentName?.trim() || "",
      location: data.location?.trim() || "Surrey, BC",
      featured: Boolean(data.featured),
      createdAt: now,
      updatedAt: now,
    });

    await revalidatePaths(["/", "/gallery", "/admin/gallery"]);
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error("createGalleryImageAction error:", error);
    return {
      success: false,
      error: error?.message || "Failed to create gallery image",
    };
  }
}

/**
 * Update a gallery image in Firestore
 */
export async function updateGalleryImageAction(
  id: string,
  data: Partial<Omit<GalleryItem, "id">>,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id) throw new Error("Missing gallery image ID");

    const docRef = db.collection("gallery").doc(id);
    const now = new Date().toISOString();

    await docRef.update({
      ...data,
      updatedAt: now,
    });

    await revalidatePaths(["/", "/gallery", "/admin/gallery"]);
    return { success: true };
  } catch (error: any) {
    console.error("updateGalleryImageAction error:", error);
    return {
      success: false,
      error: error?.message || "Failed to update gallery image",
    };
  }
}

/**
 * Delete a gallery image from Firestore and Cloudinary
 */
export async function deleteGalleryImageAction(
  id: string,
  publicId?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id) throw new Error("Missing gallery image ID");

    let targetPublicId = publicId;
    if (!targetPublicId) {
      const doc = await db.collection("gallery").doc(id).get();
      targetPublicId = doc.data()?.publicId;
    }

    if (targetPublicId) {
      try {
        await deleteImage(targetPublicId);
      } catch (cloudErr) {
        console.warn("Could not delete image from Cloudinary:", cloudErr);
      }
    }

    await db.collection("gallery").doc(id).delete();
    await revalidatePaths(["/", "/gallery", "/admin/gallery"]);
    return { success: true };
  } catch (error: any) {
    console.error("deleteGalleryImageAction error:", error);
    return {
      success: false,
      error: error?.message || "Failed to delete gallery image",
    };
  }
}
