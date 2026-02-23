//Get all needed DOM elements
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const checkInList = document.getElementById("checkInList");

// Track Attendance
let count = 0;
const maxCount = 50;

// Team counts object
let teamCounts = {
  water: 0,
  zero: 0,
  power: 0,
};

// Attendees array
let attendees = [];

// Team names mapping
const teamNames = {
  water: "Team Water Wise",
  zero: "Team Net Zero",
  power: "Team Renewables",
};

// Load data from localStorage on page load
function loadFromLocalStorage() {
  const savedCount = localStorage.getItem("attendeeCount");
  const savedTeamCounts = localStorage.getItem("teamCounts");
  const savedAttendees = localStorage.getItem("attendees");

  if (savedCount !== null) {
    count = parseInt(savedCount);
    document.getElementById("attendeeCount").textContent = count;
  }

  if (savedTeamCounts !== null) {
    teamCounts = JSON.parse(savedTeamCounts);
    document.getElementById("waterCount").textContent = teamCounts.water;
    document.getElementById("zeroCount").textContent = teamCounts.zero;
    document.getElementById("powerCount").textContent = teamCounts.power;
  }

  if (savedAttendees !== null) {
    attendees = JSON.parse(savedAttendees);
    displayAttendeeList();
  }

  if (count > 0) {
    const percentage = Math.round((count / maxCount) * 100) + "%";
    document.getElementById("progressBar").style.width = percentage;
  }
}

// Save data to localStorage
function saveToLocalStorage() {
  localStorage.setItem("attendeeCount", count);
  localStorage.setItem("teamCounts", JSON.stringify(teamCounts));
  localStorage.setItem("attendees", JSON.stringify(attendees));
}

// Display attendee list
function displayAttendeeList() {
  checkInList.innerHTML = "";
  attendees.forEach(function (attendee) {
    const listItem = document.createElement("li");
    listItem.textContent = attendee.name + " - " + attendee.team;
    checkInList.appendChild(listItem);
  });
}

// Get winning team (team with most check-ins)
function getWinningTeam() {
  let maxTeamCount = 0;
  let winningTeam = "";

  for (let team in teamCounts) {
    if (teamCounts[team] > maxTeamCount) {
      maxTeamCount = teamCounts[team];
      winningTeam = team;
    }
  }

  return winningTeam;
}

// Show celebration message
function showCelebration() {
  const winningTeam = getWinningTeam();
  const celebrationDiv = document.getElementById("celebrationMessage");
  const messageText = document.getElementById("winningTeamMessage");

  messageText.textContent =
    "Congratulations! " +
    teamNames[winningTeam] +
    " led the way with the most check-ins!";
  celebrationDiv.style.display = "flex";
}

//Handle form submission
form.addEventListener("submit", function (event) {
  event.preventDefault();

  //Get Form Values
  const name = nameInput.value.trim();
  const team = teamSelect.value;
  const teamName = teamSelect.options[teamSelect.selectedIndex].text;
  console.log(name, team, teamName);

  //Increment Count
  count++;
  console.log("Total check ins: " + count);

  //Update Attendee Count on Page
  document.getElementById("attendeeCount").textContent = count;

  //Update Progress Bar
  const percentage = Math.round((count / maxCount) * 100) + "%";
  console.log("Progress: " + percentage);
  document.getElementById("progressBar").style.width = percentage;

  //Update Team Counter
  teamCounts[team] = teamCounts[team] + 1;
  const teamCounter = document.getElementById(team + "Count");
  teamCounter.textContent = teamCounts[team];
  console.log("Team count: ", teamCounts[team]);

  //Add attendee to list
  attendees.push({
    name: name,
    team: teamName,
  });

  //Display attendee list
  displayAttendeeList();

  //Welcome Message
  const message =
    "Welcome, " + name + "! You have checked in for " + teamName + ".";
  alert(message);

  //Check if max count is reached
  if (count >= maxCount) {
    showCelebration();
  }

  //Save to localStorage
  saveToLocalStorage();

  //Reset Form
  form.reset();
});

// Load data when page loads
loadFromLocalStorage();
