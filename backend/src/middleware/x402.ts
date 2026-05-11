import { Request, Response, NextFunction } from "express";
import { verify, settle } from "x402/verify";
import type { PaymentPayload, PaymentRequirements } from "x402/types";

type VerifyFn = typeof verify;
type SettleFn = typeof settle;

// Solana address that will receive payments
const PAYMENT_RECEIVER = process.env.PAYMENT_RECEIVER_ADDRESS;

// Price per API call in USDC atomic units (1 USDC = 1_000_000)
const PRICE_PER_QUERY = process.env.PRICE_PER_QUERY_ATOMIC || "10000"; // default 0.01 USDC

// USDC token mint address on Solana mainnet
const USDC_MINT = "82jDjbxnyCbXBddKuhorjEuKsXXVNyFsdzqn9g5uUXCP";

let verifyPayment: VerifyFn = verify;
let settlePayment: SettleFn = settle;

export function __setX402TestHooks(hooks: Partial<{ verify: VerifyFn; settle: SettleFn }>): void {
  if (hooks.verify) verifyPayment = hooks.verify;
  if (hooks.settle) settlePayment = hooks.settle;
}

export function __resetX402TestHooks(): void {
  verifyPayment = verify;
  settlePayment = settle;
}

export function isX402Configured(): boolean {
  return Boolean(PAYMENT_RECEIVER);
}

/**
 * Builds the payment requirements object for a given request URL.
 */
function buildPaymentRequirements(resource: string): PaymentRequirements {
  if (!PAYMENT_RECEIVER) {
    throw new Error("x402 payment receiver is not configured");
  }

  return {
    scheme: "exact",
    network: "solana",
    maxAmountRequired: PRICE_PER_QUERY,
    resource,
    description: "CredLayer — Wallet Trust Score Query",
    mimeType: "application/json",
    payTo: PAYMENT_RECEIVER,
    maxTimeoutSeconds: 300,
    asset: USDC_MINT,
  } as PaymentRequirements;
}

/**
 * Express middleware that enforces x402 payment before allowing access.
 *
 * - If the X-PAYMENT header is present, it verifies and settles the payment.
 * - If absent or invalid, responds with HTTP 402 and payment requirements.
 */
export async function x402Middleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!isX402Configured()) {
    res.status(503).json({
      error: "Premium service unavailable",
      reason: "x402 is not configured on this server",
    });
    return;
  }

  const paymentHeader = req.headers["x-payment"] as string | undefined;

  const resource = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  const paymentRequirements = buildPaymentRequirements(resource);

  // No payment header — return 402 with requirements
  if (!paymentHeader) {
    res.status(402).json({
      error: "Payment Required",
      paymentRequirements,
    });
    return;
  }

  try {
    // Decode base64-encoded payment payload
    const payloadJson = Buffer.from(paymentHeader, "base64").toString("utf-8");
    const payload: PaymentPayload = JSON.parse(payloadJson);

    // Verify payment with the x402 facilitator
    const verifyResult = await verifyPayment(payload, paymentRequirements);

    if (!verifyResult.isValid) {
      res.status(402).json({
        error: "Invalid payment",
        reason: verifyResult.invalidReason,
        paymentRequirements,
      });
      return;
    }

    // Settle the payment on-chain
    await settlePayment(payload, paymentRequirements);

    next();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Payment processing failed";
    res.status(402).json({
      error: "Payment error",
      reason: message,
      paymentRequirements,
    });
  }
}
