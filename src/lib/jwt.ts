import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

// Use SignOptions directly instead of extending it
type SignOption = SignOptions;

const DEFAULT_SIGN_OPTION: SignOption = {
  expiresIn: "1h",
};

export function signJwtAccessToken(payload: JwtPayload, options: SignOption = DEFAULT_SIGN_OPTION) {
  const secret_key = process.env.JWT_SECRET_KEY;
  const token = jwt.sign(payload, secret_key!, options);
  return token;
}

export function verifyJwt(token: string) {
  try {
    const secret_key = process.env.JWT_SECRET_KEY;
    const decoded = jwt.verify(token, secret_key!);
    return decoded as JwtPayload;
  } catch (error) {
    console.log(error);
    return null;
  }
}
