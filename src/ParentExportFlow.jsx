import React, { useState, useEffect, useRef } from "react"
import ExportSetupModal from "./ExportSetupModal"
import ExportProgressModal from "./ExportProgressModal"
import ExportDoneModal from "./ExportDoneModal"

export default function ParentExportFlow({ open, onClose, ajaxNumber = "" }) {
  const [modalStep, setModalStep] = useState(0)
  const [totalWanted, setTotalWanted] = useState("100")
  const [startPage, setStartPage] = useState("1")
  const [fetchedCount, setFetchedCount] = useState(0)
  const [statusMsg, setStatusMsg] = useState("")
  const [scrapedData, setScrapedData] = useState([])

  const stopRef = useRef(false)

  // Reset the flow each time "open" changes
  useEffect(() => {
    if (open) setModalStep(1)
    else setModalStep(0)
  }, [open])

  // Simple helper to pause between requests
  function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms))
  }

  // Download data as CSV
  function downloadCSV(data) {
    const cols = [
      "name",
      "url",
      "jobTitle",
      "location",
      "connectionDegree",
      "badgeIcon",
      "totalFollowers",
      "extraLinks",
    ]
    const header = cols.map((c) => `"${c}"`).join(",")
    const rows = data.map((item) =>
      cols
        .map((col) => {
          const val = item[col]
          if (Array.isArray(val)) {
            return `"${JSON.stringify(val).replace(/"/g, '""')}"` 
          }
          return `"${String(val || "").replace(/"/g, '""')}"` 
        })
        .join(",")
    )
    const csvData = [header, ...rows].join("\n")
    const blob = new Blob([csvData], { type: "text/csv" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "linkedin_export.csv"
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  // Fetch data from LinkedIn
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
          const name = entity?.title?.text || ""
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
              const match = text.match(/(\d+(\.\d+)?[KMB]?)(?=\s+followers)/i)
              if (match && !totalFollowers) totalFollowers = match[1]
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

  // Close everything
  function handleClose() {
    onClose()
    stopRef.current = true
  }

  // Start scraping
  async function handleStartScraping() {
    const wanted = parseInt(totalWanted, 10)
    const start = parseInt(startPage, 10)

    if (isNaN(wanted) || wanted < 1 || wanted > 1000) {
      alert("Please enter a valid total (1–1000).")
      handleClose()
      return
    }
    if (isNaN(start) || start < 1) {
      alert("Please enter a valid start page (≥1).")
      handleClose()
      return
    }

    setModalStep(2) // progress modal
    setScrapedData([])
    setFetchedCount(0)
    setStatusMsg("Scraping in progress...")

    stopRef.current = false
    let allResults = []
    let i = 0

    try {
      while (i < wanted && !stopRef.current) {
        const offset = (start - 1) * 10 + i
        const pageData = await fetchLinkedInData(offset)
        if (!pageData.length) break
        allResults = allResults.concat(pageData)
        setScrapedData(allResults)
        i += pageData.length
        setFetchedCount(i)
        await sleep(1000)
      }
    } catch (err) {
      console.error(err)
    }

    if (!stopRef.current) {
      setFetchedCount(i)
      setStatusMsg("Scraping finished! Export or close.")
      setModalStep(3) // done modal
    }
  }

  // Stop and save
  function handleStopAndSave() {
    stopRef.current = true
    if (scrapedData.length) downloadCSV(scrapedData)
    handleClose()
  }

  // Final "save CSV" on done modal
  function handleSaveCSV() {
    if (scrapedData.length) downloadCSV(scrapedData)
    handleClose()
  }

  if (!open) return null

  return (
    <div >
      {modalStep === 1 && (
        <ExportSetupModal
          totalWanted={totalWanted}
          setTotalWanted={setTotalWanted}
          startPage={startPage}
          setStartPage={setStartPage}
          onClose={handleClose}
          onExport={handleStartScraping}
        />
      )}
      {modalStep === 2 && (
        <ExportProgressModal
          fetchedCount={fetchedCount}
          totalWanted={totalWanted}
          statusMsg={statusMsg}
          onClose={handleClose}
          onStopAndSave={handleStopAndSave}
        />
      )}
      {modalStep === 3 && (
        <ExportDoneModal
          fetchedCount={fetchedCount}
          totalWanted={totalWanted}
          onClose={handleClose}
          onSave={handleSaveCSV}
        />
      )}
    </div>
  )
}
