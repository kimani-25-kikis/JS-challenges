const footballTeam = {
  team: "Nairobi Falcons",
  year: 2026,
  headCoach: "Daniel Mwangi",
  players: [
    {
      name: "Brian Otieno",
      position: "forward",
      isCaptain: false
    },
    {
      name: "Kevin Kamau",
      position: "forward",
      isCaptain: false
    },
    {
      name: "Diego Maradona",
      position: "midfielder",
      isCaptain: true
    },
    {
      name: "Samuel Kariuki",
      position: "midfielder",
      isCaptain: false
    },
    {
      name: "Victor Wanyama",
      position: "defender",
      isCaptain: false
    },
    {
      name: "Eric Mutua",
      position: "defender",
      isCaptain: false
    },
    {
      name: "James Ochieng",
      position: "goalkeeper",
      isCaptain: false
    }
  ]
};

const teamElement = document.getElementById("team");
const yearElement = document.getElementById("year");
const headCoachElement = document.getElementById("head-coach");
const playerCardsElement = document.getElementById("player-cards");
const playersSelect = document.getElementById("players");

teamElement.textContent = footballTeam.team;
yearElement.textContent = footballTeam.year;
headCoachElement.textContent = footballTeam.headCoach;

function displayPlayers(players) {
  playerCardsElement.innerHTML = "";

  players.forEach(player => {
    const playerCard = document.createElement("div");
    playerCard.classList.add("player-card");

    const playerName = document.createElement("h2");
    playerName.textContent = player.isCaptain
      ? `(Captain) ${player.name}`
      : player.name;

    const playerPosition = document.createElement("p");
    playerPosition.textContent = `Position: ${player.position}`;

    playerCard.appendChild(playerName);
    playerCard.appendChild(playerPosition);

    playerCardsElement.appendChild(playerCard);
  });
}

displayPlayers(footballTeam.players);

playersSelect.addEventListener("change", () => {
  const selectedPosition = playersSelect.value;

  if (selectedPosition === "all") {
    displayPlayers(footballTeam.players);
  } else {
    const filteredPlayers = footballTeam.players.filter(
      player => player.position === selectedPosition
    );

    displayPlayers(filteredPlayers);
  }
});