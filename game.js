// 1. Deste oluşturma
function createDeck() {
  const colors = ["red", "blue", "green", "yellow"];
  const values = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "Skip", "Reverse", "Draw2"];
  const wilds = ["Wild", "Wild+4"];
  let deck = [];

  // Renkli kartlar (her renkten 2 adet, 0 hariç)
  colors.forEach(color => {
    values.forEach(value => {
      deck.push({ color, value });
      if (value !== "0") deck.push({ color, value });
    });
  });

  // Wild kartlar (4'er adet)
  for (let i = 0; i < 4; i++) {
    deck.push({ color: "black", value: wilds[0] });
    deck.push({ color: "black", value: wilds[1] });
  }

  return deck;
}

// 2. Desteyi karıştırma
function shuffleDeck(deck) {
  return deck.sort(() => Math.random() - 0.5);
}

// 3. Kartları ekranda gösterme
function renderHand(hand) {
  const handDiv = document.getElementById("hand");
  handDiv.innerHTML = "";
  hand.forEach(card => {
    const cardEl = document.createElement("div");
    cardEl.className = `card ${card.color}`;
    cardEl.textContent = card.value;
    cardEl.onclick = () => playCard(card);
    handDiv.appendChild(cardEl);
  });
}

// 4. Kart oynama
function playCard(card) {
  const discardPile = document.getElementById("discard-pile");
  discardPile.innerHTML = `<div class="card ${card.color}">${card.value}</div>`;
  console.log(`${card.color} ${card.value} oynandı!`);
}

// 5. Kart çekme
document.getElementById("draw-btn").addEventListener("click", () => {
  const newCard = deck.pop();
  playerHand.push(newCard);
  renderHand(playerHand);
});

// Oyunu başlat
const deck = shuffleDeck(createDeck());
const playerHand = deck.splice(0, 7); // Başlangıç eli
renderHand(playerHand);
