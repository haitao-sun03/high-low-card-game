import { ethers } from 'ethers';

// 用于签名的消息
export const SIGN_MESSAGE = 'Sign this message to verify your wallet ownership for High-Low Card Game';

/**
 * 验证以太坊签名
 * @param message 签名的消息
 * @param signature 签名
 * @param address 钱包地址
 * @returns 签名是否有效
 */
export function verifySignature(
  message: string,
  signature: string,
  address: string
): boolean {
  try {
    // 恢复签名者地址 (ethers v5 syntax)
    const signerAddr = ethers.utils.verifyMessage(message, signature);
    
    // 比较恢复的地址与提供的地址（不区分大小写）
    return signerAddr.toLowerCase() === address.toLowerCase();
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}