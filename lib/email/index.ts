/**
 * Email templates for Four Seasons Driving School
 * Stored in /lib/email as requested
 */

export interface PackageEmailData {
  orderId: string;
  customerName: string;
  email: string;
  phone: string;
  packageName: string;
  packagePrice: string;
  lessonsCount?: number;
  duration?: string;
  purchasedAt?: string;
  paymentMethod?: string;
}

export interface SlotBookingEmailData {
  bookingId: string;
  customerName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  instructor?: string;
  slotType?: string;
  price?: string;
  pickupAddress?: string;
  licenseClass?: string;
}

/**
 * Generate confirmation email for Package Purchases
 */
export function generatePackagePurchaseEmail(data: PackageEmailData): {
  subject: string;
  body: string;
} {
  const subject = `Order Confirmation: Four Seasons Driving School - ${data.packageName} (#${data.orderId.slice(0, 8)})`;
  const body = `
================================================================================
FOUR SEASONS DRIVING SCHOOL - PACKAGE PURCHASE RECEIPT & CONFIRMATION
================================================================================

Dear ${data.customerName},

Thank you for choosing Four Seasons Driving School!
Your payment of ${data.packagePrice} CAD for the "${data.packageName}" has been successfully confirmed.

ORDER SUMMARY:
--------------------------------------------------------------------------------
Order Reference: ${data.orderId}
Package:         ${data.packageName}
Total Paid:      ${data.packagePrice} CAD
Lessons Count:   ${data.lessonsCount ?? "Full Package"}
Duration:        ${data.duration ?? "Standard Course"}
Payment Method:  ${data.paymentMethod || "Credit Card (Online)"}
Date:            ${data.purchasedAt || new Date().toISOString()}

STUDENT CONTACT DETAILS:
--------------------------------------------------------------------------------
Name:            ${data.customerName}
Email:           ${data.email}
Phone:           ${data.phone}

WHAT TO EXPECT NEXT:
--------------------------------------------------------------------------------
1. Instructor Outreach: Our certified instructor will call you at ${data.phone}
   within 24 hours to welcome you and plan your lesson roadmap.
2. Doorstep Pickup: We will confirm your preferred home, school, or work pickup
   location in Surrey, Delta, or Langley.
3. Flexible Scheduling: You can schedule individual sessions whenever convenient.

IMPORTANT REMINDERS:
--------------------------------------------------------------------------------
- Bring your physical ICBC Driver's License (Class 7L / 7N / 5) to all lessons.
- Wear comfortable flat footwear (no flip-flops or open sandals).

Need assistance?
Phone: +1 604-505-3129
Email: fsdriving84@gmail.com
Address: 5805 140A Pl, Surrey, BC V3X 2S1, Canada
Website: https://fourseasonsdrivingschool.ca

Drive with confidence,
Four Seasons Driving School
================================================================================
`.trim();

  return { subject, body };
}

/**
 * Generate confirmation email for Slot / Lesson Bookings
 */
export function generateSlotBookingEmail(data: SlotBookingEmailData): {
  subject: string;
  body: string;
} {
  const subject = `Lesson Confirmed: ${data.slotType || "Driving Lesson"} on ${data.date} at ${data.time}`;
  const body = `
================================================================================
FOUR SEASONS DRIVING SCHOOL - LESSON APPOINTMENT CONFIRMATION
================================================================================

Dear ${data.customerName},

Your driving lesson slot has been confirmed! Here are your appointment details:

LESSON RESERVATION DETAILS:
--------------------------------------------------------------------------------
Booking Reference: ${data.bookingId}
Date:              ${data.date}
Time Slot:         ${data.time}
Lesson / Slot Type:${data.slotType || "Standard 90-Min Lesson"}
Total Fee:         ${data.price || "$110 CAD"}
Instructor:        ${data.instructor || "Chief ICBC Certified Instructor"}
Student Name:      ${data.customerName}
Phone Number:      ${data.phone}
Email Address:     ${data.email}
License Class:     ${data.licenseClass || "Class 7L"}
Pickup Address:    ${data.pickupAddress || "Complimentary Doorstep Pickup"}

PRE-LESSON CHECKLIST:
--------------------------------------------------------------------------------
✔ Have your physical ICBC Driver's License with you.
✔ Your instructor will arrive in a certified dual-control safety vehicle.
✔ Please be ready 5 minutes before your scheduled start time.

CANCELLATION & RESCHEDULING:
--------------------------------------------------------------------------------
If you need to change your appointment, please contact us at least 24 hours
in advance at +1 604-505-3129 or fsdriving84@gmail.com so we can accommodate other students.

Safe driving,
Four Seasons Driving School Team
5805 140A Pl, Surrey, BC V3X 2S1, Canada
================================================================================
`.trim();

  return { subject, body };
}

/**
 * Helper to console.log confirmation email upon successful package or slot purchase
 */
export function logConfirmationEmail(emailData: {
  type: "PACKAGE_PURCHASE" | "SLOT_BOOKING";
  to: string;
  subject: string;
  body: string;
}) {
  console.log("\n================================================================================");
  console.log(`📧 [EMAIL NOTIFICATION DISPATCHED] -> ${emailData.type}`);
  console.log(`To:      ${emailData.to}`);
  console.log(`Subject: ${emailData.subject}`);
  console.log("--------------------------------------------------------------------------------");
  console.log(emailData.body);
  console.log("================================================================================\n");
}
