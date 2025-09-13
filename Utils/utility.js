import bcryptjs from "bcryptjs";
const hashPassword = async function (password) {
  return await bcryptjs.hash(password, 10);
};
export { hashPassword };