//// ========================================
// Intel Sustainability Summit Check-In
// ========================================

// Attendance goal
const attendanceGoal = 50;


// ========================================
// LOAD SAVED DATA
// ========================================

let attendeeCount =
  Number(localStorage.getItem("attendeeCount")) || 0;

let waterCount =
  Number(localStorage.getItem("waterCount")) || 0;

let zeroCount =
  Number(localStorage.getItem("zeroCount")) || 0;

let powerCount =
  Number(localStorage.getItem("powerCount")) || 0;

let attendees =
  JSON.parse(localStorage.getItem("attendees")) || [];


// ========================================
// CONNECT TO HTML
// ========================================

const checkInForm =
  document.getElementById("checkInForm");

const attendeeName =
  document.getElementById("attendeeName");

const teamSelect =
  document.getElementById("teamSelect");

const greeting =
  document.getElementById("greeting");

const attendeeCountDisplay =
  document.getElementById("attendeeCount");

const waterCountDisplay =
  document.getElementById("waterCount");

const zeroCountDisplay =
  document.getElementById("zeroCount");

const powerCountDisplay =
  document.getElementById("powerCount");

const progressBar =
  document.getElementById("progressBar");

const attendeeList =
  document.getElementById("attendeeList");


// ========================================
// DISPLAY SAVED COUNTS
// ========================================

attendeeCountDisplay.textContent = attendeeCount;
waterCountDisplay.textContent = waterCount;
zeroCountDisplay.textContent = zeroCount;
powerCountDisplay.textContent = powerCount;


// ========================================
// DISPLAY SAVED PROGRESS
// ========================================

let savedProgress =
  (attendeeCount / attendanceGoal) * 100;

if (savedProgress > 100) {
  savedProgress = 100;
}

progressBar.style.width =
  savedProgress + "%";


// ========================================
// DISPLAY ATTENDEE LIST
// ========================================

function displayAttendees() {

  attendeeList.innerHTML = "";

  // If nobody has checked in yet
  if (attendees.length === 0) {

    attendeeList.innerHTML =
      "<p>No attendees have checked in yet.</p>";

    return;
  }

  // Display each attendee
  attendees.forEach(function(attendee) {

    const attendeeItem =
      document.createElement("div");

    attendeeItem.classList.add("attendee-item");

    attendeeItem.innerHTML =
      `<span>${attendee.name}</span>
       <span>${attendee.team}</span>`;

    attendeeList.appendChild(attendeeItem);

  });
}


// Show saved attendees when page loads
displayAttendees();


// ========================================
// CHECK-IN FORM
// ========================================

checkInForm.addEventListener("submit", function(event) {

  // Stop the page from refreshing
  event.preventDefault();


  // Get attendee information
  const name =
    attendeeName.value.trim();

  const team =
    teamSelect.value;


  // Make sure a name was entered
  if (name === "") {

    greeting.textContent =
      "Please enter your name.";

    return;
  }


  // Make sure a team was selected
  if (team === "") {

    greeting.textContent =
      "Please select a team.";

    return;
  }


  // ========================================
  // GREETING
  // ========================================

  greeting.textContent =
    `Welcome, ${name}! Thanks for checking in!`;


  // ========================================
  // TOTAL ATTENDANCE
  // ========================================

  attendeeCount++;

  attendeeCountDisplay.textContent =
    attendeeCount;


  // ========================================
  // TEAM COUNTS
  // ========================================

  let teamName = "";


  if (team === "water") {

    waterCount++;

    waterCountDisplay.textContent =
      waterCount;

    teamName = "Team Water Wise";

  }

  else if (team === "zero") {

    zeroCount++;

    zeroCountDisplay.textContent =
      zeroCount;

    teamName = "Team Net Zero";

  }

  else if (team === "power") {

    powerCount++;

    powerCountDisplay.textContent =
      powerCount;

    teamName = "Team Renewables";

  }


  // ========================================
  // ATTENDEE LIST
  // ========================================

  attendees.push({
    name: name,
    team: teamName
  });

  displayAttendees();


  // ========================================
  // PROGRESS BAR
  // ========================================

  let progressPercent =
    (attendeeCount / attendanceGoal) * 100;

  if (progressPercent > 100) {
    progressPercent = 100;
  }

  progressBar.style.width =
    progressPercent + "%";


  // ========================================
  // SAVE TO LOCAL STORAGE
  // ========================================

  localStorage.setItem(
    "attendeeCount",
    attendeeCount
  );

  localStorage.setItem(
    "waterCount",
    waterCount
  );

  localStorage.setItem(
    "zeroCount",
    zeroCount
  );

  localStorage.setItem(
    "powerCount",
    powerCount
  );

  localStorage.setItem(
    "attendees",
    JSON.stringify(attendees)
  );


  // ========================================
  // CELEBRATION FEATURE
  // ========================================

  if (attendeeCount === attendanceGoal) {

    let winningTeam = "";


    // Team Water Wise wins
    if (
      waterCount > zeroCount &&
      waterCount > powerCount
    ) {

      winningTeam = "🌊 Team Water Wise";

    }


    // Team Net Zero wins
    else if (
      zeroCount > waterCount &&
      zeroCount > powerCount
    ) {

      winningTeam = "🌿 Team Net Zero";

    }


    // Team Renewables wins
    else if (
      powerCount > waterCount &&
      powerCount > zeroCount
    ) {

      winningTeam = "⚡ Team Renewables";

    }


    // Two or more teams are tied
    else {

      winningTeam = "It's a tie";

    }


    // Show celebration message
    greeting.innerHTML =
      `🎉 Attendance Goal Reached! 🎉
      <br>
      <strong>${winningTeam}</strong>
      ${winningTeam === "It's a tie"
        ? " between the top teams!"
        : " is the winning team!"}`;

  }


  // ========================================
  // RESET FORM
  // ========================================

  checkInForm.reset();

});