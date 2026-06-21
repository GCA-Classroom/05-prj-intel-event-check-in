// Get all DOM elements
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");

const attendeeCount = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const greeting = document.getElementById("greeting");
const celebrationMessage = document.getElementById("celebrationMessage");
const attendeeList = document.getElementById("attendeeList");
const resetBtn = document.getElementById("resetBtn");

// track attendance
const maxCount = 50;

// Load saved data
let attendees = JSON.parse(localStorage.getItem("attendees")) || [];

let teamCounts = JSON.parse(localStorage.getItem("teamCounts")) || {
  water: 0,
  zero: 0,
  renewables: 0,
};

// Initialize display
updateDisplay();

// Handle form submission
form.addEventListener("submit", function (event) {
  event.preventDefault();

  //Get form values
  const name = nameInput.value.trim();
  const team = teamSelect.value;

  if (!name || !team) return;

  if (attendees.length >= maxCount) {
    celebrate();
    return;
  }

  const teamName = teamSelect.selectedOptions[0].text;

  // Increment count
  attendees.push({
    name,
    team,
    teamName,
  });

  teamCounts[team]++;

  // Save data
  saveData();

  // show welcome message
  greeting.textContent = `✨ Welcome, ${name} from ${teamName}!`;

  updateDisplay();

  form.reset();
  nameInput.focus();
});

// Handle reset button
resetBtn.addEventListener("click", function () {
  const confirmReset = confirm(
    "Are you sure you want to clear all attendance data?",
  );

  if (!confirmReset) return;

  attendees = [];

  teamCounts = {
    water: 0,
    zero: 0,
    renewables: 0,
  };

  localStorage.removeItem("attendees");
  localStorage.removeItem("teamCounts");

  greeting.textContent = "";
  celebrationMessage.textContent = "";

  document.querySelectorAll(".team-card").forEach((card) => {
    card.classList.remove("winner");
  });

  updateDisplay();
});

// Save data to localStorage
function saveData() {
  localStorage.setItem("attendees", JSON.stringify(attendees));
  localStorage.setItem("teamCounts", JSON.stringify(teamCounts));
}

// Update all displayed values
function updateDisplay() {
  const count = attendees.length;

  attendeeCount.textContent = count;

  // Update progress bar
  const percentage = Math.round((count / maxCount) * 100);

  progressBar.style.width = percentage + "%";
  progressBar.textContent = percentage + "%";
  progressBar.setAttribute("aria-valuenow", percentage);

  //update team counter
  document.getElementById("waterCount").textContent = teamCounts.water;
  document.getElementById("zeroCount").textContent = teamCounts.zero;
  document.getElementById("renewablesCount").textContent =
    teamCounts.renewables;

  renderAttendees();

  if (count >= maxCount) {
    celebrate();
  }
}

// Display attendee names and teams
function renderAttendees() {
  attendeeList.innerHTML = "";

  if (attendees.length === 0) {
    attendeeList.innerHTML = "<li>No attendees checked in yet.</li>";
    return;
  }

  attendees.forEach((attendee) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <strong>${attendee.name}</strong>
      <span>${attendee.teamName}</span>
    `;

    attendeeList.appendChild(li);
  });
}

// Show celebration message and highlight winning team
function celebrate() {
  celebrationMessage.textContent =
    "🎉 Attendance goal reached! Congratulations to the winning team!";

  const winningTeam = Object.keys(teamCounts).reduce((a, b) =>
    teamCounts[a] >= teamCounts[b] ? a : b,
  );

  document.querySelectorAll(".team-card").forEach((card) => {
    card.classList.remove("winner");
  });

  document.getElementById(`${winningTeam}Team`).classList.add("winner");
}
