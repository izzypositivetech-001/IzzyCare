import AppointmentForm from '@/components/forms/AppointmentForm';
import { getPatient } from '@/lib/actions/patient.actions';
import Image from 'next/image';
import React from 'react';

// Define the SearchParamProps type if not already defined
type SearchParamProps = {
  params: { userId: string };
};

export default async function NewAppointment({ 
  params: { userId } 
}: SearchParamProps) {
  const patient = await getPatient(userId);

  return (
    <div className="flex h-screen max-h-screen">
      <section className="remove-scrollbar container my-auto">
        <div className="sub-container max-w-[860px] flex-1 justify-between">
          <Image
            src="/assets/icons/logo-full.svg"
            alt="logo"
            height={1000}
            width={1000}
            className="mb-12 h-10 w-fit"
          />

          <AppointmentForm
            type="create"
            userId={userId}
            patientId={patient.$id}
          />

          <p className="copyright mt-10 py-12">
            © 2025 IzzyCare
          </p>
        </div>
      </section>

      <Image
        src="/assets/images/appointment-img.png"
        height={1000}
        width={1000}
        alt="appointment"
        className="side-img max-w-[390px] bg-bottom"
      />
    </div>
  );
}