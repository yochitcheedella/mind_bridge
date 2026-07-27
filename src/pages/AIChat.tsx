import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Lock, ShieldAlert, Send, Mic, MicOff, Volume2, VolumeX, Paperclip, ArrowLeft, Brain, Globe } from 'lucide-react';
import { getAlias, getAuth, apiFetch } from '../utils/auth';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'counselor';
  text: string;
  timestamp: Date;
  risk_level?: string;
  risk_score?: number;
}

const RISK_COLORS: Record<string, string> = {
  green:    'bg-success/15 text-success border-success/25',
  yellow:   'bg-warning/15 text-warning border-warning/25',
  orange:   'bg-orange-400/15 text-orange-300 border-orange-400/25',
  red:      'bg-error/15 text-error border-error/25',
  critical: 'bg-error/20 text-error border-error/40 animate-pulse',
};

const RISK_LABELS: Record<string, string> = {
  green: 'Safe', yellow: 'Mild Stress', orange: 'Moderate Risk',
  red: 'High Risk', critical: 'Critical',
};

export default function AIChat() {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentRisk, setCurrentRisk] = useState<string>('green');
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [language, setLanguage] = useState('en-IN');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const alias = getAlias();

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.lang = language;
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        alert("Microphone not supported on this browser.");
      }
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const connectWS = () => {
    const auth = getAuth();
    if (!auth) {
      setWsStatus('disconnected');
      return;
    }
    
    setWsStatus('connecting');
    const wsBaseUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
    const ws = new WebSocket(`${wsBaseUrl}/api/chat/ws?token=${auth.access_token}`);

    ws.onopen = () => { setWsStatus('connected'); setIsTyping(false); };
    ws.onclose = () => { setWsStatus('disconnected'); };
    ws.onerror = () => { setWsStatus('disconnected'); };

    ws.onmessage = (event) => {
      setIsTyping(false);
      try {
        const data = JSON.parse(event.data);
        if (data.sender && data.text) {
          setMessages(prev => [...prev, {
            id: `${Date.now()}-${Math.random()}`,
            sender: data.sender,
            text: data.text,
            timestamp: new Date(),
            risk_level: data.risk_level,
            risk_score: data.risk_score,
          }]);
          if (data.risk_level) setCurrentRisk(data.risk_level);
          if (data.sender === 'ai' && !isSpeaking) {
             speakText(data.text);
          }
        }
      } catch {}
    };

    wsRef.current = ws;
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await apiFetch('/api/chat/history');
        if (res.ok) {
          const data = await res.json();
          const historyMessages = data.map((msg: any) => ({
            id: msg.id,
            sender: msg.sender,
            text: msg.text,
            timestamp: new Date(msg.timestamp),
            risk_score: msg.sentiment_score
          }));
          setMessages(historyMessages);
        }
      } catch (err) {
        console.error('Failed to load chat history', err);
      }
    };

    fetchHistory().then(() => {
      connectWS();
    });
    
    return () => wsRef.current?.close();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputMessage.trim()) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputMessage.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, msg]);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      setIsTyping(true);
      wsRef.current.send(JSON.stringify({ text: inputMessage.trim(), language }));
    }
    setInputMessage('');
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Header */}
      <header className="px-4 py-3 border-b border-border flex items-center justify-between bg-surface-dim/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-bright transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
            <Brain size={16} className="text-primary" />
          </div>
          <div>
            <h1 className="font-heading font-semibold text-sm">AI Guide</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={`w-1.5 h-1.5 rounded-full ${wsStatus === 'connected' ? 'bg-success' : wsStatus === 'connecting' ? 'bg-warning animate-pulse' : 'bg-error'}`} />
              <span className="text-[10px] text-text-muted font-mono">
                {wsStatus === 'connected' ? 'Anonymous session' : wsStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent text-xs text-text border border-border rounded-md px-1 py-1 focus:outline-none"
          >
            <option value="en-IN">English</option>
            <option value="hi-IN">Hindi</option>
            <option value="te-IN">Telugu</option>
            <option value="ta-IN">Tamil</option>
          </select>
          {currentRisk !== 'green' && (
            <Badge variant="default" className={`text-[10px] border ${RISK_COLORS[currentRisk]}`}>
              {RISK_LABELS[currentRisk]}
            </Badge>
          )}
          <Link to="/emergency">
            <Button variant="danger" size="sm" className="gap-1.5 text-xs px-3 h-8">
              <ShieldAlert size={13} /> SOS
            </Button>
          </Link>
        </div>
      </header>

      {/* Chat Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-5 pb-24">
        {/* Timestamp */}
        <div className="text-center">
          <span className="text-[10px] text-text-muted bg-surface-dim px-3 py-1 rounded-full">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {messages.length === 0 && wsStatus === 'connected' && (
          <div className="text-center pt-6 text-text-muted text-sm">
            <Lock size={24} className="mx-auto mb-3 text-primary/40" />
            <p className="font-medium">Your safe space</p>
            <p className="text-xs mt-1 opacity-60">Everything you share here is anonymous and encrypted.</p>
          </div>
        )}

        {messages.map(msg => {
          if (msg.sender === 'ai') {
            return (
              <div key={msg.id} className="flex gap-2.5 animate-slide-up">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center mt-1">
                  <Brain size={14} className="text-primary" />
                </div>
                <div className="max-w-[85%]">
                  <div className="glass-panel px-4 py-3 rounded-2xl rounded-tl-none bg-surface-bright/50 border-primary/15">
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                  <p className="text-[10px] text-text-muted mt-1 ml-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          } else if (msg.sender === 'counselor') {
            return (
              <div key={msg.id} className="flex gap-2.5 animate-slide-up">
                <div className="w-8 h-8 rounded-full bg-orange-400/20 flex-shrink-0 flex items-center justify-center mt-1 shadow-[0_0_10px_rgba(251,146,60,0.3)]">
                  <ShieldAlert size={14} className="text-orange-400" />
                </div>
                <div className="max-w-[85%]">
                  <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-gradient-to-br from-orange-400/20 to-orange-500/10 border border-orange-400/30">
                    <p className="text-xs font-bold text-orange-400 mb-1 uppercase tracking-wider">Clinical Counselor</p>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                  <p className="text-[10px] text-text-muted mt-1 ml-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          } else {
            return (
              <div key={msg.id} className="flex gap-2.5 justify-end animate-slide-up">
                <div className="max-w-[85%]">
                  <div className="px-4 py-3 rounded-2xl rounded-tr-none bg-primary text-white shadow-lg shadow-primary/20">
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                  <p className="text-[10px] text-text-muted mt-1 mr-1 text-right">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          }
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-2.5 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center">
              <Brain size={14} className="text-primary" />
            </div>
            <div className="glass-panel px-4 py-3 rounded-2xl rounded-tl-none bg-surface-bright/50 border-primary/15">
              <div className="flex items-center gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {wsStatus === 'disconnected' && (
          <div className="text-center py-4">
            <p className="text-xs text-error mb-2">Connection lost</p>
            <button onClick={connectWS}
              className="text-xs text-primary hover:text-primary-hover underline transition-colors">
              Reconnect
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <div className="fixed bottom-16 w-full max-w-md bg-background border-t border-border p-3">
        <div className="flex items-center gap-2 bg-surface border border-border rounded-full p-1 pr-2 focus-within:border-primary/50 transition-colors">
          <button className="p-2 text-text-muted hover:text-text transition-colors">
            <Paperclip size={18} />
          </button>
          <input
            type="text"
            placeholder="Share your thoughts..."
            className="flex-1 bg-transparent border-none focus:outline-none text-sm px-2 py-2 text-text placeholder-text-muted"
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            onKeyDown={handleKey}
          />
          {inputMessage.trim() ? (
            <button onClick={handleSend}
              className="p-2 bg-primary text-white rounded-full hover:bg-primary-hover transition-colors shadow-md shadow-primary/30">
              <Send size={16} />
            </button>
          ) : (
            <button 
              onClick={toggleListening}
              className={`p-2 transition-colors rounded-full shadow-sm ${isListening ? 'bg-error text-white animate-pulse' : 'bg-surface-bright text-text-muted hover:text-text'}`}>
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
