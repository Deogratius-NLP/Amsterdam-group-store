import React, { useState } from 'react';
import { Menu, X, MessageCircle, ShieldCheck, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { AMSTERDAM_WHATSAPP_LINK } from '../../utils/constants';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { whatsappLink } = useSettings();
  const activeWhatsAppLink = whatsappLink || AMSTERDAM_WHATSAPP_LINK;

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-[#69001A] via-[#8C1B2A] to-[#69001A] border-b border-[#520014]/50 shadow-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Official Amsterdam Group Logo (matching uploaded inspiration top-left) */}
          <Link to="/" className="flex items-center group py-1">
            <img
              src="/logo.png"
              alt="Amsterdam Group - Moving Together"
              className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-[1.02] filter drop-shadow-[0_1px_2px_rgba(255,255,255,0.4)]"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#products-section" className="text-sm font-semibold text-white/90 hover:text-white transition-colors">
              Products
            </a>
            <a href="#coming-soon-section" className="text-sm font-semibold text-white/90 hover:text-white transition-colors">
              Coming Soon
            </a>
            <a href="#contact-section" className="text-sm font-semibold text-white/90 hover:text-white transition-colors">
              Get in Touch
            </a>
            <a href="#footer-section" className="text-sm font-semibold text-white/90 hover:text-white transition-colors">
              About
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={activeWhatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-semibold text-xs transition-colors border border-white/30 backdrop-blur-sm"
            >
              <MessageCircle className="w-4 h-4 text-white" />
              <span>WhatsApp Support</span>
            </a>

            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-black/20 hover:bg-black/30 text-white font-semibold text-xs transition-colors border border-white/20"
              title="Staff & Admin Portal"
            >
              <ShieldCheck className="w-4 h-4 text-white/80" />
              <span>Admin</span>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="flex sm:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl text-white hover:bg-white/10 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="sm:hidden bg-[#6B001B] border-b border-black/30 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          <div className="pb-2 border-b border-white/10">
            <img
              src="/logo.png"
              alt="Amsterdam Group"
              className="h-8 w-auto object-contain filter drop-shadow-[0_1px_2px_rgba(255,255,255,0.4)]"
            />
          </div>
          <a
            href="#products-section"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-white/90 hover:bg-white/10"
          >
            Products
          </a>
          <a
            href="#coming-soon-section"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-white/90 hover:bg-white/10"
          >
            Coming Soon
          </a>
          <a
            href="#contact-section"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-white/90 hover:bg-white/10"
          >
            Get in Touch
          </a>
          <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
            <a
              href={activeWhatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/15 text-white text-sm font-semibold"
            >
              <span className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                WhatsApp Direct Orders
              </span>
              <ChevronRight className="w-4 h-4" />
            </a>
            <Link
              to="/admin/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-black/20 text-white text-sm font-semibold"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Admin Portal
              </span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
