// Oyun durumu
const gameState = {
    deck: [],
    discardPile: [],
    players: [],
    currentPlayerIndex: 0,
    currentColor: null,
    direction: 1,
    gameStarted: false,
    waitingForColorSelection: false,
    cardImages: {
        red: 'https://raw.githubusercontent.com/laurentiustamate94/UNO/master/img/red_',
        blue: 'https://raw.githubusercontent.com/laurentiustamate94/UNO/master/img/blue_',
        green: 'https://raw.githubusercontent.com/laurentiustamate94/UNO/master/img/green_',
        yellow: 'https://raw.githubusercontent.com/laurentiustamate94/UNO/master/img/yellow_',
        wild: 'https://raw.githubusercontent.com/laurentiustamate94/UNO/master/img/wild.png',
        wild_draw4: 'https://raw.githubusercontent.com/laurentiustamate94/UNO/master/img/wild_draw4.png'
    }
};

// DOM Elementleri
const elements = {
    playerHand: document.getElementById('player-hand'),
    discardPile: document.getElementById('discard-pile'),
    drawPile: document.getElementById('draw-pile'),
    gameStatus: document.getElementById('game-status'),
    deckCount: document.getElementById('deck-number'),
    playerCardCount: document.getElementById('player-card-count'),
    opponentsContainer: document.getElementById('opponents-container'),
    colorSelectorModal: document.getElementById('color-selector-modal'),
    newGameBtn: document.getElementById('new-game-btn'),
    multiplayerBtn: document.getElementById('multiplayer-btn'),
    rulesBtn: document.getElementById('rules-btn'),
    rulesModal: document.getElementById('rules-modal'),
    closeRulesBtn: document.querySelector('#rules-modal .close-btn')
};

// Ses Elementleri
const sounds = {
    card: document.getElementById('cardSound'),
    uno: document.getElementById('unoSound'),
    win: document.getElementById('winSound')
};

// Event Listeners
elements.drawPile.addEventListener('click', handleDrawCard);
elements.newGameBtn.addEventListener('click', startNewGame);
elements.multiplayerBtn.addEventListener('click', setupMultiplayer);
elements.rulesBtn.addEventListener('click', showRules);
elements.closeRulesBtn.addEventListener('click', hideRules);

// Renk seçim modalı için event delegation
document.querySelector('.color-options').addEventListener('click', (e) => {
    if (e.target.classList.contains('color-option')) {
        const color = e.target.dataset.color;
        gameState.currentColor = color;
        gameState.waitingForColorSelection = false;
        elements.colorSelectorModal.style.display = 'none';
        updateGameStatus(`${gameState.players[gameState.currentPlayerIndex].name} ${color} rengi seçti`);
        playComputerTurn();
    }
});

// Deste oluşturma
function createDeck() {
    const colors = ['red', 'blue', 'green', 'yellow'];
    const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', 'draw2'];
    let deck = [];

    // Normal kartlar (her renk için)
    colors.forEach(color => {
        // 0 hariç tüm kartlardan 2'şer adet
        values.forEach(value => {
            deck.push({ color, value });
            if (value !== '0') deck.push({ color, value });
        });
    });

    // Özel kartlar (Wild ve Wild Draw 4)
    for (let i = 0; i < 4; i++) {
        deck.push({ color: 'black', value: 'wild' });
        deck.push({ color: 'black', value: 'wild_draw4' });
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

// Yeni oyun başlatma
function startNewGame() {
    // Oyun durumunu sıfırla
    gameState.deck = shuffleDeck(createDeck());
    gameState.discardPile = [];
    gameState.players = [
        { name: 'Sen', hand: [], isHuman: true },
        { name: 'Bilgisayar 1', hand: [], isHuman: false },
        { name: 'Bilgisayar 2', hand: [], isHuman: false }
    ];
    gameState.currentPlayerIndex = 0;
    gameState.direction = 1;
    gameState.gameStarted = true;
    gameState.waitingForColorSelection = false;

    // Kart dağıt
    gameState.players.forEach(player => {
        player.hand = gameState.deck.splice(0, 7);
    });

    // İlk kartı atık destesine koy (özel kart olmasın)
    let firstCard;
    do {
        firstCard = gameState.deck.pop();
    } while (firstCard.color === 'black');
    
    gameState.discardPile.push(firstCard);
    gameState.currentColor = firstCard.color;

    // Oyunu render et
    renderGame();
    updateGameStatus('Oyun başladı! Sıra sende.');
}

// Çok oyunculu mod ayarla
function setupMultiplayer() {
    // Basit bir çok oyunculu mod için oyuncu sayısını artır
    gameState.players = [
        { name: 'Sen', hand: [], isHuman: true },
        { name: 'Bilgisayar 1', hand: [], isHuman: false },
        { name: 'Bilgisayar 2', hand: [], isHuman: false },
        { name: 'Bilgisayar 3', hand: [], isHuman: false }
    ];
    startNewGame();
}

// Kart çekme işlemi
function handleDrawCard() {
    if (!gameState.gameStarted || gameState.waitingForColorSelection) return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer.isHuman) return;

    // Desteden kart çek
    const drawnCard = drawCards(currentPlayer, 1)[0];
    playSound(sounds.card);

    // Çekilen kart oynanabilir mi?
    if (canPlayCard(drawnCard)) {
        if (confirm('Bu kartı oynamak ister misiniz?')) {
            playCard(currentPlayer, currentPlayer.hand.length - 1);
            return;
        }
    }

    // Sırayı diğer oyuncuya geç
    nextPlayer();
    renderGame();
    
    // Bilgisayar hamlesi
    setTimeout(playComputerTurn, 1000);
}

// Kart oynama
function playCard(player, cardIndex) {
    const card = player.hand[cardIndex];
    
    if (!canPlayCard(card)) return false;

    // Kartı elden çıkar ve atık destesine ekle
    player.hand.splice(cardIndex, 1);
    gameState.discardPile.push(card);
    playSound(sounds.card);

    // Wild kartı için renk seçimi
    if (card.color === 'black') {
        if (player.isHuman) {
            gameState.waitingForColorSelection = true;
            elements.colorSelectorModal.style.display = 'flex';
        } else {
            // Bilgisayar rastgele renk seçer
            const colors = ['red', 'blue', 'green', 'yellow'];
            gameState.currentColor = colors[Math.floor(Math.random() * 4)];
            updateGameStatus(`${player.name} ${gameState.currentColor} rengi seçti`);
        }
    } else {
        gameState.currentColor = card.color;
    }

    // Özel kart efektleri
    handleSpecialCard(card);

    // Oyun durumunu güncelle
    renderGame();
    checkWinner();
    checkUNO(player);

    return true;
}

// Özel kart efektleri
function handleSpecialCard(card) {
    switch(card.value) {
        case 'skip':
            updateGameStatus(`${gameState.players[gameState.currentPlayerIndex].name} bir tur atlattı!`);
            nextPlayer();
            break;
            
        case 'reverse':
            gameState.direction *= -1;
            updateGameStatus('Yön değişti!');
            break;
            
        case 'draw2':
            const nextPlayerIndex = (gameState.currentPlayerIndex + gameState.direction + gameState.players.length) % gameState.players.length;
            const nextPlayer = gameState.players[nextPlayerIndex];
            drawCards(nextPlayer, 2);
            updateGameStatus(`${nextPlayer.name} 2 kart çekti!`);
            nextPlayer();
            break;
            
        case 'wild_draw4':
            const nextPIndex = (gameState.currentPlayerIndex + gameState.direction + gameState.players.length) % gameState.players.length;
            const nextP = gameState.players[nextPIndex];
            drawCards(nextP, 4);
            updateGameStatus(`${nextP.name} 4 kart çekti!`);
            nextPlayer();
            break;
    }
}

// Kart çekme fonksiyonu
function drawCards(player, count = 1) {
    const drawnCards = [];
    
    for (let i = 0; i < count; i++) {
        if (gameState.deck.length === 0) {
            reshuffleDiscardPile();
            if (gameState.deck.length === 0) break; // Eğer hala kart yoksa
        }
        
        const card = gameState.deck.pop();
        player.hand.push(card);
        drawnCards.push(card);
    }
    
    return drawnCards;
}

// Atık destesini yeniden karıştırma
function reshuffleDiscardPile() {
    if (gameState.discardPile.length <= 1) return; // Sadece üstteki kart kaldıysa
    
    const topCard = gameState.discardPile.pop();
    gameState.deck = shuffleDeck(gameState.discardPile);
    gameState.discardPile = [topCard];
    
    updateGameStatus('Deste yeniden karıştırıldı!');
}

// Sonraki oyuncuya geç
function nextPlayer() {
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + gameState.direction + gameState.players.length) % gameState.players.length;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    updateGameStatus(`Sıra: ${currentPlayer.name}`);
}

// Kart oynanabilir mi kontrolü
function canPlayCard(card) {
    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    return card.color === 'black' || 
           card.color === gameState.currentColor || 
           card.value === topCard.value;
}

// Kazanan kontrolü
function checkWinner() {
    gameState.players.forEach(player => {
        if (player.hand.length === 0) {
            playSound(sounds.win);
            setTimeout(() => {
                alert(`Tebrikler! ${player.name} kazandı!`);
                startNewGame();
            }, 500);
        }
    });
}

// UNO uyarısı
function checkUNO(player) {
    if (player.hand.length === 1) {
        playSound(sounds.uno);
        updateGameStatus(`UNO! ${player.name} tek kart kaldı!`, true);
    }
}

// Bilgisayar hamlesi
function playComputerTurn() {
    if (!gameState.gameStarted || gameState.waitingForColorSelection) return;
    
    const computer = gameState.players[gameState.currentPlayerIndex];
    if (computer.isHuman) return;

    // 1 saniye bekle (daha gerçekçi olsun diye)
    setTimeout(() => {
        let played = false;
        
        // Oynayabileceği bir kart bul
        for (let i = 0; i < computer.hand.length; i++) {
            if (canPlayCard(computer.hand[i])) {
                playCard(computer, i);
                played = true;
                break;
            }
        }
        
        // Oynayacak kart yoksa çek
        if (!played) {
            drawCards(computer, 1);
            nextPlayer();
        }
        
        renderGame();
        
        // Sıra insan oyuncuya geçmediyse, bir sonraki bilgisayar hamlesi
        if (!gameState.players[gameState.currentPlayerIndex].isHuman && gameState.gameStarted) {
            setTimeout(playComputerTurn, 1000);
        }
    }, 1000);
}

// Oyunu render etme
function renderGame() {
    renderPlayerHand();
    renderOpponents();
    renderDiscardPile();
    renderDrawPile();
    updateDeckCount();
}

// Oyuncu elini render etme
function renderPlayerHand() {
    elements.playerHand.innerHTML = '';
    const player = gameState.players[0];
    
    player.hand.forEach((card, index) => {
        const cardEl = createCardElement(card);
        cardEl.addEventListener('click', () => {
            if (gameState.currentPlayerIndex === 0 && !gameState.waitingForColorSelection) {
                playCard(player, index);
            }
        });
        elements.playerHand.appendChild(cardEl);
    });
    
    elements.playerCardCount.textContent = player.hand.length;
}

// Rakipleri render etme
function renderOpponents() {
    elements.opponentsContainer.innerHTML = '';
    
    // İnsan oyuncuyu hariç tut (0. indeks)
    for (let i = 1; i < gameState.players.length; i++) {
        const player = gameState.players[i];
        const opponentEl = document.createElement('div');
        opponentEl.className = 'opponent';
        
        const nameEl = document.createElement('h3');
        nameEl.textContent = `${player.name} (${player.hand.length})`;
        if (gameState.currentPlayerIndex === i) {
            nameEl.style.color = '#ffff00';
            nameEl.style.textDecoration = 'underline';
        }
        
        const cardsEl = document.createElement('div');
        cardsEl.className = 'opponent-cards';
        
        // Rakibin kart sayısı kadar ters kart göster
        for (let j = 0; j < player.hand.length; j++) {
            const cardBack = document.createElement('div');
            cardBack.className = 'opponent-card';
            cardsEl.appendChild(cardBack);
        }
        
        opponentEl.appendChild(nameEl);
        opponentEl.appendChild(cardsEl);
        elements.opponentsContainer.appendChild(opponentEl);
    }
}

// Atık destesini render etme
function renderDiscardPile() {
    elements.discardPile.innerHTML = '';
    
    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    if (topCard) {
        const cardEl = createCardElement(topCard);
        cardEl.classList.add('discard-card', 'card-played');
        elements.discardPile.appendChild(cardEl);
    }
}

// Deste görselini render etme
function renderDrawPile() {
    if (gameState.deck.length > 0) {
        elements.drawPile.style.display = 'block';
    } else {
        elements.drawPile.style.display = 'none';
    }
}

// Kart elementi oluşturma
function createCardElement(card) {
    const cardEl = document.createElement('div');
    cardEl.className = `card ${card.color}`;
    
    // Kart değerini göster
    const valueEl = document.createElement('div');
    valueEl.className = 'card-value';
    valueEl.textContent = formatCardValue(card.value);
    
    const valueElBottom = document.createElement('div');
    valueElBottom.className = 'card-value bottom';
    valueElBottom.textContent = formatCardValue(card.value);
    
    cardEl.appendChild(valueEl);
    cardEl.appendChild(valueElBottom);
    
    // Kart arka planı (görsel)
    if (card.color !== 'black') {
        cardEl.style.backgroundImage = `url(${gameState.cardImages[card.color]}${card.value}.png)`;
    } else {
        cardEl.style.backgroundImage = `url(${gameState.cardImages[card.value]})`;
    }
    
    return cardEl;
}

// Kart değerini formatlama
function formatCardValue(value) {
    const specialCards = {
        'skip': '⏭️',
        'reverse': '🔄',
        'draw2': '+2',
        'wild': '🌈',
        'wild_draw4': '+4'
    };
    
    return specialCards[value] || value;
}

// Oyun durumunu güncelleme
function updateGameStatus(message, isUno = false) {
    elements.gameStatus.textContent = message;
    if (isUno) {
        elements.gameStatus.classList.add('uno-alert');
        setTimeout(() => {
            elements.gameStatus.classList.remove('uno-alert');
        }, 2000);
    }
}

// Destedeki kart sayısını güncelleme
function updateDeckCount() {
    elements.deckCount.textContent = gameState.deck.length;
}

// Kuralları gösterme
function showRules() {
    elements.rulesModal.style.display = 'flex';
    document.querySelector('.rules-content').innerHTML = `
        <h3>Temel UNO Kuralları</h3>
        <ul>
            <li>Oyunun amacı elindeki tüm kartları bitirmektir.</li>
            <li>Kartları ya renk ya da sayı bakımından eşleştirerek oynayabilirsin.</li>
            <li>Özel kartlar:
                <ul>
                    <li><strong>Atlama (Skip):</strong> Sıradaki oyuncuyu atlar</li>
                    <li><strong>Yön Değiştirme (Reverse):</strong> Oyun yönünü değiştirir</li>
                    <li><strong>+2 (Draw 2):</strong> Sıradaki oyuncu 2 kart çeker</li>
                    <li><strong>Renk Değiştirme (Wild):</strong> İstediğin rengi seçersin</li>
                    <li><strong>Wild +4:</strong> Renk seçer ve sıradaki oyuncu 4 kart çeker</li>
                </ul>
            </li>
            <li>Son kartını oynarken "UNO!" demeyi unutma!</li>
        </ul>
    `;
}

// Kuralları gizleme
function hideRules() {
    elements.rulesModal.style.display = 'none';
}

// Ses çalma
function playSound(sound) {
    sound.currentTime = 0;
    sound.play();
}

// Oyunu başlat
startNewGame();
