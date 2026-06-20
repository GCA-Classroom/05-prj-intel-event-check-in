// Get all needed DOM elements
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const greeting = document.getElementById("greeting");
const attendeeCount = document.getElementById("attendeeCount");
const maxAttendeeCount = document.getElementById("maxAttendeeCount");
const progressBar = document.getElementById("progressBar");
const waterCount = document.getElementById("waterCount");
const zeroCount = document.getElementById("zeroCount");
const powerCount = document.getElementById("powerCount");
const attendeeList = document.getElementById("attendeeList");
const emptyAttendeeMessage = document.getElementById("emptyAttendeeMessage");
const resetBtn = document.getElementById("resetBtn");

// Track Attendees
let count = 0;
const maxCount = 3;
let hasShownCelebration = false;
let attendees = [];

maxAttendeeCount.textContent = maxCount;

function saveCounts() {
  localStorage.setItem("totalAttendance", String(count));
  localStorage.setItem("waterAttendance", waterCount.textContent);
  localStorage.setItem("zeroAttendance", zeroCount.textContent);
  localStorage.setItem("powerAttendance", powerCount.textContent);
}

function saveAttendees() {
  localStorage.setItem("attendeeList", JSON.stringify(attendees));
}

function getTeamChipClass(teamValue) {
  if (teamValue === "water") {
    return "team-chip-water";
  }

  if (teamValue === "zero") {
    return "team-chip-zero";
  }

  return "team-chip-power";
}

function renderAttendeeList() {
  attendeeList.innerHTML = "";

  for (let i = 0; i < attendees.length; i++) {
    const attendee = attendees[i];
    const item = document.createElement("li");
    const nameSpan = document.createElement("span");
    const teamSpan = document.createElement("span");

    item.className = "attendee-item";
    nameSpan.className = "attendee-name";
    teamSpan.className =
      "attendee-team " + getTeamChipClass(attendee.teamValue);

    nameSpan.textContent = attendee.name;
    teamSpan.textContent = attendee.teamName;

    item.appendChild(nameSpan);
    item.appendChild(teamSpan);
    attendeeList.appendChild(item);
  }

  if (attendees.length === 0) {
    emptyAttendeeMessage.style.display = "block";
  } else {
    emptyAttendeeMessage.style.display = "none";
  }
}

function loadSavedAttendees() {
  const savedAttendees = localStorage.getItem("attendeeList");

  if (!savedAttendees) {
    renderAttendeeList();
    return;
  }

  const parsedAttendees = JSON.parse(savedAttendees);

  if (Array.isArray(parsedAttendees)) {
    attendees = parsedAttendees;
  }

  renderAttendeeList();
}

function resetAllData() {
  count = 0;
  hasShownCelebration = false;
  attendees = [];

  attendeeCount.textContent = "0";
  waterCount.textContent = "0";
  zeroCount.textContent = "0";
  powerCount.textContent = "0";

  updateProgressBar();
  renderAttendeeList();

  greeting.textContent = "";
  greeting.style.display = "none";
  greeting.classList.remove("success-message");

  localStorage.removeItem("totalAttendance");
  localStorage.removeItem("waterAttendance");
  localStorage.removeItem("zeroAttendance");
  localStorage.removeItem("powerAttendance");
  localStorage.removeItem("attendeeList");
}

function updateProgressBar() {
  const percentage = Math.min(Math.round((count / maxCount) * 100), 100) + "%";
  progressBar.style.width = percentage;
}

function loadSavedCounts() {
  const savedTotal = parseInt(localStorage.getItem("totalAttendance"));
  const savedWater = parseInt(localStorage.getItem("waterAttendance"));
  const savedZero = parseInt(localStorage.getItem("zeroAttendance"));
  const savedPower = parseInt(localStorage.getItem("powerAttendance"));

  if (!isNaN(savedTotal)) {
    count = savedTotal;
    attendeeCount.textContent = count;
  }

  if (!isNaN(savedWater)) {
    waterCount.textContent = savedWater;
  }

  if (!isNaN(savedZero)) {
    zeroCount.textContent = savedZero;
  }

  if (!isNaN(savedPower)) {
    powerCount.textContent = savedPower;
  }

  updateProgressBar();

  if (count >= maxCount) {
    hasShownCelebration = true;
  }
}

loadSavedCounts();
loadSavedAttendees();

resetBtn.addEventListener("click", function () {
  resetAllData();
});

function getWinningTeamText() {
  const teams = [
    {
      name: "Team Water Wise",
      count: parseInt(document.getElementById("waterCount").textContent),
    },
    {
      name: "Team Net Zero",
      count: parseInt(document.getElementById("zeroCount").textContent),
    },
    {
      name: "Team Renewables",
      count: parseInt(document.getElementById("powerCount").textContent),
    },
  ];

  let highestCount = 0;
  let winners = [];

  for (let i = 0; i < teams.length; i++) {
    if (teams[i].count > highestCount) {
      highestCount = teams[i].count;
      winners = [teams[i].name];
    } else if (teams[i].count === highestCount) {
      winners.push(teams[i].name);
    }
  }

  if (winners.length === 1) {
    return `${winners[0]} is leading with ${highestCount} attendees!`;
  }

  return `It's a tie between ${winners.join(" and ")} with ${highestCount} attendees each!`;
}

// Handle form submission
form.addEventListener("submit", function (event) {
  event.preventDefault();

  // Get form values
  const name = nameInput.value.trim();
  const team = teamSelect.value;
  const teamName = teamSelect.selectedOptions[0].text;

  if (!name || !team) {
    return;
  }

  // Increment count
  count++;
  attendeeCount.textContent = count;

  // Update progress bar
  updateProgressBar();

  // Update team counter
  const teamCounter = document.getElementById(team + "Count");
  teamCounter.textContent = parseInt(teamCounter.textContent) + 1;

  attendees.push({
    name: name,
    teamName: teamName,
    teamValue: team,
  });

  renderAttendeeList();

  // Save updated numbers so they persist across refresh/reopen.
  saveCounts();
  saveAttendees();

  // Show welcome message
  const message = `🎉 Welcome, ${name} to ${teamName}`;
  greeting.textContent = message;
  greeting.style.display = "block";
  greeting.classList.add("success-message");

  // Show celebration message when the attendance goal is reached.
  if (count === maxCount && !hasShownCelebration) {
    const winningTeamText = getWinningTeamText();
    greeting.textContent = `🏆 Celebration! Check-in goal reached. ${winningTeamText}`;
    hasShownCelebration = true;
  }

  form.reset();
});
