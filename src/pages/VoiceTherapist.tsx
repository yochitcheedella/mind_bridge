import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Square, Sparkles, Activity } from 'lucide-react';
import { Card } from '../components/ui/Card';

export default function VoiceTherapist() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis>(window.speechSynthesis);

  useEffect(() => {
    // Initialize Web Speech API for recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (transcript.trim()) {
          handleAiThinking(transcript);
        }
      };

      recognitionRef.current = recognition;
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      synthesisRef.current.cancel();
    };
  }, []);

  const handleAiThinking = (text: string) => {
    setAiResponse("I hear you. That sounds completely understandable. Let's take a deep breath together. Tell me more about how that made you feel.");
    speakResponse("I hear you. That sounds completely understandable. Let's take a deep breath together. Tell me more about how that made you feel.");
  };

  const speakResponse = (text: string) => {
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find a calming female voice if available
    const voices = synthesisRef.current.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Samantha') || v.name.includes('Google UK English Female'));
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setTranscript(''); // reset for next turn
    };
    
    synthesisRef.current.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      setAiResponse('');
      synthesisRef.current.cancel();
      setIsSpeaking(false);
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6 md:p-8 max-w-4xl mx-auto pb-24 w-full h-full flex flex-col items-center">
      <div className="text-center mb-12 mt-8">
        <h1 className="font-heading font-bold text-4xl mb-4 flex items-center justify-center gap-3">
          <Sparkles className="text-primary" />
          AI Voice Therapist
        </h1>
        <p className="text-text-muted">A private, safe space to talk through your thoughts out loud.</p>
      </div>

      <div className="flex-1 w-full flex flex-col items-center justify-center min-h-[300px] relative">
        {/* Pulsing Avatar */}
        <div className={`relative flex items-center justify-center w-48 h-48 rounded-full transition-all duration-700 ${isSpeaking ? 'bg-primary/20 scale-110 shadow-[0_0_50px_rgba(var(--color-primary),0.4)]' : 'bg-surface border border-border'}`}>
          {isSpeaking && <div className="absolute inset-0 rounded-full animate-ping bg-primary/20" />}
          <Activity size={64} className={`transition-all duration-700 ${isSpeaking ? 'text-primary animate-pulse' : 'text-text-muted'}`} />
        </div>

        {/* Status Text */}
        <div className="mt-12 text-center h-24">
          {isListening && (
            <p className="text-lg text-text animate-pulse">"{transcript || 'Listening...'}"</p>
          )}
          {isSpeaking && (
            <p className="text-lg text-primary font-medium">"{aiResponse}"</p>
          )}
        </div>
      </div>

      <Card className="w-full max-w-md p-6 bg-surface/80 backdrop-blur-md border-primary/20">
        <div className="flex flex-col items-center gap-6">
          <p className="text-sm font-semibold tracking-wider text-text-muted uppercase">
            {isSpeaking ? 'AI is speaking...' : isListening ? 'Tap to stop' : 'Tap to speak'}
          </p>
          
          <button
            onClick={toggleListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
              isListening 
                ? 'bg-error text-white hover:bg-error-hover animate-pulse shadow-error/30' 
                : 'bg-primary text-white hover:bg-primary-hover hover:scale-105 shadow-primary/30'
            }`}
          >
            {isListening ? <Square size={28} className="fill-current" /> : <Mic size={32} />}
          </button>
        </div>
      </Card>
    </div>
  );
}
