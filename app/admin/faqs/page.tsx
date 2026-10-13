"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  getFaqsAction,
  createFaqAction,
  updateFaqAction,
  deleteFaqAction,
  FaqItem,
} from "@/lib/actions/faqs";
import { useForm } from "@/lib/useForm";
import {
  HelpCircle,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  MoveUp,
  MoveDown,
} from "lucide-react";

interface FaqFormFields {
  question: string;
  answer: string;
  category: string;
  order: string;
}

const DEFAULT_FAQ_FORM: FaqFormFields = {
  question: "",
  answer: "",
  category: "General",
  order: "1",
};

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // useForm for create/edit
  const { form, handleChange, setFields, setFormFields, resetFormFields } =
    useForm<FaqFormFields>(DEFAULT_FAQ_FORM);

  const loadFaqs = async () => {
    try {
      setLoading(true);
      const res = await getFaqsAction();
      setFaqs(res);
    } catch (err) {
      console.error("Failed to load FAQs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    resetFormFields();
    setFields({ order: String((faqs.length || 0) + 1) });
    setShowAddModal(true);
    setErrorMsg(null);
  };

  const handleOpenEdit = (faq: FaqItem) => {
    setEditingId(faq.id);
    setFormFields({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || "General",
      order: String(faq.order || 1),
    });
    setShowAddModal(true);
    setErrorMsg(null);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingId(null);
    resetFormFields();
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) {
      setErrorMsg("Please provide both a question and an answer.");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);

      const parsedOrder = parseInt(form.order, 10) || 1;

      if (editingId) {
        // Update existing FAQ
        const res = await updateFaqAction(editingId, {
          question: form.question.trim(),
          answer: form.answer.trim(),
          category: form.category.trim() || "General",
          order: parsedOrder,
        });

        if (res.success) {
          await loadFaqs();
          handleCloseModal();
        } else {
          setErrorMsg(res.error || "Failed to update FAQ.");
        }
      } else {
        // Create new FAQ
        const res = await createFaqAction({
          question: form.question.trim(),
          answer: form.answer.trim(),
          category: form.category.trim() || "General",
          order: parsedOrder,
        });

        if (res.success) {
          await loadFaqs();
          handleCloseModal();
        } else {
          setErrorMsg(res.error || "Failed to create FAQ.");
        }
      }
    } catch (err: any) {
      console.error("Save FAQ error:", err);
      setErrorMsg(err?.message || "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, question: string) => {
    if (!confirm(`Are you sure you want to delete this FAQ?\n"${question}"`)) {
      return;
    }
    try {
      await deleteFaqAction(id);
      setFaqs((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error("Delete FAQ error:", err);
      alert("Failed to delete FAQ.");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950">
              FAQs Content Management
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Add, edit, and organize frequently asked questions displayed on the public homepage.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800"
          >
            <Plus className="h-4 w-4 text-emerald-400" />
            <span>Add New FAQ</span>
          </button>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        ) : faqs.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center">
            <HelpCircle className="mx-auto h-12 w-12 text-zinc-300" />
            <h3 className="mt-3 text-base font-bold text-zinc-900">No FAQs Found</h3>
            <p className="mt-1 text-xs text-zinc-500">
              Create answers to common student questions about licenses, road tests, and lesson bookings.
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white"
            >
              <Plus className="h-4 w-4 text-emerald-400" />
              <span>Create First FAQ</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={faq.id}
                className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-xs hover:border-zinc-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-700">
                        #{faq.order || index + 1}
                      </span>
                      {faq.category && (
                        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                          {faq.category}
                        </span>
                      )}
                      <span className="text-[11px] font-mono text-zinc-400">
                        doc.id: {faq.id.slice(0, 8)}...
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-zinc-950">
                      {faq.question}
                    </h3>
                    <p className="text-xs leading-relaxed text-zinc-600 whitespace-pre-line">
                      {faq.answer}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 sm:pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(faq)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
                    >
                      <Edit className="h-3.5 w-3.5 text-zinc-500" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(faq.id, faq.question)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for Add / Edit FAQ (Using useForm) */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <h3 className="text-base font-bold text-zinc-950">
                  {editingId ? "Edit FAQ" : "Add New FAQ"}
                </h3>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {errorMsg && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                {/* Question */}
                <div>
                  <label htmlFor="question" className="block text-xs font-semibold text-zinc-900">
                    Question <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="question"
                    name="question"
                    required
                    value={form.question}
                    onChange={handleChange}
                    placeholder="e.g. Do you offer mock road tests before the ICBC exam?"
                    className="mt-1 block w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>

                {/* Answer */}
                <div>
                  <label htmlFor="answer" className="block text-xs font-semibold text-zinc-900">
                    Answer <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="answer"
                    name="answer"
                    required
                    rows={4}
                    value={form.answer}
                    onChange={handleChange}
                    placeholder="Write a clear, comprehensive answer for your students..."
                    className="mt-1 block w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>

                {/* Category & Order Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="block text-xs font-semibold text-zinc-900">
                      Category
                    </label>
                    <input
                      type="text"
                      id="category"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      placeholder="e.g. Road Test, General, Pricing"
                      className="mt-1 block w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="order" className="block text-xs font-semibold text-zinc-900">
                      Display Order #
                    </label>
                    <input
                      type="number"
                      id="order"
                      name="order"
                      min="1"
                      value={form.order}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    />
                  </div>
                </div>

                {/* Modal actions */}
                <div className="flex items-center justify-end gap-3 border-t border-zinc-100 pt-4 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 transition disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    )}
                    <span>{saving ? "Saving..." : editingId ? "Save Changes" : "Create FAQ"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
