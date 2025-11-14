import nodemailer from 'nodemailer';
import { EventEmitter } from 'node:events';

export const sendEmail = async ({
  to,
  cc = 'aharraz63unv@gmail.com',
  subject,
  content,
  attachments = [],
}) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: 'aharraz63unv@gmail.com',
    to,
    cc: 'aharraz63unv@gmail.com',
    subject,
    html: content,
    attachments,
  });

  return info;
};

export const emitter = new EventEmitter();

emitter.on('sendEmail', (args) => {
  sendEmail(args);
});
