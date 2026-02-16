import React from 'react';
import { toast } from 'sonner';

/**
 * useRefreshCooldown
 * - Accepts a `refetch` function (from react-query) and returns a handler + UI state
 * - Tracks quick repeated clicks and, after a threshold, disables the button for a cooldown period
 *
 * returns: { onClick, title, disabled }
 */
export default function useRefreshCooldown({
  refetch,
  clickWindowMs = 5000,
  clickThreshold = 3,
  cooldownSeconds = 15,
  successMessage = 'تم تحديث البيانات'
} = {}) {
  const [clickCount, setClickCount] = React.useState(0);
  const clickResetRef = React.useRef(null);

  const [cooldown, setCooldown] = React.useState(0);
  const cooldownIntervalRef = React.useRef(null);

  // manage cooldown countdown
  React.useEffect(() => {
    if (!cooldown) return undefined;

    cooldownIntervalRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownIntervalRef.current);
          cooldownIntervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
        cooldownIntervalRef.current = null;
      }
    };
  }, [cooldown]);

  // cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (clickResetRef.current) {
        clearTimeout(clickResetRef.current);
        clickResetRef.current = null;
      }
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
        cooldownIntervalRef.current = null;
      }
    };
  }, []);

  const onClick = React.useCallback(async () => {
    if (cooldown > 0) {
      toast.warning(`التحديث معطل مؤقتًا. حاول بعد ${cooldown} ثانية.`);
      return;
    }

    // call provided refetch if available
    if (typeof refetch === 'function') {
      try {
        const res = await refetch();
        // show success toast when server responded
        toast.success(successMessage);
        // If the caller needs the response it already runs in its own effect (typical pattern in this repo)
      } catch (err) {
        console.error('refetch failed', err);
        toast.error(err?.message || 'فشل تحديث البيانات');
      }
    }

    // click-window counting (reset after clickWindowMs of inactivity)
    setClickCount((prev) => {
      const next = prev + 1;

      if (clickResetRef.current) {
        clearTimeout(clickResetRef.current);
      }
      clickResetRef.current = setTimeout(() => setClickCount(0), clickWindowMs);

      if (next >= clickThreshold) {
        // trigger cooldown
        setClickCount(0);
        if (clickResetRef.current) {
          clearTimeout(clickResetRef.current);
          clickResetRef.current = null;
        }

        setCooldown(cooldownSeconds);
        toast.error(`تم تعطيل زر التحديث لمدة ${cooldownSeconds} ثانية بسبب النقر المتكرر`);
        return 0;
      }

      return next;
    });
  }, [cooldown, refetch, clickWindowMs, clickThreshold, cooldownSeconds, successMessage]);

  const title = cooldown > 0 ? `${cooldown}s` : 'تحديث';
  const disabled = cooldown > 0;

  return { onClick, title, disabled, cooldown };
}
