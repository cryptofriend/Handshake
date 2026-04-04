import { supabase } from '@/integrations/supabase/client';

export type AgreementEventType =
  | 'invite_created'
  | 'invite_sent'
  | 'deep_link_opened'
  | 'miniapp_opened'
  | 'agreement_viewed'
  | 'wallet_connected'
  | 'signature_started'
  | 'signature_completed'
  | 'signature_failed';

export async function logAgreementEvent(params: {
  agreementId: string;
  participantId?: string | null;
  eventType: AgreementEventType;
  telegramUserId?: string | null;
  walletAddress?: string | null;
  metadata?: Record<string, any>;
}) {
  try {
    await supabase.functions.invoke('log-agreement-event', {
      body: {
        agreementId: params.agreementId,
        participantId: params.participantId || null,
        eventType: params.eventType,
        telegramUserId: params.telegramUserId || null,
        walletAddress: params.walletAddress || null,
        metadata: params.metadata || {},
      },
    });
  } catch (err) {
    console.error('Failed to log agreement event:', err);
  }
}

export async function resolveInviteToken(inviteToken: string, telegramUserId?: string | null) {
  const { data, error } = await supabase.functions.invoke('resolve-invite', {
    body: { inviteToken, telegramUserId },
  });

  if (error) throw error;
  return data as {
    agreement: any;
    participant: any | null;
    invite: { id: string; status: string; participantId: string | null };
  };
}

const DEFAULT_BOT_USERNAME = 'handshakemonsterbot';

/** Primary signing surface — Telegram mini app deep link */
export function generateSignLink(inviteToken: string, botUsername: string = DEFAULT_BOT_USERNAME): string {
  return `https://t.me/${botUsername}/new?startapp=${inviteToken}`;
}

/** Fallback web sign link */
export function generateWebSignLink(agreementId: string, inviteToken: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/sign/${agreementId}?invite=${inviteToken}`;
}

/** @deprecated Use generateSignLink instead */
export function generateDeepLink(agreementId: string, inviteToken: string): string {
  return generateWebSignLink(agreementId, inviteToken);
}

/** @deprecated Use generateSignLink instead */
export function generateTelegramDeepLink(botUsername: string, inviteToken: string): string {
  return `https://t.me/${botUsername}/app?startapp=${inviteToken}`;
}
