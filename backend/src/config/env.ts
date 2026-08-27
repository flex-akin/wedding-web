import "dotenv/config";

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const env = {
  port: parseInt(process.env.PORT ?? "4000", 10),
  mongoUri: required("MONGO_URI", "mongodb://mongo:27017/wedding"),
  jwtSecret: required("JWT_SECRET", "dev-secret-change-me"),
  adminUsername: required("ADMIN_USERNAME", "admin"),
  adminPasswordHash: required("ADMIN_PASSWORD_HASH"),
  paymentMode: (process.env.PAYMENT_MODE === "paystack" ? "paystack" : "manual") as
    | "manual"
    | "paystack",
  paystackSecretKey: process.env.PAYSTACK_SECRET_KEY ?? "",
  paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY ?? "",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "*",
};
