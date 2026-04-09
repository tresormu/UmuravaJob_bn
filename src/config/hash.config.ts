import config from "./env.config.js"
import bcrypt from "bcryptjs"
const saltRounds=config.saltRounds
const HashMe =async (Password:string):Promise<string>=>{
    return bcrypt.hash(Password, saltRounds);
}
export default HashMe