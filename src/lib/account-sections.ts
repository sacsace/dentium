export const ACCOUNT_SECTIONS = [
  { id: "personal", label: "Personal Information", description: "Update your name, email, phone, and password." },
  { id: "company", label: "Company Information", description: "Clinic details, tax IDs, and delivery address." },
  { id: "orders", label: "Purchase History", description: "View your past orders and line items." },
  { id: "tracking", label: "Shipping Tracking", description: "Track delivery status and courier details." },
  { id: "returns", label: "Returns & Exchanges", description: "Request a return or exchange for a past order." },
  { id: "ledger", label: "Ledger Request", description: "Request GST ledger or invoice summary." },
] as const;

export type AccountSectionId = (typeof ACCOUNT_SECTIONS)[number]["id"];

export function isAccountSectionId(value: string | null | undefined): value is AccountSectionId {
  return ACCOUNT_SECTIONS.some((s) => s.id === value);
}

export function getAccountSection(id: AccountSectionId) {
  return ACCOUNT_SECTIONS.find((s) => s.id === id)!;
}
