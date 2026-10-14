"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  getSlotsAction,
  deleteSlotAction,
  updateSlotStatusAction,
  getSlotTypesAction,
  createSlotTypeAction,
  updateSlotTypeAction,
  deleteSlotTypeAction,
  manualBookSlotAction,
  freeSlotAction,
  SlotItem,
  SlotTypeItem,
} from "@/lib/actions/slots";
import { useForm } from "@/lib/useForm";
import {
  Plus,
  Calendar,
  Clock,
  Car,
  Trash2,
  CheckCircle2,
  User,
  Filter,
  Loader2,
  Tag,
  DollarSign,
  Edit,
  X,
  Layers,
  Settings,
  ShieldAlert,
  Unlock,
  Lock,
  UserPlus,
  CreditCard,
  Banknote,
  AlertCircle,
} from "lucide-react";

interface SlotTypeFormFields {
  name: string;
  price: string;
}

const DEFAULT_SLOT_TYPE_FORM: SlotTypeFormFields = {
  name: "",
  price: "110",
};

interface ManualBookingFormFields {
  studentName: string;
  phone: string;
  email: string;
  paymentMethod: "Cash on spot" | "Card";
  slotTypeId: string;
  notes: string;
}

const DEFAULT_MANUAL_BOOKING_FORM: ManualBookingFormFields = {
  studentName: "",
  phone: "",
  email: "",
  paymentMethod: "Cash on spot",
  slotTypeId: "",
  notes: "",
};

export default function AdminSlotsPage() {
  const [activeTab, setActiveTab] = useState<"slots" | "types">("slots");

  // Slots state
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [filterDate, setFilterDate] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Manage Slot Modal State
  const [managingSlot, setManagingSlot] = useState<SlotItem | null>(null);
  const [freeingSlot, setFreeingSlot] = useState(false);
  const [bookingSlot, setBookingSlot] = useState(false);
  const [manageError, setManageError] = useState<string | null>(null);
  const [manageSuccess, setManageSuccess] = useState<string | null>(null);

  // Slot Types state
  const [slotTypes, setSlotTypes] = useState<SlotTypeItem[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [savingType, setSavingType] = useState(false);
  const [typeError, setTypeError] = useState<string | null>(null);

  // useForm for Slot Types
  const {
    form: typeForm,
    handleChange: handleTypeChange,
    setFields: setTypeFields,
    resetFormFields: resetTypeForm,
  } = useForm<SlotTypeFormFields>(DEFAULT_SLOT_TYPE_FORM);

  // useForm for Manual Slot Booking
  const {
    form: manualForm,
    handleChange: handleManualChange,
    setFields: setManualFields,
    resetFormFields: resetManualForm,
  } = useForm<ManualBookingFormFields>(DEFAULT_MANUAL_BOOKING_FORM);

  const loadSlots = async (date?: string) => {
    try {
      setLoadingSlots(true);
      const res = await getSlotsAction(date || undefined);
      setSlots(res);
    } catch (err) {
      console.error("Failed to load slots:", err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const loadSlotTypes = async () => {
    try {
      setLoadingTypes(true);
      const res = await getSlotTypesAction();
      setSlotTypes(res);
      if (res.length > 0 && !manualForm.slotTypeId) {
        setManualFields({ slotTypeId: res[0].id });
      }
    } catch (err) {
      console.error("Failed to load slot types:", err);
    } finally {
      setLoadingTypes(false);
    }
  };

  useEffect(() => {
    loadSlots(filterDate);
    loadSlotTypes();
  }, [filterDate]);

  // Handle direct slot deletion with safety check
  const handleDeleteSlot = async (slot: SlotItem) => {
    if (slot.status === "booked") {
      alert(
        "Cannot delete a booked slot directly. Please open 'Manage Slot' to release / free it first."
      );
      setManagingSlot(slot);
      setManageError(
        "Direct deletion is blocked because this slot is booked. Click 'Free Slot' below to initiate the refund and restore it to available status."
      );
      return;
    }

    if (!confirm(`Are you sure you want to delete slot: ${slot.date} ${slot.time}?`)) {
      return;
    }

    try {
      setDeletingId(slot.id);
      const res = await deleteSlotAction(slot.id);
      if (res.success) {
        setSlots((prev) => prev.filter((s) => s.id !== slot.id));
        if (managingSlot?.id === slot.id) {
          setManagingSlot(null);
        }
      } else {
        alert(res.error || "Failed to delete slot.");
      }
    } catch (err) {
      console.error("Failed to delete slot:", err);
      alert("Failed to delete slot.");
    } finally {
      setDeletingId(null);
    }
  };

  // Open Manage Slot Modal
  const handleOpenManageModal = (slot: SlotItem) => {
    setManagingSlot(slot);
    setManageError(null);
    setManageSuccess(null);
    resetManualForm();
    if (slotTypes.length > 0) {
      setManualFields({ slotTypeId: slotTypes[0].id });
    }
  };

  // Free a booked slot (Refund via mock stripe & mark available)
  const handleFreeSlot = async () => {
    if (!managingSlot) return;
    try {
      setFreeingSlot(true);
      setManageError(null);
      setManageSuccess(null);

      const res = await freeSlotAction(managingSlot.id);
      if (res.success) {
        setManageSuccess(
          "Slot freed successfully! Mock Stripe refund processed. The slot is now available to be booked again or deleted."
        );
        const updatedSlot: SlotItem = {
          ...managingSlot,
          status: "available",
          available: true,
          bookedBy: undefined,
        };
        setManagingSlot(updatedSlot);
        setSlots((prev) =>
          prev.map((s) => (s.id === managingSlot.id ? updatedSlot : s))
        );
      } else {
        setManageError(res.error || "Failed to free slot.");
      }
    } catch (err: any) {
      console.error("Free slot error:", err);
      setManageError(err?.message || "An error occurred while freeing slot.");
    } finally {
      setFreeingSlot(false);
    }
  };

  // Submit manual booking from modal
  const handleManualBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingSlot) return;
    if (!manualForm.studentName.trim() || !manualForm.phone.trim()) {
      setManageError("Please enter the student's name and phone number.");
      return;
    }

    try {
      setBookingSlot(true);
      setManageError(null);
      setManageSuccess(null);

      const selectedType = slotTypes.find((t) => t.id === manualForm.slotTypeId);

      const res = await manualBookSlotAction({
        slotId: managingSlot.id,
        studentName: manualForm.studentName.trim(),
        phone: manualForm.phone.trim(),
        email: manualForm.email.trim() || "walkin@fourseasonsdrivingschool.ca",
        paymentMethod: manualForm.paymentMethod,
        slotTypeName: selectedType?.name || "Driving Lesson",
        slotTypePrice: selectedType?.price || "$110",
        notes: manualForm.notes.trim(),
      });

      if (res.success) {
        setManageSuccess(
          `Slot booked successfully for ${manualForm.studentName}! Payment: ${manualForm.paymentMethod}.`
        );
        const updatedSlot: SlotItem = {
          ...managingSlot,
          status: "booked",
          available: false,
          bookedBy: {
            name: manualForm.studentName.trim(),
            email: manualForm.email.trim() || "walkin@fourseasonsdrivingschool.ca",
            phone: manualForm.phone.trim(),
            bookingId: res.bookingId,
          },
        };
        setManagingSlot(updatedSlot);
        setSlots((prev) =>
          prev.map((s) => (s.id === managingSlot.id ? updatedSlot : s))
        );
        resetManualForm();
      } else {
        setManageError(res.error || "Failed to book slot.");
      }
    } catch (err: any) {
      console.error("Manual booking error:", err);
      setManageError(err?.message || "An error occurred while booking slot.");
    } finally {
      setBookingSlot(false);
    }
  };

  const handleToggleStatus = async (slot: SlotItem) => {
    const newStatus = slot.status === "available" ? "booked" : "available";
    try {
      await updateSlotStatusAction(slot.id, newStatus);
      setSlots((prev) =>
        prev.map((s) =>
          s.id === slot.id
            ? { ...s, status: newStatus, available: newStatus === "available" }
            : s
        )
      );
    } catch (err) {
      console.error("Failed to toggle slot status:", err);
    }
  };

  // Slot Type Handlers
  const handleOpenAddType = () => {
    setEditingTypeId(null);
    resetTypeForm();
    setShowTypeModal(true);
    setTypeError(null);
  };

  const handleOpenEditType = (type: SlotTypeItem) => {
    setEditingTypeId(type.id);
    setTypeFields({
      name: type.name,
      price: String(type.numericPrice || 110),
    });
    setShowTypeModal(true);
    setTypeError(null);
  };

  const handleSaveSlotType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeForm.name.trim() || !typeForm.price) {
      setTypeError("Please enter both the slot name and price.");
      return;
    }

    try {
      setSavingType(true);
      setTypeError(null);
      const numericPrice = parseFloat(typeForm.price) || 0;

      if (editingTypeId) {
        const res = await updateSlotTypeAction(editingTypeId, {
          name: typeForm.name.trim(),
          numericPrice,
          price: `$${numericPrice}`,
        });
        if (res.success) {
          await loadSlotTypes();
          setShowTypeModal(false);
          resetTypeForm();
        } else {
          setTypeError(res.error || "Failed to update slot type.");
        }
      } else {
        const res = await createSlotTypeAction({
          name: typeForm.name.trim(),
          numericPrice,
          price: `$${numericPrice}`,
        });
        if (res.success) {
          await loadSlotTypes();
          setShowTypeModal(false);
          resetTypeForm();
        } else {
          setTypeError(res.error || "Failed to create slot type.");
        }
      }
    } catch (err: any) {
      console.error("Save slot type error:", err);
      setTypeError(err?.message || "An error occurred.");
    } finally {
      setSavingType(false);
    }
  };

  const handleDeleteSlotType = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete slot type: "${name}"?`)) return;
    try {
      await deleteSlotTypeAction(id);
      setSlotTypes((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Delete slot type error:", err);
      alert("Failed to delete slot type.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950">
            Lesson Slots &amp; Types
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage scheduled lesson time slots, manually book appointments, and configure live slot types.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {activeTab === "types" ? (
            <button
              type="button"
              onClick={handleOpenAddType}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800"
            >
              <Plus className="h-4 w-4 text-emerald-400" />
              <span>Add Slot Type</span>
            </button>
          ) : (
            <Link
              href="/admin/slots/new"
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800"
            >
              <Plus className="h-4 w-4 text-emerald-400" />
              <span>Schedule New Slots</span>
            </Link>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-zinc-200">
        <button
          type="button"
          onClick={() => setActiveTab("slots")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold border-b-2 transition -mb-px ${
            activeTab === "slots"
              ? "border-zinc-900 text-zinc-950"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Scheduled Time Slots ({slots.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("types")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold border-b-2 transition -mb-px ${
            activeTab === "types"
              ? "border-zinc-900 text-zinc-950"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <Tag className="h-4 w-4" />
          <span>Manage Slot Types &amp; Pricing ({slotTypes.length})</span>
        </button>
      </div>

      {/* TAB 1: SCHEDULED TIME SLOTS */}
      {activeTab === "slots" && (
        <div className="space-y-6">
          {/* Filter bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs">
            <div className="flex items-center gap-3">
              <Filter className="h-4 w-4 text-zinc-400" />
              <span className="text-xs font-semibold text-zinc-700">Filter by Date:</span>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-800 focus:border-zinc-900 focus:outline-none"
              />
              {filterDate && (
                <button
                  type="button"
                  onClick={() => setFilterDate("")}
                  className="text-xs text-zinc-500 hover:text-zinc-900 underline"
                >
                  Clear Filter
                </button>
              )}
            </div>

            <span className="text-xs font-medium text-zinc-500">
              Showing {slots.length} time slot{slots.length === 1 ? "" : "s"}
            </span>
          </div>

          {/* Slots Grid */}
          {loadingSlots ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
          ) : slots.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-zinc-300" />
              <h3 className="mt-3 text-base font-bold text-zinc-900">No Slots Found</h3>
              <p className="mt-1 text-xs text-zinc-500">
                {filterDate
                  ? `No lesson slots scheduled for ${filterDate}.`
                  : "No slots currently scheduled in the system."}
              </p>
              <Link
                href="/admin/slots/new"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white"
              >
                <Plus className="h-4 w-4 text-emerald-400" />
                <span>Add First Slot</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {slots.map((slot) => {
                const isAvailable = slot.status === "available";
                const isBooked = slot.status === "booked";

                return (
                  <div
                    key={slot.id}
                    className={`flex flex-col justify-between rounded-2xl border p-5 transition ${
                      isAvailable
                        ? "border-zinc-200 bg-white hover:border-zinc-300 shadow-xs"
                        : "border-zinc-300 bg-zinc-50/80 shadow-xs"
                    }`}
                  >
                    <div>
                      {/* Top Row: Date & Status Badge */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                          <span>{slot.date}</span>
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                            isAvailable
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-amber-100 text-amber-900 border border-amber-200"
                          }`}
                        >
                          {isBooked ? (
                            <Lock className="h-2.5 w-2.5" />
                          ) : (
                            <Unlock className="h-2.5 w-2.5" />
                          )}
                          <span>{slot.status}</span>
                        </span>
                      </div>

                      {/* Time */}
                      <div className="mt-3 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-zinc-400" />
                        <span className="text-sm font-bold text-zinc-900">{slot.time}</span>
                        <span className="text-[11px] text-zinc-400 font-medium">({slot.duration})</span>
                      </div>

                      {/* Booked Student Info if Booked */}
                      {slot.bookedBy && (
                        <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-700 shadow-2xs">
                          <p className="font-bold text-zinc-900 flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-emerald-600" />
                            <span>{slot.bookedBy.name}</span>
                          </p>
                          <p className="text-[11px] text-zinc-500 mt-1">
                            {slot.bookedBy.phone} • {slot.bookedBy.email}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions: Manage Slot Modal & Delete */}
                    <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-3.5">
                      {/* Manage Slot Modal Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenManageModal(slot)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 hover:border-zinc-300 transition"
                      >
                        <Settings className="h-3.5 w-3.5 text-zinc-500" />
                        <span>Manage Slot</span>
                      </button>

                      {/* Delete Button (Protected if Booked) */}
                      {isBooked ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteSlot(slot)}
                          className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-amber-700 font-medium transition"
                          title="Slot is booked. Open 'Manage Slot' to free it before deletion."
                        >
                          <Lock className="h-3 w-3" />
                          <span>Booked</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDeleteSlot(slot)}
                          disabled={deletingId === slot.id}
                          className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50 transition"
                        >
                          {deletingId === slot.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MANAGE SLOT TYPES & PRICING */}
      {activeTab === "types" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-zinc-950">Active Slot Types</h3>
              <p className="text-xs text-zinc-500">
                These slot types with their custom pricing are shown directly to students during online appointment booking.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddType}
              className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 transition"
            >
              <Plus className="h-3.5 w-3.5 text-emerald-400" />
              <span>Add Slot Type</span>
            </button>
          </div>

          {loadingTypes ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
          ) : slotTypes.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center">
              <Tag className="mx-auto h-12 w-12 text-zinc-300" />
              <h3 className="mt-3 text-base font-bold text-zinc-900">No Slot Types</h3>
              <p className="mt-1 text-xs text-zinc-500">
                Add slot types like &quot;Standard 90-Min Lesson&quot; or &quot;Mock ICBC Test&quot;.
              </p>
              <button
                type="button"
                onClick={handleOpenAddType}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white"
              >
                <Plus className="h-4 w-4 text-emerald-400" />
                <span>Create First Slot Type</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {slotTypes.map((type) => (
                <div
                  key={type.id}
                  className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs hover:border-zinc-300 transition"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-zinc-400">
                        ID: {type.id.slice(0, 8)}
                      </span>
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        Live in Booking
                      </span>
                    </div>

                    <h4 className="mt-3 text-base font-bold text-zinc-950">
                      {type.name}
                    </h4>

                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-zinc-950">
                        {type.price}
                      </span>
                      <span className="text-xs text-zinc-500 font-medium">CAD</span>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-end gap-2 border-t border-zinc-100 pt-3.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditType(type)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
                    >
                      <Edit className="h-3.5 w-3.5 text-zinc-500" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSlotType(type.id, type.name)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: MANAGE SLOT MODAL (Manual Booking & Free Slot with Mock Stripe) */}
      {managingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white font-bold">
                  <Calendar className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-950">
                    Manage Slot: {managingSlot.date}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {managingSlot.time} • {managingSlot.duration}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setManagingSlot(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Error & Success Feedback */}
            {manageError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                <span>{manageError}</span>
              </div>
            )}

            {manageSuccess && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>{manageSuccess}</span>
              </div>
            )}

            {/* CASE A: SLOT IS CURRENTLY BOOKED */}
            {managingSlot.status === "booked" ? (
              <div className="mt-5 space-y-5">
                {/* Booked Student Info Box */}
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Current Reservation
                  </span>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-emerald-600" />
                    <span className="font-bold text-sm text-zinc-900">
                      {managingSlot.bookedBy?.name || "Client Booking"}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-600 space-y-0.5">
                    <p>Phone: <strong>{managingSlot.bookedBy?.phone || "N/A"}</strong></p>
                    <p>Email: <strong>{managingSlot.bookedBy?.email || "N/A"}</strong></p>
                    {managingSlot.bookedBy?.bookingId && (
                      <p className="text-[10px] font-mono text-zinc-400 pt-1">
                        Ref #{managingSlot.bookedBy.bookingId.slice(0, 8)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Safety Warning */}
                <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                  <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">Slot Deletion is Protected</p>
                    <p className="mt-0.5 text-amber-800">
                      Direct deletion of booked slots is disabled. To release this appointment, click <strong>&quot;Free Slot&quot;</strong> below. This will trigger a mock Stripe refund and revert the status to available, after which the slot can be deleted or re-booked.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setManagingSlot(null)}
                    className="w-full sm:w-auto rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={handleFreeSlot}
                    disabled={freeingSlot}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition disabled:opacity-50"
                  >
                    {freeingSlot ? (
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                    ) : (
                      <Unlock className="h-4 w-4" />
                    )}
                    <span>{freeingSlot ? "Processing Refund..." : "Free Slot (Refund & Release)"}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* CASE B: SLOT IS AVAILABLE - MANUAL BOOKING FORM (ON CALL / CASH ON SPOT) */
              <div className="mt-5 space-y-5">
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Slot is Available</span>
                  </div>
                  <span className="text-[11px] text-emerald-700">Ready for booking</span>
                </div>

                <form onSubmit={handleManualBookingSubmit} className="space-y-4">
                  <p className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                    Manual Booking (On-Call / Walk-In)
                  </p>

                  {/* Student Name */}
                  <div>
                    <label htmlFor="studentName" className="block text-xs font-semibold text-zinc-700">
                      Student Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="studentName"
                      name="studentName"
                      required
                      placeholder="e.g. Navjot Singh"
                      value={manualForm.studentName}
                      onChange={handleManualChange}
                      className="mt-1 block w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
                    />
                  </div>

                  {/* Phone & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="phone" className="block text-xs font-semibold text-zinc-700">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        placeholder="604-555-0199"
                        value={manualForm.phone}
                        onChange={handleManualChange}
                        className="mt-1 block w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-xs font-semibold text-zinc-700">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="student@gmail.com"
                        value={manualForm.email}
                        onChange={handleManualChange}
                        className="mt-1 block w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Slot Type Selection */}
                  <div>
                    <label htmlFor="slotTypeId" className="block text-xs font-semibold text-zinc-700">
                      Lesson Slot Type
                    </label>
                    <select
                      id="slotTypeId"
                      name="slotTypeId"
                      value={manualForm.slotTypeId}
                      onChange={handleManualChange}
                      className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-900 focus:border-zinc-900 focus:outline-none"
                    >
                      {slotTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name} ({type.price})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Payment Method: Cash on Spot or Card */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                      Payment Method <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label
                        className={`flex items-center gap-2.5 rounded-xl border p-3 cursor-pointer transition ${
                          manualForm.paymentMethod === "Cash on spot"
                            ? "border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600"
                            : "border-zinc-200 hover:bg-zinc-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="Cash on spot"
                          checked={manualForm.paymentMethod === "Cash on spot"}
                          onChange={handleManualChange}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="flex items-center gap-2">
                          <Banknote className="h-4 w-4 text-emerald-700" />
                          <div>
                            <p className="text-xs font-bold text-zinc-900">Cash on spot</p>
                            <p className="text-[10px] text-zinc-500">Pay instructor</p>
                          </div>
                        </div>
                      </label>

                      <label
                        className={`flex items-center gap-2.5 rounded-xl border p-3 cursor-pointer transition ${
                          manualForm.paymentMethod === "Card"
                            ? "border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900"
                            : "border-zinc-200 hover:bg-zinc-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="Card"
                          checked={manualForm.paymentMethod === "Card"}
                          onChange={handleManualChange}
                          className="text-zinc-900 focus:ring-zinc-900"
                        />
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-zinc-700" />
                          <div>
                            <p className="text-xs font-bold text-zinc-900">Card (Mock)</p>
                            <p className="text-[10px] text-zinc-500">Stripe charge</p>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label htmlFor="notes" className="block text-xs font-semibold text-zinc-700">
                      Notes (Optional)
                    </label>
                    <input
                      type="text"
                      id="notes"
                      name="notes"
                      placeholder="e.g. Student requested pickup from Surrey Central"
                      value={manualForm.notes}
                      onChange={handleManualChange}
                      className="mt-1 block w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
                    />
                  </div>

                  {/* Form Actions: Book Slot or Delete Slot */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-zinc-100">
                    <button
                      type="button"
                      onClick={() => handleDeleteSlot(managingSlot)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-semibold py-2 px-3 rounded-lg hover:bg-red-50 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete This Slot</span>
                    </button>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => setManagingSlot(null)}
                        className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={bookingSlot}
                        className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 transition disabled:opacity-50"
                      >
                        {bookingSlot ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                        ) : (
                          <UserPlus className="h-3.5 w-3.5 text-emerald-400" />
                        )}
                        <span>{bookingSlot ? "Booking..." : "Confirm Manual Booking"}</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT SLOT TYPE */}
      {showTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <h3 className="text-base font-bold text-zinc-950">
                {editingTypeId ? "Edit Slot Type" : "Create New Slot Type"}
              </h3>
              <button
                type="button"
                onClick={() => setShowTypeModal(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {typeError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {typeError}
              </div>
            )}

            <form onSubmit={handleSaveSlotType} className="mt-4 space-y-4">
              {/* Slot Name */}
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-zinc-900">
                  Slot Type Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={typeForm.name}
                  onChange={handleTypeChange}
                  placeholder="e.g. Standard 90-Min Lesson"
                  className="mt-1 block w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-xs font-semibold text-zinc-900">
                  Price (CAD $) <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    required
                    min="0"
                    step="1"
                    value={typeForm.price}
                    onChange={handleTypeChange}
                    placeholder="110"
                    className="block w-full rounded-xl border border-zinc-200 pl-8 pr-3.5 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
              </div>

              {/* Modal actions */}
              <div className="flex items-center justify-end gap-3 border-t border-zinc-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowTypeModal(false)}
                  className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingType}
                  className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 transition disabled:opacity-50"
                >
                  {savingType ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  )}
                  <span>{savingType ? "Saving..." : editingTypeId ? "Update Slot Type" : "Create Slot Type"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
