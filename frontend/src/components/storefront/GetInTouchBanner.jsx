import React, { useState } from 'react';
import { Send, CheckCircle2, MessageCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { AMSTERDAM_WHATSAPP_LINK } from '../../utils/constants';

export default function GetInTouchBanner() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { whatsappLink } = useSettings();
  const activeWhatsAppLink = whatsappLink || AMSTERDAM_WHATSAPP_LINK;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setEmail('');
      setSubmitted(false);
    }, 4000);
  };

  return (
    <section id="contact-section" className="pt-16 sm:pt-20 lg:pt-24 pb-0 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Deep Crimson Banner Container with rounded top corners matching reference */}
      <div className="relative overflow-hidden rounded-t-[36px] sm:rounded-t-[48px] lg:rounded-t-[56px] bg-amsterdam-red text-white p-8 sm:p-12 lg:p-16 pb-32 sm:pb-44 lg:pb-52 shadow-crimson">
        
        {/* Subtle decorative leaf watermark in background */}
        <div className="absolute -right-12 -bottom-16 opacity-10 pointer-events-none">
          <svg className="w-80 h-80" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 15C50 15 32 30 32 55C32 75 45 85 50 85C55 85 68 75 68 55C68 30 50 15 50 15Z"/>
          </svg>
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* Left Side: Headline & Email Input Pill */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight">
              Get in Touch<br />Today
            </h2>

            {/* Email Pill Input Form (exact Canva design) */}
            <form onSubmit={handleSubmit} className="w-full max-w-md">
              <div className="relative flex items-center bg-white rounded-full p-1.5 shadow-lg">
                <input
                  type="email"
                  required
                  placeholder="email.."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-5 pr-24 py-2.5 rounded-full text-amsterdam-dark placeholder-gray-400 text-sm focus:outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 px-6 py-2 rounded-full bg-black hover:bg-gray-800 text-white font-bold text-xs tracking-wider uppercase transition-colors shadow-sm"
                >
                  Send
                </button>
              </div>

              {submitted && (
                <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-emerald-200 bg-black/20 px-3.5 py-1.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Thank you! We will get in touch with you shortly.</span>
                </div>
              )}
            </form>
          </div>

          {/* Right Side: Trust Statement & Callout (matching reference underline) */}
          <div className="lg:col-span-6 lg:text-right space-y-3 sm:space-y-4">
            <h3 className="font-display font-bold text-xl sm:text-2xl tracking-tight text-white inline-block">
              Don't stay back
            </h3>
            <div className="w-28 h-0.5 bg-white lg:ml-auto mb-3"></div>
            <p className="text-white/90 text-xs sm:text-sm leading-relaxed max-w-lg lg:ml-auto font-normal">
              Trusted over a thousand farmers in East and central Africa,<br className="hidden sm:inline" />
              We prioritize quality of the goods we deliver and we are results oriented.
            </p>
            
            <div className="pt-3 sm:pt-4">
              <a
                href={activeWhatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-amsterdam-red hover:bg-gray-100 font-bold text-xs tracking-wide shadow-md hover:shadow-lg transition-all"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Chat Directly on WhatsApp</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
