import { Schema, model, InferSchemaType } from "mongoose";

const asoebiContributionSchema = new Schema(
  {
    paymentId: { type: Schema.Types.ObjectId, ref: "AsoebiPayment", required: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    receiptUrl: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

export type AsoebiContribution = InferSchemaType<typeof asoebiContributionSchema>;
export const AsoebiContributionModel = model("AsoebiContribution", asoebiContributionSchema);
