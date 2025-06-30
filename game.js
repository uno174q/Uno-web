document.addEventListener("DOMContentLoaded", () => {
  const startScreen = document.getElementById("start-screen");
  const gameContainer = document.getElementById("game-container");
  const playerInput = document.getElementById("player-name");
  const startBtn = document.getElementById("start-game-btn");
  const playerHand = document.getElementById("player-hand");

  const imageMap = {
    red_1: "R1.png",
    blue_0: "B0.png",
    yellow_skip: "YS.png",
    green_reverse: "GR.png",
    yellow_draw2: "YA2.png",
    wild: "WC.png",
    draw4: "W4.png"
  };

  startBtn.addEventListener("click", () => {
    const name = playerInput.value.trim();
    if (!name) {
      alert("Lütfen ismini gir!");
      return;
    }

    startScreen.style.display = "none";
    gameContainer.style.display = "block";

    const cards = [
      { color: "red", value: "1" },
      { color: "blue", value: "0" },
      { color: "yellow", value: "skip" },
      { color: "green", value: "reverse" },
      { color: "yellow", value: "draw2" },
      { color: "wild", value: "wild" },
      { color: "wild", value: "draw4" }
    ];

    cards.forEach(card => {
      const key = card.color === "wild" ? card.value : `${card.color}_${card.value}`;
      const filename = imageMap[key] || "WC.png";
      const cardEl = document.createElement("div");
      cardEl.className = "card";
      cardEl.style.backgroundImage = `url('img/${filename}')`;
      playerHand.appendChild(cardEl);
    });
  });
});
