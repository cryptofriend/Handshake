import { useEffect, useState } from 'react';

export type Platform = 'telegram' | 'world' | 'web';

declare global {
  interface Window {
    WorldApp?: any;
    MiniKit?: any;
  }
}

export interface PlatformInfo {
  platform: Platform;
  isTelegram: boolean;
  isWorld: boolean;
  isWeb: boolean;
  isMiniApp: boolean;
  details: {
    telegramPlatform?: string;
    telegramVersion?: string;
    userAgent: string;
  };
}

function detect(): PlatformInfo {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';

  // Telegram Mini App detection — Telegram injects window.Telegram.WebApp with initData
  const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;
  const isTelegram = !!tg && (!!tg.initData || !!tg.platform);

  // World App detection — World App injects window.WorldApp / MiniKit, and UA contains "WorldApp"
  const isWorld =
    typeof window !== 'undefined' &&
    (!!window.WorldApp || !!window.MiniKit || /WorldApp/i.test(ua));

  let platform: Platform = 'web';
  if (isTelegram) platform = 'telegram';
  else if (isWorld) platform = 'world';

  return {
    platform,
    isTelegram,
    isWorld,
    isWeb: platform === 'web',
    isMiniApp: isTelegram || isWorld,
    details: {
      telegramPlatform: tg?.platform,
      telegramVersion: tg?.version,
      userAgent: ua,
    },
  };
}

/**
 * Detects whether the app is running in:
 * - Telegram Mini App (window.Telegram.WebApp present)
 * - World App Mini App (window.WorldApp / MiniKit / UA marker)
 * - Plain web browser (fallback)
 */
export function usePlatform(): PlatformInfo {
  const [info, setInfo] = useState<PlatformInfo>(() =>
    typeof window === 'undefined'
      ? {
          platform: 'web',
          isTelegram: false,
          isWorld: false,
          isWeb: true,
          isMiniApp: false,
          details: { userAgent: '' },
        }
      : detect()
  );

  useEffect(() => {
    // Re-detect after mount in case Telegram/World scripts inject late
    const t = setTimeout(() => setInfo(detect()), 50);
    return () => clearTimeout(t);
  }, []);

  return info;
}
