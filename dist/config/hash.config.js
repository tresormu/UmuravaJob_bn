import config from "./env.config.js";
import bcrypt from "bcryptjs";
const saltRounds = config.saltRounds;
const HashMe = async (Password) => {
    return bcrypt.hash(Password, saltRounds);
};
export default HashMe;
//# sourceMappingURL=hash.config.js.map