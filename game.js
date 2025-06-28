// Oyun durumu
const gameState = {
    deck: [],
    discardPile: [],
    players: [
        { name: "Oyuncu", hand: [], isHuman: true },
        { name: "Bilgisayar", hand: [], isHuman: false }
    ],
    currentPlayerIndex: 0,
    currentColor: null,
    direction: 1 // 1: ileri, -1: geri
};

// Deste oluşturma
function createDeck() {
    const colors = ["red", "blue", "green", "yellow"];
    const values = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "Skip", "Reverse", "Draw2"];
    let deck = [];

    colors.forEach(color => {
        values.forEach(value => {
            deck.push({ color, value });
            if (value !== "0") deck.push({ color, value }); // 0 hariç 2'şer adet
        });
    });

    // Özel kartlar
    for (let i = 0; i < 4; i++) {
        deck.push({ color: "black", value: "Wild" });
        deck.push({ color: "black", value: "WildDraw4" });
    }

    return deck;
}

// Deste karıştırma
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

// Kart dağıtma
function dealCards() {
    gameState.deck = shuffleDeck(createDeck());
    
    // Her oyuncuya 7 kart dağıt
    gameState.players.forEach(player => {
        player.hand = gameState.deck.splice(0, 7);
    });
    
    // İlk kartı atış destesine koy
    let firstCard;
    do {
        firstCard = gameState.deck.pop();
    } while (firstCard.color === "black"); // Özel kartla başlamayalım
    
    gameState.discardPile.push(firstCard);
    gameState.currentColor = firstCard.color;
}

// Kart oynanabilir mi?
function canPlayCard(card) {
    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    return card.color === "black" || 
           card.color === gameState.currentColor || 
           card.value === topCard.value;
}

// Kart oynama
function playCard(player, cardIndex) {
    const card = player.hand[cardIndex];
    
    if (!canPlayCard(card)) return false;
    
    player.hand.splice(cardIndex, 1);
    gameState.discardPile.push(card);
    
    // Özel kart efektleri
    handleSpecialCard(card);
    
    // Renk güncelle (Wild kartları hariç)
    if (card.color !== "black") {
        gameState.currentColor = card.color;
    }
    
    return true;
}

// Özel kart efektleri
function handleSpecialCard(card) {
    switch(card.value) {
        case "Skip":
            nextPlayer();
            break;
        case "Reverse":
            gameState.direction *= -1;
            break;
        case "Draw2":
            nextPlayer();
            const nextPlayer = gameState.players[gameState.currentPlayerIndex];
            drawCards(nextPlayer, 2);
            nextPlayer();
            break;
        case "WildDraw4":
            nextPlayer();
            const nextP = gameState.players[gameState.currentPlayerIndex];
            drawCards(nextP, 4);
            nextPlayer();
            break;
    }
}

// Sonraki oyuncu
function nextPlayer() {
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + gameState.direction + gameState.players.length) % gameState.players.length;
}

// Kart çekme
function drawCards(player, count = 1) {
    for (let i = 0; i < count; i++) {
        if (gameState.deck.length === 0) {
            reshuffleDiscardPile();
        }
        if (gameState.deck.length > 0) {
            player.hand.push(gameState.deck.pop());
        }
    }
}

// Atılan desteyi yeniden karıştırma
function reshuffleDiscardPile() {
    const topCard = gameState.discardPile.pop();
    gameState.deck = shuffleDeck(gameState.discardPile);
    gameState.discardPile = [topCard];
}

// Oyunu başlat
function startGame() {
    dealCards();
    renderGame();
}

// Oyunu render etme
function renderGame() {
    renderPlayerHand();
    renderOpponentHand();
    renderDiscardPile();
    renderGameInfo();
}

// Oyuncu elini render etme
function renderPlayerHand() {
    const handDiv = document.getElementById("player-hand");
    handDiv.innerHTML = "";
    
    gameState.players[0].hand.forEach((card, index) => {
        const cardEl = document.createElement("div");
        cardEl.className = `card ${card.color}`;
        cardEl.textContent = card.value;
        cardEl.onclick = () => {
            if (playCard(gameState.players[0], index)) {
                renderGame();
                setTimeout(computerPlay, 1000);
            }
        };
        handDiv.appendChild(cardEl);
    });
}

// Bilgisayar elini render etme
function renderOpponentHand() {
    const handDiv = document.getElementById("opponent-hand");
    handDiv.innerHTML = `Bilgisayar (${gameState.players[1].hand.length} kart)`;
}

// Atılan desteyi render etme
function renderDiscardPile() {
    const discardDiv = document.getElementById("discard-pile");
    discardDiv.innerHTML = "";
    
    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    const cardEl = document.createElement("div");
    cardEl.className = `card ${topCard.color}`;
    cardEl.textContent = topCard.value;
    discardDiv.appendChild(cardEl);
}

// Oyun bilgilerini render etme
function renderGameInfo() {
    const infoDiv = document.getElementById("game-info");
    infoDiv.textContent = `Sıra: ${gameState.players[gameState.currentPlayerIndex].name} | Renk: ${gameState.currentColor}`;
}

// Bilgisayar hamlesi
function computerPlay() {
    if (gameState.currentPlayerIndex !== 1) return;
    
    const computer = gameState.players[1];
    let played = false;
    
    // Oynayabileceği bir kart bulmaya çalış
    for (let i = 0; i < computer.hand.length; i++) {
        if (canPlayCard(computer.hand[i])) {
            playCard(computer, i);
            played = true;
            break;
        }
    }
    
    // Oynayacak kart yoksa çek
    if (!played) {
        drawCards(computer);
    }
    
    renderGame();
}

// Kart çek butonu
document.getElementById("draw-btn").addEventListener("click", () => {
    if (gameState.currentPlayerIndex === 0) {
        drawCards(gameState.players[0]);
        nextPlayer();
        renderGame();
        setTimeout(computerPlay, 1000);
    }
});

// Oyunu başlat
startGame();
