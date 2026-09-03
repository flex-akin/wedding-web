import { Schema, model, InferSchemaType } from "mongoose";

export const GENDER_TARGETS: Record<"M" | "F", number> = {
  M: 45000,
  F: 40000,
};

const asoebiPaymentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    gender: { type: String, enum: ["M", "F", null], default: null },
    targetAmount: { type: Number, default: 0 },
    guestId: { type: Schema.Types.ObjectId, ref: "Guest" },
  },
  { timestamps: true }
);

export type AsoebiPayment = InferSchemaType<typeof asoebiPaymentSchema>;
export const AsoebiPaymentModel = model("AsoebiPayment", asoebiPaymentSchema);
