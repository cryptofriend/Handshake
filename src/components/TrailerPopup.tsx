import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const STORAGE_KEY = 'hm_trailer_seen_v1';

export default function TrailerPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  const close = () => {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch {}
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl">
        <button
          onClick={close}
          aria-label="Close trailer"
          className="absolute -top-3 -right-3 z-10 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="relative rounded-3xl overflow-hidden border border-border bg-card aspect-video shadow-2xl">
          <iframe
            className="absolute inset-0 w-full h-full"
            src="https://www.youtube.com/embed/YylVp-8jLUA?autoplay=1&rel=0&modestbranding=1"
            title="Handshake Monster trailer"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <div className="mt-4 text-center">
          <button
            onClick={close}
            className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-semibold text-sm tracking-wide hover:opacity-90 transition-opacity"
          >
            Skip trailer
          </button>
        </div>
      </div>
    </div>
  );
}
