import React from 'react';
import { MessageCircle, PhoneCall, ArrowRight, ShieldCheck } from 'lucide-react';

export function FloatingConsultationBar() {
  return (
    <section className="py-6 bg-[#fbf9f4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white border border-[#d6ebd9] p-4 sm:p-5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-md flex-shrink-0 animate-bounce">
              <MessageCircle className="h-6 w-6 fill-current" />
            </div>
            <div>
              <h4 className="font-heading font-extrabold text-forest-deep text-sm sm:text-base">
                Need Help Choosing the Right Ayurvedic Remedy?
              </h4>
              <p className="text-xs text-charcoal-muted">
                Chat with certified Ayurvedic Vaidyas on WhatsApp for free personalized dosage guidance.
              </p>
            </div>
          </div>

          <a
            href="https://wa.me/917657963458?text=Hello%20Doctor,%20I%20need%20guidance%20on%20Fibax%20Ayurvedic%20products"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-extrabold tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 transform active:scale-98 flex-shrink-0"
          >
            <span>START FREE WHATSAPP CHAT</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
