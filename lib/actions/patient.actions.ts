"use server";

import { ID, Query } from "node-appwrite";
import {
  DATABASE_ID,
  databases,
  ENDPOINT,
  PATIENT_COLLECTION_ID,
  PROJECT_ID,
  storage,
  users,
} from "../appwrite.config";
import { parseStringify } from "../utils";
import { InputFile } from "node-appwrite/file";

import { BUCKET_ID } from "../appwrite.config";

// ✅ Types for params
interface CreateUserParams {
  email: string;
  phone: string;
  name: string;
}

interface RegisterUserParams {
  identificationDocument?: Map<string, unknown>;
  [key: string]: unknown; // Allows extra patient fields
}

export const createUser = async (user: CreateUserParams) => {
  try {
    if (!databases) {
      throw new Error("Databases client is not initialized.");
    }
    const newPatient = await databases.createDocument(
      DATABASE_ID!,            
      PATIENT_COLLECTION_ID!,  
      ID.unique(),             
      {
        name: user.name,
        email: user.email,
        phone: user.phone,
      }
    );

    console.log("✅ New Patient Created:", newPatient);
    return newPatient;
  } catch (error) {
    console.error("❌ Error creating patient:", error);
    throw error;
  }
};

export const getUser = async (userId: string) => {
  try {
    if (!databases) {
      throw new Error("Databases client is not initialized.");
    }
    const user = await databases.getDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      userId
    );

    return user; // Already JSON serializable
  } catch (error: any) {
    console.error("❌ Error fetching patient:", error?.message || error);
    throw error;
  }
};

export const getPatient = async (userId: string) => {
  try {
    if (!databases) {
      throw new Error("Databases client is not initialized.");
    }
    const patients = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [Query.equal("userId", userId)]
    );

    return parseStringify(patients.documents[0]);
  } catch (error) {
    console.error(error);
  }
};

export const registerPatient = async ({
  identificationDocument,
  ...patient
}: RegisterUserParams) => {
  try {
    let file;

    if (identificationDocument) {
      const inputFile = InputFile.fromBuffer(
        identificationDocument.get("blobFile") as Blob,
        identificationDocument.get("fileName") as string
      );

      if (!storage) {
        throw new Error("Storage client is not initialized.");
      }
      file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
    }

    if (!databases) {
      throw new Error("Databases client is not initialized.");
    }

    const newPatient = await databases.createDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      ID.unique(),
      {
        identificationDocumentId: file?.$id || null,
        identificationDocumentUrl: file
          ? `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file.$id}/view?project=${PROJECT_ID}`
          : null,
        ...patient,
      }
    );

    return parseStringify(newPatient);
  } catch (error) {
    console.error(error);
  }
};