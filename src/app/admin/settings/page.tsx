"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField, inputClass } from "@/components/admin/AdminForm";

type SettingsTab = "general" | "marketing" | "smtp" | "seo";

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "general", label: "General" },
  { id: "marketing", label: "Marketing" },
  { id: "smtp", label: "SMTP" },
  { id: "seo", label: "SEO" },
];

const EMPTY_FORM = {
  siteName: "",
  tagline: "",
  aboutTitle: "",
  aboutContent: "",
  aboutMission: "",
  aboutVision: "",
  contactEmail: "",
  contactPhone: "",
  contactAddress: "",
  socialLinkedin: "",
  socialYoutube: "",
  socialTwitter: "",
  socialInstagram: "",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  smtpHost: "",
  smtpPort: "587",
  smtpUser: "",
  smtpPass: "",
  smtpFromEmail: "",
  smtpFromName: "",
  smtpSecure: false,
  hasSmtpPass: false,
  whatsappNumber: "",
  whatsappMessage: "",
  searchSuggestionsText: "",
  blogNotifyOnPublish: false,
};

function normalizeSettingsForm(data: Record<string, unknown>) {
  const str = (key: keyof typeof EMPTY_FORM) => {
    const value = data[key];
    return value == null ? "" : String(value);
  };

  return {
    ...EMPTY_FORM,
    siteName: str("siteName"),
    tagline: str("tagline"),
    aboutTitle: str("aboutTitle"),
    aboutContent: str("aboutContent"),
    aboutMission: str("aboutMission"),
    aboutVision: str("aboutVision"),
    contactEmail: str("contactEmail"),
    contactPhone: str("contactPhone"),
    contactAddress: str("contactAddress"),
    socialLinkedin: str("socialLinkedin"),
    socialYoutube: str("socialYoutube"),
    socialTwitter: str("socialTwitter"),
    socialInstagram: str("socialInstagram"),
    seoTitle: str("seoTitle"),
    seoDescription: str("seoDescription"),
    seoKeywords: str("seoKeywords"),
    smtpHost: str("smtpHost"),
    smtpPort: String(data.smtpPort ?? 587),
    smtpUser: str("smtpUser"),
    smtpPass: "",
    smtpFromEmail: str("smtpFromEmail"),
    smtpFromName: str("smtpFromName"),
    smtpSecure: Boolean(data.smtpSecure),
    hasSmtpPass: Boolean(data.hasSmtpPass),
    whatsappNumber: str("whatsappNumber"),
    whatsappMessage: str("whatsappMessage"),
    searchSuggestionsText: Array.isArray(data.searchSuggestions)
      ? (data.searchSuggestions as string[]).join("\n")
      : "",
    blogNotifyOnPublish: Boolean(data.blogNotifyOnPublish),
  };
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [smtpTesting, setSmtpTesting] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => r.json()).then((data) => {
      if (data && !data.error) {
        setForm(normalizeSettingsForm(data));
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSmtpTestResult(null);
    const payload = {
      ...form,
      smtpPort: parseInt(form.smtpPort, 10) || 587,
    };
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok && !data.error) {
      setSaved(true);
      setForm(normalizeSettingsForm(data));
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleTestSmtp = async () => {
    setSmtpTesting(true);
    setSmtpTestResult(null);
    const res = await fetch("/api/admin/settings/test-smtp", { method: "POST" });
    const data = await res.json();
    setSmtpTesting(false);
    setSmtpTestResult(
      res.ok
        ? { ok: true, msg: "SMTP connection successful!" }
        : { ok: false, msg: data.error || "Connection failed" }
    );
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 shrink-0">
        <h1 className="text-xl sm:text-2xl font-semibold text-brand-navy">Site Settings</h1>
        {saved && (
          <div className="bg-green-50 text-green-700 text-sm px-4 py-2 rounded-sm">
            Settings saved successfully!
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col flex-1 bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden min-h-0"
      >
        <div className="flex border-b border-gray-200 shrink-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-brand-accent text-brand-navy bg-brand-accent/10"
                  : "border-transparent text-brand-silver hover:text-brand-navy hover:bg-brand-gray/20"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          {activeTab === "general" && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-6xl">
              <section className="space-y-4">
                <h3 className="font-semibold text-brand-navy text-base border-b border-gray-100 pb-2">
                  General
                </h3>
                <FormField label="Site Name">
                  <input className={inputClass} value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} />
                </FormField>
                <FormField label="Tagline">
                  <input className={inputClass} value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
                </FormField>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-brand-navy text-base border-b border-gray-100 pb-2">
                  Contact
                </h3>
                <FormField label="Email">
                  <input className={inputClass} value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
                </FormField>
                <FormField label="Phone">
                  <input className={inputClass} value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
                </FormField>
                <FormField label="Address">
                  <textarea className={inputClass} rows={3} value={form.contactAddress} onChange={(e) => setForm({ ...form, contactAddress: e.target.value })} />
                </FormField>
              </section>

              <section className="space-y-4 xl:col-span-2">
                <h3 className="font-semibold text-brand-navy text-base border-b border-gray-100 pb-2">
                  About Page
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <FormField label="About Title">
                    <input className={inputClass} value={form.aboutTitle} onChange={(e) => setForm({ ...form, aboutTitle: e.target.value })} />
                  </FormField>
                  <div className="hidden lg:block" />
                  <div className="lg:col-span-2">
                    <FormField label="About Content">
                      <textarea className={inputClass} rows={4} value={form.aboutContent} onChange={(e) => setForm({ ...form, aboutContent: e.target.value })} />
                    </FormField>
                  </div>
                  <FormField label="Mission">
                    <textarea className={inputClass} rows={3} value={form.aboutMission} onChange={(e) => setForm({ ...form, aboutMission: e.target.value })} />
                  </FormField>
                  <FormField label="Vision">
                    <textarea className={inputClass} rows={3} value={form.aboutVision} onChange={(e) => setForm({ ...form, aboutVision: e.target.value })} />
                  </FormField>
                </div>
              </section>
            </div>
          )}

          {activeTab === "marketing" && (
            <div className="max-w-2xl space-y-6">
              <section className="space-y-4">
                <h3 className="font-semibold text-brand-navy text-base border-b border-gray-100 pb-2">WhatsApp</h3>
                <FormField label="WhatsApp Number">
                  <input
                    className={inputClass}
                    placeholder="+91 98765 43210"
                    value={form.whatsappNumber}
                    onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                  />
                  <p className="text-xs text-brand-silver mt-1">Include country code. Shows a floating chat button on the site.</p>
                </FormField>
                <FormField label="Default Message">
                  <input
                    className={inputClass}
                    value={form.whatsappMessage}
                    onChange={(e) => setForm({ ...form, whatsappMessage: e.target.value })}
                  />
                </FormField>
              </section>
              <section className="space-y-4">
                <h3 className="font-semibold text-brand-navy text-base border-b border-gray-100 pb-2">Search</h3>
                <FormField label="Recommended Search Terms (one per line)">
                  <textarea
                    className={inputClass}
                    rows={5}
                    value={form.searchSuggestionsText}
                    onChange={(e) => setForm({ ...form, searchSuggestionsText: e.target.value })}
                  />
                </FormField>
              </section>
              <section className="space-y-4">
                <h3 className="font-semibold text-brand-navy text-base border-b border-gray-100 pb-2">Blog Notifications</h3>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.blogNotifyOnPublish}
                    onChange={(e) => setForm({ ...form, blogNotifyOnPublish: e.target.checked })}
                  />
                  Email newsletter subscribers when a blog or news post is published
                </label>
              </section>
            </div>
          )}

          {activeTab === "smtp" && (
            <div className="max-w-2xl space-y-4">
              <div>
                <h3 className="font-semibold text-brand-navy text-base mb-1">SMTP Mail Settings</h3>
                <p className="text-sm text-brand-silver">
                  Configure SMTP to send inquiry reply emails from the admin panel.
                </p>
              </div>
              <FormField label="SMTP Host">
                <input className={inputClass} placeholder="smtp.gmail.com" value={form.smtpHost} onChange={(e) => setForm({ ...form, smtpHost: e.target.value })} />
                <p className="text-xs text-brand-silver mt-1">Gmail: use <span className="font-mono">smtp.gmail.com</span>, port 587, SSL off, App Password.</p>
                {form.smtpHost.trim().toLowerCase() === "smtp.google.com" && (
                  <p className="text-xs text-amber-700 mt-1">Use <span className="font-mono">smtp.gmail.com</span> instead of smtp.google.com.</p>
                )}
              </FormField>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="SMTP Port">
                  <input className={inputClass} type="number" value={form.smtpPort} onChange={(e) => setForm({ ...form, smtpPort: e.target.value })} />
                </FormField>
                <FormField label="Use SSL/TLS (port 465)">
                  <label className="flex items-center gap-2 mt-2 h-[38px]">
                    <input
                      type="checkbox"
                      checked={form.smtpSecure}
                      onChange={(e) => setForm({ ...form, smtpSecure: e.target.checked })}
                    />
                    <span className="text-sm text-brand-dark">Enable secure connection</span>
                  </label>
                </FormField>
              </div>
              <FormField label="SMTP Username">
                <input className={inputClass} value={form.smtpUser} onChange={(e) => setForm({ ...form, smtpUser: e.target.value })} />
              </FormField>
              <FormField label="SMTP Password">
                <input
                  className={inputClass}
                  type="password"
                  placeholder={form.hasSmtpPass ? "•••••••• (leave blank to keep current)" : "Enter password"}
                  value={form.smtpPass}
                  onChange={(e) => setForm({ ...form, smtpPass: e.target.value })}
                />
              </FormField>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="From Email">
                  <input className={inputClass} placeholder="noreply@dentium.in" value={form.smtpFromEmail} onChange={(e) => setForm({ ...form, smtpFromEmail: e.target.value })} />
                </FormField>
                <FormField label="From Name">
                  <input className={inputClass} placeholder="Dentium India" value={form.smtpFromName} onChange={(e) => setForm({ ...form, smtpFromName: e.target.value })} />
                </FormField>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={handleTestSmtp} disabled={smtpTesting}>
                  {smtpTesting ? "Testing..." : "Test Connection"}
                </Button>
                {smtpTestResult && (
                  <span className={`text-sm ${smtpTestResult.ok ? "text-green-700" : "text-red-600"}`}>
                    {smtpTestResult.msg}
                  </span>
                )}
              </div>
            </div>
          )}

          {activeTab === "seo" && (
            <div className="max-w-2xl space-y-4">
              <div>
                <h3 className="font-semibold text-brand-navy text-base mb-1">Search Engine Optimization</h3>
                <p className="text-sm text-brand-silver">
                  Default meta tags used across the site when page-specific SEO is not set.
                </p>
              </div>
              <FormField label="SEO Title">
                <input className={inputClass} value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
              </FormField>
              <FormField label="SEO Description">
                <textarea className={inputClass} rows={3} value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} />
              </FormField>
              <FormField label="SEO Keywords">
                <input className={inputClass} placeholder="dental implant, dentium, india" value={form.seoKeywords} onChange={(e) => setForm({ ...form, seoKeywords: e.target.value })} />
              </FormField>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-gray-200 px-6 lg:px-8 py-4 bg-brand-gray/20">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
