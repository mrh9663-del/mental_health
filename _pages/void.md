---
layout: single
permalink: /void/
title: "The Void"
---

<div class="void-container" style="text-align: center; padding: 40px 20px; background-color: #1a1a1a; border-radius: 12px; color: #f4f4f4;">
  <h2 style="color: #fff;">Scream into the Void</h2>
  <p>Whatever is weighing heavily on your mind, type it below. When you're ready, release it. <br><strong style="color: #ff6b6b;">Nothing typed here is saved, tracked, or sent anywhere.</strong></p>
  
  <textarea id="voidText" placeholder="Let it all out here..." rows="8" style="width: 100%; max-width: 600px; margin: 20px 0; padding: 15px; border-radius: 8px; background: #333; color: #fff; border: 1px solid #555; transition: all 1.5s ease; resize: none;"></textarea>
  <br>
  
  <button id="letGoBtn" onclick="sendToVoid()" class="btn" style="background-color: #ff3b30; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold;">Let It Go</button>
  
  <p id="voidMessage" style="opacity: 0; transition: opacity 1s ease; margin-top: 20px; font-style: italic; color: #aaa;">It's gone. Take a deep breath.</p>
</div>

<script>
function sendToVoid() {
  const textEl = document.getElementById('voidText');
  const msgEl = document.getElementById('voidMessage');
  
  // Do nothing if the box is empty
  if (!textEl.value.trim()) return;

  // The Animation: Fade out, blur, and shrink slightly
  textEl.style.opacity = '0';
  textEl.style.transform = 'scale(0.95)';
  textEl.style.filter = 'blur(5px)';
  
  // Wait for the animation to finish, then clear it and reset
  setTimeout(() => {
    textEl.value = ''; // Physically delete the text
    textEl.style.opacity = '1';
    textEl.style.transform = 'scale(1)';
    textEl.style.filter = 'blur(0px)';
    
    // Show the comforting message
    msgEl.style.opacity = '1';
    
    // Hide the comforting message after 4 seconds
    setTimeout(() => {
      msgEl.style.opacity = '0';
    }, 4000);
  }, 1500); // 1.5 seconds matches the CSS transition time
}
</script>