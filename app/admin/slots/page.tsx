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
} from "lucide-react";

interface SlotTypeFormFields {
  name: string;
  price: string;
}

const DEFAULT_SLOT_TYPE_FORM: SlotTypeFormFields = {
  name: "",
  price: "110",
};

export default function AdminSlotsPage() {
  const [activeTab, setActiveTab] = useState<"slots" | "types">("slots");

  // Slots state
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [filterDate, setFilterDate] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Slot Types state
  const [slotTypes, setSlotTypes] = useState<SlotTypeItem[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [savingType, setSavingType] = useState(false);
  const [typeError, setTypeError] = useState<string | null>(null);

  // useForm for Slot Types
  const { form: typeForm, handleChange: handleTypeChange, setFields: setTypeFields, resetFormFields: resetTypeForm } =
    useForm<SlotTypeFormFields>(DEFAULT_SLOT_TYPE_FORM);

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

  const handleDeleteSlot = async (id: string, time: string) => {
    if (!confirm(`Are you sure you want to delete slot: ${time}?`)) return;
    try {
      setDeletingId(id);
      await deleteSlotAction(id);
      setSlots((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Failed to delete slot:", err);
      alert("Failed to delete slot.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (slot: SlotItem) => {
    const newStatus = slot.status === "available" ? "booked" : "available";
    try {
      await updateSlotStatusAction(slot.id, newStatus);
      setSlots((prev) =>
        prev.map((s) => (s.id === slot.id ? { ...s, status: newStatus, available: newStatus === "available" } : s))
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
              Manage scheduled lesson time slots and configure lesson slot types with live pricing.
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
                  return (
                    <div
                      key={slot.id}
                      className={`flex flex-col justify-between rounded-xl border p-4.5 transition ${
                        isAvailable
                          ? "border-zinc-200 bg-white hover:border-zinc-300"
                          : "border-zinc-200 bg-zinc-50/70"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                            <span>{slot.date}</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(slot)}
                            title="Click to toggle status"
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition ${
                              isAvailable
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                            }`}
                          >
                            {slot.status}
                          </button>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-zinc-400" />
                          <span className="text-sm font-bold text-zinc-900">{slot.time}</span>
                          <span className="text-[11px] text-zinc-400 font-medium">({slot.duration})</span>
                        </div>

                        <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-600">
                          <Car className="h-3.5 w-3.5 text-emerald-600" />
                          <span>{slot.instructor}</span>
                        </div>

                        {slot.bookedBy && (
                          <div className="mt-3 rounded-lg border border-zinc-200 bg-white p-2.5 text-xs text-zinc-700">
                            <p className="font-semibold text-zinc-900 flex items-center gap-1">
                              <User className="h-3 w-3 text-zinc-500" />
                              <span>{slot.bookedBy.name}</span>
                            </p>
                            <p className="text-[11px] text-zinc-500 mt-0.5">
                              {slot.bookedBy.phone} • {slot.bookedBy.email}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3">
                        <span className="text-[10px] font-mono text-zinc-400">
                          ID: {slot.id.slice(0, 8)}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleDeleteSlot(slot.id, `${slot.date} ${slot.time}`)}
                          disabled={deletingId === slot.id}
                          className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                        >
                          {deletingId === slot.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          <span>Delete</span>
                        </button>
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

        {/* Modal: Add / Edit Slot Type (Using useForm) */}
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
