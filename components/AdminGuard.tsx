"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { decryptKey } from "@/lib/utils";

const ADMIN_PASSKEY = process.env.NEXT_PUBLIC_ADMIN_PASSKEY;

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const encryptedKey = localStorage.getItem("accessKey");

    if (!encryptedKey) {
      router.replace("/?admin=true"); // No key → go to modal
      return;
    }

    const accessKey = decryptKey(encryptedKey);
    if (accessKey === ADMIN_PASSKEY) {
      setAllowed(true);
    } else {
      router.replace("/?admin=true"); // Wrong key → back to modal
    }

    setLoading(false);
  }, [router]);

  if (loading) return <p className="text-center mt-20">Checking access...</p>;

  return allowed ? <>{children}</> : null;
}
