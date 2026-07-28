import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: "Is MindBridge completely anonymous?",
    answer: "Yes, absolute anonymity is the cornerstone of our platform. We use zero-knowledge identity mapping. Your real identity is never exposed to the AI, and clinical staff can only see an encrypted alias unless a critical, life-threatening emergency protocol is initiated."
  },
  {
    question: "How does the Emergency Protocol work?",
    answer: "If the AI detects an imminent risk of severe harm or suicide, it triggers an alert to on-campus clinical staff. Only in these specific, life-critical scenarios can an authorized clinician request an identity reveal to intervene and save a life. Every reveal is strictly audited."
  },
  {
    question: "Is the AI a replacement for a human therapist?",
    answer: "No. The MindBridge AI is an empathetic sounding board and triage system, not a replacement for clinical care. It provides immediate coping exercises and validates your emotions, but its main goal is to connect you with your university's human counselors when you need them."
  },
  {
    question: "How do I know my data is secure?",
    answer: "All chat data, journal entries, and mood logs are encrypted using AES-256 both in transit and at rest. We comply with GDPR and HIPAA standards to ensure your sensitive health information is never compromised."
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-background">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-text-muted">Everything you need to know about privacy, AI, and how we protect students.</p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="border border-border rounded-2xl overflow-hidden bg-surface transition-all duration-200"
            >
              <button
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-heading font-semibold text-lg">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="text-primary flex-shrink-0" size={20} />
                ) : (
                  <ChevronDown className="text-text-muted flex-shrink-0" size={20} />
                )}
              </button>
              
              <div 
                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-text-muted leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
