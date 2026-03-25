import { Send } from 'lucide-react';

const TG_COMMUNITY_URL = 'https://t.me/handshakealphagroup';

export const TelegramFab = () => {
  return (
    <a
      href={TG_COMMUNITY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full bg-[#2AABEE] hover:bg-[#229ED9] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
      aria-label="Join Telegram Community"
    >
      <Send className="w-5 h-5" />
    </a>
  );
};
