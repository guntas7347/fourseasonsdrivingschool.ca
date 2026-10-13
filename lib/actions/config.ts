"use server";

import { db } from "@/lib/firebase/firebase";
import { revalidatePaths } from "@/lib/revalidatePath";

export interface AuthConfig {
  allowedGmails: string[];
  updatedAt?: string;
}

const DEFAULT_ALLOWED_GMAILS = [
  "admin@fourseasonsdrivingschool.ca",
  "guntas7347@gmail.com",
];

/**
 * Fetch the admin auth configuration from Firestore
 */
export async function getAuthConfigAction(): Promise<AuthConfig> {
  try {
    const docRef = db.collection("settings").doc("auth_config");
    const doc = await docRef.get();

    if (!doc.exists) {
      // Seed default allowed emails
      const initial: AuthConfig = {
        allowedGmails: DEFAULT_ALLOWED_GMAILS,
        updatedAt: new Date().toISOString(),
      };
      await docRef.set(initial);
      return initial;
    }

    const data = doc.data()!;
    const list = Array.isArray(data.allowedGmails)
      ? data.allowedGmails.map((e: string) => String(e).trim().toLowerCase())
      : DEFAULT_ALLOWED_GMAILS;

    return {
      allowedGmails: list,
      updatedAt: data.updatedAt,
    };
  } catch (error) {
    console.error("getAuthConfigAction error:", error);
    return {
      allowedGmails: DEFAULT_ALLOWED_GMAILS,
    };
  }
}

/**
 * Check if a specific Gmail is authorized to access the admin portal
 */
export async function checkIsEmailAuthorizedAction(
  email?: string | null,
): Promise<{ authorized: boolean; reason?: string }> {
  try {
    if (!email) {
      return { authorized: false, reason: "No email address provided." };
    }

    const config = await getAuthConfigAction();
    const normalized = email.trim().toLowerCase();

    // If allowed list is empty, default allow or warn
    if (!config.allowedGmails || config.allowedGmails.length === 0) {
      return { authorized: true };
    }

    const isMatch = config.allowedGmails.includes(normalized);
    if (!isMatch) {
      return {
        authorized: false,
        reason: `Email "${normalized}" is not authorized. Allowed admins: ${config.allowedGmails.join(", ")}`,
      };
    }

    return { authorized: true };
  } catch (err: any) {
    console.error("checkIsEmailAuthorizedAction error:", err);
    return { authorized: false, reason: "Error verifying admin privileges." };
  }
}

/**
 * Add a new allowed Gmail address
 */
export async function addAllowedGmailAction(
  newEmail: string,
): Promise<{ success: boolean; allowedGmails?: string[]; error?: string }> {
  try {
    const normalized = newEmail.trim().toLowerCase();
    if (!normalized || !normalized.includes("@")) {
      return { success: false, error: "Please enter a valid email address." };
    }

    const config = await getAuthConfigAction();
    const currentList = config.allowedGmails || [];

    if (currentList.includes(normalized)) {
      return { success: false, error: "This email is already authorized." };
    }

    const updatedList = [...currentList, normalized];
    const docRef = db.collection("settings").doc("auth_config");
    await docRef.set(
      {
        allowedGmails: updatedList,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    await revalidatePaths(["/admin/config"]);
    return { success: true, allowedGmails: updatedList };
  } catch (error: any) {
    console.error("addAllowedGmailAction error:", error);
    return { success: false, error: error?.message || "Failed to add email" };
  }
}

/**
 * Remove an allowed Gmail address
 */
export async function removeAllowedGmailAction(
  emailToRemove: string,
): Promise<{ success: boolean; allowedGmails?: string[]; error?: string }> {
  try {
    const normalized = emailToRemove.trim().toLowerCase();
    const config = await getAuthConfigAction();
    const currentList = config.allowedGmails || [];

    if (currentList.length <= 1) {
      return {
        success: false,
        error:
          "Cannot remove the only authorized email. At least one admin email must remain.",
      };
    }

    const updatedList = currentList.filter((e) => e !== normalized);
    const docRef = db.collection("settings").doc("auth_config");
    await docRef.set(
      {
        allowedGmails: updatedList,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    await revalidatePaths(["/admin/config"]);
    return { success: true, allowedGmails: updatedList };
  } catch (error: any) {
    console.error("removeAllowedGmailAction error:", error);
    return {
      success: false,
      error: error?.message || "Failed to remove email",
    };
  }
}
