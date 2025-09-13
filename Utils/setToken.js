import jwt from "jsonwebtoken";
import { cookieOption } from "./cookiesOptions.js";
export const setToken = (res, payload, code, message) => {
  const token = jwt.sign({ id: payload._id }, process.env.SECRETE_KEY, {
    expiresIn: "1d",
  });

  return res
    .status(code)
    .cookie("token", token, cookieOption)
    .json({
      message: message,
      user: {
        token: token,
        _id: payload._id,
        name: payload.name,
        email: payload.email,
        role: payload.role,
      },
    });
};
