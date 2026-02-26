const nodemailer = require('nodemailer');

let transporter;

const getEmailConfig = () => {
  const user = process.env.EMAIL_USERNAME || process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;

  if (process.env.SMTP_HOST) {
    return {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || 'false') === 'true',
      auth: user && pass ? { user, pass } : undefined,
    };
  }

  return {
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: user && pass ? { user, pass } : undefined,
  };
};

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport(getEmailConfig());
  }

  return transporter;
};

const sendEmail = async (options) => {
  const fromUser = process.env.EMAIL_USERNAME || process.env.EMAIL_USER;

  if (!fromUser) {
    throw new Error('Email configuration missing: EMAIL_USERNAME or EMAIL_USER');
  }

  const activeTransporter = getTransporter();

  const mailOptions = {
    from: `BidPulse Support <${fromUser}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  await activeTransporter.sendMail(mailOptions);
};

const sendEmailAsync = (options, logger = console) => {
  sendEmail(options).catch((error) => {
    logger.error('Email send failed:', error.message);
  });
};

const verifyEmailTransport = async () => {
  try {
    const activeTransporter = getTransporter();
    await activeTransporter.verify();
    console.log('Email transport verified successfully');
    return true;
  } catch (error) {
    console.error('Email transport verification failed:', error.message);
    return false;
  }
};

module.exports = sendEmail;
module.exports.sendEmailAsync = sendEmailAsync;
module.exports.verifyEmailTransport = verifyEmailTransport;
