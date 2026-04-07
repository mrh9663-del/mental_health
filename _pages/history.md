---
layout: single
permalink: /history/
title: "Mood History & Graph"
---

<div class="dashboard-container">
  <h3>Your Mood Over Time</h3>
  
  <label for="timeRange"><strong>Time Range: </strong></label>
  <select id="timeRange" onchange="updateDashboard()">
    <option value="today">Today</option>
    <option value="7" selected>Past 7 Days</option>
    <option value="30">Past 30 Days</option>
    <option value="all">All Time</option>
  </select>
  <br><br>

  <canvas id="moodChart" width="400" height="200"></canvas>
  
  <br><br>
  
  <h3>Logs for this Period</h3>
  <div id="logList"></div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="{{ '/assets/js/mood.js' | relative_url }}"></script>