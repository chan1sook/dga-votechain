import { initializeApp, cert } from "firebase-admin/app";
import serviceAccount from "~/logisensesdns-firebase-adminsdk-j54e3-afd409c9ac.json";

export function initFirebase() {
  const app = initializeApp({
    credential: cert(serviceAccount),
    databaseURL: "https://logisensesdns-default-rtdb.firebaseio.com"
  });
  return { app };
}