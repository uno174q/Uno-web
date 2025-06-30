document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("start-game-btn");
  const startScreen = document.getElementById("start-screen");
  const gameContainer = document.getElementById("game-container");
  const playerNameInput = document.getElementById("player-name");
  const playerLabel = document.getElementById("player-label");
  const playerHand = document.getElementById("player-hand");
  const botHand = document.getElementById("bot-hand");
  const turnIndicator = document.getElementById("turn-indicator");

  const colors = ["Red", "Blue", "Green", "Yellow"];
  const values = ["0", "1", "2", "Skip", "Reverse", "+2"];

  const createCard = (color, value) => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.backgroundColor = color.toLowerCase();
    card.textContent = value;
    return card;
  };

  startBtn.addEventListener("click", () => {
    const name = playerNameInput.value.trim();
    if (!name) return alert("İsmini gir!");

    startScreen.style.display = "none";
    gameContainer.style.display = "block";
    playerLabel.textContent = `Oyuncu: ${name}`;
    turnIndicator.textContent = "Oyuncu";

    // Oyuncuya 5 kart ver
    playerHand.innerHTML = "";
    for (let i = 0; i < 5; i++) {
      const card = createCard(colors[Math.floor(Math.random() * 4)], values[Math.floor(Math.random() * values.length)]);
      playerHand.appendChild(card);
    }

    // Bot’a 5 kart ver
    botHand.innerHTML = "";
    for (let i = 0; i < 5; i++) {
      const card = createCard(colors[Math.floor(Math.random() * 4)], values[Math.floor(Math.random() * values.length)]);
      botHand.appendChild(card);
    }

    // Oyuncu kart seçince bot oynasın
    playerHand.querySelectorAll(".card").forEach(card => {
      card.addEventListener("click", () => {
        if (turnIndicator.textContent !== "Oyuncu") return;

        card.remove();
        turnIndicator.textContent = "Bot";

        setTimeout(() => {
          const botCards = botHand.querySelectorAll(".card");
          if (botCards.length > 0) {
            botCards[0].remove(); // basit bot stratejisi
            turnIndicator.textContent = "Oyuncu";
          }
        }, 1000);
      });
    });
  });
});
