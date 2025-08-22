"use server";
import { ID, Query } from "node-appwrite";
import {
  APPOINTMENT_COLLECTION_ID,
  DATABASE_ID,
  databases,
  messaging
} from "../appwrite.config";
import { formatDateTime, parseStringify } from "../utils";
import { Appointment } from "@/types/appwrite.types";
import { revalidatePath } from "next/cache";

export const createAppointment = async (
  appointment: CreateAppointmentParams
) => {
  try {
    if (!databases) {
      throw new Error("Databases service is not available.");
    }
    const newAppointment = await databases.createDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      ID.unique(),
      {
        ...appointment,
        status: "pending" // Explicitly set initial status
      }
    );

    // 👈 ADD THIS: Revalidate dashboard after creating appointment
    revalidatePath('/admin');
    revalidatePath('/');

    return parseStringify(newAppointment);
  } catch (error) {
    console.error("Create appointment error:", error);
    throw error; // Re-throw to handle in form
  }
};

export const getAppointment = async (appointmentId: string) => {
  try {
    if (!databases) {
      throw new Error("Databases service is not available.");
    }
    const appointment = await databases.getDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId
    );

    return parseStringify(appointment);
  } catch (error) {
    console.error("Get appointment error:", error);
    throw error;
  }
};

export const getRecentAppointmentList = async () => {
  try {
    if (!databases) {
      throw new Error("Databases service is not available.");
    }
    
    console.log("Fetching appointments from:", { DATABASE_ID, APPOINTMENT_COLLECTION_ID });
    
    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [Query.orderDesc("$createdAt")]
    );

    console.log("Raw appointments:", appointments.documents.length);

    const initialCounts = {
      scheduledCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
    };

    const counts = (appointments.documents as Appointment[]).reduce(
      (acc, appointment) => {
        console.log("Appointment status:", appointment.status); // Debug status values
        
        if (appointment.status === "scheduled") {
          acc.scheduledCount += 1;
        } else if (appointment.status === "pending") {
          acc.pendingCount += 1;
        } else if (appointment.status === "cancelled") {
          acc.cancelledCount += 1;
        }
        return acc;
      },
      initialCounts
    );

    const data = {
      totalCount: appointments.total,
      ...counts,
      documents: appointments.documents as Appointment[],
    };

    console.log("Final counts:", counts);
    return parseStringify(data);
  } catch (error) {
    console.error("Get appointments error:", error);
    // Return empty data instead of undefined
    return parseStringify({
      totalCount: 0,
      scheduledCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
      documents: []
    });
  }
};

export const updateAppointment = async ({
  appointmentId,
  userId,
  appointment,
  type,
}: UpdateAppointmentParams) => {
  try {
    if (!databases) {
      throw new Error("Databases service is not available.");
    }

    // 👈 FIX: Explicitly set the status based on type
    const appointmentData = {
      ...appointment,
      status: type === 'schedule' ? 'scheduled' : 'cancelled'
    };

    console.log("Updating appointment:", { appointmentId, type, status: appointmentData.status });

    const updatedAppointment = await databases.updateDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      appointmentData
    );

    if (!updatedAppointment) {
      throw new Error('Appointment not found');
    }

    const smsMessage = `Hi, it's IzzyCare.

${type === 'schedule'
  ? `Your appointment has been scheduled for ${formatDateTime(appointment.schedule!).dateTime} with Dr. ${appointment.primaryPhysician}.`
  : `We regret to inform you that your appointment has been cancelled for the following reason: ${appointment.cancellationReason}.`
}`;

    // Send SMS notification
    if (messaging) {
      try {
        await messaging.createSms(
          ID.unique(),
          smsMessage,
          [],
          [userId]
        );
      } catch (smsError) {
        console.error("SMS sending failed:", smsError);
        // Don't fail the entire operation if SMS fails
      }
    }

    // Revalidate both admin and main pages
    revalidatePath('/admin');
    revalidatePath('/');
    
    return parseStringify(updatedAppointment);
  } catch (error) {
    console.error("Update appointment error:", error);
    throw error;
  }
};

export const sendSMSNotification = async (userId: string, content: string) => {
  try {
    if (!messaging) {
      throw new Error("Messaging service is not available.");
    }
    const message = await messaging.createSms(
      ID.unique(),
      content,
      [],
      [userId]
    );
    return parseStringify(message);
  } catch (error) {
    console.error("SMS notification error:", error);
    throw error;
  }
}