document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("start-btn");
  const startScreen = document.getElementById("start-screen");
  const gameContainer = document.getElementById("game-container");
  const playerNameInput = document.getElementById("player-name");
  const playerHand = document.getElementById("player-hand");
  const botHand = document.getElementById("bot-hand");
  const centerCard = document.getElementById("center-card");
  const turnDisplay = document.getElementById("turn-indicator");
  const drawBtn = document.getElementById("draw-btn");
  const playerScoreEl = document.getElementById("player-score");
  const botScoreEl = document.getElementById("bot-score");
  const colorPicker = document.getElementById("color-picker");
  const colorButtons = document.querySelectorAll(".color-btn");
  const winScreen = document.getElementById("win-screen");
  const winMessage = document.getElementById("win-message");
  const restartBtn = document.getElementById("restart-btn");

  let playerName = "Sen";
  let currentColor = "";
  let currentValue = "";
  let playerScore = 0;
  let botScore = 0;
  let isPlayerTurn = true;

  const colors = ["red", "blue", "green", "yellow"];
  const values = ["0","1","2","3","4","5","6","7","8","9","skip","reverse","draw2"];
  const wilds = ["wild","draw4"];

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

    const effects = {
      "draw2": "draw2.mp3",
      "draw4": "draw4.mp3",
      "skip": "skip.mp3",
      "reverse": "reverse.mp3",
      "wild": "wild.mp3"
    };

    if (effects[currentValue]) playSound(effects[currentValue]);
    if (colors.includes(currentColor)) playSound(`${currentColor}.mp3`);
  }

  function checkWin() {
    if (playerHand.children.length === 0) {
      playSound("youwin.mp3");
      winMessage.textContent = `${playerName} Kazandı!`;
      winScreen.style.display = "block";
    } else if (botHand.children.length === 0) {
      playSound("youlose.mp3");
      winMessage.textContent = `Bot Kazandı!`;
      winScreen.style.display = "block";
    }
  }

  function botPlay() {
    isPlayerTurn = false;
    turnDisplay.textContent = "Sıra: Bot";
    const cards = botHand.querySelectorAll(".card");

    setTimeout(() => {
      for (let card of cards) {
        const color = card.dataset.color;
        const value = card.dataset.value;
        if (color === currentColor || value === currentValue || color === "wild") {
          botHand.removeChild(card);
          setCenterCard(card);
          botScore++;
          botScoreEl.textContent = botScore;

          if (value === "draw2") drawCard(playerHand, 2);
          if (value === "draw4") drawCard(playerHand, 4);
          if (value === "wild") currentColor = colors[Math.floor(Math.random() * 4)];

          checkWin();
          isPlayerTurn = true;
          turnDisplay.textContent = `Sıra: ${playerName}`;
          return;
        }
      }

      drawCard(botHand);
      isPlayerTurn = true;
      turnDisplay.textContent = `Sıra: ${playerName}`;
    }, 1200);
  }

  startBtn.addEventListener("click", () => {
    playerName = playerNameInput.value.trim() || "Sen";
    startScreen.style.display = "none";
    gameContainer.style.display = "block";
    winScreen.style.display = "none";
    turnDisplay.textContent = `Sıra: ${playerName}`;
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

  restartBtn.addEventListener("click", () => {
    winScreen.style.display = "none";
    startScreen.style.display = "flex";
  });

  drawBtn.addEventListener("click", () => {
    if (!isPlayerTurn) return playSound("notyourturn.mp3");
    drawCard(playerHand);
    isPlayerTurn = false;
    turnDisplay.textContent = "Sıra: Bot";
    setTimeout(botPlay, 1000);
  });

  playerHand.addEventListener("click", (e) => {
    if (!isPlayerTurn) return playSound("notyourturn.mp3");
    const card = e.target.closest(".card");
    if (!card) return;

    const color = card.dataset.color;
    const value = card.dataset.value;

    if (color === currentColor || value === currentValue || color === "wild") {
      card.remove();
      setCenterCard(card);
      playerScore++;
      playerScoreEl.textContent = playerScore;

      if (value === "draw2") drawCard(botHand, 2);
      if (value === "draw4" || value === "wild") {
        colorPicker.style.display = "block";
      } else {
        checkWin();
        isPlayerTurn = false;
        turnDisplay.textContent = "Sıra: Bot";
        setTimeout(botPlay, 1000);
      }
    } else {
      playSound("choosecolor.mp3");
    }
  });

  colorButtons.forEach(button => {
    button.addEventListener("click", () => {
      currentColor = button.dataset.color;
      colorPicker.style.display = "none";
      playSound(`${currentColor}.mp3`);
      checkWin();
      isPlayerTurn = false;
      turnDisplay.textContent = "Sıra: Bot";
      setTimeout(botPlay, 1000);
    });
  });
});
