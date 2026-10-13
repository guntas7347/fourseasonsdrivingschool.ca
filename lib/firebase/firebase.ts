import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!privateKey) {
  throw new Error("FIREBASE_PRIVATE_KEY is missing");
}

const admin =
  getApps()[0] ??
  initializeApp({
    credential: cert({
      projectId: "fourseasonsdrivingschool-7541c",
      clientEmail:
        "firebase-adminsdk-fbsvc@fourseasonsdrivingschool-7541c.iam.gserviceaccount.com",
      privateKey,
    }),
  });

export const db = getFirestore(admin);
export default admin;
