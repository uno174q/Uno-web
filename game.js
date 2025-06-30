const playerHand = document.getElementById('player-hand');

const imageMap = {
  red_1: 'R1.png',
  blue_0: 'B0.png',
  yellow_skip: 'YS.png',
  green_reverse: 'GR.png',
  yellow_draw2: 'YA2.png',
  wild: 'WC.png',
  wild_draw4: 'W4.png'
};

const testCards = [
  { color: 'red', value: '1' },
  { color: 'blue', value: '0' },
  { color: 'yellow', value: 'skip' },
  { color: 'green', value: 'reverse' },
  { color: 'yellow', value: 'draw2' },
  { color: 'wild', value: 'wild' },
  { color: 'wild', value: 'draw4' }
];

testCards.forEach(card => {
  const key = card.color === 'wild' ? card.value : `${card.color}_${card.value}`;
  const fileName = imageMap[key] || 'default.png';
  const cardEl = document.createElement('div');
  cardEl.className = 'card';
  cardEl.style.backgroundImage = `url('img/${fileName}')`;
  playerHand.appendChild(cardEl);
});
