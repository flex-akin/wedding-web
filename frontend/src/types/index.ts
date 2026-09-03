export interface PlusOne {
  name: string;
}

export interface Guest {
  _id: string;
  name: string;
  slug: string;
  partySize: number;
  phone?: string;
  email?: string;
  rsvpStatus: "pending" | "attending" | "declined";
  attendingCeremony: boolean;
  attendingReception: boolean;
  mealChoice?: string;
  plusOnes: PlusOne[];
  notes?: string;
  respondedAt?: string;
  createdAt: string;
}

export interface AsoEbiOrder {
  _id: string;
  guestName: string;
  contact: string;
  color: string;
  fabric: string;
  size: string;
  quantity: number;
  notes?: string;
  status: "pending" | "paid";
  paymentMethod: "manual" | "paystack";
  paystackReference?: string;
  createdAt: string;
}

export interface Photo {
  _id: string;
  url: string;
  uploadedBy?: string;
  approved: boolean;
  likedBy: string[];
  challengeTag: "groomsmen" | "bridal-team" | "parents" | null;
  createdAt: string;
}

export interface VenueInfo {
  name: string;
  address: string;
  mapsUrl: string;
  time: string;
  lat?: number;
  lng?: number;
}

export interface GiftAccount {
  label: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
}

export interface ColorOfDay {
  label: string;
  hex: string;
}

export interface ProgramEvent {
  name: string;
  time: string;
  note: string;
  colors: ColorOfDay[];
}

export type PhotoCategory = "proposal" | "throwback" | "pre-wedding";

export interface PhotoshootImage {
  url: string;
  category: PhotoCategory;
}

export interface Settings {
  partnerOneName: string;
  partnerTwoName: string;
  weddingDate?: string;
  rsvpDeadline?: string;
  heroImageUrl?: string;
  ceremony: VenueInfo;
  reception: VenueInfo;
  giftNote: string;
  giftAccounts: GiftAccount[];
  ourStory: string;
  ourStoryImageUrl?: string;
  ourStoryFromImage?: string;
  ourStoryToImage?: string;
  ourStoryPdfUrl?: string;
  programOfEvents: ProgramEvent[];
  photoshootImages: PhotoshootImage[];
}

export interface Wish {
  _id: string;
  name: string;
  message: string;
  approved: boolean;
  createdAt: string;
}

export interface GuestRequest {
  _id: string;
  name: string;
  phone: string;
  status: "pending" | "approved" | "rejected";
  guestId?: string;
  createdAt: string;
}

export interface HotelReservation {
  _id: string;
  name: string;
  contact: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  budgetPerRoom: string;
  notes?: string;
  status: "pending" | "confirmed";
  createdAt: string;
}

export interface PaymentModeInfo {
  mode: "manual" | "paystack";
  paystackPublicKey?: string;
}

export interface AsoebiPayment {
  _id: string;
  name: string;
  phone: string;
  gender: "M" | "F" | null;
  targetAmount: number;
  guestId?: string;
  createdAt: string;
}

export interface AsoebiPaymentWithTotals extends AsoebiPayment {
  confirmedTotal: number;
  pendingCount: number;
}

export interface AsoebiContribution {
  _id: string;
  paymentId: string;
  amount: number;
  receiptUrl: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface AsoebiContributionWithPayment extends AsoebiContribution {
  payment: { name: string; phone: string } | null;
}

export interface AsoebiLookupResponse {
  payment: AsoebiPayment;
  contributions: AsoebiContribution[];
  confirmedTotal: number;
}
