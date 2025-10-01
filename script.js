// Get all needed DOM elements
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");

// Track attendance
const maxCount = 50; // Maximum number of attendees
let count = 0;
let waterCount = 0;
let zeroCount = 0;
let powerCount = 0;

// Restore counts from localStorage
if (localStorage.getItem("attendanceCount")) {
  count = parseInt(localStorage.getItem("attendanceCount"));
}
if (localStorage.getItem("waterCount")) {
  waterCount = parseInt(localStorage.getItem("waterCount"));
}
if (localStorage.getItem("zeroCount")) {
  zeroCount = parseInt(localStorage.getItem("zeroCount"));
}
if (localStorage.getItem("powerCount")) {
  powerCount = parseInt(localStorage.getItem("powerCount"));
}

// Restore attendee list from localStorage
let attendeeList = [];
if (localStorage.getItem("attendeeList")) {
  attendeeList = JSON.parse(localStorage.getItem("attendeeList"));
}

// Helper to render attendee list
function renderAttendeeList() {
  const attendeeListElement = document.getElementById("attendeeList");
  attendeeListElement.innerHTML = "";
  for (let i = 0; i < attendeeList.length; i++) {
    const attendee = attendeeList[i];
    const li = document.createElement("li");
    li.className = "attendee-item";
    li.textContent = `${attendee.name} (${attendee.teamLabel})`;
    attendeeListElement.appendChild(li);
  }
}

// Initial render
renderAttendeeList();

// Update UI with restored values
document.getElementById("attendeeCount").textContent = count;
document.getElementById("waterCount").textContent = waterCount;
document.getElementById("zeroCount").textContent = zeroCount;
document.getElementById("powerCount").textContent = powerCount;
const progressBar = document.getElementById("progressBar");
const percentage = Math.round((count / maxCount) * 100);
progressBar.style.width = `${percentage}%`;

//Handle form submission
form.addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent default form submission

  // Get form values
  const name = nameInput.value;
  const team = teamSelect.value;
  const teamName = teamSelect.selectedOptions[0].text;

  const greeting = document.getElementById("greeting");
  if (count >= maxCount) {
    greeting.textContent =
      "Sorry, the maximum number of attendees has been reached. No more check-ins allowed.";
    greeting.style.display = "block";
    form.reset();
    return;
  }

  // Send form data to the server (mocked with a console log)
  console.log(name, teamName);

  // Increment count and team
  count++;
  if (team === "water") {
    waterCount++;
  } else if (team === "zero") {
    zeroCount++;
  } else if (team === "power") {
    powerCount++;
  }
  // Save to localStorage
  localStorage.setItem("attendanceCount", count);
  localStorage.setItem("waterCount", waterCount);
  localStorage.setItem("zeroCount", zeroCount);
  localStorage.setItem("powerCount", powerCount);
  // Update UI
  document.getElementById("attendeeCount").textContent = count;
  document.getElementById("waterCount").textContent = waterCount;
  document.getElementById("zeroCount").textContent = zeroCount;
  document.getElementById("powerCount").textContent = powerCount;
  const percentage = Math.round((count / maxCount) * 100);
  progressBar.style.width = `${percentage}%`;

  // Show Welcome message in the greeting element
  greeting.textContent = `Welcome, ${name} from ${teamName}!`;
  greeting.style.display = "block";

  // Add attendee to list and save
  attendeeList.push({ name: name, team: team, teamLabel: teamName });
  localStorage.setItem("attendeeList", JSON.stringify(attendeeList));
  renderAttendeeList();

  // Check if goal reached
  if (count >= maxCount) {
    // Find winning team based on highest count
    const waterCount = parseInt(
      document.getElementById("waterCount").textContent
    );
    const zeroCount = parseInt(
      document.getElementById("zeroCount").textContent
    );
    const powerCount = parseInt(
      document.getElementById("powerCount").textContent
    );
    let winningTeam = "";
    let winningLabel = "";
    if (waterCount >= zeroCount && waterCount >= powerCount) {
      winningTeam = "water";
      winningLabel = "Team Water Wise";
    } else if (zeroCount >= waterCount && zeroCount >= powerCount) {
      winningTeam = "zero";
      winningLabel = "Team Net Zero";
    } else {
      winningTeam = "power";
      winningLabel = "Team Renewables";
    }
    const greeting = document.getElementById("greeting");
    greeting.textContent = `🎉 Goal reached! Congratulations, ${winningLabel}! 🎉`;
  }
  // Reset form
  form.reset();
});
