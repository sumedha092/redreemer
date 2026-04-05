import { useState } from 'react';
import { Zap } from 'lucide-react';
import Logo from '@/components/Logo';
import Modal from '@/components/Modal';

export default function Footer() {
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);

  function scrollToMission() {
    document.getElementById('mission')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      <footer className="relative bg-navy-950" id="footer">
        <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8 items-start">
          <div>
            <Logo size="sm" />
            <p className="text-muted-foreground text-sm italic mt-2">Redream what's possible.</p>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground justify-center flex-wrap">
            <button onClick={scrollToMission} className="hover:text-foreground transition-colors">About</button>
            <button onClick={() => setPrivacyOpen(true)} className="hover:text-foreground transition-colors">Privacy</button>
            <button onClick={() => setSecurityOpen(true)} className="hover:text-foreground transition-colors">Security</button>
            <a href="mailto:hello@redreemer.app" className="hover:text-foreground transition-colors">Contact</a>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Zap size={16} className="text-primary" /> Built at InnovationHacks 2026
            </span>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="max-w-7xl mx-auto px-6 py-4 text-center text-xs text-muted-foreground">
            2026 Redreemer — Free forever — Made with purpose
          </div>
        </div>
      </footer>

      <Modal open={privacyOpen} onClose={() => setPrivacyOpen(false)} title="Privacy Policy">
        <p className="font-semibold text-foreground">Last updated: April 2026</p>
        <p>We collect only your phone number and conversation history — nothing more.</p>
        <p>We never sell your data to third parties or share it with advertisers.</p>
        <p>Caseworkers can only see clients assigned to them, enforced at the database level.</p>
        <p>You can delete all your data by texting DELETE to our number at any time.</p>
        <p>Data is encrypted at rest in Supabase using AES-256 encryption.</p>
        <p>We are TCPA compliant — text STOP at any time to opt out of all messages.</p>
        <p>Phone numbers are hashed with SHA-256 before storage for additional privacy.</p>
        <p>We do not use your data to train AI models or for any commercial purpose.</p>
      </Modal>

      <Modal open={securityOpen} onClose={() => setSecurityOpen(false)} title="Security">
        <p className="font-semibold text-foreground">How we protect your data</p>
        <p>All data is encrypted in transit using TLS 1.3 and at rest using AES-256.</p>
        <p>Auth0 enterprise authentication handles all caseworker logins — no passwords stored by us.</p>
        <p>Supabase Row Level Security ensures caseworkers can only access their assigned clients, even if the application layer is bypassed.</p>
        <p>Twilio webhook signature validation prevents spoofed SMS requests.</p>
        <p>Phone numbers are hashed with SHA-256 + a secret salt before storage.</p>
        <p>Rate limiting prevents SMS flooding (max 10 messages per minute per IP).</p>
        <p>We conduct regular security reviews and dependency audits.</p>
      </Modal>
    </>
  );
}
