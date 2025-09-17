import nodeMailer from "nodemailer";
const sendEmail = async (options) => {
  const transpoter = nodeMailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: options.user,
    subject: options.subject,
    text: options.message,
  };
  await transpoter.sendMail(mailOptions);
};
export default sendEmail;
