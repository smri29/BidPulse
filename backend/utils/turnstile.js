const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// Cloudflare Turnstile is used on the backend as the final authority for anti-bot verification.
const validateTurnstileToken = async ({ token, remoteip }) => {
  // Returns a normalized result object so controllers can respond consistently.
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    return {
      success: false,
      status: 503,
      message: 'Human verification service is not configured',
      errorCodes: ['missing-secret'],
    };
  }

  if (!token) {
    return {
      success: false,
      status: 400,
      message: 'Please complete the human verification challenge',
      errorCodes: ['missing-token'],
    };
  }

  const body = new URLSearchParams();
  body.set('secret', secret);
  body.set('response', token);
  if (remoteip) {
    body.set('remoteip', remoteip);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        success: false,
        status: 502,
        message: 'Human verification failed. Please try again.',
        errorCodes: ['verification-request-failed'],
      };
    }

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        status: 400,
        message: 'Human verification failed. Please try again.',
        errorCodes: result['error-codes'] || [],
      };
    }

    return {
      success: true,
      status: 200,
      errorCodes: [],
    };
  } catch (error) {
    return {
      success: false,
      status: 502,
      message: 'Human verification could not be completed right now',
      errorCodes: [error.name === 'AbortError' ? 'verification-timeout' : 'verification-error'],
    };
  } finally {
    clearTimeout(timeout);
  }
};

module.exports = {
  validateTurnstileToken,
};
