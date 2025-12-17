'use client'

import { useAppSelector } from "@/hooks/redux.hook";
import { useSession } from "next-auth/react";
import { notFound } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data } = useSession();
  const shop = useAppSelector((s) => s.shop.shop);

  if (!shop || !data || data.user.id !== shop.owner_id) {
    notFound();
  }
  return children;
}
