"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { getBookingsAction, BookingItem } from "@/lib/actions/bookings";
import {
  BookOpen,
  Calendar,
  Clock,
  Car,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Loader2,
  CheckCircle,
} from "lucide-react";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBookings() {
      try {
        setLoading(true);
        const res = await getBookingsAction();
        setBookings(res);
      } catch (err) {
        console.error("Failed to load bookings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950">
            Student Bookings
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Complete record of student registrations, package enrollments, and payment confirmations.
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-zinc-300" />
            <h3 className="mt-3 text-base font-bold text-zinc-900">No Bookings Yet</h3>
            <p className="mt-1 text-xs text-zinc-500">
              When students complete their booking via the registration portal, their reservations will show here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs hover:border-zinc-300 transition"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white font-bold">
                      <User className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-zinc-900">
                        {booking.firstName} {booking.lastName}
                      </h3>
                      <p className="text-xs text-zinc-500">
                        License: <strong>{booking.licenseClass}</strong> ({booking.licenseNumber || "LDL not provided"}) • Expiry: {booking.licenseExpiry || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
                      {booking.paymentStatus === "paid" ? "Paid" : "Confirmed (Dev Mode)"}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      Ref: #{booking.id.slice(0, 8)}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-zinc-600">
                  {/* Contact */}
                  <div className="space-y-1">
                    <span className="font-semibold text-zinc-900 uppercase text-[10px] tracking-wider">
                      Contact Details
                    </span>
                    <p className="flex items-center gap-1.5 text-zinc-700">
                      <Phone className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{booking.phone}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-zinc-700">
                      <Mail className="h-3.5 w-3.5 text-zinc-400" />
                      <span className="truncate">{booking.email}</span>
                    </p>
                  </div>

                  {/* Pickup Location */}
                  <div className="space-y-1">
                    <span className="font-semibold text-zinc-900 uppercase text-[10px] tracking-wider">
                      Pickup Address
                    </span>
                    <p className="flex items-start gap-1.5 text-zinc-700">
                      <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0 mt-0.5" />
                      <span>
                        {booking.street}, {booking.city} {booking.postCode}
                      </span>
                    </p>
                  </div>

                  {/* Package */}
                  <div className="space-y-1">
                    <span className="font-semibold text-zinc-900 uppercase text-[10px] tracking-wider">
                      Selected Package
                    </span>
                    <p className="font-bold text-emerald-900">{booking.packageName}</p>
                    <p className="font-semibold text-zinc-900">{booking.packagePrice}</p>
                  </div>

                  {/* Slot */}
                  <div className="space-y-1">
                    <span className="font-semibold text-zinc-900 uppercase text-[10px] tracking-wider">
                      Reserved Appointment
                    </span>
                    <p className="flex items-center gap-1.5 font-bold text-zinc-900">
                      <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{booking.slotDate}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-zinc-600">
                      <Clock className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{booking.slotTime}</span>
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Trainer: {booking.slotInstructor}
                    </p>
                  </div>
                </div>

                {/* Additional notes / Road test */}
                {(booking.bookedRoadTest === "yes" || booking.additionalNotes) && (
                  <div className="mt-4 pt-3 border-t border-zinc-100 flex flex-wrap gap-4 text-xs">
                    {booking.bookedRoadTest === "yes" && (
                      <div className="rounded-lg bg-zinc-50 px-3 py-1.5 text-zinc-700">
                        <strong>Road Test Booked:</strong> {booking.roadTestDate || "Date pending"}{" "}
                        at {booking.roadTestLocation || "Local ICBC"}
                      </div>
                    )}
                    {booking.additionalNotes && (
                      <div className="rounded-lg bg-zinc-50 px-3 py-1.5 text-zinc-600 italic">
                        &quot;{booking.additionalNotes}&quot;
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
