import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!privateKey) {
  throw new Error("FIREBASE_PRIVATE_KEY is missing");
}

const admin =
  getApps().length > 0
    ? getApp()
    : initializeApp({
        credential: cert({
          projectId: "fourseasonsdrivingschool-7541c",
          clientEmail:
            "firebase-adminsdk-fbsvc@fourseasonsdrivingschool-7541c.iam.gserviceaccount.com",
          privateKey,
        }),
      });

export default admin;
