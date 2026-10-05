// Get all needed DOM elements
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const attendeeCount = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const greeting = document.getElementById("greeting");
const checkInButton = document.getElementById("checkInBtn");
const attendeeNames = document.getElementById("attendeeNames");
const celebration = document.getElementById("celebration");

//Track attendance
let count = 0;
const maxCount = 50;
let teamCounts = {
  water: 0,
  zero: 0,
  power: 0,
};
let attendees = [];

function saveAttendance() {
  localStorage.setItem("attendanceCount", count);
  localStorage.setItem("teamCounts", JSON.stringify(teamCounts));
  localStorage.setItem("attendees", JSON.stringify(attendees));
}

function renderAttendeeList() {
  attendeeNames.innerHTML = "";

  for (let index = 0; index < attendees.length; index++) {
    const attendee = attendees[index];
    const listItem = document.createElement("li");
    listItem.textContent = `${attendee.name} - ${attendee.teamName}`;
    attendeeNames.appendChild(listItem);
  }
}

function getWinningTeamName() {
  let winningTeam = "Team Water Wise";
  let winningCount = teamCounts.water;

  if (teamCounts.zero > winningCount) {
    winningTeam = "Team Net Zero";
    winningCount = teamCounts.zero;
  }

  if (teamCounts.power > winningCount) {
    winningTeam = "Team Renewables";
  }

  return winningTeam;
}

function showCelebration() {
  celebration.textContent = `🎉 Goal reached! ${getWinningTeamName()} led the attendance!`;
  celebration.style.display = "block";
}

function restoreAttendance() {
  const savedCount = localStorage.getItem("attendanceCount");
  const savedTeamCounts = localStorage.getItem("teamCounts");
  const savedAttendees = localStorage.getItem("attendees");

  if (savedCount !== null) {
    count = parseInt(savedCount);
  }

  if (savedTeamCounts !== null) {
    teamCounts = JSON.parse(savedTeamCounts);
  }

  if (savedAttendees !== null) {
    attendees = JSON.parse(savedAttendees);
  }

  attendeeCount.textContent = count;
  document.getElementById("waterCount").textContent = teamCounts.water;
  document.getElementById("zeroCount").textContent = teamCounts.zero;
  document.getElementById("powerCount").textContent = teamCounts.power;
  progressBar.style.width = `${Math.round((count / maxCount) * 100)}%`;
  renderAttendeeList();

  if (count >= maxCount) {
    checkInButton.disabled = true;
    checkInButton.textContent = "Check-In Full";
    showCelebration();
  }
}

restoreAttendance();

//Handle form submission
form.addEventListener("submit", function (event) {
  event.preventDefault();

  if (count >= maxCount) {
    greeting.textContent = "Check-in is full. Thank you for your interest!";
    greeting.className = "success-message";
    greeting.style.display = "block";
    return;
  }

  //Get form values
  const name = nameInput.value;
  const team = teamSelect.value;
  teamSelect.selectOptions = teamSelect.selectedOptions;
  const teamName = teamSelect.selectOptions[0].text;
  console.log(name, teamName);

  //Increment count
  count++;
  console.log("Total check-ins: ", count);
  attendeeCount.textContent = count;

  //Update progress bar
  const percentage = Math.round((count / maxCount) * 100) + "%";
  console.log(`Progress: ${percentage}`);
  progressBar.style.width = percentage;

  //Update team conter
  const teamCounter = document.getElementById(team + "Count");
  teamCounter.textContent = parseInt(teamCounter.textContent) + 1;
  teamCounts[team] = parseInt(teamCounter.textContent);

  attendees.push({
    name: name,
    teamName: teamName,
  });
  renderAttendeeList();
  saveAttendance();

  //Show welcome message
  const message = `Welcome, ${name} from ${teamName}`;
  console.log(message);
  greeting.textContent = message;
  greeting.className = "success-message";
  greeting.style.display = "block";

  if (count === maxCount) {
    checkInButton.disabled = true;
    checkInButton.textContent = "Check-In Full";
    greeting.textContent = "Check-in is full. Thank you for attending!";
    greeting.className = "success-message";
    greeting.style.display = "block";
    showCelebration();
  }

  form.reset();
});
