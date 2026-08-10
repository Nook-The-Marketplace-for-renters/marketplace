import { useEffect, useRef, useState } from 'react';
import styles from './AskLouAiPanel.module.css';
import { useLanguage } from '@/i18n/LanguageContext';
import { askLouAi, type LouAiMatch } from '@/lib/api/louai';

interface AskLouAiPanelProps {
  listingId: string;
  listingAddress: string;
  onClose: () => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  // Runner-up matches for an assistant answer, so the dots under the bubble
  // can page through alternates without asking the question again.
  matches?: LouAiMatch[];
  selectedIndex?: number;
}

// Filler listings (src/data/listings.ts) only exist in the frontend, never
// in Supabase, so LouAI has no row to fetch and would just error. Skip the
// network call and explain why instead.
const isSampleListing = (listingId: string) => listingId.startsWith('filler-');

const DEFAULT_SIZE = { width: 360, height: 520 };
const MIN_SIZE = { width: 280, height: 320 };
const PANEL_MARGIN = 24; // keep in sync with --space-6, used to cap growth against the viewport

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function AskLouAiPanel({ listingId, listingAddress, onClose }: AskLouAiPanelProps) {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [sending, setSending] = useState(false);
  const [size, setSize] = useState(() => ({
    width: Math.min(DEFAULT_SIZE.width, window.innerWidth - PANEL_MARGIN * 2),
    height: Math.min(DEFAULT_SIZE.height, window.innerHeight - PANEL_MARGIN * 2),
  }));
  const threadRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; startWidth: number; startHeight: number } | null>(null);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  useEffect(() => {
    // The panel is anchored to the bottom-right corner (right/bottom in
    // CSS), so growing from the top-left handle means: further left/up you
    // drag, the bigger it gets.
    function handleMove(e: PointerEvent) {
      if (!dragRef.current) return;
      const { startX, startY, startWidth, startHeight } = dragRef.current;
      setSize({
        width: clamp(startWidth + (startX - e.clientX), MIN_SIZE.width, window.innerWidth - PANEL_MARGIN * 2),
        height: clamp(startHeight + (startY - e.clientY), MIN_SIZE.height, window.innerHeight - PANEL_MARGIN * 2),
      });
    }
    function handleUp() {
      dragRef.current = null;
    }
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, []);

  function handleResizeStart(e: React.PointerEvent) {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startY: e.clientY, startWidth: size.width, startHeight: size.height };
  }

  function selectMatch(messageIndex: number, matchIndex: number) {
    setMessages((prev) =>
      prev.map((m, i) =>
        i === messageIndex && m.matches ? { ...m, text: m.matches[matchIndex].text, selectedIndex: matchIndex } : m
      )
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const asked = question.trim();
    if (!asked || sending) return;

    setMessages((prev) => [...prev, { role: 'user', text: asked }]);
    setQuestion('');

    if (isSampleListing(listingId)) {
      setMessages((prev) => [...prev, { role: 'assistant', text: t.louai.sampleListing }]);
      return;
    }

    setSending(true);
    try {
      const { answer, matches } = await askLouAi(listingId, asked);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: matches[0]?.text ?? answer, matches, selectedIndex: 0 },
      ]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', text: t.louai.error }]);
    } finally {
      setSending(false);
    }
  }

  return (
    // A floating panel, not a modal: no backdrop, no scroll lock, so the
    // rest of the page (and the listing detail behind it) stays clickable
    // and scrollable while the chat is open.
    <div
      className={styles.panel}
      style={{ width: size.width, height: size.height }}
      role="dialog"
      aria-label={t.louai.askAbout(listingAddress)}
    >
      <div className={styles.resizeHandle} onPointerDown={handleResizeStart} aria-hidden="true">
        ⤡
      </div>

      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <span className={styles.dot} aria-hidden="true" />
          <h2 className={styles.title}>{t.louai.askAbout(listingAddress)}</h2>
        </div>
        <button className={styles.aiBadge} onClick={onClose} aria-label={t.louai.close}>
          AI
        </button>
      </div>

      <div className={styles.thread} ref={threadRef}>
        {messages.map((message, i) => (
          <div key={i} className={styles.messageBlock}>
            <div className={message.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant}>
              {message.role === 'assistant' && <span className={styles.assistantLabel}>Loua AI</span>}
              {message.text}
            </div>
            {message.role === 'assistant' && message.matches && message.matches.length > 1 && (
              <div className={styles.dots}>
                {message.matches.map((_, matchIndex) => (
                  <button
                    key={matchIndex}
                    type="button"
                    className={matchIndex === message.selectedIndex ? styles.dotActive : styles.dotInactive}
                    onClick={() => selectMatch(i, matchIndex)}
                    aria-label={`Alternate answer ${matchIndex + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
        {sending && <div className={styles.bubbleAssistant}>{t.louai.thinking}</div>}
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={t.louai.placeholder}
          className={styles.input}
          aria-label={t.louai.placeholder}
          disabled={sending}
        />
        <button type="submit" className={styles.sendBtn} disabled={sending || !question.trim()} aria-label={t.louai.send}>
          ◀
        </button>
      </form>
    </div>
  );
}
