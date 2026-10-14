"use client";

import React, { useEffect, useState } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { markBookingPaidAction } from "@/lib/actions/bookings";
import { createPaymentIntentAction } from "@/lib/actions/transactions";
import {
  CreditCard,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

interface CheckoutFormProps {
  bookingId?: string;
  amountFormatted: string;
  onSuccess?: (paymentIntentId: string) => void;
}

function CheckoutForm({ bookingId, amountFormatted, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!stripe || !elements) return;

    try {
      setLoading(true);
      setErrorMessage(null);

      const returnUrl = `${window.location.origin}/payment-success${
        bookingId ? `?bookingId=${bookingId}` : ""
      }`;

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "Payment processing failed. Please verify your card details.");
        setLoading(false);
        return;
      }

      if (paymentIntent && (paymentIntent.status === "succeeded" || paymentIntent.status === "processing")) {
        // Mark booking as paid in Firestore
        if (bookingId) {
          try {
            await markBookingPaidAction({
              bookingId,
              paymentIntentId: paymentIntent.id,
              cardLast4: "stripe",
            });
          } catch (dbErr) {
            console.warn("Could not mark booking as paid immediately:", dbErr);
          }
        }

        if (onSuccess) {
          onSuccess(paymentIntent.id);
        } else {
          window.location.href = returnUrl;
        }
      }
    } catch (err: any) {
      console.error("Stripe confirmPayment error:", err);
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

      {/* Stripe Official Payment Element */}
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
        <span className="font-mono text-[11px] text-zinc-400">Powered by Stripe</span>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || loading}
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
            <span>Pay {amountFormatted} &amp; Confirm Booking</span>
          </>
        )}
      </button>
    </form>
  );
}

interface StripeCheckoutProps {
  bookingId?: string;
  amount?: number | string; // in dollars or cents or "$110"
  currency?: string;
  customerName?: string;
  customerEmail?: string;
  onSuccess?: (paymentIntentId: string) => void;
}

export default function StripeCheckout({
  bookingId,
  amount = 110,
  currency = "cad",
  customerName,
  customerEmail,
  onSuccess,
}: StripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  // Compute display amount formatted (e.g. "$110 CAD")
  const numericAmount =
    typeof amount === "number"
      ? amount
      : parseFloat(String(amount).replace(/[^0-9.]/g, "")) || 110;
  const amountFormatted = `$${numericAmount.toFixed(2)} ${currency.toUpperCase()}`;

  const initializePayment = async () => {
    try {
      setLoading(true);
      setInitError(null);

      const res = await createPaymentIntentAction({
        amount: numericAmount,
        currency,
        bookingId,
        customerName,
        customerEmail,
        description: `Four Seasons Driving Lesson Booking #${bookingId || "direct"}`,
      });

      if (res.success && res.clientSecret) {
        setClientSecret(res.clientSecret);
      } else {
        setInitError(res.error || "Unable to initialize Stripe payment session.");
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
  }, [bookingId, numericAmount, currency]);

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
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800 transition"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry Payment Initialization</span>
        </button>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#059669",
            colorBackground: "#ffffff",
            colorText: "#18181b",
            borderRadius: "12px",
            fontFamily: "inherit",
          },
        },
      }}
    >
      <CheckoutForm
        bookingId={bookingId}
        amountFormatted={amountFormatted}
        onSuccess={onSuccess}
      />
    </Elements>
  );
}