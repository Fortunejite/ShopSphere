'use client'

import { PageLoading } from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/hooks/redux.hook";
import axios from "axios";
import { AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { notFound, usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const shop = useAppSelector((s) => s.shop.shop);

  if (status === 'loading') {
    return <PageLoading text="Loading dashboard..." variant="dots" />;
  } else if(status === 'unauthenticated') {
    return router.push('/login?next=' + encodeURIComponent(pathname));
  }
  if (!shop || !data || data.user.id !== shop.owner_id) {
    notFound();
  }

  const handleConnectAccount = async  () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/shops/${shop.domain}/stripe/genetate-acount-link`);
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error connecting Stripe account:", error);
      setLoading(false);
    }
  }

  if (!shop?.stripe_account_connected) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full bg-white p-8 rounded-lg shadow text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Stripe Account Not Connected</h2>
            <p className="text-gray-600 mb-6">
              To access the admin dashboard, please connect your Stripe account.
            </p>
            <Button onClick={handleConnectAccount} disabled={loading}>
              {loading ? 'Redirecting...' : 'Connect Stripe Account'}
            </Button>
          </div>
        </div>
      </div>
    );
  }
  return children;
}
