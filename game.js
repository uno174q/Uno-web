document.addEventListener("DOMContentLoaded", () => {
  const startScreen = document.getElementById("start-screen");
  const gameContainer = document.getElementById("game-container");
  const playerInput = document.getElementById("player-name");
  const startBtn = document.getElementById("start-game-btn");
  const playerHand = document.getElementById("player-hand");
  const botHand = document.getElementById("bot-hand");
  const turnDisplay = document.getElementById("turn-indicator");

  const colors = ["red", "blue", "green", "yellow"];
  const values = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "skip", "reverse", "draw2"];
  const wilds = ["wild", "draw4"];

  function createCard(color, value) {
    const cardEl = document.createElement("div");
    cardEl.className = "card";
    let fileName;

    if (color === "wild") {
      fileName = value === "draw4" ? "W4.png" : "WC.png";
    } else {
      if (value === "skip") fileName = color.charAt(0).toUpperCase() + "S.png";
      else if (value === "reverse") fileName = color.charAt(0).toUpperCase() + "R.png";
      else if (value === "draw2") fileName = color.charAt(0).toUpperCase() + "A2.png";
      else fileName = color.charAt(0).toUpperCase() + value + ".png";
    }

    cardEl.style.backgroundImage = `url('img/${fileName}')`;
    cardEl.style.backgroundSize = "cover";
    cardEl.setAttribute("tabindex", "0");

    return cardEl;
  }

  function addCards(container, count) {
    for (let i = 0; i < count; i++) {
      const isWild = Math.random() < 0.2;
      const card = isWild
        ? createCard("wild", wilds[Math.floor(Math.random() * wilds.length)])
        : createCard(colors[Math.floor(Math.random() * colors.length)], values[Math.floor(Math.random() * values.length)]);

      container.appendChild(card);
    }
  }

  startBtn.addEventListener("click", () => {
    const name = playerInput.value.trim();
    if (!name) return alert("İsmini gir!");

    startScreen.style.display = "none";
    gameContainer.style.display = "block";
    turnDisplay.textContent = `Sıra: ${name}`;

    playerHand.innerHTML = "";
    botHand.innerHTML = "";

    addCards(playerHand, 7);
    addCards(botHand, 7);

    playerHand.querySelectorAll(".card").forEach(card => {
      card.addEventListener("click", () => {
        if (turnDisplay.textContent !== `Sıra: ${name}`) return;

        card.remove();
        turnDisplay.textContent = "Sıra: Bot";

        setTimeout(() => {
          const botCards = botHand.querySelectorAll(".card");
          if (botCards.length > 0) {
            botCards[0].remove(); // en üstteki kartı oynar
          }

          turnDisplay.textContent = `Sıra: ${name}`;
        }, 1000);
      });
    });
  });
});
