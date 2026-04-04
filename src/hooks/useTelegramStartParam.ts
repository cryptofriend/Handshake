import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;

    const tg = window.Telegram?.WebApp;

    // Signal to Telegram that the app is ready
    if (tg) {
      tg.ready?.();
      tg.expand?.();
    }

    // Try Telegram SDK start_param first, then fall back to URL ?startapp= query param
    const startParam =
      tg?.initDataUnsafe?.start_param ||
      new URLSearchParams(window.location.search).get('startapp') ||
      new URLSearchParams(location.search).get('startapp');

    console.log('[TG Deep Link] start_param:', startParam, '| tg available:', !!tg, '| initDataUnsafe:', JSON.stringify(tg?.initDataUnsafe));

    if (!startParam) return;

    handled.current = true;

    // If the param starts with "agreement_" it's a direct agreement ID link
    if (startParam.startsWith('agreement_')) {
      const agreementId = startParam.replace('agreement_', '');
      console.log('[TG Deep Link] Direct agreement link, navigating to /sign/' + agreementId);
      navigate(`/sign/${agreementId}`, { replace: true });
      return;
    }

    // Otherwise treat it as an invite token — resolve to get the agreement ID
    const resolveToken = async () => {
      try {
        const telegramUserId = tg?.initDataUnsafe?.user?.id?.toString() || null;
        console.log('[TG Deep Link] Resolving invite token:', startParam, '| telegramUserId:', telegramUserId);

        const { data, error } = await supabase.functions.invoke('resolve-invite', {
          body: { inviteToken: startParam, telegramUserId },
        });

        if (error || !data?.agreement) {
          console.error('[TG Deep Link] Failed to resolve invite token:', error || 'No agreement found');
          return;
        }

        const agreementId = data.agreement.id;
        console.log('[TG Deep Link] Resolved! Navigating to /sign/' + agreementId);
        navigate(`/sign/${agreementId}?invite=${startParam}`, { replace: true });
      } catch (err) {
        console.error('[TG Deep Link] Error resolving Telegram start param:', err);
      }
    };

    resolveToken();
  }, [navigate, location.search]);
}
