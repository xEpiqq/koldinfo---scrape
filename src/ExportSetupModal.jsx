import React from "react"

export default function ExportSetupModal({
  totalWanted,
  setTotalWanted,
  startPage,
  setStartPage,
  onClose,
  onExport,
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
        <h2 className="text-3xl font-semibold text-gray-900">
          How many profiles do you wanna scrape?
        </h2>

        {/* Inputs stacked vertically, using the borderless style */}
        <div className="mt-12 space-y-6 text-left">
          {/* Number to Scrape */}
          <div>
            <label
              htmlFor="totalWanted"
              className="block text-xl font-medium text-gray-900"
            >
              Number to Scrape (Max 1000)
            </label>
            <div className="relative mt-2">
              <input
                id="totalWanted"
                type="number"
                placeholder="100"
                className="peer block w-full bg-gray-100 px-3 py-1.5 text-xl text-gray-700 placeholder:text-gray-500 focus:outline focus:outline-0"
                value={totalWanted}
                onChange={(e) => setTotalWanted(e.target.value)}
              />
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 border-gray-300 peer-focus:border-t-2 peer-focus:border-indigo-400"
              />
            </div>
          </div>

          {/* Start Page */}
          <div>
            <label
              htmlFor="startPage"
              className="block text-xl font-medium text-gray-900"
            >
              Start Page
            </label>
            <div className="relative mt-2">
              <input
                id="startPage"
                type="number"
                placeholder="1"
                className="peer block w-full bg-gray-100 px-3 py-1.5 text-xl text-gray-700 placeholder:text-gray-500 focus:outline focus:outline-0"
                value={startPage}
                onChange={(e) => setStartPage(e.target.value)}
              />
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 border-gray-300 peer-focus:border-t-2 peer-focus:border-indigo-400"
              />
            </div>
          </div>
        </div>

        {/* Single big button at the bottom */}
        <div className="mt-10">
          <button
            className="w-full rounded-md bg-sky-400 px-4 py-3 text-xl font-bold text-white hover:bg-sky-700"
            onClick={onExport}
          >
            Export CSV
          </button>
        </div>
      </div>
    </div>
  )
}
