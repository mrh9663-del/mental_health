// initiallizing the Chart.js drawing, will be overwritten when given data inside function
let myChart = null 

const emotionCategories = {
  low: ["Sad", "Anxious", "Overwhelmed", "Exhausted"],   // used if mood is 1-3
  neutral: ["Calm", "Apathetic", "Bored", "Okay"],       // used if mood is 4-7
  high: ["Happy", "Excited", "Grateful", "Motivated"]    // used if mood is 8-10
}

// --- check-in page ---

// func to change 'val' to current value of slider
function updateMoodValue(val) {
  // query DOM to find the paragraph tag that displays the number and update its text
  const display = document.getElementById("moodValue")
  if (display) display.innerText = val

  // query the DOM for the empty div where we put the checkboxes
  const container = document.getElementById("emotionsContainer")
  if (!container) return // if we aren't on the checkin page break

  // find category to use based on the slider's integer value
  let category = "neutral"
  if (val <= 3) category = "low"
  if (val >= 8) category = "high"

  // grab the correct array of emotions from object above
  const emotions = emotionCategories[category]
  
  // take the array of emotions turn them into html checkboxes and place them in the page
  container.innerHTML = emotions.map(emo => 
    `<label><input type="checkbox" class="emotion-cb" value="${emo}"> ${emo}</label><br>`
  ).join("")
}

// run when user clicks save entry
function saveMood() {
  // grab the slider and text area from the page
  const moodEl = document.getElementById("moodSlider")
  const noteEl = document.getElementById("note")

  // if there is no slider just stop and warn the user
  if (!moodEl) {
    alert("Mood slider not found.")
    return
  }

  // turn the slider text into an actual math number
  const mood = Number(moodEl.value)
  // get the note and remove extra spaces at the ends
  const note = noteEl ? noteEl.value.trim() : ""

  // find all checked factor boxes and put them in a list
  const factors = []
  document.querySelectorAll('.factor-cb:checked').forEach(cb => {
    factors.push(cb.value)
  })

  // find all checked emotion boxes and put them in a list
  const emotions = []
  document.querySelectorAll('.emotion-cb:checked').forEach(cb => {
    emotions.push(cb.value)
  })

  // get saved data from local storage 
  // parse turns it into real code and the '|| []' makes an empty list if there's nothing saved so it doesnt crash
  const logs = JSON.parse(localStorage.getItem("moodLogs")) || []

  // make a new object for this check-in
  const entry = {
    mood: mood,
    factors: factors,
    emotions: emotions,
    note: note,
    date: new Date().toISOString() // saves the exact date and time
  }

  // add the entry to a big list of logs
  logs.push(entry)
  
  // turn the list into text so the browser can actually save it
  localStorage.setItem("moodLogs", JSON.stringify(logs))

  alert("Entry saved successfully!")

  // clear the form so user can do it again without refreshing
  if (noteEl) noteEl.value = ""
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false)
  moodEl.value = 5
  updateMoodValue(5) 
}

// --- history page ---

// filters old logs and finds the averages
function getFilteredData() {
  const rangeEl = document.getElementById("timeRange")
  if (!rangeEl) return { data: [], isSingleDay: false }
  
  const range = rangeEl.value // get whatever the user picked in the dropdown
  const logs = JSON.parse(localStorage.getItem("moodLogs")) || []
  const now = new Date() // get right now
  
  // filter out logs that dont fit the time range
  let filteredLogs = logs.filter(log => {
    const logDate = new Date(log.date)
    if (range === "today") return logDate.toDateString() === now.toDateString()
    if (range === "all") return true // keep it all
    
    // figure out the exact date for 7 or 30 days ago
    const cutoff = new Date()
    cutoff.setDate(now.getDate() - parseInt(range))
    return logDate >= cutoff // only keep logs newer than the cutoff date
  })

  // get the data ready for the graph
  if (range === "today") {
    const formattedData = filteredLogs.map(log => {
      const d = new Date(log.date)
      return {
        label: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
        moodValue: log.mood,
        logs: [log] 
      }
    })
    return { data: formattedData, isSingleDay: true }
    
  } else {
    // if multiple days group them up to get a daily average
    const grouped = {}
    filteredLogs.forEach(log => {
      const day = new Date(log.date).toLocaleDateString()
      if (!grouped[day]) {
        grouped[day] = { count: 0, totalMood: 0, originalLogs: [] }
      }
      grouped[day].count += 1 // add one to the count (first index is 0)
      grouped[day].totalMood += Number(log.mood) // add this mood to the total
      grouped[day].originalLogs.push(log) // keep the raw log for html logs later
    })

    // find average and sort by date
    const formattedData = Object.keys(grouped).map(date => ({
      label: date, 
      moodValue: (grouped[date].totalMood / grouped[date].count).toFixed(1), // average mood 
      logs: grouped[date].originalLogs
    })).sort((a, b) => new Date(a.logs.date) - new Date(b.logs.date))
    
    return { data: formattedData, isSingleDay: false }
  }
}

// actually draws the graph and prints the journals
function updateDashboard() {
  const rangeEl = document.getElementById("timeRange")
  const range = rangeEl ? rangeEl.value : "7"
  const result = getFilteredData()
  const data = result.data
  const isSingleDay = result.isSingleDay
  
  // --- 1 update the graph ---
  const canvas = document.getElementById("moodChart")
  if (canvas && typeof Chart !== "undefined") {
    // if a graph is already there destroy it so they dont overlap and break
    if (myChart) myChart.destroy() 

    // draw a new graph
    myChart = new Chart(canvas, {
      type: "line",
      data: {
        labels: data.map(d => d.label), // x axis dates or times
        datasets: [{
          label: isSingleDay ? "Mood (1-10)" : "Average Mood (1-10)",
          data: data.map(d => d.moodValue), // y axis mood scores
          borderColor: "#007aff", 
          backgroundColor: "rgba(0, 122, 255, 0.1)",
          fill: true,
          tension: 0.3 // makes a curved line
        }]
      },
      options: {
        responsive: true,
        scales: { y: { min: 1, max: 10 } } // keep the graph locked between 1 and 10
      }
    })
  }

  // --- update the text logs ---
  const container = document.getElementById("logList")
  if (container) {
    container.innerHTML = "" // wipe the old list
    
    // find all the raw logs to print them one by one
    const logs = JSON.parse(localStorage.getItem("moodLogs")) || []
    const now = new Date()
    let rawLogs = logs.filter(log => {
      const logDate = new Date(log.date)
      if (range === "today") return logDate.toDateString() === now.toDateString()
      if (range === "all") return true
      const cutoff = new Date()
      cutoff.setDate(now.getDate() - parseInt(range))
      return logDate >= cutoff
    })

    // sort them by time
    rawLogs.sort((a, b) => new Date(b.date) - new Date(a.date))

    // if no logs found print message saying so
    if (rawLogs.length === 0) {
      container.innerHTML = "<p>No logs found for this timeframe.</p>"
      return
    }

    // loop through each log and make a box for it on the page using html
    rawLogs.forEach(log => {
      const div = document.createElement("div")
      const d = new Date(log.date)
      const dateString = d.toLocaleDateString()
      const timeString = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

      // inject the html box with some style
      div.innerHTML = `
        <div style="background: #f4f4f4; padding: 15px; margin-bottom: 15px; border-radius: 8px;">
          <h4 style="margin-top: 0; color: #333;">${dateString} at ${timeString} - Mood: <strong>${log.mood}</strong></h4>
          ${log.emotions && log.emotions.length ? `<p style="margin: 5px 0;"><strong>Felt:</strong> ${log.emotions.join(", ")}</p>` : ""}
          ${log.factors && log.factors.length ? `<p style="margin: 5px 0;"><strong>Factors:</strong> ${log.factors.join(", ")}</p>` : ""}
          ${log.note ? `<p style="margin: 5px 0;"><strong>Note:</strong> <em>"${log.note}"</em></p>` : ""}
        </div>
      `
      container.appendChild(div)
    })
  }
}

// --- start up ---
// figures out which page we currently on and runs the right setup
function initPage() {
  const checkinContainer = document.getElementById("emotionsContainer")
  if (checkinContainer) {
    // if the emotions container exists we on the checkin page force the slider to draw emotions
    const slider = document.getElementById("moodSlider")
    if (slider) updateMoodValue(slider.value) 
  }

  if (document.getElementById("moodChart")) {
    // if the chart canvas exists we on the history page draw the dashboard
    updateDashboard() 
  }
}

// don't run code until the html is fully loaded and the DOM tree is built
document.addEventListener("DOMContentLoaded", initPage)