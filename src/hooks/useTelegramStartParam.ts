import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initDataUnsafe?: {
          start_param?: string;
          user?: { id: number };
        };
        ready?: () => void;
        expand?: () => void;
      };
    };
  }
}

/**
 * Reads the Telegram Mini App `startapp` parameter and navigates
 * to the appropriate sign page if an invite token is detected.
 */
export function useTelegramStartParam() {
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;

    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    // Signal to Telegram that the app is ready
    tg.ready?.();
    tg.expand?.();

    const startParam = tg.initDataUnsafe?.start_param;
    if (!startParam) return;

    handled.current = true;

    // If the param starts with "agreement_" it's a direct agreement ID link
    if (startParam.startsWith('agreement_')) {
      const agreementId = startParam.replace('agreement_', '');
      navigate(`/sign/${agreementId}`, { replace: true });
      return;
    }

    // Otherwise treat it as an invite token — resolve to get the agreement ID
    const resolveToken = async () => {
      try {
        const telegramUserId = tg.initDataUnsafe?.user?.id?.toString() || null;

        const { data, error } = await supabase.functions.invoke('resolve-invite', {
          body: { inviteToken: startParam, telegramUserId },
        });

        if (error || !data?.agreement) {
          console.error('Failed to resolve invite token:', error || 'No agreement found');
          return;
        }

        const agreementId = data.agreement.id;
        navigate(`/sign/${agreementId}?invite=${startParam}`, { replace: true });
      } catch (err) {
        console.error('Error resolving Telegram start param:', err);
      }
    };

    resolveToken();
  }, [navigate]);
}
