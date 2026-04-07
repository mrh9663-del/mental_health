// Global chart variable so we can destroy/redraw it cleanly
let myChart = null; 

// Dynamic emotion categories
const emotionCategories = {
  low: ["Sad", "Anxious", "Overwhelmed", "Exhausted"],   // Mood 1-3
  neutral: ["Calm", "Apathetic", "Bored", "Okay"],       // Mood 4-7
  high: ["Happy", "Excited", "Grateful", "Motivated"]    // Mood 8-10
};

// --- CHECK-IN PAGE FUNCTIONS ---

// Update slider text AND generate the dynamic checkboxes
function updateMoodValue(val) {
  const display = document.getElementById("moodValue");
  if (display) display.innerText = val;

  const container = document.getElementById("emotionsContainer");
  if (!container) return;

  // Determine category based on slider value
  let category = "neutral";
  if (val <= 3) category = "low";
  if (val >= 8) category = "high";

  // Generate checkboxes dynamically and inject them into the HTML
  const emotions = emotionCategories[category];
  container.innerHTML = emotions.map(emo => 
    `<label><input type="checkbox" class="emotion-cb" value="${emo}"> ${emo}</label><br>`
  ).join("");
}

// Save mood, factors, emotions, and notes to localStorage
function saveMood() {
  const moodEl = document.getElementById("moodSlider");
  const noteEl = document.getElementById("note");

  if (!moodEl) {
    alert("Mood slider not found.");
    return;
  }

  const mood = Number(moodEl.value);
  const note = noteEl ? noteEl.value.trim() : "";

  // Collect checked factors
  const factors = [];
  document.querySelectorAll('.factor-cb:checked').forEach(cb => {
    factors.push(cb.value);
  });

  // Collect checked dynamic emotions
  const emotions = [];
  document.querySelectorAll('.emotion-cb:checked').forEach(cb => {
    emotions.push(cb.value);
  });

  // Pull existing logs or start a new array
  const logs = JSON.parse(localStorage.getItem("moodLogs")) || [];

  // Create the entry object
  const entry = {
    mood: mood,
    factors: factors,
    emotions: emotions,
    note: note,
    date: new Date().toISOString()
  };

  logs.push(entry);
  localStorage.setItem("moodLogs", JSON.stringify(logs));

  alert("Entry saved successfully!");

  // Reset the form for the next check-in
  if (noteEl) noteEl.value = "";
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
  moodEl.value = 5;
  updateMoodValue(5); // Reset the dynamic emotions back to neutral
}

// --- HISTORY/DASHBOARD PAGE FUNCTIONS ---

// Filter logs and determine if we are showing times (Today) or averages (Multiple Days)
function getFilteredData() {
  const rangeEl = document.getElementById("timeRange");
  if (!rangeEl) return { data: [], isSingleDay: false };
  
  const range = rangeEl.value;
  const logs = JSON.parse(localStorage.getItem("moodLogs")) || [];
  const now = new Date();
  
  // 1. Filter out logs that don't fit the time range
  let filteredLogs = logs.filter(log => {
    const logDate = new Date(log.date);
    if (range === "today") return logDate.toDateString() === now.toDateString();
    if (range === "all") return true;
    
    const cutoff = new Date();
    cutoff.setDate(now.getDate() - parseInt(range));
    return logDate >= cutoff;
  });

  // 2. Format data based on the selected range
  if (range === "today") {
    // If it's today, DO NOT AVERAGE. Show exact times.
    const formattedData = filteredLogs.map(log => {
      const d = new Date(log.date);
      return {
        label: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // e.g., "10:30 AM"
        moodValue: log.mood, // Exact mood
        logs: [log] // Keep in an array so the table rendering loop works the same way
      };
    });
    return { data: formattedData, isSingleDay: true };
    
  } else {
    // If it's multiple days, AVERAGE by day.
    const grouped = {};
    filteredLogs.forEach(log => {
      const day = new Date(log.date).toLocaleDateString();
      if (!grouped[day]) {
        grouped[day] = { count: 0, totalMood: 0, originalLogs: [] };
      }
      grouped[day].count += 1;
      grouped[day].totalMood += Number(log.mood);
      grouped[day].originalLogs.push(log);
    });

    const formattedData = Object.keys(grouped).map(date => ({
      label: date, // e.g., "4/7/2026"
      moodValue: (grouped[date].totalMood / grouped[date].count).toFixed(1), // Average mood
      logs: grouped[date].originalLogs
    })).sort((a, b) => new Date(a.logs.date) - new Date(b.logs.date));
    
    return { data: formattedData, isSingleDay: false };
  }
}

// Update the chart and the HTML list below it
function updateDashboard() {
  const result = getFilteredData();
  const data = result.data;
  const isSingleDay = result.isSingleDay;
  
  // Update Chart
  const canvas = document.getElementById("moodChart");
  if (canvas && typeof Chart !== "undefined") {
    if (myChart) myChart.destroy(); 

    myChart = new Chart(canvas, {
      type: "line",
      data: {
        labels: data.map(d => d.label), // Uses Times for "Today", Dates for others
        datasets: [{
          label: isSingleDay ? "Mood (1-10)" : "Average Mood (1-10)",
          data: data.map(d => d.moodValue),
          borderColor: "#007aff", 
          backgroundColor: "rgba(0, 122, 255, 0.1)",
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        scales: { y: { min: 1, max: 10 } }
      }
    });
  }

  // Update Table/List
  const container = document.getElementById("logList");
  if (container) {
    container.innerHTML = "";
    if (data.length === 0) {
      container.innerHTML = "<p>No logs found for this timeframe.</p>";
      return;
    }

    data.forEach(entry => {
      const div = document.createElement("div");
      
      let allNotes = [];
      let allFactors = [];
      let allEmotions = [];
      
      entry.logs.forEach(l => {
        if (l.note) allNotes.push(l.note);
        if (l.factors) allFactors.push(...l.factors);
        if (l.emotions) allEmotions.push(...l.emotions);
      });
      
      const uniqueFactors = [...new Set(allFactors)];
      const uniqueEmotions = [...new Set(allEmotions)];

      // Change the heading depending on if we are showing a specific time or an averaged day
      const headerText = isSingleDay 
        ? `${entry.label} - Mood: <strong>${entry.moodValue}</strong>` 
        : `${entry.label} - Avg Mood: <strong>${entry.moodValue}</strong>`;

      div.innerHTML = `
        <div style="background: #f4f4f4; padding: 15px; margin-bottom: 15px; border-radius: 8px;">
          <h4 style="margin-top: 0; color: #333;">${headerText}</h4>
          <p style="margin: 5px 0;"><strong>Felt:</strong> ${uniqueEmotions.length ? uniqueEmotions.join(", ") : "None specified"}</p>
          <p style="margin: 5px 0;"><strong>Factors:</strong> ${uniqueFactors.length ? uniqueFactors.join(", ") : "None specified"}</p>
          ${allNotes.length ? `<p style="margin: 5px 0;"><strong>Notes:</strong> <em>${allNotes.join(" | ")}</em></p>` : ""}
        </div>
      `;
      container.appendChild(div);
    });
  }
}

// --- INITIALIZATION ---
function initPage() {
  const checkinContainer = document.getElementById("emotionsContainer");
  if (checkinContainer) {
    const slider = document.getElementById("moodSlider");
    if (slider) updateMoodValue(slider.value); // Triggers the emotions to show up immediately
  }

  if (document.getElementById("moodChart")) {
    updateDashboard(); // Draws the chart immediately when opening the history page
  }
}

document.addEventListener("DOMContentLoaded", initPage);