import React from "react"
import { CheckCircleIcon } from "@heroicons/react/20/solid"

export default function ExportUI({ onExportClick }) {
  return (
    <div className="flex items-center justify-between p-6">
      {/* Brand Logo + Title */}
      <div className="flex items-center gap-2">
        <img
          src="https://i.ibb.co/vYGgN3t/koldinfologo.png"
          alt="Koldinfo"
          className="h-10 w-10"
        />
        <span className="text-2xl font-bold text-sky-700 mr-6">Koldinfo</span>
      </div>

      {/* Export Button */}
      <button
        type="button"
        onClick={onExportClick}
        className="inline-flex items-center gap-x-2 rounded-md bg-sky-400 px-3.5 py-2.5 text-2xl font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 active:scale-95"
      >
        Export
        <CheckCircleIcon aria-hidden="true" className="h-7 w-7" />
      </button>
    </div>
  )
}
