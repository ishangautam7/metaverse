import { useState, useEffect, useRef } from 'react';

interface ChatOverlayProps {
  onSendMessage: (message: string, toTarget?: string) => void;
  chatHistory: Array<{ username: string; message: string; timestamp: string; isWhisper?: boolean }>;
  players: any; // We just need the usernames
}

export const ChatOverlay = ({ onSendMessage, chatHistory, players }: ChatOverlayProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [message, setMessage] = useState('');
  const [whisperTarget, setWhisperTarget] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isOpen) {
        setIsOpen(true);
        setShowMessages(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && message.trim()) {
          onSendMessage(message, whisperTarget || undefined);
          setMessage('');
          setIsOpen(false);
          setShowMessages(true);
          // Auto-hide messages after sending
          if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
          hideTimerRef.current = setTimeout(() => {
            setShowMessages(false);
          }, 4000);
        } else if (e.key === 'Escape') {
          setIsOpen(false);
          setMessage('');
        } else if (e.key === 'Tab') {
          e.preventDefault();
          
          const currentUserUsername = JSON.parse(localStorage.getItem('user') || '{}').username;
          const availablePlayers = Object.values(players || {})
            .map((p: any) => p.username || p.email) 
            .filter(u => u && u !== currentUserUsername);
          
          if (availablePlayers.length === 0) {
            setWhisperTarget(null);
            return;
          }

          if (!whisperTarget) {
            setWhisperTarget(availablePlayers[0]);
          } else {
            const idx = availablePlayers.indexOf(whisperTarget);
            if (idx === -1 || idx === availablePlayers.length - 1) {
              setWhisperTarget(null); // cycle back to "all"
            } else {
              setWhisperTarget(availablePlayers[idx + 1]);
            }
          }
        }
      };

      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [isOpen, message, onSendMessage, whisperTarget, players]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }

    setShowMessages(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (!isOpen) setShowMessages(false);
    }, 4000);
  }, [chatHistory, isOpen]);

  useEffect(() => {
    if (!isOpen && chatHistory.length > 0) {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        setShowMessages(false);
      }, 4000);
    }
  }, [isOpen]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, []);
  return (
    <div className="fixed bottom-6 left-6 z-40 w-80 pointer-events-none">
      {!isOpen && !showMessages && (
        <div className="bg-black/70 backdrop-blur-sm text-white border border-white/20 rounded-lg text-sm px-3 py-2 pointer-events-auto">
          💬 Press ENTER to chat
        </div>
      )}

      {(isOpen || showMessages) && (
        <div
          className={`rounded-lg shadow-lg transition-all duration-300 overflow-hidden pointer-events-auto
          ${isOpen ? 'bg-black/90 backdrop-blur-lg border border-white/30' : 'bg-black/70 backdrop-blur-sm border border-white/20'}`}
        >
          <div
            ref={chatContainerRef}
            className={`transition-all duration-300 p-3 space-y-2 text-white
            ${isOpen ? 'h-48 overflow-y-auto' : 'max-h-48 overflow-hidden'}`}
          >
            {chatHistory.map((msg, index) => (
              <div key={index} className="text-sm">
                <div className="flex items-baseline gap-2">
                  <span className={`font-semibold ${msg.isWhisper ? 'text-pink-400' : 'text-white'}`}>
                    {msg.isWhisper ? `${msg.username} (Whisper)` : msg.username}
                  </span>
                  <span className="text-gray-400 text-xs">{msg.timestamp}</span>
                </div>
                <div className={`${msg.isWhisper ? 'text-pink-200' : 'text-gray-200'}`}>
                  {msg.message}
                </div>
              </div>
            ))}
          </div>

          {isOpen && (
            <div className="p-2 border-t border-white/20 flex items-center gap-2">
              {whisperTarget && (
                <span className="text-pink-400 text-sm whitespace-nowrap font-medium">To {whisperTarget}:</span>
              )}
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={whisperTarget ? "Whisper message..." : "Type a message to room (Tab to cycle players)"}
                className="w-full bg-transparent border-none outline-none text-white placeholder-gray-400"
                autoFocus
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
