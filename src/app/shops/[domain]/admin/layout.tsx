'use client'

import { PageLoading } from "@/components/Loading";
import { useAppSelector } from "@/hooks/redux.hook";
import { useSession } from "next-auth/react";
import { notFound } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data, status } = useSession();
  const shop = useAppSelector((s) => s.shop.shop);

  if (status === 'loading') {
    return <PageLoading text="Loading dashboard..." variant="dots" />;
  } else if(status === 'unauthenticated') {
    notFound();
  }
  if (!shop || !data || data.user.id !== shop.owner_id) {
    notFound();
  }
  return children;
}
