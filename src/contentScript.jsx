import React, { useState } from "react"
import { createRoot } from "react-dom/client"
import tailwindStyles from "./index.css?inline"
import ExportUI from "./ExportUI"
import ParentExportFlow from "./ParentExportFlow"

function getCookieValue(name) {
  const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]+)`))
  return match ? match[2] : ""
}

const jsessionId = getCookieValue("JSESSIONID").replace(/^"|"$/g, "")
const ajaxMatch = jsessionId.match(/ajax:(\d+)/)
const ajaxNumber = ajaxMatch?.[1] || ""

function FloatingUI() {
  const [showFlow, setShowFlow] = useState(false)

  return (
    <div className="flex items-center justify-center text-white font-bold">
      {/* Normal Export Button */}
      <ExportUI onExportClick={() => setShowFlow(true)} />

      {/* Export Flow */}
      <ParentExportFlow open={showFlow} onClose={() => setShowFlow(false)} ajaxNumber={ajaxNumber} />
    </div>
  )
}

const searchMarvelSrp = document.querySelector(".search-marvel-srp")
const resultsContainer = document.querySelector(".search-results-container")

if (searchMarvelSrp && resultsContainer) {
  const container = document.createElement("div")
  const shadowRoot = container.attachShadow({ mode: "open" })

  const styleSheet = new CSSStyleSheet()
  styleSheet.replaceSync(tailwindStyles)
  shadowRoot.adoptedStyleSheets = [styleSheet]

  container.style.cssText = `
    display: flex;
    justify-content: flex-end;
    margin: 1rem;
    align-items: center;
  `
  searchMarvelSrp.insertBefore(container, resultsContainer)
  createRoot(shadowRoot).render(<FloatingUI />)
}
