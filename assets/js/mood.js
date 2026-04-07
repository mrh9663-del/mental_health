

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

// Update slider value display (used by checkin page)
function updateMoodValue(val) {
  const display = document.getElementById("moodValue");
  if (display) {
    display.innerText = val;
  }
}

// Load logs into history page
function loadLogs() {
  const container = document.getElementById("logList");
  if (!container) return;

  const logs = JSON.parse(localStorage.getItem("moodLogs")) || [];

  container.innerHTML = "";

  logs.forEach(log => {
    const div = document.createElement("div");
    const date = new Date(log.date).toLocaleString();
    const factors = (log.factors && log.factors.length) ? log.factors.join(", ") : "None";

    div.innerHTML = `
      <p><strong>${date}</strong></p>
      <p>Mood: ${log.mood}</p>
      <p>Factors: ${factors}</p>
      ${log.note ? `<p>Note: ${log.note}</p>` : ""}
      <hr>
    `;

    container.appendChild(div);
  });
}

// Load chart on history page (requires Chart.js)
function loadChart() {
  const canvas = document.getElementById("moodChart");
  if (!canvas || typeof Chart === "undefined") return;

  const logs = JSON.parse(localStorage.getItem("moodLogs")) || [];

  const labels = logs.map(log => new Date(log.date).toLocaleDateString());
  const data = logs.map(log => log.mood);

  new Chart(canvas, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Mood (1-10)",
        data: data,
        fill: false,
        tension: 0.2
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          suggestedMin: 1,
          suggestedMax: 10,
          ticks: { stepSize: 1 }
        }
      }
    }
  });
}

// Initialize page functions automatically
function initPage() {
  if (document.getElementById("logList")) loadLogs();
  if (document.getElementById("moodChart")) loadChart();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPage);
} else {
  initPage();
}