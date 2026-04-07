

---
layout: single
title: "Daily Check-In"
permalink: /checkin/
---

<div class="checkin-container">

<h2>Daily Mood Check-In</h2>
<p>Take a moment to log how you feel. This is for awareness only.</p>

<!-- Mood Slider -->
<label for="moodSlider"><strong>Mood (1 = Very Low, 10 = Very Good)</strong></label>
<input type="range" min="1" max="10" value="5" id="moodSlider" oninput="updateMoodValue(this.value)">
<p id="moodValue">5</p>

<!-- Factors -->
<h4>What affected your mood?</h4>
<label><input type="checkbox" value="School/Work"> School / Work</label><br>
<label><input type="checkbox" value="Sleep"> Sleep</label><br>
<label><input type="checkbox" value="Social"> Social</label><br>
<label><input type="checkbox" value="Health"> Health</label><br>
<label><input type="checkbox" value="Other"> Other</label><br>

<!-- Notes -->
<h4>Optional Notes</h4>
<textarea id="note" placeholder="Write anything you'd like..."></textarea>

<br><br>

<!-- Save Button -->
<button onclick="saveMood()" class="btn btn--primary">Save Entry</button>

</div>

<!-- Script -->
<script src="/assets/js/mood.js"></script>

<script>
function updateMoodValue(val) {
  document.getElementById("moodValue").innerText = val;
}
</script>