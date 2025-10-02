// Intel Sustainability Summit Check-In System
// Includes: Greetings, Attendance Tracking, Team Stats, Progress Bar,
// Celebration, Local Storage, and Attendee List

// Team data structure
const teams = {
  water: { name: "Team Water Wise", count: 0, emoji: "🌊" },
  zero: { name: "Team Net Zero", count: 0, emoji: "🌿" },
  power: { name: "Team Renewables", count: 0, emoji: "⚡" },
};

// Attendee list to track all check-ins
let attendees = [];
let totalAttendees = 0;
const GOAL = 50;

// Load saved data from localStorage on page load
function loadFromStorage() {
  const savedData = localStorage.getItem("intelSummitData");
  if (savedData) {
    const data = JSON.parse(savedData);
    totalAttendees = data.totalAttendees || 0;
    attendees = data.attendees || [];

    // Restore team counts
    teams.water.count = data.teams?.water || 0;
    teams.zero.count = data.teams?.zero || 0;
    teams.power.count = data.teams?.power || 0;

    updateDisplay();
  }
}

// Save data to localStorage
function saveToStorage() {
  const data = {
    totalAttendees,
    attendees,
    teams: {
      water: teams.water.count,
      zero: teams.zero.count,
      power: teams.power.count,
    },
  };
  localStorage.setItem("intelSummitData", JSON.stringify(data));
}

// Update all displays
function updateDisplay() {
  // Update total count
  document.getElementById("attendeeCount").textContent = totalAttendees;

  // Update team counts
  document.getElementById("waterCount").textContent = teams.water.count;
  document.getElementById("zeroCount").textContent = teams.zero.count;
  document.getElementById("powerCount").textContent = teams.power.count;

  // Update progress bar
  const progress = Math.min((totalAttendees / GOAL) * 100, 100);
  document.getElementById("progressBar").style.width = progress + "%";

  // Update attendee list
  updateAttendeeList();
}

// Update attendee list display
function updateAttendeeList() {
  // Check if list container exists, if not create it
  let listContainer = document.getElementById("attendeeList");
  if (!listContainer) {
    listContainer = document.createElement("div");
    listContainer.id = "attendeeList";
    listContainer.className = "attendee-list";

    const title = document.createElement("h3");
    title.textContent = "Checked-In Attendees";
    listContainer.appendChild(title);

    const list = document.createElement("div");
    list.id = "attendeeListItems";
    list.className = "attendee-items";
    listContainer.appendChild(list);

    // Insert after team stats
    const teamStats = document.querySelector(".team-stats");
    teamStats.parentNode.insertBefore(listContainer, teamStats.nextSibling);
  }

  // Update list items
  const listItems = document.getElementById("attendeeListItems");
  listItems.innerHTML = "";

  attendees.forEach((attendee, index) => {
    const item = document.createElement("div");
    item.className = "attendee-item";

    const teamInfo = teams[attendee.team];
    item.innerHTML = `
      <span class="attendee-number">${index + 1}.</span>
      <span class="attendee-name">${attendee.name}</span>
      <span class="attendee-team">${teamInfo.emoji} ${teamInfo.name}</span>
    `;

    listItems.appendChild(item);
  });
}

// Show celebration when goal is reached
function showCelebration() {
  // Find winning team
  let winningTeam = "water";
  let maxCount = teams.water.count;

  if (teams.zero.count > maxCount) {
    winningTeam = "zero";
    maxCount = teams.zero.count;
  }
  if (teams.power.count > maxCount) {
    winningTeam = "power";
  }

  const winner = teams[winningTeam];

  // Create celebration overlay
  const overlay = document.createElement("div");
  overlay.className = "celebration-overlay";
  overlay.innerHTML = `
    <div class="celebration-content">
      <div class="celebration-emoji">🎉</div>
      <h2>Goal Reached!</h2>
      <p>We've hit ${GOAL} attendees!</p>
      <div class="winner-announcement">
        <p>🏆 Leading Team:</p>
        <h3>${winner.emoji} ${winner.name}</h3>
        <p class="winner-count">${winner.count} attendees</p>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" class="celebration-close">
        Continue
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  // Add confetti effect
  createConfetti();
}

// Simple confetti effect
function createConfetti() {
  const colors = ["#0071c5", "#00c7fd", "#50e6ff", "#ffc600", "#00d084"];
  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      confetti.style.left = Math.random() * 100 + "%";
      confetti.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = Math.random() * 3 + "s";
      document.body.appendChild(confetti);

      setTimeout(() => confetti.remove(), 4000);
    }, i * 30);
  }
}

// Handle form submission
document.getElementById("checkInForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const nameInput = document.getElementById("attendeeName");
  const teamSelect = document.getElementById("teamSelect");
  const greeting = document.getElementById("greeting");

  const name = nameInput.value.trim();
  const team = teamSelect.value;

  if (name && team) {
    // Add attendee
    attendees.push({ name, team });
    totalAttendees++;
    teams[team].count++;

    // Show greeting
    greeting.textContent = `Welcome, ${name}! You've been checked in to ${teams[team].emoji} ${teams[team].name}!`;
    greeting.className = "greeting-message show";

    // Update display
    updateDisplay();

    // Save to localStorage
    saveToStorage();

    // Check if goal reached
    if (totalAttendees === GOAL) {
      setTimeout(showCelebration, 500);
    }

    // Reset form
    nameInput.value = "";
    teamSelect.value = "";

    // Hide greeting after 4 seconds
    setTimeout(() => {
      greeting.classList.remove("show");
    }, 4000);
  }
});

// Load saved data when page loads
window.addEventListener("DOMContentLoaded", loadFromStorage);
