export type UserProfile = {
  id: string;
  email: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  phone: string | null;
  gstin: string | null;
  dciNumber: string | null;
  panNumber: string | null;
  state: string | null;
  city: string | null;
  pincode: string | null;
};

export function isBusinessIncomplete(profile: UserProfile) {
  return !profile.company && !profile.gstin && !profile.panNumber;
}

export function isAddressIncomplete(profile: UserProfile) {
  return !profile.state || !profile.city || !profile.pincode;
}

export function isProfileSetupIncomplete(profile: UserProfile) {
  return isBusinessIncomplete(profile) || isAddressIncomplete(profile);
}
