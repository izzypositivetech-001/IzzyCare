"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/form";
import CustomFormField from "../CustomFormField";
import SubmitButton from "../ui/SubmitButton";
import { useState } from "react";
import { getAppointmentSchema } from "@/lib/validation";
import { useRouter } from "next/navigation";
import { FormFieldType } from "./PatientForm";
import { Doctors } from "@/constants";
import Image from "next/image";
import { SelectItem } from "../ui/select";
import { createAppointment, updateAppointment } from "@/lib/actions/appointment.actions";
import { Appointment } from "@/types/appwrite.types";

// Add Status type definition (if not already imported)
type Status = "pending" | "scheduled" | "cancelled";

const AppointmentForm = ({
  userId,
  patientId,
  type,
  appointment,
  setOpen
}: {
  userId: string;
  patientId: string;
  type: "create" | "cancel" | "schedule";
  appointment?: Appointment;
  setOpen?: (open: boolean) => void; // Made optional since it's not always passed
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const AppointmentFormValidation = getAppointmentSchema(type);

  const form = useForm<z.infer<typeof AppointmentFormValidation>>({
    resolver: zodResolver(AppointmentFormValidation),
    defaultValues: {
      primaryPhysician: appointment ? appointment.primaryPhysician : "",
      schedule: appointment ? new Date(appointment.schedule) : new Date(),
      reason: appointment ? appointment.reason : "",
      note: appointment ? appointment.note : "",
      cancellationReason: appointment ? appointment.cancellationReason ?? "" : "",
    },
  });

  async function onSubmit(values: z.infer<typeof AppointmentFormValidation>) {
    setIsLoading(true);
    let status: Status;
    
    switch (type) {
      case 'schedule':
        status = 'scheduled';  
        break;
      case 'cancel':
        status = 'cancelled';
        break;
      default:
        status = "pending";
        break;
    }

    try {
      if (type === 'create' && patientId) {
        const appointmentData = {
          userId,
          patient: patientId,
          primaryPhysician: values.primaryPhysician,
          schedule: new Date(values.schedule),
          reason: values.reason!,
          note: values.note,
          status: status,
        };

        const appointment = await createAppointment(appointmentData);
        if (appointment) {
          form.reset();
          router.push(`/patients/${userId}/new-appointment/success?appointmentId=${appointment.$id}`);
        }
      } else {
        const appointmentToUpdate = {
          userId,
          appointmentId: appointment?.$id!,
          appointment: {
            primaryPhysician: values?.primaryPhysician,
            schedule: new Date(values?.schedule),
            status: status,
            cancellationReason: values?.cancellationReason,
          },
          type
        };

        const updatedAppointment = await updateAppointment(appointmentToUpdate);
        if (updatedAppointment) {
          setOpen && setOpen(false);
          form.reset();
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  let buttonLabel: string;

  switch (type) {
    case 'cancel':
      buttonLabel = 'Cancel Appointment';
      break;
    case 'create':
      buttonLabel = 'Create Appointment';
      break;
    case 'schedule':
      buttonLabel = 'Schedule Appointment';
      break;
    default:
      buttonLabel = 'Submit';
      break;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
        {type === 'create' && (
          <section className="mb-12 space-y-4">
            <h1 className="header">New Appointment</h1>
            <p className="text-dark-700">Request A New Appointment</p>
          </section>
        )}

        {type !== "cancel" && (
          <>
            <CustomFormField
              fieldType={FormFieldType.SELECT}
              control={form.control}
              name="primaryPhysician"
              label="Doctor"
              placeholder="Select a doctor"
            >
              {Doctors.map((doctor) => (
                <SelectItem key={doctor.name} value={doctor.name}>
                  <div className="flex cursor-pointer items-center gap-2">
                    <Image
                      src={doctor.image}
                      alt={doctor.name}
                      width={32}
                      height={32}
                      className="rounded-full border border-dark-500"
                    />
                    <p>{doctor.name}</p>
                  </div>
                </SelectItem>
              ))}
            </CustomFormField>
            
            <CustomFormField
              fieldType={FormFieldType.DATE_PICKER}
              control={form.control}
              name="schedule"
              label="Expected appointment date"
              showTimeSelect
              dateFormat="MM/dd/yyyy - h:mm aa"
            />

            <div className="flex flex-col gap-6 xl:flex-row">
              <CustomFormField
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                label="Reason for appointment"
                name="reason"
                placeholder="Enter reason for appointment"
              />
              <CustomFormField
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                label="Notes"
                name="note"
                placeholder="Enter notes"
              />
            </div>
          </>
        )}

        {type === "cancel" && (
          <CustomFormField
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            label="Reason for cancellation"
            name="cancellationReason"
            placeholder="Enter reason for cancellation"
          />
        )}

        <SubmitButton 
          isLoading={isLoading}
          className={`${type === 'cancel' ? 'shad-danger-btn' : 'shad-primary-btn'} w-full`}
        >
          {buttonLabel}
        </SubmitButton>
      </form>
    </Form>
  );
};

export default AppointmentForm;