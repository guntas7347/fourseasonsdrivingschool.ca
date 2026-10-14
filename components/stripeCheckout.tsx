"use client";

import React, { useEffect, useState } from "react";
import {
  CheckoutElementsProvider,
  PaymentElement,
  useCheckout,
} from "@stripe/react-stripe-js/checkout";
import { loadStripe } from "@stripe/stripe-js";
import { markBookingPaidAction } from "@/lib/actions/bookings";
import { markPackageOrderPaidAction } from "@/lib/actions/packages";
import { createCheckoutSessionAction } from "@/lib/actions/transactions";
import {
  Lock,
  Loader2,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

interface CheckoutFormProps {
  bookingId?: string;
  type?: "slot" | "package";
  amountFormatted: string;
  onSuccess?: (sessionId: string) => void;
}

function CheckoutForm({
  bookingId,
  type = "slot",
  amountFormatted,
  onSuccess,
}: CheckoutFormProps) {
  const checkoutState = useCheckout();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isReady = checkoutState.type === "success";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (checkoutState.type !== "success") return;
    const { checkout } = checkoutState;

    try {
      setLoading(true);
      setErrorMessage(null);

      // In Stripe Checkout Elements SDK, checkout.confirm() submits details and handles redirect
      const res = await checkout.confirm();

      if (res && res.type === "error") {
        setErrorMessage(
          res.error?.message || "Payment processing failed. Please verify your payment details."
        );
        setLoading(false);
        return;
      }

      if (res && res.type === "success") {
        const sessionId = res.session.id;

        // Mark booking or package order as paid immediately if possible
        if (bookingId) {
          try {
            if (type === "package") {
              await markPackageOrderPaidAction({
                orderId: bookingId,
                paymentIntentId: sessionId,
                cardLast4: "stripe",
              });
            } else {
              await markBookingPaidAction({
                bookingId,
                paymentIntentId: sessionId,
                cardLast4: "stripe",
              });
            }
          } catch (dbErr) {
            console.warn("Could not mark as paid immediately:", dbErr);
          }
        }

        if (onSuccess) {
          onSuccess(sessionId);
        } else {
          window.location.href = `${window.location.origin}/payment-success?session_id=${sessionId}&bookingId=${bookingId || ""}&type=${type}`;
        }
      }
    } catch (err: any) {
      console.error("Stripe checkout.confirm error:", err);
      setErrorMessage(err?.message || "An unexpected error occurred during payment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {checkoutState.type === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          <span>{checkoutState.error.message}</span>
        </div>
      )}

      {/* Stripe Official Checkout Payment Element */}
      <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4">
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {/* Security notice */}
      <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>256-Bit SSL Encrypted Payment</span>
        </span>
        <span className="font-mono text-[11px] text-zinc-400">Powered by Stripe Checkout</span>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isReady || loading}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-950 py-3.5 px-4 text-sm font-bold text-white shadow-md hover:bg-zinc-800 transition active:scale-95 disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-white" />
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <Lock className="h-4 w-4 text-emerald-400" />
            <span>
              Pay {amountFormatted} &amp; Complete {type === "package" ? "Package Purchase" : "Booking"}
            </span>
          </>
        )}
      </button>
    </form>
  );
}

interface StripeCheckoutProps {
  bookingId?: string;
  type?: "slot" | "package";
  amount?: number | string;
  currency?: string;
  customerName?: string;
  customerEmail?: string;
  packageName?: string;
  onSuccess?: (sessionId: string) => void;
}

export default function StripeCheckout({
  bookingId,
  type = "slot",
  amount = 110,
  currency = "cad",
  customerName,
  customerEmail,
  packageName,
  onSuccess,
}: StripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  const numericAmount =
    typeof amount === "number"
      ? amount
      : parseFloat(String(amount).replace(/[^0-9.]/g, "")) || 110;
  const amountFormatted = `$${numericAmount.toFixed(2)} ${currency.toUpperCase()}`;

  const initializePayment = async () => {
    try {
      setLoading(true);
      setInitError(null);

      const description =
        type === "package"
          ? `Four Seasons Driving Package: ${packageName || "Driving Package"} #${bookingId || "direct"}`
          : `Four Seasons Driving Lesson Booking #${bookingId || "direct"}`;

      const res = await createCheckoutSessionAction({
        amount: numericAmount,
        currency,
        bookingId,
        type,
        customerName,
        customerEmail,
        description,
        metadata: {
          type,
          bookingId: bookingId || "",
          customerName: customerName || "",
          customerEmail: customerEmail || "",
        },
      });

      if (res.success && res.clientSecret) {
        setClientSecret(res.clientSecret);
      } else {
        setInitError(res.error || "Unable to initialize Stripe checkout session.");
      }
    } catch (err: any) {
      console.error("Payment initialization error:", err);
      setInitError(err?.message || "Failed to connect to payment gateway.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializePayment();
  }, [bookingId, numericAmount, currency, type]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-zinc-500 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-900" />
        <p className="text-xs font-semibold">Preparing secure Stripe checkout...</p>
      </div>
    );
  }

  if (initError || !clientSecret) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center space-y-3">
        <AlertCircle className="mx-auto h-8 w-8 text-red-600" />
        <p className="text-xs font-semibold text-red-800">
          {initError || "Failed to load payment form."}
        </p>
        <button
          type="button"
          onClick={initializePayment}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 transition"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  return (
    <CheckoutElementsProvider
      key={clientSecret}
      stripe={stripePromise}
      options={{
        clientSecret,
        elementsOptions: {
          appearance: {
            theme: "stripe",
            variables: {
              colorPrimary: "#09090b",
              colorBackground: "#ffffff",
              colorText: "#18181b",
              colorDanger: "#dc2626",
              fontFamily: "inherit",
              borderRadius: "0.75rem",
            },
          },
        },
      }}
    >
      <CheckoutForm
        bookingId={bookingId}
        type={type}
        amountFormatted={amountFormatted}
        onSuccess={onSuccess}
      />
    </CheckoutElementsProvider>
  );
}