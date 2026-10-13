"use client";

import React, { useEffect, useState } from "react";
import CloudinaryUploader from "@/components/CloudinaryUploader";
import {
  getGalleryImagesAction,
  createGalleryImageAction,
  updateGalleryImageAction,
  deleteGalleryImageAction,
  GalleryItem,
} from "@/lib/actions/gallery";
import { useForm } from "@/lib/useForm";
import {
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Sparkles,
  MapPin,
  User,
  Filter,
} from "lucide-react";

interface GalleryFormFields {
  url: string;
  title: string;
  category: GalleryItem["category"];
  studentName: string;
  location: string;
  description: string;
  featured: boolean;
}

const DEFAULT_GALLERY_FORM: GalleryFormFields = {
  url: "",
  title: "",
  category: "Student Passes",
  studentName: "",
  location: "Surrey 152nd St ICBC",
  description: "",
  featured: false,
};

const CATEGORIES: GalleryItem["category"][] = [
  "Student Passes",
  "Training Cars",
  "Lessons & Road Tests",
  "Safety & Dual Control",
  "General",
];

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("All");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // useForm hook
  const { form, handleChange, setFields, resetFormFields } =
    useForm<GalleryFormFields>(DEFAULT_GALLERY_FORM);

  const loadGallery = async () => {
    try {
      setLoading(true);
      const data = await getGalleryImagesAction();
      setImages(data);
    } catch (err) {
      console.error("Failed to load gallery images:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    resetFormFields();
    setShowModal(true);
    setFeedback(null);
  };

  const handleOpenEdit = (item: GalleryItem) => {
    setEditingId(item.id);
    setFields({
      url: item.url,
      title: item.title,
      category: item.category,
      studentName: item.studentName || "",
      location: item.location || "Surrey, BC",
      description: item.description || "",
      featured: Boolean(item.featured),
    });
    setShowModal(true);
    setFeedback(null);
  };

  const handleUploadSuccess = (uploadedUrl: string) => {
    setFields({ url: uploadedUrl });
    setFeedback({
      type: "success",
      message: "Image uploaded successfully to Cloudinary! Please complete the title and details below.",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.url.trim()) {
      setFeedback({ type: "error", message: "Please upload an image or provide an image URL." });
      return;
    }
    if (!form.title.trim()) {
      setFeedback({ type: "error", message: "Please provide a title for the image." });
      return;
    }

    try {
      setSubmitting(true);
      setFeedback(null);

      if (editingId) {
        const res = await updateGalleryImageAction(editingId, {
          url: form.url.trim(),
          title: form.title.trim(),
          category: form.category,
          studentName: form.studentName.trim(),
          location: form.location.trim(),
          description: form.description.trim(),
          featured: form.featured,
        });

        if (res.success) {
          await loadGallery();
          setShowModal(false);
          resetFormFields();
        } else {
          setFeedback({ type: "error", message: res.error || "Failed to update image." });
        }
      } else {
        const res = await createGalleryImageAction({
          url: form.url.trim(),
          title: form.title.trim(),
          category: form.category,
          studentName: form.studentName.trim(),
          location: form.location.trim(),
          description: form.description.trim(),
          featured: form.featured,
        });

        if (res.success) {
          await loadGallery();
          setShowModal(false);
          resetFormFields();
        } else {
          setFeedback({ type: "error", message: res.error || "Failed to add image." });
        }
      }
    } catch (err: any) {
      console.error("Gallery save error:", err);
      setFeedback({ type: "error", message: err?.message || "An unexpected error occurred." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}" from the gallery?`)) return;

    try {
      setDeletingId(id);
      const res = await deleteGalleryImageAction(id);
      if (res.success) {
        setImages((prev) => prev.filter((img) => img.id !== id));
      } else {
        alert(res.error || "Failed to delete image.");
      }
    } catch (err) {
      console.error("Error deleting image:", err);
      alert("Failed to delete image.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredImages =
    filterCategory === "All"
      ? images
      : images.filter((img) => img.category === filterCategory);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950">
            Photo Gallery CMS
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Upload and manage photos of student road test passes, training vehicles, and driving lessons.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800"
        >
          <Plus className="h-4 w-4 text-emerald-400" />
          <span>Add Photo to Gallery</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-200">
        <span className="text-xs font-semibold text-zinc-500 mr-2 flex items-center gap-1 shrink-0">
          <Filter className="h-3.5 w-3.5" />
          <span>Category:</span>
        </span>
        {["All", ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilterCategory(cat)}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold whitespace-nowrap transition ${
              filterCategory === cat
                ? "bg-zinc-900 text-white shadow-xs"
                : "bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
            }`}
          >
            {cat} {cat === "All" ? `(${images.length})` : `(${images.filter((i) => i.category === cat).length})`}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="mt-3 text-xs font-semibold">Loading gallery photos from Firestore...</p>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-zinc-200 p-12 text-center bg-white">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400">
            <ImageIcon className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-bold text-zinc-900">No photos found</h3>
          <p className="mt-1 text-xs text-zinc-500">
            {filterCategory === "All"
              ? "Get started by adding your first student road test photo."
              : `No photos in the "${filterCategory}" category yet.`}
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 transition"
          >
            <Plus className="h-3.5 w-3.5 text-emerald-400" />
            <span>Upload Photo</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredImages.map((img) => (
            <div
              key={img.id}
              className="group flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-xs hover:border-zinc-300 hover:shadow-md transition"
            >
              <div>
                {/* Image Container with Badges */}
                <div className="relative aspect-4/3 w-full overflow-hidden bg-zinc-100">
                  <img
                    src={img.url}
                    alt={img.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-zinc-900/80 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-semibold text-white">
                      {img.category}
                    </span>
                    {img.featured && (
                      <span className="rounded-full bg-amber-500/90 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white flex items-center gap-1">
                        <Sparkles className="h-2.5 w-2.5" />
                        <span>Featured</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-sm text-zinc-950 line-clamp-1">{img.title}</h3>
                  {img.studentName && (
                    <p className="text-xs text-zinc-600 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>{img.studentName}</span>
                    </p>
                  )}
                  {img.location && (
                    <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      <span className="truncate">{img.location}</span>
                    </p>
                  )}
                  {img.description && (
                    <p className="text-xs text-zinc-500 line-clamp-2 italic pt-1 border-t border-zinc-100">
                      &ldquo;{img.description}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3 bg-zinc-50/70 border-t border-zinc-100 flex items-center justify-between gap-2 text-xs">
                <a
                  href={img.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 transition"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>View</span>
                </a>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(img)}
                    className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-200 transition"
                    title="Edit Details"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(img.id, img.title)}
                    disabled={deletingId === img.id}
                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition"
                    title="Delete Image"
                  >
                    {deletingId === img.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-zinc-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 p-5 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-800">
                  <ImageIcon className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-950">
                    {editingId ? "Edit Gallery Photo Details" : "Upload & Add New Photo"}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Upload via Cloudinary or paste direct URL, then save to Firestore.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {feedback && (
                <div
                  className={`rounded-xl border p-4 text-xs font-medium flex items-center gap-2.5 ${
                    feedback.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {feedback.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}

              {/* 1. Cloudinary Uploader Component */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                  1. Image File Upload (Cloudinary)
                </label>
                <CloudinaryUploader onUpload={handleUploadSuccess} />
              </div>

              {/* Form Fields */}
              <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-zinc-100">
                {/* Direct Image URL (can be edited/pasted or auto-filled by Cloudinary) */}
                <div>
                  <label htmlFor="url" className="block text-xs font-semibold text-zinc-700">
                    Image URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    id="url"
                    name="url"
                    required
                    value={form.url}
                    onChange={handleChange}
                    placeholder="https://res.cloudinary.com/... or https://..."
                    className="mt-1 block w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
                  />
                  <p className="mt-1 text-[11px] text-zinc-400">
                    Automatically populated upon Cloudinary upload, or paste an external URL.
                  </p>
                </div>

                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-xs font-semibold text-zinc-700">
                    Photo Title / Headline <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Gurpreet passing Class 5 on first attempt at Surrey 152nd ICBC"
                    className="mt-1 block w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
                  />
                </div>

                {/* Category & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="block text-xs font-semibold text-zinc-700">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="studentName" className="block text-xs font-semibold text-zinc-700">
                      Student Name (Optional)
                    </label>
                    <input
                      type="text"
                      id="studentName"
                      name="studentName"
                      value={form.studentName}
                      onChange={handleChange}
                      placeholder="e.g. Gurpreet S."
                      className="mt-1 block w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-xs font-semibold text-zinc-700">
                    Location / ICBC Test Centre
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. Surrey 152nd St ICBC / Langley ICBC"
                    className="mt-1 block w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-xs font-semibold text-zinc-700">
                    Caption / Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={2}
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Brief background or student quote..."
                    className="mt-1 block w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
                  />
                </div>

                {/* Featured checkbox */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={form.featured}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  />
                  <label htmlFor="featured" className="text-xs font-medium text-zinc-700">
                    Mark as Featured (Highlight at top of public gallery)
                  </label>
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 transition disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    )}
                    <span>{submitting ? "Saving to Firestore..." : editingId ? "Save Changes" : "Save to Gallery"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
