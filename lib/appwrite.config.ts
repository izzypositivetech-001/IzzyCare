import * as sdk from "node-appwrite";

export const {
  PROJECT_ID,
  API_KEY,
  DATABASE_ID,
  PATIENT_COLLECTION_ID,
  DOCTOR_COLLECTION_ID,
  APPOINTMENT_COLLECTION_ID,
  NEXT_PUBLIC_BUCKET_ID: BUCKET_ID,
  NEXT_PUBLIC_ENDPOINT: ENDPOINT,
} = process.env;

// Initialize client only if ENDPOINT and PROJECT_ID exist
const client = ENDPOINT && PROJECT_ID ? new sdk.Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY || "") // optional, won't break if undefined
  : null;

// Conditionally export services
export const databases = client ? new sdk.Databases(client) : null;
export const storage = client ? new sdk.Storage(client) : null;
export const messaging = client ? new sdk.Messaging(client) : null;
export const users = client ? new sdk.Users(client) : null;
