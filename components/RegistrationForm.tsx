"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Car,
  User,
  MapPin,
  FileText,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import SlotCalendar, { TimeSlot } from "./SlotCalendar";
import { useForm } from "@/lib/useForm";
import { getSlotTypesAction, SlotTypeItem } from "@/lib/actions/slots";

export interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  postCode: string;
  licenseNumber: string;
  licenseClass: string;
  licenseExpiry: string;
  startDate: string;
  selectedSlot: TimeSlot | null;
  slotTypeId?: string;
  slotTypeName?: string;
  slotTypePrice?: string;
  packageOfInterest?: string;
  packageName?: string;
  packagePrice?: string;
  alreadyPurchased: "yes" | "no" | "";
  bookedRoadTest: "yes" | "no" | "";
  roadTestDate?: string;
  roadTestLocation?: string;
  additionalNotes: string;
}

const INITIAL_FORM_DATA: BookingFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  street: "",
  city: "Surrey",
  postCode: "",
  licenseNumber: "",
  licenseClass: "Class 7L",
  licenseExpiry: "",
  startDate: "2026-10-15",
  selectedSlot: null,
  alreadyPurchased: "no",
  bookedRoadTest: "no",
  roadTestDate: "",
  roadTestLocation: "",
  additionalNotes: "",
};

export default function RegistrationForm() {
  const router = useRouter();
  const [slotTypes, setSlotTypes] = useState<SlotTypeItem[]>([]);
  const [slotError, setSlotError] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Using useForm as requested
  const { form, setFormFields, handleChange, setFields } =
    useForm<BookingFormData>(INITIAL_FORM_DATA);

  // Load slot types dynamically from database (admin slot types)
  useEffect(() => {
    async function loadTypes() {
      try {
        const types = await getSlotTypesAction();
        setSlotTypes(types);
        if (types.length > 0 && !form.slotTypeId) {
          setFields({
            slotTypeId: types[0].id,
            slotTypeName: types[0].name,
            slotTypePrice: types[0].price,
          });
        }
      } catch (err) {
        console.error("Error loading slot types:", err);
      }
    }
    loadTypes();
  }, [setFields, form.slotTypeId]);

  // Set today's date dynamically on client mount
  useEffect(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const liveStr = `${year}-${month}-${day}`;
    setFields({ startDate: liveStr });
  }, [setFields]);

  const handleSelectDate = (dateStr: string) => {
    setFields({
      startDate: dateStr,
      selectedSlot: null,
    });
    setSlotError(false);
  };

  const handleSelectSlot = (slot: TimeSlot) => {
    setFields({ selectedSlot: slot });
    setSlotError(false);
    setValidationError(null);
  };

  const handleSlotTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const matchedType = slotTypes.find((t) => t.id === selectedId);
    setFields({
      slotTypeId: selectedId,
      slotTypeName: matchedType?.name || "Standard Lesson",
      slotTypePrice: matchedType?.price || "$110",
    });
  };

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation checks
    if (!form.firstName || !form.lastName || !form.email || !form.phone) {
      setValidationError("Please fill out your contact details (Name, Email, Phone).");
      return;
    }

    if (!form.street || !form.city) {
      setValidationError("Please enter your street address and city for lesson pickup.");
      return;
    }

    if (!form.selectedSlot) {
      setSlotError(true);
      setValidationError("Please select an available lesson appointment slot from the calendar.");
      const calendarEl = document.getElementById("calendar-section");
      if (calendarEl) {
        calendarEl.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    setValidationError(null);

    // Save half-filled draft to sessionStorage
    const selectedType = slotTypes.find((t) => t.id === form.slotTypeId);

    const draftPayload: BookingFormData = {
      ...form,
      slotTypeName: selectedType?.name || form.slotTypeName || "Standard 90-Min Lesson",
      slotTypePrice: selectedType?.price || form.slotTypePrice || "$110",
      packageName: selectedType?.name || form.slotTypeName || "Standard 90-Min Lesson",
      packagePrice: selectedType?.price || form.slotTypePrice || "$110",
    };

    console.log("==================================================");
    console.log("HALF-FILLED BOOKING FORM SAVED — PROCEEDING TO /bookings:");
    console.log(draftPayload);
    console.log("==================================================");

    if (typeof window !== "undefined") {
      sessionStorage.setItem("fourseasons_booking_draft", JSON.stringify(draftPayload));
    }

    // Navigate to /bookings to continue and complete payment
    router.push("/bookings");
  };

  return (
    <section id="register" className="relative scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Step 1: Choose Your Slot &amp; Details</span>
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Online Registration &amp; Appointment Booking
          </h2>
          <p className="mt-3 text-base text-zinc-600 max-w-2xl mx-auto">
            Choose an available date &amp; time slot directly on the calendar below, then proceed to finalize your lesson details.
          </p>
        </div>

        {/* Form Container */}
        <div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-950/5 sm:p-10">
          <form onSubmit={handleProceed} className="space-y-10">
            {validationError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{validationError}</span>
              </div>
            )}

            {/* SECTION 1: Personal & Contact Details */}
            <div>
              <div className="flex items-center gap-2.5 border-b border-zinc-100 pb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
                  <User className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold text-zinc-900">
                  1. Student Contact Information
                </h3>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-zinc-700">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    autoComplete="given-name"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="e.g. Navjot"
                    className="mt-1.5 block w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-zinc-700">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    autoComplete="family-name"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="e.g. Singh"
                    className="mt-1.5 block w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-zinc-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="e.g. student@example.com"
                    className="mt-1.5 block w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-zinc-700">
                    Phone No <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    autoComplete="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="(604) 505-3129"
                    className="mt-1.5 block w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: Pickup Location & Address */}
            <div>
              <div className="flex items-center gap-2.5 border-b border-zinc-100 pb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
                  <MapPin className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold text-zinc-900">
                  2. Pickup Location &amp; Address
                </h3>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="street" className="block text-sm font-medium text-zinc-700">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    required
                    autoComplete="address-line1"
                    value={form.street}
                    onChange={handleChange}
                    placeholder="e.g. 7240 120th Street"
                    className="mt-1.5 block w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="city" className="block text-sm font-medium text-zinc-700">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    autoComplete="address-level2"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Surrey"
                    className="mt-1.5 block w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label htmlFor="postCode" className="block text-sm font-medium text-zinc-700">
                    Post Code
                  </label>
                  <input
                    type="text"
                    id="postCode"
                    name="postCode"
                    autoComplete="postal-code"
                    value={form.postCode}
                    onChange={handleChange}
                    placeholder="V3W 3M8"
                    className="mt-1.5 block w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: Driver License Details */}
            <div>
              <div className="flex items-center gap-2.5 border-b border-zinc-100 pb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
                  <FileText className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold text-zinc-900">
                  3. ICBC Driver&apos;s License Information
                </h3>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="licenseNumber" className="block text-sm font-medium text-zinc-700">
                    Driving License No (LDL#)
                  </label>
                  <input
                    type="text"
                    id="licenseNumber"
                    name="licenseNumber"
                    value={form.licenseNumber}
                    onChange={handleChange}
                    placeholder="e.g. 7482910"
                    className="mt-1.5 block w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition"
                  />
                  <p className="mt-1 text-xs text-zinc-400">
                    7-digit number on your ICBC card or paper learner permit.
                  </p>
                </div>

                <div>
                  <label htmlFor="licenseClass" className="block text-sm font-medium text-zinc-700">
                    Driving License Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="licenseClass"
                    name="licenseClass"
                    required
                    value={form.licenseClass}
                    onChange={handleChange}
                    className="mt-1.5 block w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition"
                  >
                    <option value="Class 7L">Class 7L (Learner&apos;s License)</option>
                    <option value="Class 7N">Class 7N (Novice License)</option>
                    <option value="Class 5">Class 5 (Full License / Refresher)</option>
                    <option value="International / Other">
                      Out of Province / International License
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 4: Slot Type Selection (Dynamic from DB) */}
            <div>
              <div className="flex items-center gap-2.5 border-b border-zinc-100 pb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
                  <Car className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold text-zinc-900">
                  4. Lesson Slot Type
                </h3>
              </div>

              <div className="mt-5">
                {/* Slot Type Selector */}
                <div>
                  <label htmlFor="slotTypeId" className="block text-sm font-medium text-zinc-700">
                    Lesson / Slot Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="slotTypeId"
                    name="slotTypeId"
                    value={form.slotTypeId || ""}
                    onChange={handleSlotTypeChange}
                    className="mt-1.5 block w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition"
                  >
                    {slotTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name} — {type.price}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-zinc-400">
                    Price and duration for your selected individual appointment slot.
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION 5: CALENDAR & AVAILABLE SLOTS */}
            <div id="calendar-section" className="scroll-mt-24">
              <div className="flex items-center gap-2.5 border-b border-zinc-100 pb-3 mb-5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
                  <Calendar className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold text-zinc-900">
                  5. Choose Date &amp; Available Appointment Slot
                </h3>
              </div>

              {slotError && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                  <span>
                    Please select an available lesson appointment slot from the calendar below to proceed.
                  </span>
                </div>
              )}

              {/* Slot Calendar Component */}
              <SlotCalendar
                selectedDate={form.startDate}
                selectedSlot={form.selectedSlot}
                onSelectDate={handleSelectDate}
                onSelectSlot={handleSelectSlot}
              />
            </div>

            {/* Proceed CTA */}
            <div className="border-t border-zinc-100 pt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-zinc-500 max-w-sm">
                  {form.selectedSlot ? (
                    <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>
                        Slot selected: {form.startDate} at {form.selectedSlot.time}. Click proceed to finalize payment and schedule.
                      </span>
                    </span>
                  ) : (
                    <span>Please select a date and an available slot above to proceed.</span>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-zinc-900 px-8 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-zinc-800 hover:shadow-lg active:scale-95"
                >
                  <span>Proceed to Finalize Booking</span>
                  <ArrowRight className="h-4 w-4 text-emerald-400" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
