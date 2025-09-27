// --- Get elements ---
const form = document.getElementById("checkInForm");
const attendeeNameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const greeting = document.getElementById("greeting");
const attendeeCount = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const waterCount = document.getElementById("waterCount");
const zeroCount = document.getElementById("zeroCount");
const powerCount = document.getElementById("powerCount");

// --- Counters ---
let totalCount = 0;
let teamCounts = {
  water: 0,
  zero: 0,
  power: 0,
};

const maxGoal = 50; // Max attendees goal

// --- Form submit event ---
form.addEventListener("submit", function (e) {
  e.preventDefault(); // Stop page reload

  // Get name and team
  const name = attendeeNameInput.value.trim();
  const team = teamSelect.value;

  if (!name || !team) return; // Do nothing if fields are empty

  // Increment counts
  totalCount++;
  teamCounts[team]++;

  // Update total on page
  attendeeCount.textContent = totalCount;

  // Update team counts
  waterCount.textContent = teamCounts.water;
  zeroCount.textContent = teamCounts.zero;
  powerCount.textContent = teamCounts.power;

  // Calculate progress
  const percentage = (totalCount / maxGoal) * 100;
  progressBar.style.width = percentage + "%";

  // Show greeting message
  const teamNames = {
    water: "Team Water Wise 🌊",
    zero: "Team Net Zero 🌿",
    power: "Team Renewables ⚡",
  };
  greeting.textContent = `Welcome, ${name}! You're on ${teamNames[team]}.`;
  greeting.classList.add("success-message");
  greeting.style.display = "block";

  // Reset form
  form.reset();
});
