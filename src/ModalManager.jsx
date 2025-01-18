import React, { useState, useRef } from "react"

// Helper for small delays
function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms))
}

export default function ModalManager({ ajaxNumber, onClose }) {
  const [showConfig, setShowConfig] = useState(true)
  const [showProgress, setShowProgress] = useState(false)
  const [totalWanted, setTotalWanted] = useState("100")
  const [startPage, setStartPage] = useState("1")
  const [fetchedCount, setFetchedCount] = useState(0)
  const [statusMsg, setStatusMsg] = useState("")
  const [scrapedData, setScrapedData] = useState([]) // holds partial or full results

  const stopRef = useRef(false)

  // Close everything
  function closeAll() {
    onClose()
    setShowConfig(false)
    setShowProgress(false)
  }

  // Download data as CSV
  function downloadCSV(data) {
    const columns = [
      "name",
      "url",
      "jobTitle",
      "location",
      "connectionDegree",
      "badgeIcon",
      "totalFollowers",
      "extraLinks",
    ]
    const header = columns.map((c) => `"${c}"`).join(",")
    const rows = data.map((item) =>
      columns
        .map((col) => {
          const val = item[col]
          if (Array.isArray(val)) {
            return `"${JSON.stringify(val).replace(/"/g, '""')}"` 
          }
          const strVal = val ? String(val) : ""
          return `"${strVal.replace(/"/g, '""')}"` 
        })
        .join(",")
    )
    const csvString = [header, ...rows].join("\n")
    const blob = new Blob([csvString], { type: "text/csv" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "linkedin_export.csv"
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  // Actual fetching
  async function fetchLinkedInData(offset) {
    const url = `https://www.linkedin.com/voyager/api/graphql?variables=(start:${offset},origin:OTHER,query:(flagshipSearchIntent:SEARCH_SRP,queryParameters:List((key:resultType,value:List(PEOPLE))),includeFiltersInResponse:false))&queryId=voyagerSearchDashClusters.cd5ee9d14d375bf9ca0596cfe0cbb926`
    try {
      const resp = await fetch(url, {
        headers: {
          accept: "application/vnd.linkedin.normalized+json+2.1",
          "csrf-token": `ajax:${ajaxNumber}`,
        },
      })
      if (!resp.ok) throw new Error(`Request failed with ${resp.status}`)
      const json = await resp.json()
      const included = json.included || []

      return included
        .filter((x) => x.$type === "com.linkedin.voyager.dash.search.EntityResultViewModel")
        .map((entity) => {
          const name = entity?.title?.text || "N/A"
          const rawUrl = entity?.navigationUrl || ""
          const profileUrl = rawUrl.split("?")[0].replace(/\/$/, "")
          const jobTitle = entity?.primarySubtitle?.text || ""
          const location = entity?.secondarySubtitle?.text || ""
          const connectionDegree = entity?.badgeText?.text?.replace("• ", "") || ""

          let badgeIcon = null
          const iconDetail = entity?.badgeIcon?.attributes?.[0]?.detailData || {}
          if (iconDetail.icon === "IC_LINKEDIN_INFLUENCER_COLOR_ICON_16DP") {
            badgeIcon = "Influencer"
          } else if (iconDetail.systemImage === "SYS_ICN_VERIFIED_SMALL") {
            badgeIcon = "Verified"
          } else if (iconDetail.icon === "IC_LINKEDIN_PREMIUM_GOLD_ICON_16DP") {
            badgeIcon = "Premium"
          }

          let totalFollowers = null
          const extraLinks = []
          if (Array.isArray(entity?.insightsResolutionResults)) {
            entity.insightsResolutionResults.forEach((insight) => {
              const text = insight?.simpleInsight?.title?.text || ""
              const matchFollowers = text.match(/(\d+(\.\d+)?[KMB]?)(?=\s+followers)/i)
              if (matchFollowers && !totalFollowers) totalFollowers = matchFollowers[1]
              const ctaUrl = insight?.premiumCustomCtaInsight?.navigationContext?.url
              if (ctaUrl) extraLinks.push(ctaUrl)
            })
          }

          return {
            name,
            url: profileUrl,
            jobTitle,
            location,
            connectionDegree,
            badgeIcon,
            totalFollowers,
            extraLinks,
          }
        })
    } catch (err) {
      console.error(err)
      return []
    }
  }

  // Start the scraping
  async function startScraping() {
    setShowConfig(false)
    setShowProgress(true)
    setScrapedData([])
    setFetchedCount(0)
    setStatusMsg("")
    stopRef.current = false

    const wanted = parseInt(totalWanted, 10)
    const start = parseInt(startPage, 10)
    if (isNaN(wanted) || wanted < 1 || wanted > 1000) {
      alert("Please enter a valid total (1–1000).")
      closeAll()
      return
    }
    if (isNaN(start) || start < 1) {
      alert("Please enter a valid start page (≥1).")
      closeAll()
      return
    }

    let i = 0
    let allResults = []

    try {
      while (i < wanted) {
        if (stopRef.current) break
        const offset = (start - 1) * 10 + i
        const pageData = await fetchLinkedInData(offset)
        if (!pageData.length) break

        allResults = allResults.concat(pageData)
        setScrapedData(allResults) // update state so we have partial results
        i += pageData.length
        setFetchedCount(i)
        setStatusMsg("Please don't leave this page.")
        await sleep(1000)
      }
    } catch (err) {
      console.error(err)
    }

    if (allResults.length) {
      setFetchedCount(i)
      setStatusMsg("All done! Export now or cancel.")
    } else {
      alert("No data found or canceled early.")
      closeAll()
    }
  }

  // -- CONFIG MODAL --
  const configModal = (
    <div
      className="m-4 w-full max-w-md rounded bg-white p-6 text-center shadow-lg"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="mb-4 text-lg font-bold">How many people to export?</h2>
      <div className="mb-2 flex items-center justify-center gap-2">
        <input
          className="w-20 rounded border border-gray-300 p-1 text-sm"
          type="number"
          value={totalWanted}
          onChange={(e) => setTotalWanted(e.target.value)}
          placeholder="Max 1000"
        />
        <input
          className="w-20 rounded border border-gray-300 p-1 text-sm"
          type="number"
          value={startPage}
          onChange={(e) => setStartPage(e.target.value)}
          placeholder="Start page"
        />
      </div>
      <div className="mb-4 text-xs text-gray-500">Max 1000, page starts at 1</div>
      <div className="flex justify-center gap-4">
        <button
          onClick={closeAll}
          className="rounded bg-blue-50 px-4 py-2 text-sm text-blue-600"
        >
          Cancel
        </button>
        <button
          onClick={startScraping}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Export CSV
        </button>
      </div>
    </div>
  )

  // -- PROGRESS MODAL --
  const progressModal = (
    <div
      className="m-4 w-full max-w-md rounded bg-white p-6 text-center shadow-lg"
      onClick={(e) => e.stopPropagation()}
    >
      <img
        src="https://i.ibb.co/vYGgN3t/koldinfologo.png"
        alt="Scraping"
        className="mx-auto mb-4 h-8"
      />
      <h2 className="mb-2 text-lg font-bold">
        {fetchedCount} of {totalWanted} people exported
      </h2>
      <p className="mb-4 text-sm">{statusMsg}</p>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => {
            stopRef.current = true
            closeAll()
          }}
          className="rounded bg-blue-50 px-4 py-2 text-sm text-blue-600"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            // STOP and SAVE what's currently in scrapedData
            stopRef.current = true
            if (scrapedData.length) downloadCSV(scrapedData)
            closeAll()
          }}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Stop &amp; Save
        </button>
      </div>
    </div>
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={closeAll}
    >
      {showConfig && configModal}
      {showProgress && progressModal}
    </div>
  )
}
