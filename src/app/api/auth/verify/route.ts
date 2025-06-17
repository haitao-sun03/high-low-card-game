import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"; // 从环境变量获取密钥

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { token } = body;

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  try {
    console.log('verify token interface,token is:',token)
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
    return NextResponse.json(
      { address: decoded.sub, valid: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("JWT verification failed:", error);
    return NextResponse.json(
      { error: "Invalid token", valid: false },
      { status: 401 }
    );
  }
}
