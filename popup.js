document.getElementById("scrapeButton").addEventListener("click", async () => {
  const username = document.getElementById("username").value;
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "Scraping data...";

  try {
    const response = await chrome.runtime.sendMessage({
      action: "scrapeInstagram",
      username,
    });
    if (response.error) {
      resultDiv.innerHTML = `Error: ${response.error}`;
    } else {
      const dontFollowMeBack = response.dontFollowMeBack;
      resultDiv.innerHTML = `<h3 style="text-align: center;">Users who don't follow you back:</h3>`;

      const { profilePicCache = {} } = await chrome.storage.local.get('profilePicCache');

      dontFollowMeBack.forEach((user) => {
        const cachedPic = profilePicCache[user.username];
        const imgSrc = cachedPic || getInitialsAvatar(user.username);
        const fallback = getInitialsAvatar(user.username);
        resultDiv.innerHTML += `
          <div class="user">
            <img src="${imgSrc}" alt="${user.username}" onerror="this.src='${fallback}'">
            <div>
              <strong>${user.username}</strong><br>
              ${user.full_name}
            </div>
          </div>
        `;
      });
    }
  } catch (error) {
    resultDiv.innerHTML = `Error: ${error.message}`;
  }
});

function getInitialsAvatar(username) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = 50;
  canvas.height = 50;

  // Draw circle
  context.fillStyle = "#3498db";
  context.beginPath();
  context.arc(25, 25, 25, 0, Math.PI * 2, true);
  context.fill();

  // Draw text
  context.font = "bold 20px Arial";
  context.fillStyle = "#ffffff";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(username.substring(0, 2).toUpperCase(), 25, 25);

  return canvas.toDataURL();
}

