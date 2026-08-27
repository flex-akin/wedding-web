import axios from "axios";
import { env } from "../config/env";

const client = axios.create({
  baseURL: "https://api.paystack.co",
  headers: { Authorization: `Bearer ${env.paystackSecretKey}` },
});

export interface InitializeResult {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export async function initializeTransaction(params: {
  email: string;
  amountKobo: number;
  reference: string;
}): Promise<InitializeResult> {
  const { data } = await client.post("/transaction/initialize", {
    email: params.email,
    amount: params.amountKobo,
    reference: params.reference,
  });
  return {
    authorizationUrl: data.data.authorization_url,
    accessCode: data.data.access_code,
    reference: data.data.reference,
  };
}

export async function verifyTransaction(reference: string): Promise<{ paid: boolean }> {
  const { data } = await client.get(`/transaction/verify/${encodeURIComponent(reference)}`);
  return { paid: data.data.status === "success" };
}
