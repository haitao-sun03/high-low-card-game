/**
 * 扑克牌SVG生成脚本
 * 
 * 这个脚本用于生成扑克牌的SVG图像，可以在需要时运行来创建所有52张扑克牌的SVG文件
 */

import fs from 'fs';
import path from 'path';

// 定义花色和点数
const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// 花色符号
const suitSymbols: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

// 花色颜色
const suitColors: Record<string, string> = {
  hearts: '#E53E3E',   // 红色
  diamonds: '#E53E3E',  // 红色
  clubs: '#2D3748',     // 黑色
  spades: '#2D3748',    // 黑色
};

// 生成单张扑克牌的SVG
function generateCardSVG(rank: string, suit: string): string {
  const color = suitColors[suit];
  const symbol = suitSymbols[suit];
  
  // 中心图案的大小和位置
  const centerSize = rank === '10' ? 40 : 50; // 10需要小一点的字体
  
  // 生成SVG
  return `<svg width="180" height="250" viewBox="0 0 180 250" xmlns="http://www.w3.org/2000/svg">
  <!-- 卡片背景 -->
  <rect width="180" height="250" rx="15" fill="white" stroke="#E2E8F0" stroke-width="2"/>
  
  <!-- 左上角 -->
  <text x="15" y="30" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="${color}">${rank}</text>
  <text x="15" y="55" font-family="Arial, sans-serif" font-size="24" fill="${color}">${symbol}</text>
  
  <!-- 右下角 (旋转180度) -->
  <text x="165" y="220" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="${color}" text-anchor="end">${rank}</text>
  <text x="165" y="245" font-family="Arial, sans-serif" font-size="24" fill="${color}" text-anchor="end">${symbol}</text>
  
  <!-- 中心图案 -->
  <text x="90" y="125" font-family="Arial, sans-serif" font-size="${centerSize}" fill="${color}" text-anchor="middle" dominant-baseline="middle">${symbol}</text>
</svg>`;
}

// 生成所有扑克牌的SVG并保存到文件
export function generateAllCardSVGs() {
  const outputDir = path.join(process.cwd(), 'public', 'images', 'cards');
  
  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // 生成每张牌的SVG
  for (const suit of suits) {
    for (const rank of ranks) {
      const svg = generateCardSVG(rank, suit);
      const fileName = `${rank}_of_${suit}.svg`;
      const filePath = path.join(outputDir, fileName);
      
      fs.writeFileSync(filePath, svg);
      console.log(`Generated: ${fileName}`);
    }
  }
  
  console.log('All card SVGs generated successfully!');
}

// 如果直接运行此脚本，则生成所有卡片
if (require.main === module) {
  generateAllCardSVGs();
}