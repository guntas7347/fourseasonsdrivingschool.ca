import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // Body might be empty
    }

    const {
      amount,
      currency = "cad",
      bookingId,
      customerEmail,
      customerName,
      description,
      metadata = {},
    } = body;

    // Parse amount to integer cents (e.g., $110 -> 11000 cents)
    let amountInCents = 11000; // default $110 CAD
    if (typeof amount === "number") {
      amountInCents = amount > 1000 ? Math.round(amount) : Math.round(amount * 100);
    } else if (typeof amount === "string") {
      const cleaned = parseFloat(amount.replace(/[^0-9.]/g, ""));
      if (!isNaN(cleaned) && cleaned > 0) {
        amountInCents = Math.round(cleaned * 100);
      }
    }

    // Safety minimum: $1 CAD = 100 cents
    if (amountInCents < 100) {
      amountInCents = 11000;
    }

    const metadataPayload: Record<string, string> = {
      ...metadata,
    };
    if (bookingId) metadataPayload.bookingId = String(bookingId);
    if (customerEmail) metadataPayload.customerEmail = String(customerEmail);
    if (customerName) metadataPayload.customerName = String(customerName);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: (currency || "cad").toLowerCase(),
      description: description || `Four Seasons Driving Lesson Booking #${bookingId || "direct"}`,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: metadataPayload,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });
  } catch (err: any) {
    console.error("API create-payment-intent error:", err);
    return NextResponse.json(
      { error: err?.message || "Unable to initialize Stripe payment" },
      { status: 500 }
    );
  }
}
