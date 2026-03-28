// Get all needed DOM elements
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const clearBtn = document.getElementById("clearBtn");

// Track attendance
let count = 0;
const maxCount = 50; // Set a maximum count for demonstration purposes

// Track attendees by team
const teamAttendees = {
  water: [],
  zero: [],
  power: [],
};

// Load data from localStorage on page load
function loadData() {
  const savedData = localStorage.getItem("attendanceData");
  if (savedData) {
    const data = JSON.parse(savedData);
    count = data.count;
    teamAttendees.water = data.water;
    teamAttendees.zero = data.zero;
    teamAttendees.power = data.power;

    // Update displays
    document.getElementById("attendeeCount").textContent = count;
    document.getElementById("waterCount").textContent =
      teamAttendees.water.length;
    document.getElementById("zeroCount").textContent =
      teamAttendees.zero.length;
    document.getElementById("powerCount").textContent =
      teamAttendees.power.length;

    // Update progress bar
    const percentage = Math.round((count / maxCount) * 100);
    document.getElementById("progressBar").style.width = percentage + "%";

    // Update attendee lists
    updateAttendeeList("water");
    updateAttendeeList("zero");
    updateAttendeeList("power");
  }
}

// Save data to localStorage
function saveData() {
  const data = {
    count: count,
    water: teamAttendees.water,
    zero: teamAttendees.zero,
    power: teamAttendees.power,
  };
  localStorage.setItem("attendanceData", JSON.stringify(data));
}

// Load data when page loads
loadData();

// Handle form submission
form.addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent form from submitting normally

  // Get form values
  const name = nameInput.value;
  const team = teamSelect.value;
  const teamName = teamSelect.selectedOptions[0].text; // Get the text of the selected option

  console.log(name, teamName); // For testing purposes, you can replace this with actual form handling logic

  // Increment count
  count++;
  console.log("Total check-ins: " + count);

  // Update attendance count display
  const attendeeCountElement = document.getElementById("attendeeCount");
  attendeeCountElement.textContent = count;

  // Update progress bar
  const percentage = Math.round((count / maxCount) * 100);
  const progressBar = document.getElementById("progressBar");
  progressBar.style.width = percentage + "%";

  // Update team counter
  const teamCounter = document.getElementById(team + "Count");
  teamCounter.textContent = parseInt(teamCounter.textContent) + 1;

  // Add attendee to team list
  teamAttendees[team].push(name);
  updateAttendeeList(team);

  // Show personalized welcome message
  const message = `Welcome, ${name} from ${teamName}!`;
  const greetingElement = document.getElementById("greeting");
  greetingElement.textContent = message;
  greetingElement.style.display = "block";
  greetingElement.className = "success-message";

  // Save data to localStorage
  saveData();

  // Reset form
  form.reset();
});

// Function to update attendee list for a team
function updateAttendeeList(team) {
  const listElement = document.getElementById(team + "List");
  listElement.innerHTML = "";

  teamAttendees[team].forEach(function (attendeeName) {
    const listItem = document.createElement("li");
    listItem.textContent = attendeeName;
    listElement.appendChild(listItem);
  });
}

// Function to toggle attendee list visibility
function toggleAttendees(team) {
  const listElement = document.getElementById(team + "List");
  const teamCard = listElement.closest(".team-card");
  const button = teamCard.querySelector(".toggle-attendees");
  const icon = button.querySelector("i");

  if (listElement.style.display === "block") {
    listElement.style.display = "none";
    icon.className = "fas fa-chevron-down";
    button.innerHTML = '<i class="fas fa-chevron-down"></i> View Attendees';
  } else {
    listElement.style.display = "block";
    icon.className = "fas fa-chevron-up";
    button.innerHTML = '<i class="fas fa-chevron-up"></i> Hide Attendees';
  }
}

// Function to clear all attendance data
function clearAllData() {
  count = 0;
  teamAttendees.water = [];
  teamAttendees.zero = [];
  teamAttendees.power = [];

  // Update all displays
  document.getElementById("attendeeCount").textContent = 0;
  document.getElementById("waterCount").textContent = 0;
  document.getElementById("zeroCount").textContent = 0;
  document.getElementById("powerCount").textContent = 0;
  document.getElementById("progressBar").style.width = "0%";

  // Clear all attendee lists
  updateAttendeeList("water");
  updateAttendeeList("zero");
  updateAttendeeList("power");

  // Clear greeting message
  document.getElementById("greeting").style.display = "none";

  // Clear localStorage
  localStorage.removeItem("attendanceData");
}

// Add click listener to clear button
clearBtn.addEventListener("click", function () {
  clearAllData();
});
// Get references to DOM elements
const checkInForm = document.getElementById("checkInForm");
const attendeeNameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const greetingElement = document.getElementById("greeting");
const attendeeCountElement = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const waterCountElement = document.getElementById("waterCount");
const zeroCountElement = document.getElementById("zeroCount");
const powerCountElement = document.getElementById("powerCount");
const waterListElement = document.getElementById("waterList");
const zeroListElement = document.getElementById("zeroList");
const powerListElement = document.getElementById("powerList");
const clearListBtn = document.getElementById("clearListBtn");

// Initialize counters
let totalAttendees = 0;
let teamCounts = {
  water: 0,
  zero: 0,
  power: 0,
};

let teamNames = {
  water: [],
  zero: [],
  power: [],
};

const maxAttendees = 50;

// Load data from localStorage when page loads
function loadData() {
  const savedTotal = localStorage.getItem("totalAttendees");
  const savedTeamCounts = localStorage.getItem("teamCounts");
  const savedTeamNames = localStorage.getItem("teamNames");

  if (savedTotal) {
    totalAttendees = parseInt(savedTotal);
  }

  if (savedTeamCounts) {
    teamCounts = JSON.parse(savedTeamCounts);
  }

  if (savedTeamNames) {
    teamNames = JSON.parse(savedTeamNames);
  }

  updateDisplay();
}

// Save data to localStorage
function saveData() {
  localStorage.setItem("totalAttendees", totalAttendees.toString());
  localStorage.setItem("teamCounts", JSON.stringify(teamCounts));
  localStorage.setItem("teamNames", JSON.stringify(teamNames));
}

// Update all display elements
function updateDisplay() {
  // Update total attendee count
  attendeeCountElement.textContent = totalAttendees;

  // Update progress bar
  const progressPercent = (totalAttendees / maxAttendees) * 100;
  progressBar.style.width = `${progressPercent}%`;

  // Update team counts
  waterCountElement.textContent = teamCounts.water;
  zeroCountElement.textContent = teamCounts.zero;
  powerCountElement.textContent = teamCounts.power;

  // Update team name lists
  renderTeamList(waterListElement, teamNames.water);
  renderTeamList(zeroListElement, teamNames.zero);
  renderTeamList(powerListElement, teamNames.power);
}

function renderTeamList(listElement, names) {
  listElement.innerHTML = "";

  if (names.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.textContent = "No attendees yet";
    listElement.appendChild(emptyItem);
    return;
  }

  for (let i = 0; i < names.length; i++) {
    const listItem = document.createElement("li");
    listItem.textContent = names[i];
    listElement.appendChild(listItem);
  }
}

// Show success message
function showMessage(name, team) {
  const teamNames = {
    water: "Team Water Wise",
    zero: "Team Net Zero",
    power: "Team Renewables",
  };

  greetingElement.textContent = `Welcome, ${name}! You've been checked in to ${teamNames[team]}.`;
  greetingElement.className = "success-message";
  greetingElement.style.display = "block";

  // Hide message after 4 seconds
  setTimeout(function () {
    greetingElement.style.display = "none";
  }, 4000);
}

// Handle form submission
function handleCheckIn(event) {
  event.preventDefault();

  const attendeeName = attendeeNameInput.value.trim();
  const selectedTeam = teamSelect.value;

  if (attendeeName && selectedTeam) {
    // Increment counters
    totalAttendees++;
    teamCounts[selectedTeam]++;
    teamNames[selectedTeam].push(attendeeName);

    // Update display
    updateDisplay();

    // Save to localStorage
    saveData();

    // Show success message
    showMessage(attendeeName, selectedTeam);

    // Clear form
    attendeeNameInput.value = "";
    teamSelect.value = "";
  }
}

// Handle clear list
function handleClearList() {
  const confirmClear = confirm(
    "Are you sure you want to clear all attendance data?",
  );

  if (confirmClear) {
    // Reset counters
    totalAttendees = 0;
    teamCounts = {
      water: 0,
      zero: 0,
      power: 0,
    };
    teamNames = {
      water: [],
      zero: [],
      power: [],
    };

    // Update display
    updateDisplay();

    // Clear localStorage
    localStorage.removeItem("totalAttendees");
    localStorage.removeItem("teamCounts");
    localStorage.removeItem("teamNames");

    // Hide greeting message
    greetingElement.style.display = "none";
  }
}

// Add event listeners
checkInForm.addEventListener("submit", handleCheckIn);
clearListBtn.addEventListener("click", handleClearList);

// Load data when page loads
loadData();

