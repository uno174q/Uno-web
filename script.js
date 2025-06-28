class Card {
  constructor(color, value) {
    this.color = color;
    this.value = value;
  }

  toString() {
    return this.color === 'wild' ? this.value : `${this.color} ${this.value}`;
  }
}

function createDeck() {
  const colors = ['red', 'green', 'blue', 'yellow'];
  const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+2', 'skip', 'reverse'];
  let deck = [];

  for (const color of colors) {
    deck.push(new Card(color, '0'));
    for (let i = 1; i < values.length; i++) {
      deck.push(new Card(color, values[i]));
      deck.push(new Card(color, values[i]));
    }
  }

  for (let i = 0; i < 4; i++) {
    deck.push(new Card('wild', 'wild'));
    deck.push(new Card('wild', 'wild+4'));
  }

  return shuffle(deck);
}

function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

let deck, playerHand, discardPile;

const playerHandDiv = document.getElementById('player-hand');
const discardCardSpan = document.getElementById('discard-card');
const drawCardBtn = document.getElementById('draw-card');
const messageP = document.getElementById('message');

function startGame() {
  deck = createDeck();
  playerHand = [];
  discardPile = [];

  for (let i = 0; i < 7; i++) {
    playerHand.push(deck.pop());
  }

  let firstCard;
  do {
    firstCard = deck.pop();
    discardPile.push(firstCard);
  } while (firstCard.color === 'wild');

  updateUI();
  messageP.textContent = 'Kart atmak için kartlara tıkla, kart çekmek için butona bas.';
}

function updateUI() {
  const topCard = discardPile[discardPile.length - 1];
  discardCardSpan.textContent = topCard.toString();
  discardCardSpan.className = topCard.color;

  playerHandDiv.innerHTML = '';
  playerHand.forEach((card, index) => {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card ' + card.color;
    cardDiv.textContent = card.value;
    cardDiv.onclick = () => playCard(index);
    playerHandDiv.appendChild(cardDiv);
  });
}

function canPlay(card, topCard) {
  return card.color === topCard.color || card.value === topCard.value || card.color === 'wild';
}

function playCard(index) {
  const card = playerHand[index];
  const topCard = discardPile[discardPile.length - 1];

  if (canPlay(card, topCard)) {
    discardPile.push(card);
    playerHand.splice(index, 1);

    if (playerHand.length === 0) {
      messageP.textContent = 'Tebrikler! Tüm kartları bitirdin!';
      drawCardBtn.disabled = true;
      return;
    }

    if (card.color === 'wild') {
      messageP.textContent = 'Wild kart oynadın. Renk otomatik kırmızı yapıldı.';
      discardPile[discardPile.length - 1].color = 'red';
    } else {
      messageP.textContent = 'Kart oynandı.';
    }

    updateUI();
  } else {
    messageP.textContent = 'Bu kart atılamaz!';
  }
}

drawCardBtn.onclick = function () {
  if (deck.length === 0) {
    messageP.textContent = 'Kart kalmadı. Oyun bitti.';
    return;
  }
  const card = deck.pop();
  playerHand.push(card);
  messageP.textContent = 'Kart çektin.';
  updateUI();
};

startGame();
