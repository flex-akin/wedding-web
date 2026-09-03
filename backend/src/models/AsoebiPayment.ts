import { Schema, model, InferSchemaType } from "mongoose";

export const GENDER_TARGETS: Record<"M" | "F", number> = {
  M: 45000,
  F: 40000,
};

// Always derive the target from gender at read time rather than storing it —
// a stored copy can drift out of sync (e.g. if gender is edited directly in
// the database rather than through the API), and there's nothing to gain
// from persisting a value that's fully determined by another field.
export function targetAmountFor(gender: "M" | "F" | null | undefined): number {
  return gender ? GENDER_TARGETS[gender] : 0;
}

const asoebiPaymentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    gender: { type: String, enum: ["M", "F", null], default: null },
    guestId: { type: Schema.Types.ObjectId, ref: "Guest" },
  },
  { timestamps: true }
);

export type AsoebiPayment = InferSchemaType<typeof asoebiPaymentSchema>;
export const AsoebiPaymentModel = model("AsoebiPayment", asoebiPaymentSchema);
