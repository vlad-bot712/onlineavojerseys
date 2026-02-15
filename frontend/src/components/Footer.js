import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer data-testid="main-footer" className="bg-black text-white py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">AVO JERSEYS</h3>
            <p className="text-sm text-neutral-400">
              Tricouri de fotbal premium pentru adevărații fani.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">LINKURI RAPIDE</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-neutral-400 hover:text-[#CCFF00] transition-colors">
                  Acasă
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-sm text-neutral-400 hover:text-[#CCFF00] transition-colors">
                  Produse
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="text-sm text-neutral-400 hover:text-[#CCFF00] transition-colors">
                  Urmărește Comandă
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-neutral-400 hover:text-[#CCFF00] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-4">CONTACT</h4>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-sm text-neutral-400">
                <Mail className="w-4 h-4" />
                <span>contact@avojerseys.ro</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-neutral-400">
                <Phone className="w-4 h-4" />
                <span>+40 123 456 789</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-neutral-400">
                <MapPin className="w-4 h-4" />
                <span>București, România</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-lg font-bold mb-4">SOCIAL MEDIA</h4>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-[#CCFF00] hover:text-black flex items-center justify-center transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-[#CCFF00] hover:text-black flex items-center justify-center transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-[#CCFF00] hover:text-black flex items-center justify-center transition-all">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center">
          <p className="text-sm text-neutral-400">
            © 2025 AVO JERSEYS. Toate drepturile rezervate.
          </p>
        </div>
      </div>
    </footer>
  );
}
