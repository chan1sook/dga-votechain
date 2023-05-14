import { initializeApp, cert } from "firebase-admin/app";
import serviceAccount from "~/firebase-admin-config.json";

export function initFirebase() {
  const app = initializeApp({
    credential: cert(serviceAccount),
    databaseURL: "https://logisensesdns-default-rtdb.firebaseio.com"
  });
  return { app };
}