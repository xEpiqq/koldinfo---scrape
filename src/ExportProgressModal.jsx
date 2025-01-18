import React from "react"

export default function ExportProgressModal({
  fetchedCount,
  totalWanted,
  statusMsg,
  onClose,
  onStopAndSave,
}) {
  // Keep overlay style unchanged
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
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sky-100">
          <img
            src="https://i.ibb.co/vYGgN3t/koldinfologo.png"
            alt="Scraping"
            className="h-8"
          />
        </div>
        <h2 className="mt-2 text-2xl font-semibold text-gray-900">
          {fetchedCount} of {totalWanted} people scraped
        </h2>
        <p className="mt-3 text-xl text-gray-600">{statusMsg}</p>
        <div className="mt-8 flex justify-center space-x-3">
          <button
            onClick={onClose}
            className="w-full rounded-md bg-sky-50 py-3 text-xl font-bold text-sky-400 hover:bg-sky-100"
          >
            Cancel
          </button>
          <button
            onClick={onStopAndSave}
            className="w-full rounded-md bg-sky-400 py-3 text-xl font-bold text-white hover:bg-sky-700"
          >
            Stop &amp; Save
          </button>
        </div>
      </div>
    </div>
  )
}
