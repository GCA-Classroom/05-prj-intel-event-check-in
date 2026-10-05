// Get the form elements
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");

// Get the attendance elements
const attendeeCount = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const greeting = document.getElementById("greeting");

// Track attendance
let count = 0;
const maxCount = 50;

// Handle form submission
form.addEventListener("submit", function (event) {
  event.preventDefault();

  // Get the values from the form
  const attendeeName = nameInput.value;
  const team = teamSelect.value;
  const teamName = teamSelect.options[teamSelect.selectedIndex].text;

  // Increment and display the total attendance
  count++;
  attendeeCount.textContent = count;

  // Update the progress bar
  const percentage = Math.min(Math.round((count / maxCount) * 100), 100);
  progressBar.style.width = `${percentage}%`;

  // Update the selected team's count
  const teamCounter = document.getElementById(`${team}Count`);
  const currentTeamCount = parseInt(teamCounter.textContent, 10);
  teamCounter.textContent = currentTeamCount + 1;

  // Show a personalized greeting
  greeting.textContent = `🎉 Welcome, ${attendeeName} from ${teamName}!`;
  greeting.classList.add("success-message");
  greeting.style.display = "block";

  // Reset the form for the next attendee
  form.reset();
});
