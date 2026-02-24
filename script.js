const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");

// To Handle Form Submission
form.addEventListener("submit", function (e) {
  event.preventDefault();

  //Getting the form values
  const name = nameInput.value;
  const team = teamSelect.value;

  console.log(name, team);
  
});