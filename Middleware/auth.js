
import jwtToken from "jsonwebtoken";
import { ErrorHandler } from "../Utils/error.js";
const auth = async (req, res, next) => {
  const token = req.cookies["token"];
  try {
    if (!token) {
      return next(new ErrorHandler("Please Login", 400));
    }
    const decode = await jwtToken.verify(token, process.env.SECRETE_KEY);
    req.user = decode.id;
    next();
  } catch (error) {
    return next(error);
  }
};

export default auth;