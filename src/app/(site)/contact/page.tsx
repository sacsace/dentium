"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { SITE, INDIA_OFFICES } from "@/lib/site-config";
import { OfficeLocationsCarousel } from "@/components/contact/OfficeLocationsCarousel";

export default function ContactPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "general";
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, type }),
      });
      if (res.ok) setSubmitted(true);
      else alert("Failed to send message. Please try again.");
    } catch {
      alert("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const titles: Record<string, string> = {
    general: "Contact Us",
    careers: "Join Our Team",
    partnership: "Partnership Inquiry",
  };

  return (
    <>
      <PageHeader
        title={titles[type] || "Contact Us"}
        subtitle="Get in Touch"
        description="We're here to support you. Reach out for product information, partnerships, or careers."
      />

      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-brand-light rounded-sm">
                  <MapPin className="w-5 h-5 text-brand-deep" />
                </div>
                <div>
                  <h4 className="font-semibold text-brand-navy mb-1">Head Office</h4>
                  <p className="text-brand-silver text-sm">{INDIA_OFFICES[0].address}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-brand-light rounded-sm">
                  <Phone className="w-5 h-5 text-brand-deep" />
                </div>
                <div>
                  <h4 className="font-semibold text-brand-navy mb-1">Phone</h4>
                  <p className="text-brand-silver text-sm">{SITE.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-brand-light rounded-sm">
                  <Mail className="w-5 h-5 text-brand-deep" />
                </div>
                <div>
                  <h4 className="font-semibold text-brand-navy mb-1">Email</h4>
                  <p className="text-brand-silver text-sm">{SITE.email}</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              {submitted ? (
                <div className="bg-brand-light p-10 rounded-sm text-center">
                  <h3 className="font-display text-2xl text-brand-navy mb-2">Message Sent!</h3>
                  <p className="text-brand-silver">Thank you for reaching out. Our team will respond shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-brand-gray p-8 rounded-sm space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      required
                      placeholder="Full Name *"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="px-4 py-3 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-brand-deep bg-white"
                    />
                    <input
                      required
                      type="email"
                      placeholder="Email *"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="px-4 py-3 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-brand-deep bg-white"
                    />
                    <input
                      placeholder="Phone"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="px-4 py-3 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-brand-deep bg-white"
                    />
                    <input
                      placeholder="Company / Clinic"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className="px-4 py-3 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-brand-deep bg-white"
                    />
                  </div>
                  <input
                    placeholder="Subject"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-brand-deep bg-white"
                  />
                  <textarea
                    required
                    placeholder="Your Message *"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-brand-deep bg-white resize-none"
                  />
                  <Button type="submit" disabled={submitting}>
                    <Send className="w-4 h-4" />
                    {submitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <OfficeLocationsCarousel offices={INDIA_OFFICES} />
    </>
  );
}
