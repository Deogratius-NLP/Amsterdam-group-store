import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Lock } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { AMSTERDAM_WHATSAPP_LINK } from '../../utils/constants';

export default function Footer() {
  const { whatsappLink } = useSettings();
  const activeWhatsAppLink = whatsappLink || AMSTERDAM_WHATSAPP_LINK;
  return (
    <footer id="footer-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-14 lg:-mt-16 relative z-20">
      <div className="bg-white rounded-t-[36px] sm:rounded-t-[48px] lg:rounded-t-[56px] shadow-xl pt-16 sm:pt-20 lg:pt-24 pb-12 sm:pb-16 px-6 sm:px-10 lg:px-12 border-t border-gray-100">
        
        {/* Main Footer Columns (matching Canva layout: About, Support, Social Media) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-12 sm:mb-16">
          
          {/* Official Brand Info */}
          <div className="space-y-4">
            <div>
              <img
                src="/logo.png"
                alt="Amsterdam Group - Moving Together"
                className="h-10 w-auto object-contain"
              />
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Empowering farmers across East & Central Africa with premium poultry vitamins, veterinary pharmaceuticals, and agricultural innovations.
            </p>
            <p className="text-xs text-gray-500 font-medium">
              Dar es Salaam, Tanzania
            </p>
          </div>

          {/* About Column (Canva: Blog, Meet The Team, Contact Us) */}
          <div>
            <h4 className="font-display font-bold text-base text-amsterdam-dark mb-4">
              About
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-600 font-medium">
              <li>
                <a href="#about" className="hover:text-amsterdam-olive transition-colors">Blog</a>
              </li>
              <li>
                <a href="#team" className="hover:text-amsterdam-olive transition-colors">Meet The Team</a>
              </li>
              <li>
                <a href="#contact-section" className="hover:text-amsterdam-olive transition-colors">Contact Us</a>
              </li>
              <li>
                <a href="#innovations" className="hover:text-amsterdam-olive transition-colors">Innovation Lab</a>
              </li>
            </ul>
          </div>

          {/* Support Column (Canva: FAQ, Shipping Policy, Return) */}
          <div>
            <h4 className="font-display font-bold text-base text-amsterdam-dark mb-4">
              Support
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-600 font-medium">
              <li>
                <a href="#faq" className="hover:text-amsterdam-olive transition-colors">FAQ</a>
              </li>
              <li>
                <a href="#shipping" className="hover:text-amsterdam-olive transition-colors">Shipping Policy</a>
              </li>
              <li>
                <a href="#returns" className="hover:text-amsterdam-olive transition-colors">Return & Quality Guarantee</a>
              </li>
              <li>
                <a href="#orders" className="hover:text-amsterdam-olive transition-colors">Order Tracking Help</a>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-amsterdam-olive transition-colors">Staff & Admin Portal</Link>
              </li>
            </ul>
          </div>

          {/* Social Media Column (matching reference: X, YouTube, Instagram, WhatsApp) */}
          <div>
            <h4 className="font-display font-bold text-base text-amsterdam-dark mb-4">
              Social Media
            </h4>
            <p className="text-xs text-gray-500 mb-4">
              Follow our agricultural updates and farming advice:
            </p>
            <div className="flex items-center gap-3">
              
              {/* X / Twitter */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors font-bold text-sm"
                aria-label="Twitter X"
              >
                𝕏
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href={activeWhatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 flex items-center justify-center transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>

            </div>
          </div>

        </div>

        {/* Bottom Copyright & Tanzanian Registration */}
        <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Amsterdam Group (Tanzania). All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6">
            <a href="#privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-gray-600 transition-colors">Terms of Service</a>
            <a href="#compliance" className="hover:text-gray-600 transition-colors">Veterinary Standards</a>
            <Link to="/admin/login" className="hover:text-amsterdam-olive transition-colors font-medium text-gray-400 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>Staff Portal</span>
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
