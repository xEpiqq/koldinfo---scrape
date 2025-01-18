import React from "react"

export default function ExportDoneModal({
  fetchedCount,
  totalWanted,
  onClose,
  onSave,
}) {
  // Overlay style must remain the same
  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-[400px] min-h-[300px] rounded-xl px-8 py-12 text-center shadow-lg"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <svg
            viewBox="0 0 24 24"
            className="h-7 w-7 text-green-600"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="mt-6 text-3xl font-semibold text-gray-900">
          Export Successful
        </h2>
        <p className="mt-3 text-xl text-gray-600">
          {fetchedCount} out of {totalWanted} people saved
        </p>
        <button
          onClick={onSave}
          className="mt-8 w-full rounded-md bg-sky-400 py-3 text-xl font-bold text-white hover:bg-sky-700"
        >
          Save CSV
        </button>
      </div>
    </div>
  )
}
