"use server";

import { db } from "@/lib/firebase/firebase";
import { revalidatePaths } from "@/lib/revalidatePath";
import { generatePackagePurchaseEmail, logConfirmationEmail } from "@/lib/email";

export interface PackageItem {
  id: string; // Always a genuine Firebase doc.id
  name: string;
  price: string;
  numericPrice: number;
  duration: string;
  lessonsCount: number;
  description: string;
  features: string[];
  popular?: boolean;
  showOnHomepage?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Initial default package templates
const INITIAL_DEFAULT_PACKAGES: Omit<PackageItem, "id">[] = [
  {
    name: "1 Individual Driving Lesson",
    price: "$110",
    numericPrice: 110,
    duration: "90 minutes",
    lessonsCount: 1,
    description: "Ideal for initial skill evaluation, parking practice, or specific maneuver review.",
    features: [
      "One-on-one 90 min driving instruction",
      "Free home / school / work pickup",
      "Dual-brake safety car",
      "Post-lesson skill feedback report",
    ],
    popular: false,
    showOnHomepage: true,
  },
  {
    name: "10 Lessons Package (Recommended)",
    price: "$999",
    numericPrice: 999,
    duration: "15 hours total",
    lessonsCount: 10,
    description: "Comprehensive step-by-step driver education for confident first-time ICBC test pass.",
    features: [
      "10 sessions of 90 min individual driving",
      "Free home pickup & drop-off in Surrey & Delta",
      "Highway, reverse stall & parallel parking",
      "Full mock road test simulating ICBC criteria",
      "Flexible weekday & weekend scheduling",
    ],
    popular: true,
    showOnHomepage: true,
  },
  {
    name: "Road Test Preparation & Car Rental",
    price: "$230",
    numericPrice: 230,
    duration: "Test Day Package",
    lessonsCount: 1,
    description: "Warm-up lesson right before your test + school vehicle rental for your ICBC exam.",
    features: [
      "45–60 min pre-test warm-up driving lesson",
      "Certified dual-brake car rental for ICBC exam",
      "Instructor accompaniment to ICBC center",
      "Drop-off back to your home after test",
    ],
    popular: false,
    showOnHomepage: true,
  },
  {
    name: "5 Lessons Package",
    price: "$525",
    numericPrice: 525,
    duration: "7.5 hours total",
    lessonsCount: 5,
    description: "Great for building core foundational driving habits and city road confidence.",
    features: [
      "5 one-on-one 90 min sessions",
      "Free pickup & drop-off in Surrey & Delta",
      "Parallel, 2-point, and reverse stall parking",
      "Lane change & intersection mastery",
    ],
    popular: false,
    showOnHomepage: false,
  },
  {
    name: "Complete Beginner to Pass",
    price: "$1,280",
    numericPrice: 1280,
    duration: "18 hours + Road Test",
    lessonsCount: 12,
    description: "Full novice package: 12 in-depth lessons plus test-day warm-up and car rental.",
    features: [
      "12 individual lessons (18 hours behind the wheel)",
      "Car rental for ICBC road test included",
      "Pre-test warm-up lesson included",
      "Free door-to-door pickup & drop-off",
    ],
    popular: false,
    showOnHomepage: false,
  },
  {
    name: "Refresher & Parking Brush-Up",
    price: "$210",
    numericPrice: 210,
    duration: "3 hours total",
    lessonsCount: 2,
    description: "Tailored for Class 5 drivers or newcomers wanting confidence on Canadian roads.",
    features: [
      "2 sessions of 90 min brush-up",
      "Focus on winter driving, highway, and parking",
      "Review of BC road rules and signs",
    ],
    popular: false,
    showOnHomepage: false,
  },
];

// Helper to seed defaults with real Firebase Document IDs
async function ensureDefaultPackagesSeeded(): Promise<PackageItem[]> {
  try {
    const snapshot = await db.collection("packages").get();
    if (!snapshot.empty) {
      const items: PackageItem[] = [];
      snapshot.forEach((doc) => {
        const d = doc.data();
        items.push({
          id: doc.id,
          name: d.name || "",
          price: d.price || `$${d.numericPrice || 0}`,
          numericPrice: Number(d.numericPrice) || 0,
          duration: d.duration || "",
          lessonsCount: Number(d.lessonsCount) || 1,
          description: d.description || "",
          features: Array.isArray(d.features) ? d.features : [],
          popular: Boolean(d.popular),
          showOnHomepage: d.showOnHomepage !== undefined ? Boolean(d.showOnHomepage) : false,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        });
      });
      return items;
    }

    // Collection is empty: create documents using real Firebase doc.id
    const seededList: PackageItem[] = [];
    const batch = db.batch();
    const now = new Date().toISOString();

    for (const template of INITIAL_DEFAULT_PACKAGES) {
      const docRef = db.collection("packages").doc(); // Generates official Firebase doc id
      const pkgData: PackageItem = {
        ...template,
        id: docRef.id,
        createdAt: now,
      };
      batch.set(docRef, {
        name: pkgData.name,
        price: pkgData.price,
        numericPrice: pkgData.numericPrice,
        duration: pkgData.duration,
        lessonsCount: pkgData.lessonsCount,
        description: pkgData.description,
        features: pkgData.features,
        popular: pkgData.popular,
        showOnHomepage: pkgData.showOnHomepage,
        createdAt: now,
      });
      seededList.push(pkgData);
    }

    await batch.commit();
    return seededList;
  } catch (err) {
    console.error("ensureDefaultPackagesSeeded error:", err);
    return INITIAL_DEFAULT_PACKAGES.map((t) => {
      const docRef = db.collection("packages").doc();
      return {
        ...t,
        id: docRef.id,
      };
    });
  }
}

/**
 * Fetch all packages from Firestore
 */
export async function getPackagesAction(): Promise<PackageItem[]> {
  try {
    const packages = await ensureDefaultPackagesSeeded();
    return packages;
  } catch (error) {
    console.error("getPackagesAction error:", error);
    return [];
  }
}

/**
 * Fetch homepage packages: Exactly 3 packages with the popular one centered:
 * [Regular, Popular, Regular]
 */
export async function getHomepagePackagesAction(): Promise<PackageItem[]> {
  try {
    const all = await getPackagesAction();

    // Find any popular item in db
    const popularItem = all.find((p) => p.popular);

    // Filter packages that have showOnHomepage === true
    let homepageList = all.filter((p) => p.showOnHomepage);

    // If popular item exists in db, ensure it is included in homepageList
    if (popularItem && !homepageList.some((h) => h.id === popularItem.id)) {
      homepageList.unshift(popularItem);
    }

    // If less than 3 are explicitly marked, supplement from all packages
    if (homepageList.length < 3) {
      const remaining = all.filter((p) => !homepageList.some((h) => h.id === p.id));
      homepageList = [...homepageList, ...remaining].slice(0, 3);
    } else if (homepageList.length > 3) {
      homepageList = homepageList.slice(0, 3);
    }

    // Arrange with popular in center: [regular, popular, regular]
    const currentPopular = homepageList.find((p) => p.popular) || popularItem;
    if (currentPopular) {
      const nonPopularItems = homepageList.filter((p) => p.id !== currentPopular.id);
      if (nonPopularItems.length >= 2) {
        return [nonPopularItems[0], currentPopular, nonPopularItems[1]];
      }
      if (nonPopularItems.length === 1) {
        return [nonPopularItems[0], currentPopular];
      }
      return [currentPopular];
    }

    return homepageList.slice(0, 3);
  } catch (error) {
    console.error("getHomepagePackagesAction error:", error);
    return [];
  }
}

/**
 * Fetch a single package by its Firebase doc.id
 */
export async function getPackageByIdAction(id: string): Promise<PackageItem | null> {
  try {
    if (!id) return null;
    const doc = await db.collection("packages").doc(id).get();
    if (!doc.exists) {
      return null;
    }
    const data = doc.data()!;
    return {
      id: doc.id,
      name: data.name || "",
      price: data.price || `$${data.numericPrice || 0}`,
      numericPrice: Number(data.numericPrice) || 0,
      duration: data.duration || "",
      lessonsCount: Number(data.lessonsCount) || 1,
      description: data.description || "",
      features: Array.isArray(data.features) ? data.features : [],
      popular: Boolean(data.popular),
      showOnHomepage: Boolean(data.showOnHomepage),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  } catch (error) {
    console.error("getPackageByIdAction error:", error);
    return null;
  }
}

/**
 * Unmark other popular packages so only max 1 is popular in database
 */
async function unmarkOtherPopularPackages(excludeId?: string) {
  try {
    const popularSnapshot = await db
      .collection("packages")
      .where("popular", "==", true)
      .get();

    const batch = db.batch();
    popularSnapshot.forEach((doc) => {
      if (doc.id !== excludeId) {
        batch.update(doc.ref, { popular: false, updatedAt: new Date().toISOString() });
      }
    });
    await batch.commit();
  } catch (err) {
    console.error("Error unmarking other popular packages:", err);
  }
}

/**
 * Create a new package with a real Firebase doc.id
 * Rules:
 * - Only max 1 package can be marked as popular (auto unmark others)
 * - Marked as popular auto-marks as showOnHomepage
 */
export async function createPackageAction(
  data: Omit<PackageItem, "id" | "createdAt" | "updatedAt">
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const docRef = db.collection("packages").doc(); // Always generate doc.id
    const numericPrice = Number(data.numericPrice) || 0;
    const formattedPrice = data.price?.startsWith("$") ? data.price : `$${numericPrice}`;
    const now = new Date().toISOString();

    const isPopular = Boolean(data.popular);
    // If marked as popular, automark showOnHomepage = true
    const showOnHomepage = isPopular ? true : Boolean(data.showOnHomepage);

    if (isPopular) {
      await unmarkOtherPopularPackages(docRef.id);
    }

    await docRef.set({
      name: data.name,
      price: formattedPrice,
      numericPrice,
      duration: data.duration || "",
      lessonsCount: Number(data.lessonsCount) || 1,
      description: data.description || "",
      features: Array.isArray(data.features) ? data.features : [],
      popular: isPopular,
      showOnHomepage,
      createdAt: now,
    });

    await revalidatePaths(["/", "/packages", "/admin/packages"]);
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error("createPackageAction error:", error);
    return { success: false, error: error?.message || "Failed to create package" };
  }
}

/**
 * Update a package by its Firebase doc.id
 * Rules:
 * - Only max 1 package can be marked as popular (auto unmark others)
 * - Marked as popular auto-marks as showOnHomepage
 */
export async function updatePackageAction(
  id: string,
  data: Partial<Omit<PackageItem, "id">>
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id) throw new Error("Missing package doc.id");
    const updatePayload: Record<string, any> = { ...data };

    if (data.numericPrice !== undefined) {
      updatePayload.numericPrice = Number(data.numericPrice);
      if (!data.price) {
        updatePayload.price = `$${data.numericPrice}`;
      }
    }

    if (data.popular !== undefined) {
      const isPopular = Boolean(data.popular);
      updatePayload.popular = isPopular;

      if (isPopular) {
        // Automatically unmark other popular packages in DB
        await unmarkOtherPopularPackages(id);
        // Marked as popular automarks as show
        updatePayload.showOnHomepage = true;
      }
    }

    if (data.showOnHomepage !== undefined && !updatePayload.popular) {
      updatePayload.showOnHomepage = Boolean(data.showOnHomepage);
    }

    updatePayload.updatedAt = new Date().toISOString();

    await db.collection("packages").doc(id).set(updatePayload, { merge: true });
    await revalidatePaths(["/", "/packages", "/admin/packages"]);
    return { success: true };
  } catch (error: any) {
    console.error("updatePackageAction error:", error);
    return { success: false, error: error?.message || "Failed to update package" };
  }
}

/**
 * Delete a package by its Firebase doc.id
 */
export async function deletePackageAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id) throw new Error("Missing package doc.id");
    await db.collection("packages").doc(id).delete();
    await revalidatePaths(["/", "/packages", "/admin/packages"]);
    return { success: true };
  } catch (error: any) {
    console.error("deletePackageAction error:", error);
    return { success: false, error: error?.message || "Failed to delete package" };
  }
}

export interface PurchasePackagePayload {
  packageId: string;
  packageName: string;
  packagePrice: string;
  numericPrice?: number;
  duration?: string;
  lessonsCount?: number;
  firstName: string;
  lastName: string;
  email: string; // Most important
  phone: string; // Most important
  street?: string;
  city?: string;
  postCode?: string;
  licenseNumber?: string;
  licenseClass?: string;
  preferredStartDate?: string;
  additionalNotes?: string;
  paymentMethod?: string;
  paymentStatus?: "paid" | "pay_on_arrival" | "pending";
}

/**
 * Purchase a driving package
 * - Validates essential contact details (Email and Phone most important)
 * - Stores order in Firestore with genuine doc.id
 * - Dispatches and logs confirmation email via /lib/email
 */
export async function purchasePackageAction(
  data: PurchasePackagePayload
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    if (!data.email?.trim() || !data.phone?.trim()) {
      return { success: false, error: "Email address and contact phone number are required." };
    }
    if (!data.firstName?.trim() || !data.lastName?.trim()) {
      return { success: false, error: "First and last name are required." };
    }

    const docRef = db.collection("package_orders").doc(); // Genuine Firebase doc.id
    const now = new Date().toISOString();
    const customerFullName = `${data.firstName.trim()} ${data.lastName.trim()}`;

    const orderData = {
      orderId: docRef.id,
      packageId: data.packageId,
      packageName: data.packageName,
      packagePrice: data.packagePrice,
      numericPrice: Number(data.numericPrice) || 0,
      duration: data.duration || "Standard",
      lessonsCount: data.lessonsCount || 1,
      customerName: customerFullName,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      street: data.street || "",
      city: data.city || "Surrey",
      postCode: data.postCode || "",
      licenseNumber: data.licenseNumber || "",
      licenseClass: data.licenseClass || "Class 7L",
      preferredStartDate: data.preferredStartDate || "",
      additionalNotes: data.additionalNotes || "",
      paymentMethod: data.paymentMethod || "card",
      paymentStatus: data.paymentStatus || "paid",
      createdAt: now,
    };

    await docRef.set(orderData);

    // Generate and log confirmation email using /lib/email
    const emailTemplate = generatePackagePurchaseEmail({
      orderId: docRef.id,
      customerName: customerFullName,
      email: data.email.trim(),
      phone: data.phone.trim(),
      packageName: data.packageName,
      packagePrice: data.packagePrice,
      lessonsCount: data.lessonsCount,
      duration: data.duration,
      purchasedAt: now,
      paymentMethod: data.paymentMethod,
    });

    logConfirmationEmail({
      type: "PACKAGE_PURCHASE",
      to: data.email.trim(),
      subject: emailTemplate.subject,
      body: emailTemplate.body,
    });

    await revalidatePaths(["/", "/packages", "/admin/bookings"]);
    return { success: true, orderId: docRef.id };
  } catch (error: any) {
    console.error("purchasePackageAction error:", error);
    return { success: false, error: error?.message || "Failed to process package purchase." };
  }
}
