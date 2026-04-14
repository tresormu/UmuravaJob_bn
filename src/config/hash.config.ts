import config from "./env.config.js";
import bcrypt from "bcryptjs";

const resolveSaltRounds = (): number => {
  const rounds = Number(config.saltRounds);
  if (Number.isFinite(rounds) && rounds > 0) return rounds;
  return 10;
};

const HashMe = async (Password: string): Promise<string> => {
  return bcrypt.hash(Password, resolveSaltRounds());
};

export default HashMe;
