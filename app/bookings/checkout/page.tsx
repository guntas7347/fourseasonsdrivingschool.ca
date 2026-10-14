import CheckoutPage from "@/app/checkout/page";

export default function BookingsCheckoutPage(props: {
  searchParams: Promise<{ bookingId?: string }>;
}) {
  return <CheckoutPage {...props} />;
}
