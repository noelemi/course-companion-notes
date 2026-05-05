import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { jsPDF } from "jspdf";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Learner Notes — Symitar eLearning" },
      { name: "description", content: "Take notes for your Symitar eLearning module and download them as a PDF." },
    ],
  }),
});

const COURSE_TITLE = "Symitar eLearning: Account Maintenance & Inquiries";
const MODULE_TITLE = "Module 2: Moving Money";
const NAME_KEY = "learner-notes:name";
const NOTES_KEY = "learner-notes:notes";

function Index() {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      setName(localStorage.getItem(NAME_KEY) ?? "");
      setNotes(localStorage.getItem(NOTES_KEY) ?? "");
    } catch {}
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(NAME_KEY, name);
      localStorage.setItem(NOTES_KEY, notes);
    } catch {}
    setSaved(true);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), 1200);
  }, [name, notes]);

  const handleDownload = () => {
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 54;
    let y = margin;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 58, 92);
    doc.setFontSize(16);
    doc.text(COURSE_TITLE, margin, y);
    y += 22;

    doc.setFontSize(13);
    doc.setTextColor(60, 60, 60);
    doc.text(MODULE_TITLE, margin, y);
    y += 24;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(90, 90, 90);
    const date = new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.text(`Name: ${name || "—"}`, margin, y);
    doc.text(`Date: ${date}`, pageWidth - margin, y, { align: "right" });
    y += 14;

    doc.setDrawColor(26, 58, 92);
    doc.setLineWidth(1);
    doc.line(margin, y, pageWidth - margin, y);
    y += 22;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(26, 58, 92);
    doc.text("Notes", margin, y);
    y += 16;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    const lines = doc.splitTextToSize(notes || "(No notes recorded.)", pageWidth - margin * 2);
    const lineHeight = 15;
    for (const line of lines) {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    }

    const safeName = (name || "learner").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    doc.save(`symitar-module-2-notes-${safeName}.pdf`);
  };

  const handleClear = () => {
    setNotes("");
    setConfirmOpen(false);
  };

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      <div className="mx-auto max-w-3xl px-5 py-6">
        <header className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#1a3a5c]">
            {MODULE_TITLE}
          </p>
          <h1 className="mt-1 text-xl font-semibold text-slate-900">Learner Notes</h1>
        </header>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Your Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1a3a5c] focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20"
          />
        </label>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Notes</span>
            <span
              className={`text-xs text-slate-500 transition-opacity duration-300 ${
                saved ? "opacity-100" : "opacity-0"
              }`}
              aria-live="polite"
            >
              Saved ✓
            </span>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Type your notes, questions, or reflections here..."
            className="mt-1 w-full min-h-[260px] resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-[#1a3a5c] focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20"
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center justify-center rounded-md bg-[#1a3a5c] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#14304b] focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/40"
          >
            Download My Notes
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="text-sm text-slate-500 underline-offset-4 hover:text-[#1a3a5c] hover:underline"
          >
            Clear Notes
          </button>
        </div>
      </div>

      {confirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setConfirmOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold text-slate-900">Clear all notes?</h2>
            <p className="mt-1 text-sm text-slate-600">
              This will permanently delete your notes for this module. This cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="rounded-md bg-[#1a3a5c] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#14304b]"
              >
                Clear Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
