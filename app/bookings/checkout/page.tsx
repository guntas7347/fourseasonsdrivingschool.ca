import CheckoutPage from "@/app/checkout/page";

export default function BookingsCheckoutPage(props: {
  searchParams: Promise<{ bookingId?: string; type?: string }>;
}) {
  return <CheckoutPage {...props} />;
}
