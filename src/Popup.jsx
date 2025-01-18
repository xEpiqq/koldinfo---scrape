// my-chrome-extension/src/Popup.jsx
import React from 'react'

export default function Popup() {
  return (
    <div className="relative w-[350px] h-[250px] bg-gray-50 text-gray-800 flex flex-col rounded-md shadow-lg">
      <header className="flex items-center justify-between px-4 py-3 bg-sky-50 border-b border-sky-200">
        <div className="flex items-center gap-2">
          <img
            src="https://i.ibb.co/vYGgN3t/koldinfologo.png"
            alt="Koldinfo"
            className="h-8 w-8"
          />
          <h1 className="text-xl font-bold text-sky-400">Koldinfo Scrape</h1>
        </div>
        <button className="text-sm font-semibold text-sky-400 hover:text-sky-900">
          Sign Out
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <h2 className="text-lg font-semibold mb-2">Welcome Karston Fox!</h2>
        <p>
          Signed in as <span className="font-medium">karston@koldleads.com</span>.
        </p>
        <button
          onClick={() => window.open('https://www.linkedin.com/search/results/people/', '_blank')}
          className="mt-4 w-full rounded bg-sky-400 py-2 text-white font-semibold hover:bg-sky-700"
        >
          Visit LinkedIn to Start Scraping
        </button>
      </main>

      <a
        href="https://app.koldinfo.com"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-2 text-xs text-sky-400 hover:text-sky-600 font-bold"
      >
        Enrich data on koldinfo web
      </a>
    </div>
  )
}
