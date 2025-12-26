import React from 'react';
import { HelpCircle, Mail, MessageCircle } from 'lucide-react';

const HelpCenter = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">How can we help?</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-12">
            <div className="divide-y divide-gray-100">
                <FAQItem 
                    q="How do I get my money back?" 
                    a="If you do not receive your item, simply do not click 'Confirm Receipt'. Contact support, and we will investigate. If the seller cannot prove delivery, we refund you from Escrow." 
                />
                <FAQItem 
                    q="Is there a fee for selling?" 
                    a="Yes, we charge a flat 8% platform fee on successful sales. There are no listing fees." 
                />
                <FAQItem 
                    q="Can I cancel a bid?" 
                    a="Bids are binding contracts. However, if you made an obvious typo (e.g., entered $1000 instead of $100), contact support immediately." 
                />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ContactCard 
                icon={<Mail />} 
                title="Email Support" 
                desc="support@bidpulse.com" 
                action="Send Email"
            />
            <ContactCard 
                icon={<MessageCircle />} 
                title="Live Chat" 
                desc="Available 9am - 5pm EST" 
                action="Start Chat"
            />
        </div>
      </div>
    </div>
  );
};

const FAQItem = ({ q, a }) => (
    <div className="p-6">
        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <HelpCircle size={16} className="text-bid-purple" /> {q}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed ml-6">{a}</p>
    </div>
);

const ContactCard = ({ icon, title, desc, action }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 text-center hover:border-bid-purple transition cursor-pointer group">
        <div className="text-gray-400 group-hover:text-bid-purple transition mb-3 flex justify-center">
            {React.cloneElement(icon, { size: 32 })}
        </div>
        <h3 className="font-bold text-gray-900">{title}</h3>
        <p className="text-gray-500 text-sm mb-4">{desc}</p>
        <span className="text-bid-purple font-semibold text-sm">{action} &rarr;</span>
    </div>
);

export default HelpCenter;