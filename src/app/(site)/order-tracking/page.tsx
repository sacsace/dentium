"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";

export default function OrderTrackingPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Please log in to your account to view order status, or contact customer care at +91 9625994598.");
  };

  return (
    <>
      <PageHeader title="Order Tracking" subtitle="Support" description="Track your Dentium order status" />
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-md">
          <form onSubmit={handleSubmit} className="bg-brand-gray p-6 rounded-sm space-y-4">
            <input
              placeholder="Order number"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-brand-deep bg-white"
            />
            <Button type="submit" className="w-full">Track Order</Button>
          </form>
          {message && <p className="text-brand-silver text-sm mt-4 text-center">{message}</p>}
          <p className="text-center text-sm text-brand-silver mt-6">
            <Link href="/auth/login" className="text-brand-deep hover:underline">Login</Link> for full order history
          </p>
        </div>
      </section>
    </>
  );
}
