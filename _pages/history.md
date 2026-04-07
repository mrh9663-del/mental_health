---
permalink: /history/
title: "Mood History & Graph"
---

<div class="dashboard-container">
  <h3>Your Mood Over Time</h3>
  <canvas id="moodChart" width="400" height="200"></canvas>
  
  <br><br>

  <h3>Past Check-ins</h3>
  <div id="logList"></div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="{{ '/assets/js/mood.js' | relative_url }}"></script>