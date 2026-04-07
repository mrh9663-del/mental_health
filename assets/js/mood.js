

// Save a new mood entry to localStorage
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
  document.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
    factors.push(cb.value);
  });

  // Get existing logs or initialize
  const logs = JSON.parse(localStorage.getItem("moodLogs")) || [];

  // Create entry
  const entry = {
    mood: mood,
    factors: factors,
    note: note,
    date: new Date().toISOString()
  };

  logs.push(entry);
  localStorage.setItem("moodLogs", JSON.stringify(logs));

  alert("Entry saved!");

  // Reset inputs
  if (noteEl) noteEl.value = "";
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
}

// Add this at the top of mood.js to define your emotion categories
const emotionCategories = {
  low: ["Sad", "Anxious", "Overwhelmed", "Exhausted"],   // Mood 1-3
  neutral: ["Calm", "Apathetic", "Bored", "Okay"],       // Mood 4-7
  high: ["Happy", "Excited", "Grateful", "Motivated"]    // Mood 8-10
};

function updateMoodValue(val) {
  const display = document.getElementById("moodValue");
  if (display) display.innerText = val;

  const container = document.getElementById("emotionsContainer");
  if (!container) return;

  // Determine category based on slider value
  let category = "neutral";
  if (val <= 3) category = "low";
  if (val >= 8) category = "high";

  // Generate checkboxes dynamically
  const emotions = emotionCategories[category];
  container.innerHTML = emotions.map(emo => 
    `<label><input type="checkbox" class="emotion-cb" value="${emo}"> ${emo}</label><br>`
  ).join("");
}

// In your saveMood() function, add this right below where you collect "factors"
// to also collect the new dynamic emotions:
/*
  const emotions = [];
  document.querySelectorAll('.emotion-cb:checked').forEach(cb => {
    emotions.push(cb.value);
  });
  
  // And be sure to add `emotions: emotions,` to your `entry` object!
*/


let myChart = null; // Global variable to hold the chart instance

// Core function to filter and average data
function getFilteredData() {
  const range = document.getElementById("timeRange").value;
  const logs = JSON.parse(localStorage.getItem("moodLogs")) || [];
  const now = new Date();
  
  // 1. Filter by date
  let filteredLogs = logs.filter(log => {
    const logDate = new Date(log.date);
    if (range === "today") return logDate.toDateString() === now.toDateString();
    if (range === "all") return true;
    
    const cutoff = new Date();
    cutoff.setDate(now.getDate() - parseInt(range));
    return logDate >= cutoff;
  });

  // 2. Group by day and average the mood
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

  // 3. Format into an array sorted by date
  return Object.keys(grouped).map(date => ({
    date: date,
    avgMood: (grouped[date].totalMood / grouped[date].count).toFixed(1),
    logs: grouped[date].originalLogs
  })).sort((a, b) => new Date(a.date) - new Date(b.date));
}

// Master function to update both Chart and Table
function updateDashboard() {
  const data = getFilteredData();
  
  // --- Update Chart ---
  const canvas = document.getElementById("moodChart");
  if (canvas && typeof Chart !== "undefined") {
    if (myChart) myChart.destroy(); // Destroy old chart before redrawing

    myChart = new Chart(canvas, {
      type: "line",
      data: {
        labels: data.map(d => d.date),
        datasets: [{
          label: "Average Mood (1-10)",
          data: data.map(d => d.avgMood),
          borderColor: "#007aff", // Apple blue!
          fill: false,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        scales: { y: { min: 1, max: 10 } }
      }
    });
  }

  // --- Update Table/List ---
  const container = document.getElementById("logList");
  if (container) {
    container.innerHTML = "";
    if (data.length === 0) {
      container.innerHTML = "<p>No logs found for this timeframe.</p>";
      return;
    }

    // Loop through our grouped days
    data.forEach(day => {
      const div = document.createElement("div");
      
      // Combine all notes and factors from that day to display easily
      let allNotes = [];
      let allFactors = [];
      day.logs.forEach(l => {
        if (l.note) allNotes.push(l.note);
        if (l.factors) allFactors.push(...l.factors);
      });
      
      // Remove duplicate factors
      const uniqueFactors = [...new Set(allFactors)];

      div.innerHTML = `
        <div style="background: #f9f9f9; padding: 15px; margin-bottom: 10px; border-radius: 8px;">
          <h4 style="margin-top: 0;">${day.date} - Average Mood: <strong>${day.avgMood}</strong></h4>
          <p><strong>Factors logged:</strong> ${uniqueFactors.length ? uniqueFactors.join(", ") : "None"}</p>
          ${allNotes.length ? `<p><strong>Notes:</strong> ${allNotes.join(" | ")}</p>` : ""}
        </div>
      `;
      container.appendChild(div);
    });
  }
}

// Trigger initialization 
function initPage() {
  const checkinContainer = document.getElementById("emotionsContainer");
  if (checkinContainer) {
    // We are on the check-in page, trigger initial slider emotions
    updateMoodValue(document.getElementById("moodSlider").value);
  }

  if (document.getElementById("moodChart")) {
    // We are on the history page, load everything
    updateDashboard();
  }
}

document.addEventListener("DOMContentLoaded", initPage);