import { hashPassword } from "./hashPassword";

export async function verifyPassword(
  password: string,
  userPassword: string
): Promise<boolean> {
  const hashedPassword = await hashPassword(password);

  return hashedPassword === userPassword;
}
