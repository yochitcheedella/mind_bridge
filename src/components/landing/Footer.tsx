import React from 'react';
import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-background border-t border-border pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
                <Shield className="text-primary" size={16} />
              </div>
              <span className="font-heading font-bold text-lg tracking-tight">Mind<span className="text-primary">Bridge</span> AI</span>
            </div>
            <p className="text-sm text-text-muted mb-6 leading-relaxed">
              Bridging the gap between struggling students and clinical care with zero-identity AI.
            </p>
            <div className="flex items-center gap-4 text-text-muted">
              <a href="#" className="hover:text-primary transition-colors">Twitter</a>
              <a href="#" className="hover:text-primary transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-primary transition-colors">GitHub</a>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-bold mb-6">Platform</h4>
            <ul className="space-y-4 text-sm text-text-muted">
              <li><a href="#features" className="hover:text-text transition-colors">Features</a></li>
              <li><a href="#security" className="hover:text-text transition-colors">Security</a></li>
              <li><a href="#pricing" className="hover:text-text transition-colors">Pricing</a></li>
              <li><Link to="/onboarding" className="hover:text-text transition-colors">University Onboarding</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold mb-6">Resources</h4>
            <ul className="space-y-4 text-sm text-text-muted">
              <li><a href="#" className="hover:text-text transition-colors">Blog</a></li>
              <li><a href="#faq" className="hover:text-text transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-text transition-colors">Support Center</a></li>
              <li><a href="#" className="hover:text-text transition-colors">API Documentation</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-text-muted">
              <li><a href="#" className="hover:text-text transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-text transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-text transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-text transition-colors">Accessibility</a></li>
            </ul>
          </div>

        </div>
        
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>© {new Date().getFullYear()} MindBridge AI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>HIPAA Compliant Structure</span>
            <span>AES-256 Encryption</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
