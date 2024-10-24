const nodemailer = require("nodemailer");

export const sendEmail = async (to: string, subject: string, text: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: process.env.correo,
      pass: "faqp mnzl pyeh hkmi",
    },
  });

  await transporter.sendMail({
    from: '"GSIP" <your_email@example.com>',
    to,
    subject,
    text,
  });
};
