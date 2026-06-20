
// Get all needed DOM elements
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");

const attendeeCount = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const greeting = document.getElementById("greeting");
const celebrationMessage = document.getElementById("celebrationMessage");
const attendeeList = document.getElementById("attendeeList");
const resetBtn = document.getElementById("resetBtn");

// Attendance goal
const maxCount = 50;

// Local storage key
const storageKey = "intelSummitCheckInData";

// Team names connected to the select option values
const teamNames = {
  water: "Team Water Wise",
  zero: "Team Net Zero",
  power: "Team Renewables",
};

// Create fresh starting data
function getStartingData() {
  return {
    totalCount: 0,
    teamCounts: {
      water: 0,
      zero: 0,
      power: 0,
    },
    attendees: [],
  };
}

// Load saved data from localStorage
function loadData() {
  const savedData = localStorage.getItem(storageKey);

  if (savedData) {
    return JSON.parse(savedData);
  }

  return getStartingData();
}

// Main data object
let checkInData = loadData();

// Save data to localStorage
function saveData() {
  localStorage.setItem(storageKey, JSON.stringify(checkInData));
}

// Show greeting or warning messages
function showMessage(text, type) {
  greeting.textContent = text;
  greeting.className = "message";

  if (type === "success") {
    greeting.classList.add("success-message");
  } else {
    greeting.classList.add("warning-message");
  }

  greeting.classList.remove("hidden");
}

// Update total attendance count
function updateTotalCount() {
  attendeeCount.textContent = checkInData.totalCount;
}

// Update team counters
function updateTeamCounts() {
  document.getElementById("waterCount").textContent =
    checkInData.teamCounts.water;

  document.getElementById("zeroCount").textContent =
    checkInData.teamCounts.zero;

  document.getElementById("powerCount").textContent =
    checkInData.teamCounts.power;
}

// Update progress bar
function updateProgressBar() {
  const progressPercent = Math.min(
    (checkInData.totalCount / maxCount) * 100,
    100
  );

  progressBar.style.width = progressPercent + "%";
  progressBar.textContent = Math.round(progressPercent) + "%";
  progressBar.setAttribute("aria-valuenow", checkInData.totalCount);

  progressText.textContent =
    Math.round(progressPercent) + "% of goal completed";
}

// Display attendee list
function updateAttendeeList() {
  attendeeList.innerHTML = "";

  if (checkInData.attendees.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.textContent = "No attendees checked in yet.";
    emptyMessage.classList.add("empty-list-message");
    attendeeList.appendChild(emptyMessage);
    return;
  }

  checkInData.attendees.forEach(function(attendee) {
    const listItem = document.createElement("li");
    listItem.classList.add("attendee-item");

    const nameSpan = document.createElement("span");
    nameSpan.classList.add("attendee-name");
    nameSpan.textContent = attendee.name;

    const teamSpan = document.createElement("span");
    teamSpan.classList.add("attendee-team");
    teamSpan.textContent = teamNames[attendee.team];

    listItem.appendChild(nameSpan);
    listItem.appendChild(teamSpan);

    attendeeList.appendChild(listItem);
  });
}

// Find winning team or teams
function getWinningTeams() {
  const highestCount = Math.max(
    checkInData.teamCounts.water,
    checkInData.teamCounts.zero,
    checkInData.teamCounts.power
  );

  return Object.keys(checkInData.teamCounts).filter(function(team) {
    return checkInData.teamCounts[team] === highestCount;
  });
}

// Highlight the winning team card
function highlightWinningTeams(winningTeams) {
  const teamCards = document.querySelectorAll(".team-card");

  teamCards.forEach(function(card) {
    card.classList.remove("winning");
  });

  winningTeams.forEach(function(team) {
    const winningCard = document.querySelector(`[data-team="${team}"]`);

    if (winningCard) {
      winningCard.classList.add("winning");
    }
  });
}

// Check if attendance goal has been reached
function checkCelebration() {
  if (checkInData.totalCount >= maxCount) {
    const winningTeams = getWinningTeams();

    const winningTeamNames = winningTeams
      .map(function(team) {
        return teamNames[team];
      })
      .join(" and ");

    celebrationMessage.textContent =
      "🎉 Attendance goal reached! Winning team: " + winningTeamNames + "!";

    celebrationMessage.classList.remove("hidden");

    highlightWinningTeams(winningTeams);
  } else {
    celebrationMessage.classList.add("hidden");

    const teamCards = document.querySelectorAll(".team-card");

    teamCards.forEach(function(card) {
      card.classList.remove("winning");
    });
  }
}

// Update all page displays
function updatePage() {
  updateTotalCount();
  updateTeamCounts();
  updateProgressBar();
  updateAttendeeList();
  checkCelebration();
}

// Handle form submission
form.addEventListener("submit", function(event) {
  event.preventDefault();

  // Get form values
  const name = nameInput.value.trim();
  const team = teamSelect.value;

  // Make sure the user filled everything out
  if (name === "" || team === "") {
    showMessage("Please enter a name and select a team.", "warning");
    return;
  }

  // Increase total count
  checkInData.totalCount++;

  // Increase selected team count
  checkInData.teamCounts[team]++;

  // Save attendee name and team
  checkInData.attendees.push({
    name: name,
    team: team,
  });

  // Show personalized greeting
  showMessage("🚀 Welcome, " + name + " from " + teamNames[team] + "!", "success");

  // Save progress to localStorage
  saveData();

  // Update the page
  updatePage();

  // Reset form
  form.reset();
  nameInput.focus();
});

// Clear saved progress for testing
resetBtn.addEventListener("click", function() {
  const confirmReset = confirm("Are you sure you want to clear all saved progress?");

  if (confirmReset) {
    localStorage.removeItem(storageKey);
    checkInData = getStartingData();
    updatePage();
    showMessage("Saved progress has been cleared.", "warning");
  }
});

// Load saved progress when the page opens
updatePage();