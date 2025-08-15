"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import AppointmentForm from "./forms/AppointmentForm";
import { Appointment } from "@/types/appwrite.types";
import { updateAppointment } from "@/lib/actions/appointment.actions";

const AppointmentModal = ({
  type,
  patientId,
  userId,
  appointment,
}: {
  type: "schedule" | "cancel";
  patientId: string;
  userId: string;
  appointment?: Appointment;
}) => {
  const [open, setOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");

  const handleCancel = async () => {
    if (!appointment?.$id) return;

    await updateAppointment({
      appointmentId: appointment.$id,
      userId,
      appointment: {
        status: "cancelled",
        cancellationReason: cancellationReason.trim(),
      },
      type: "cancel",
    });

    setOpen(false);
    setCancellationReason("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className={`capitalize ${
            type === "schedule" && "text-green-500"
          } ${type === "cancel" && "text-red-500"}`}
        >
          {type}
        </Button>
      </DialogTrigger>

      <DialogContent className="shad-dialog sm:max-w-md">
        <DialogHeader className="mb-4 space-y-3">
          <DialogTitle className="capitalize">
            {type} Appointment
          </DialogTitle>
          <DialogDescription>
            {type === "schedule"
              ? `Please fill in the following details to ${type} an appointment.`
              : "Please provide a reason for cancellation. This action cannot be undone."}
          </DialogDescription>
        </DialogHeader>

        {type === "schedule" ? (
          <AppointmentForm
            userId={userId}
            patientId={patientId}
            type={type}
            appointment={appointment}
            setOpen={setOpen}
          />
        ) : (
          <div className="flex flex-col gap-4">
            <Textarea
              placeholder="Enter reason for cancellation..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setOpen(false)}>
                No
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={!cancellationReason.trim()}
                className="bg-red-700 hover:bg-red-800 text-white"
              >
                Cancel Appointment
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentModal;
