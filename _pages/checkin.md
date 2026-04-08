---
layout: single
permalink: /checkin/
title: "Daily Check-In"
---

<div class="checkin-container">
  <h2>Daily Mood Check-In</h2>
  <p>Take a moment to log how you feel. This is for awareness only.</p>

  <label for="moodSlider"><strong>Mood (1 = Very Low, 10 = Very Good)</strong></label>
  <input type="range" min="1" max="10" value="5" id="moodSlider" oninput="updateMoodValue(this.value)">
  <p id="moodValue">5</p>

  <h4>Which best describes this feeling?</h4>
  <div id="emotionsContainer"></div>
  <br>

  <h4>What affected your mood?</h4>
  <label><input type="checkbox" class="factor-cb" value="School/Work"> School / Work</label><br>
  <label><input type="checkbox" class="factor-cb" value="Sleep"> Sleep</label><br>
  <label><input type="checkbox" class="factor-cb" value="Social"> Social</label><br>
  <label><input type="checkbox" class="factor-cb" value="Health"> Health</label><br>
  <label><input type="checkbox" class="factor-cb" value="Other"> Other</label><br>

  <h4>Optional Notes</h4>
  <textarea id="note" placeholder="Write anything you'd like..." rows="4" style="width: 100%;"></textarea>
  <br><br>

  <button onclick="saveMood()" class="btn btn--primary">Save Entry</button>
</div>

<script src="{{ '/assets/js/mood.js' | relative_url }}"></script>