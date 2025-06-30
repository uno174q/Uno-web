const startScreen = document.getElementById('start-screen');
const gameContainer = document.getElementById('game-container');
const playerNameInput = document.getElementById('player-name');
const startGameBtn = document.getElementById('start-game-btn');
const gameStatus = document.getElementById('game-status');
const playerHand = document.getElementById('player-hand');

startGameBtn.addEventListener('click', () => {
  const name = playerNameInput.value.trim();
  if (name === '') return alert('İsmini girmelisin!');

  startScreen.style.display = 'none';
  gameContainer.style.display = 'flex';
  gameStatus.textContent = `${name}, oyuna hoş geldin!`;
  // Örnek kart gösterimi
  const card = document.createElement('div');
  card.textContent = '🔴 7';
  card.style.padding = '20px';
  card.style.background = 'rgba(255,0,0,0.6)';
  card.style.borderRadius = '10px';
  playerHand.appendChild(card);
});
