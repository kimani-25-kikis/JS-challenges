
const searchForm = document.getElementById("search-form");
const usernameInput = document.getElementById("username");
const userContainer = document.getElementById("user-container");
const status = document.getElementById("status");

async function fetchGitHubUser(username) {
  const response = await fetch(`https://api.github.com/users/${username}`);

  if (!response.ok) {
    throw new Error("GitHub user not found!");
  }

  const data = await response.json();

  return data;
}

function displayUser(user) {
  userContainer.innerHTML = `
    <div class="user-card">
      <img src="${user.avatar_url}" alt="${user.login}'s profile picture">

      <h2>${user.name || user.login}</h2>

      <p>@${user.login}</p>

      <p>${user.bio || "No bio available."}</p>

      <div class="user-stats">
        <p>Repositories: ${user.public_repos}</p>
        <p>Followers: ${user.followers}</p>
        <p>Following: ${user.following}</p>
      </div>

      <a href="${user.html_url}" target="_blank" rel="noopener noreferrer">
        View GitHub Profile
      </a>
    </div>
  `;
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const username = usernameInput.value.trim();

  if (!username) {
    status.textContent = "Please enter a GitHub username.";
    return;
  }

  status.textContent = "Loading user information...";
  userContainer.innerHTML = "";

  fetchGitHubUser(username)
    .then((user) => {
      status.textContent = "User found successfully!";
      displayUser(user);
    })
    .catch((error) => {
      status.textContent = error.message;
      userContainer.innerHTML = "";
    });
});
