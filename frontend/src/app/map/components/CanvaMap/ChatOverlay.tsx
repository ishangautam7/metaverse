import { useState, useEffect, useRef } from 'react';

interface ChatOverlayProps {
  onSendMessage: (message: string) => void;
  chatHistory: Array<{ username: string; message: string; timestamp: string }>;
}

export const ChatOverlay = ({ onSendMessage, chatHistory }: ChatOverlayProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [message, setMessage] = useState('');
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
          onSendMessage(message);
          setMessage('');
          setIsOpen(false);
        } else if (e.key === 'Escape') {
          setIsOpen(false);
          setMessage('');
        }
      };

      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [isOpen, message, onSendMessage]);

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

  return (
    <div className="absolute bottom-6 left-6 z-50 w-80 pointer-events-none">
      {!isOpen && !showMessages && (
        <div className="text-fuchsia-800 border-blue-500 border-2 text-sm px-2">Press ENTER to chat</div>
      )}

      {(isOpen || showMessages) && (
        <div
          className={`rounded-lg shadow-lg transition-all duration-300 overflow-hidden 
          ${isOpen ? 'bg-white/90' : 'bg-white/10'} pointer-events-auto`}
        >
          <div
            ref={chatContainerRef}
            className={`transition-all duration-300 p-3 space-y-2 
            ${isOpen ? 'h-48 overflow-y-auto' : 'max-h-48 overflow-hidden'}`}
          >
            {chatHistory.map((msg, index) => (
              <div key={index} className="text-sm">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-indigo-600">{msg.username}</span>
                  <span className="text-gray-500 text-xs">{msg.timestamp}</span>
                </div>
                <div className="text-gray-800">{msg.message}</div>
              </div>
            ))}
          </div>

          {isOpen && (
            <div className="p-2 border-t border-gray-200">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="w-full bg-transparent border-none outline-none text-gray-800 placeholder-gray-400"
                autoFocus
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
