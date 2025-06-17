import jwt from "jsonwebtoken";

// 使用环境变量或安全存储的密钥
const JWT_SECRET = process.env.JWT_SECRET || "high-low-card-game-secret-key";

// 生成JWT令牌
export function generateToken(address: string): string {
  return jwt.sign({ address }, JWT_SECRET, { expiresIn: "2h" });
}

// 验证JWT令牌
export function verifyToken(token: string): { address: string } | null {
  try {
    console.log("verify token interface,token is:", token);
    const decoded = jwt.verify(token, JWT_SECRET) as { address: string };
    console.log("decoded is:", decoded);
    return { address: decoded.address };
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

// 从请求头中提取JWT令牌
export function extractTokenFromHeader(
  authHeader: string | null
): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.substring(7); // 移除 'Bearer ' 前缀
}
