import { NextRequest, NextResponse } from 'next/server';
import { verifySignature } from '@/lib/ethereum';
import { generateToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();
    const { message,address, signature } = body;

    // 验证请求参数
    if (!address || !signature) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // 验证签名
    const isValid = verifySignature(message, signature, address);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // 生成JWT令牌
    const token = generateToken(address);

    // 返回令牌
    return NextResponse.json({ token });
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}