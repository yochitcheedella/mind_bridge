import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-surface border-t border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Transparent pricing for institutions.</h2>
          <p className="text-text-muted">MindBridge is always 100% free for students. Universities subscribe to support their campus.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Pilot Tier */}
          <div className="p-8 rounded-2xl bg-background border border-border flex flex-col">
            <h3 className="text-2xl font-heading font-bold mb-2">Campus Pilot</h3>
            <p className="text-text-muted mb-6 text-sm">Perfect for departments or small campuses testing the waters.</p>
            <div className="mb-6">
              <span className="text-4xl font-black">$499</span>
              <span className="text-text-muted">/month</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              {['Up to 2,000 active students', '24/7 AI Chat Assistant', 'Basic Risk Detection alerts', 'Standard Psychologist Dashboard', 'Email Support'].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="text-primary flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm font-medium">{feature}</span>
                </li>
              ))}
            </ul>
            
            <button className="w-full py-3 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-colors">
              Start Free Trial
            </button>
          </div>

          {/* Enterprise Tier */}
          <div className="p-8 rounded-2xl bg-primary text-white flex flex-col relative overflow-hidden shadow-2xl shadow-primary/20">
            <div className="absolute top-0 right-0 p-3 bg-white/20 backdrop-blur-md rounded-bl-2xl text-xs font-bold uppercase tracking-wider">
              Most Popular
            </div>
            
            <h3 className="text-2xl font-heading font-bold mb-2">University Enterprise</h3>
            <p className="text-white/80 mb-6 text-sm">Full campus deployment with advanced clinical routing.</p>
            <div className="mb-6">
              <span className="text-4xl font-black text-white">Custom</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              {['Unlimited active students', 'Advanced Multi-Factor Risk Engine', 'Emergency WebSockets Triage', 'Anonymous to Real Identity Protocol', 'Custom University Branding', 'Dedicated Success Manager', '24/7 Phone Support'].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="text-white flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm font-medium text-white/90">{feature}</span>
                </li>
              ))}
            </ul>
            
            <button className="w-full py-3 rounded-xl bg-white text-primary font-bold hover:bg-gray-100 transition-colors shadow-lg">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
