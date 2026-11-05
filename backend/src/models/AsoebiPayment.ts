import { Schema, model, InferSchemaType } from "mongoose";

export const GENDER_TARGETS: Record<"M" | "F", number> = {
  M: 45000,
  F: 40000,
};

export const PART_PACKAGE_AMOUNT = 30000;
export const COUPLE_PACKAGE_AMOUNT = 70000;

export type PackageType = "part" | "full" | "couple";

// Always derive the target from package/gender at read time rather than
// storing it — a stored copy can drift out of sync (e.g. if gender is
// edited directly in the database rather than through the API), and
// there's nothing to gain from persisting a value that's fully
// determined by other fields.
export function targetAmountFor(payment: {
  package?: PackageType | null;
  gender?: "M" | "F" | null;
}): number {
  if (payment.package === "part") return PART_PACKAGE_AMOUNT;
  if (payment.package === "full") return payment.gender ? GENDER_TARGETS[payment.gender] : 0;
  if (payment.package === "couple") return COUPLE_PACKAGE_AMOUNT;
  return 0;
}

const asoebiPaymentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    gender: { type: String, enum: ["M", "F", null], default: null },
    package: { type: String, enum: ["part", "full", "couple", null], default: null },
    partnerId: { type: Schema.Types.ObjectId, ref: "AsoebiPayment", default: null },
    guestId: { type: Schema.Types.ObjectId, ref: "Guest" },
    clothesReceived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type AsoebiPayment = InferSchemaType<typeof asoebiPaymentSchema>;
export const AsoebiPaymentModel = model("AsoebiPayment", asoebiPaymentSchema);
