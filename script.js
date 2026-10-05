const checkInForm = document.getElementById("checkInForm");
const attendeeNameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const attendeeCountDisplay = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const greeting = document.getElementById("greeting");
const celebration = document.getElementById("celebration");
const attendeeList = document.getElementById("attendeeList");
const emptyAttendeeList = document.getElementById("emptyAttendeeList");
const resetButton = document.getElementById("resetButton");
const attendanceGoal = 50;

let attendeeCount = Number(localStorage.getItem("attendeeCount")) || 0;
let attendees = JSON.parse(localStorage.getItem("attendees")) || [];
const teamCounts = {
  water: {
    count: Number(localStorage.getItem("waterCount")) || 0,
    display: document.getElementById("waterCount"),
    name: "Team Water Wise",
  },
  zero: {
    count: Number(localStorage.getItem("zeroCount")) || 0,
    display: document.getElementById("zeroCount"),
    name: "Team Net Zero",
  },
  power: {
    count: Number(localStorage.getItem("powerCount")) || 0,
    display: document.getElementById("powerCount"),
    name: "Team Renewables",
  },
};

function updateAttendance() {
  attendeeCountDisplay.textContent = attendeeCount;
  teamCounts.water.display.textContent = teamCounts.water.count;
  teamCounts.zero.display.textContent = teamCounts.zero.count;
  teamCounts.power.display.textContent = teamCounts.power.count;

  const progress = Math.min((attendeeCount / attendanceGoal) * 100, 100);
  progressBar.style.width = `${progress}%`;
}

function displayAttendees() {
  attendeeList.innerHTML = "";

  attendees.forEach(function (attendee) {
    const attendeeRow = document.createElement("li");
    const name = document.createElement("span");
    const team = document.createElement("span");

    name.textContent = attendee.name;
    team.textContent = attendee.team;
    attendeeRow.appendChild(name);
    attendeeRow.appendChild(team);
    attendeeList.appendChild(attendeeRow);
  });

  emptyAttendeeList.style.display = attendees.length === 0 ? "block" : "none";
}

function showCelebration() {
  let highestCount = 0;
  let winningTeams = [];

  Object.keys(teamCounts).forEach(function (teamKey) {
    const team = teamCounts[teamKey];

    if (team.count > highestCount) {
      highestCount = team.count;
      winningTeams = [team.name];
    } else if (team.count === highestCount) {
      winningTeams.push(team.name);
    }
  });

  if (winningTeams.length === 1) {
    celebration.textContent = `Goal reached! ${winningTeams[0]} is the winning team!`;
  } else {
    celebration.textContent = `Goal reached! ${winningTeams.join(" and ")} are tied for the win!`;
  }

  celebration.style.display = "block";
}

updateAttendance();
displayAttendees();

if (attendeeCount >= attendanceGoal) {
  showCelebration();
}

checkInForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const attendeeName = attendeeNameInput.value.trim();
  const selectedTeam = teamSelect.value;

  if (attendeeName === "" || teamCounts[selectedTeam] === undefined) {
    return;
  }

  attendeeCount += 1;
  teamCounts[selectedTeam].count += 1;
  updateAttendance();

  const teamName = teamSelect.options[teamSelect.selectedIndex].text;
  attendees.push({ name: attendeeName, team: teamName });
  displayAttendees();

  greeting.textContent = `Welcome, ${attendeeName}! You are checked in with ${teamName}.`;
  greeting.classList.add("success-message");
  greeting.style.display = "block";

  localStorage.setItem("attendeeCount", attendeeCount);
  localStorage.setItem("waterCount", teamCounts.water.count);
  localStorage.setItem("zeroCount", teamCounts.zero.count);
  localStorage.setItem("powerCount", teamCounts.power.count);
  localStorage.setItem("attendees", JSON.stringify(attendees));

  if (attendeeCount === attendanceGoal) {
    showCelebration();
  }

  checkInForm.reset();
});

resetButton.addEventListener("click", function () {
  const shouldReset = confirm(
    "Reset all attendee names and attendance counts?",
  );

  if (shouldReset === false) {
    return;
  }

  attendeeCount = 0;
  attendees = [];
  teamCounts.water.count = 0;
  teamCounts.zero.count = 0;
  teamCounts.power.count = 0;

  localStorage.removeItem("attendeeCount");
  localStorage.removeItem("waterCount");
  localStorage.removeItem("zeroCount");
  localStorage.removeItem("powerCount");
  localStorage.removeItem("attendees");

  checkInForm.reset();
  greeting.textContent = "";
  greeting.style.display = "none";
  greeting.classList.remove("success-message");
  celebration.textContent = "";
  celebration.style.display = "none";
  updateAttendance();
  displayAttendees();
});
