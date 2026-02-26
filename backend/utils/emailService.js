const nodemailer = require('nodemailer');

let transporter;

const getEmailIdentity = () => ({
  user: process.env.EMAIL_USERNAME || process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS,
});

const getEmailConfig = () => {
  const { user, pass } = getEmailIdentity();
  const baseConfig = {
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT_MS || 10000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS || 10000),
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT_MS || 15000),
  };

  if (process.env.SMTP_HOST) {
    return {
      ...baseConfig,
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || 'false') === 'true',
      auth: user && pass ? { user, pass } : undefined,
    };
  }

  return {
    ...baseConfig,
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
  const { user: fromUser } = getEmailIdentity();

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
    logger.error('Email send failed:', error.message, {
      to: options?.email,
      subject: options?.subject,
    });
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
