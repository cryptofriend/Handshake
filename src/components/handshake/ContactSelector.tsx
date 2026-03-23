import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Contact, MOCK_CONTACTS } from '@/data/contacts';
import { ChevronDown, Search, User } from 'lucide-react';

interface ContactSelectorProps {
  value: string;
  onChange: (name: string) => void;
}

export const ContactSelector = ({ value, onChange }: ContactSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = MOCK_CONTACTS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.username.toLowerCase().includes(search.toLowerCase())
  );

  const selectedContact = MOCK_CONTACTS.find((c) => c.name === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="w-3 h-3 text-primary" />
          </div>
          <span className={`truncate ${value ? 'text-foreground' : 'text-muted-foreground'}`}>
            {selectedContact ? `${selectedContact.name} @${selectedContact.username}` : value || 'Select contact...'}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-1.5 bg-card rounded-2xl border border-border overflow-hidden z-50"
            style={{ boxShadow: 'var(--shadow-elevated)' }}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
          >
            {/* Search */}
            <div className="p-2 border-b border-border">
              <div className="flex items-center gap-2 px-2.5 h-9 rounded-xl bg-muted/50">
                <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search contacts..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  autoFocus
                />
              </div>
            </div>

            {/* Contact list */}
            <div className="max-h-48 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No contacts found</p>
              ) : (
                filtered.map((contact) => (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => {
                      onChange(contact.name);
                      setOpen(false);
                      setSearch('');
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors ${
                      value === contact.name ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-primary">
                        {contact.name.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{contact.name}</p>
                      <p className="text-xs text-muted-foreground truncate">@{contact.username}</p>
                    </div>
                    {value === contact.name && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
