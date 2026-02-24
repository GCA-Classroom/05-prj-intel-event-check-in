// 1. SELECT DOM ELEMENTS
const checkInForm = document.getElementById('checkInForm');
const nameInput = document.getElementById('attendeeName');
const teamSelect = document.getElementById('teamSelect');
const greetingDisplay = document.getElementById('greeting');
const totalDisplay = document.getElementById('attendeeCount');
const progressBar = document.getElementById('progressBar');

// Team Count Display Elements
const waterCountDisp = document.getElementById('waterCount');
const zeroCountDisp = document.getElementById('zeroCount');
const powerCountDisp = document.getElementById('powerCount');

// 2. APP STATE (Variables)
let totalAttendees = 0;
const goal = 50;
let teamStats = {
    water: 0,
    zero: 0,
    power: 0
};

// 3. LEVELUP: LOAD SAVED DATA (Local Storage)
// This runs immediately when the page loads
const savedData = JSON.parse(localStorage.getItem('intelSummitData'));
if (savedData) {
    totalAttendees = savedData.totalAttendees;
    teamStats = savedData.teamStats;
    updateUI(); // Refresh the numbers on the screen
}

// 4. EVENT LISTENER: FORM SUBMISSION
checkInForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevents page reload

    const name = nameInput.value;
    const selectedTeam = teamSelect.value;

    // Increment Counts
    totalAttendees++;
    teamStats[selectedTeam]++;

    // Save to Local Storage (LevelUp)
    localStorage.setItem('intelSummitData', JSON.stringify({ totalAttendees, teamStats }));

    // Update the Greeting (Rubric: Personalized Greeting)
    showGreeting(name, selectedTeam);

    // Update the visual counts and bar
    updateUI();

    // Clear form for next attendee
    checkInForm.reset();
});

// 5. FUNCTION: UPDATE UI
function updateUI() {
    // Update Attendance Count
    totalDisplay.textContent = totalAttendees;

    // Update Team Grid (Rubric: Team Tracking)
    waterCountDisp.textContent = teamStats.water;
    zeroCountDisp.textContent = teamStats.zero;
    powerCountDisp.textContent = teamStats.power;

    // Update Progress Bar (Rubric: Progress Bar)
    const percentage = (totalAttendees / goal) * 100;
    progressBar.style.width = `${Math.min(percentage, 100)}%`;

    // LEVELUP: Celebration Feature
    if (totalAttendees >= goal) {
        greetingDisplay.innerHTML = "🌟 <strong>Summit Goal Reached!</strong> Excellent work, Intel team!";
        greetingDisplay.style.backgroundColor = "#ecfdf3"; // Light green success
        greetingDisplay.style.color = "#027a48";
        progressBar.style.backgroundImage = "linear-gradient(90deg, #10b981, #059669)";
    }
}

// 6. FUNCTION: SHOW GREETING
function showGreeting(name, team) {
    // Map the value to a friendly name
    const teamNames = {
        water: "Team Water Wise",
        zero: "Team Net Zero",
        power: "Team Renewables"
    };

    greetingDisplay.textContent = `Welcome, ${name}! Thanks for checking in with ${teamNames[team]}!`;
    
    // Use the success class from your CSS
    greetingDisplay.classList.add('success-message');
    greetingDisplay.style.display = "block";
}
