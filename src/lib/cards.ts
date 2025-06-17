// 定义扑克牌的花色和点数
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

// 定义扑克牌结构
export interface Card {
  suit: Suit;
  rank: Rank;
  value: number; // A=1, 2=2, ..., J=11, Q=12, K=13
}

// 点数到数值的映射
const rankValues: Record<Rank, number> = {
  'A': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 11,
  'Q': 12,
  'K': 13
};

// 创建一副完整的扑克牌（52张）
export function createDeck(): Card[] {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck: Card[] = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({
        suit,
        rank,
        value: rankValues[rank]
      });
    }
  }

  return deck;
}

// 洗牌函数
export function shuffleDeck(deck: Card[]): Card[] {
  // 创建一个新数组，避免修改原始数组
  const shuffled = [...deck];
  
  // Fisher-Yates 洗牌算法
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

// 比较两张牌的大小
export function compareCards(card1: Card, card2: Card): 'higher' | 'lower' | 'equal' {
  if (card1.value > card2.value) {
    return 'higher';
  } else if (card1.value < card2.value) {
    return 'lower';
  } else {
    return 'equal';
  }
}

// 获取牌的显示名称
export function getCardDisplayName(card: Card): string {
  return `${card.rank} of ${card.suit}`;
}

// 获取牌的图片路径
export function getCardImagePath(card: Card): string {
  return `/images/${card.rank}_of_${card.suit}.svg`;
}