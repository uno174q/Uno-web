document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("start-btn");
  const startScreen = document.getElementById("start-screen");
  const gameContainer = document.getElementById("game-container");
  const playerNameInput = document.getElementById("player-name");

  const playerHand = document.getElementById("player-hand");
  const botHand = document.getElementById("bot-hand");
  const centerCard = document.getElementById("center-card");
  const turnIndicator = document.getElementById("turn-indicator");
  const drawBtn = document.getElementById("draw-btn");
  const playerScoreEl = document.getElementById("player-score");
  const botScoreEl = document.getElementById("bot-score");

  let playerName = "Sen";
  let playerScore = 0;
  let botScore = 0;
  let currentColor = "";
  let currentValue = "";

  const colors = ["red", "blue", "green", "yellow"];
  const values = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "skip", "reverse", "draw2"];
  const wilds = ["wild", "draw4"];

  function playSound(file) {
    const audio = new Audio(`sounds/${file}`);
    audio.play();
  }

  function createCard(color, value) {
    const card = document.createElement("div");
    card.className = "card";
    let filename;

    if (color === "wild") {
      filename = value === "draw4" ? "W4.png" : "WC.png";
    } else {
      if (value === "skip") filename = color.charAt(0).toUpperCase() + "S.png";
      else if (value === "reverse") filename = color.charAt(0).toUpperCase() + "R.png";
      else if (value === "draw2") filename = color.charAt(0).toUpperCase() + "A2.png";
      else filename = color.charAt(0).toUpperCase() + value + ".png";
    }

    card.dataset.color = color;
    card.dataset.value = value;
    card.style.backgroundImage = `url('img/${filename}')`;
    return card;
  }

  function drawCard(container, count = 1) {
    for (let i = 0; i < count; i++) {
      const isWild = Math.random() < 0.2;
      const card = isWild
        ? createCard("wild", wilds[Math.floor(Math.random() * wilds.length)])
        : createCard(colors[Math.floor(Math.random() * 4)], values[Math.floor(Math.random() * values.length)]);
      container.appendChild(card);
    }
    playSound("draw.mp3");
  }

  function setCenterCard(card) {
    centerCard.style.backgroundImage = card.style.backgroundImage;
    currentColor = card.dataset.color;
    currentValue = card.dataset.value;
    playSound("slap.mp3");

    if (currentValue === "skip") playSound("skip.mp3");
    if (currentValue === "reverse") playSound("reverse.mp3");
    if (currentValue === "draw2") playSound("draw2.mp3");
    if (currentValue === "draw4") playSound("draw4.mp3");
    if (currentValue === "wild") playSound("wild.mp3");
  }

  function botPlay() {
    const cards = botHand.querySelectorAll(".card");
    for (let card of cards) {
      const color = card.dataset.color;
      const value = card.dataset.value;
      if (
        color === currentColor || value === currentValue || color === "wild"
      ) {
        botHand.removeChild(card);
        setCenterCard(card);
        botScore += 1;
        botScoreEl.textContent = botScore;
        turnIndicator.textContent = `Sıra: ${playerName}`;
        return;
      }
    }
    drawCard(botHand);
    turnIndicator.textContent = `Sıra: ${playerName}`;
  }

  startBtn.addEventListener("click", () => {
    playerName = playerNameInput.value.trim() || "Sen";
    startScreen.style.display = "none";
    gameContainer.style.display = "block";
    turnIndicator.textContent = `Sıra: ${playerName}`;

    playerHand.innerHTML = "";
    botHand.innerHTML = "";
    playerScore = 0;
    botScore = 0;
    playerScoreEl.textContent = "0";
    botScoreEl.textContent = "0";

    drawCard(playerHand, 7);
    drawCard(botHand, 7);

    const firstCard = createCard(colors[Math.floor(Math.random() * 4)], values[Math.floor(Math.random() * values.length)]);
    setCenterCard(firstCard);
  });

  drawBtn.addEventListener("click", () => {
    if (turnIndicator.textContent !== `Sıra: ${playerName}`) {
      playSound("notyourturn.mp3");
      return;
    }
    drawCard(playerHand);
    turnIndicator.textContent =drawBtn.addEventListener("click", () => {
    if (turnIndicator.textContent !== `Sıra: ${playerName}`) {
      playSound("notyourturn.mp3");
      return;
    }
    drawCard(playerHand);
    turnIndicator.textContent = "Sıra: Bot";
    setTimeout(() => {
      botPlay();
    }, 1000);
  });

  // Oyuncu kartlarına tıklama — oynama hamlesi
  playerHand.addEventListener("click", (e) => {
    if (turnIndicator.textContent !== `Sıra: ${playerName}`) {
      playSound("notyourturn.mp3");
      return;
    }

    const card = e.target.closest(".card");
    if (!card) return;

    const cColor = card.dataset.color;
    const cValue = card.dataset.value;

    if (cColor === currentColor || cValue === currentValue || cColor === "wild") {
      setCenterCard(card);
      card.remove();
      playerScore += 1;
      playerScoreEl.textContent = playerScore;
      turnIndicator.textContent = "Sıra: Bot";

      setTimeout(() => {
        botPlay();
      }, 1000);
    } else {
      playSound("choosecolor.mp3"); // uygunsuz kart
    }
  });
});
