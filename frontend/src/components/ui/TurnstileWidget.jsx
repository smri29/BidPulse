/**
 * Module: components/ui/TurnstileWidget.jsx
 * Purpose: Supports the Turnstile Widget module and keeps its responsibility isolated by file name.
 */
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

const TURNSTILE_SCRIPT_ID = 'cf-turnstile-script';
const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let turnstileScriptPromise = null;

// Cloudflare Turnstile is loaded lazily and shared through one promise so
// multiple forms do not inject duplicate scripts into the page.
const loadTurnstileScript = () => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window is not available'));
  }

  if (window.turnstile) {
    return Promise.resolve(window.turnstile);
  }

  if (turnstileScriptPromise) {
    return turnstileScriptPromise;
  }

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(TURNSTILE_SCRIPT_ID);

    if (existing) {
      existing.addEventListener('load', () => resolve(window.turnstile), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Turnstile')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.turnstile);
    script.onerror = () => reject(new Error('Failed to load Turnstile'));
    document.head.appendChild(script);
  });

  return turnstileScriptPromise;
};

const TurnstileWidget = forwardRef(function TurnstileWidget(
  { siteKey, onVerify, onExpire, onError, className = '' },
  ref
) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  const onErrorRef = useRef(onError);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    onVerifyRef.current = onVerify;
    onExpireRef.current = onExpire;
    onErrorRef.current = onError;
  }, [onVerify, onExpire, onError]);

  useImperativeHandle(ref, () => ({
    // Parent forms can reset the widget after an expired token or failed submit.
    reset() {
      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.reset(widgetIdRef.current);
      }
    },
  }));

  useEffect(() => {
    let cancelled = false;

    if (!siteKey || !containerRef.current) {
      return undefined;
    }

    loadTurnstileScript()
      .then((turnstile) => {
        if (cancelled || !turnstile || !containerRef.current) {
          return;
        }

        if (widgetIdRef.current !== null) {
          // Recreate the widget cleanly if the component is re-mounted with new props.
          turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        }

        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: 'light',
          size: 'flexible',
          // Success, expiry, and load failure are separated so the caller can
          // react with the correct recovery message.
          callback: (token) => {
            setLoadError('');
            onVerifyRef.current?.(token);
          },
          'expired-callback': () => {
            onExpireRef.current?.();
          },
          'error-callback': () => {
            setLoadError('Human verification could not load. Please retry.');
            onErrorRef.current?.();
          },
        });
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError('Human verification could not load. Please refresh and try again.');
          onErrorRef.current?.();
        }
      });

    return () => {
      cancelled = true;
      // Remove the rendered widget instance during cleanup to avoid leftovers.
      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey]);

  return (
    <div className={className}>
      {!siteKey ? (
        <p className="text-sm text-rose-600">Turnstile site key is missing in the frontend environment.</p>
      ) : (
        <>
          <div ref={containerRef} />
          {loadError ? <p className="mt-2 text-sm text-rose-600">{loadError}</p> : null}
        </>
      )}
    </div>
  );
});

export default TurnstileWidget;
