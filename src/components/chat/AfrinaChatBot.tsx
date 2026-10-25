import React, { useState, useRef, useEffect } from 'react';
import { useCyberCafe } from '../../context/CyberCafeContext';
import {
  Bot,
  Send,
  Sparkles,
  ShoppingBag,
  FileText,
  CreditCard,
  QrCode,
  X,
  Minimize2,
  Maximize2,
  RotateCcw,
  Check,
  ChevronRight,
  Phone,
  HelpCircle,
  Copy
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  suggestedAction?: {
    type: 'add_to_pos' | 'open_order' | 'show_qr' | 'apply_service' | 'view_rates';
    label: string;
    items?: { id: string; name: string; price: number; quantity: number }[];
    totalAmount?: number;
  };
}

interface AfrinaChatBotProps {
  isEmbedded?: boolean;
  onAddToCart?: (items: { id: string; name: string; price: number; quantity: number }[]) => void;
  onClose?: () => void;
}

export const AfrinaChatBot: React.FC<AfrinaChatBotProps> = ({
  isEmbedded = false,
  onAddToCart,
  onClose
}) => {
  const {
    rateChart,
    products,
    settings,
    openModal,
    setActiveTab,
    directPosCheckout
  } = useCyberCafe();

  const [isOpen, setIsOpen] = useState(isEmbedded);
  const [input, setInput] = useState('');
  const [addedItemNotice, setAddedItemNotice] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'নমস্কার! আমি AFRINA INTERNET CAFE-র AI স্মার্ট সেবা ও জেরক্স অ্যাসিস্ট্যান্ট।\nজেরক্স বিলিং ক্যালকুলেশন, রেট চার্ট, ড্রাইভিং লাইসেন্স (LL), প্যান বা ভোটার কার্ডের নিয়ম জানতে পারেন, বা আমাকে যেকোনো বিল বানাতে বলতে পারেন!',
      timestamp: 'Just now'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Quick suggestion prompts
  const quickPrompts = [
    '১০ কপি B/W জেরক্স + ১ টা ল্যামিনেশন বিল বানিয়ে দাও',
    'Learner Licence (LL) করতে কি কি লাগবে আর ফি কত?',
    'পাসপোর্ট সাইজ ফটো ৮ কপি প্রিন্ট রেট কত?',
    '৫ পেজ কালার প্রিন্ট + স্পাইরাল বাইন্ডিং হিসাব করো',
    'দোকানের পেমেন্ট UPI QR কোড ও ফোন নম্বর দাও'
  ];

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');

    // Generate intelligent response
    setTimeout(() => {
      const botResponse = generateBotResponse(query);
      setMessages(prev => [...prev, botResponse]);
    }, 400);
  };

  const generateBotResponse = (query: string): ChatMessage => {
    const q = query.toLowerCase().trim();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Greetings & Pleasantries
    if (q.match(/^(hi|hello|hey|নমস্কার|সালাম|assalamu|salam|kemon|কেমন|হ্যাল|হাই|সুপ্রভাত|help|সাহায্য)/i)) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `নমস্কার! AFRINA INTERNET CAFE-তে আপনাকে স্বাগতম।\nআমি আপনাকে কীভাবে সাহায্য করতে পারি?\n\n• জেরক্স ও প্রিন্টের ইনস্ট্যান্ট বিল বানাতে পারি\n• ড্রাইভিং লাইসেন্স (LL), প্যান, আধার, ভোটার কার্ডের তথ্য দিতে পারি\n• অনলাইনে ফর্ম ফিলাপ ও ডকুমেন্টস ক্রপ করার নিয়ম জানাতে পারি\n\nনিচের যেকোনো অপশনে ক্লিক করুন বা আপনার প্রশ্ন লিখুন:`,
        timestamp: time,
        suggestedAction: {
          type: 'view_rates',
          label: '📜 View All Rates (সব সেবার রেট চার্ট)'
        }
      };
    }

    // 2. Xerox, Print, Color Print, Lamination & Binding Calculation
    if (q.includes('xerox') || q.includes('জেরক্স') || q.includes('জরক্স') || q.includes('print') || q.includes('প্রিন্ট') || q.includes('lamination') || q.includes('ল্যামিনেশন') || q.includes('binding') || q.includes('বাইন্ডিং') || q.includes('বিল')) {
      let count = 10;
      const numMatch = query.match(/(\d+)\s*(?:কপি|টা|টি|copy|pages?|page)?/i);
      if (numMatch && parseInt(numMatch[1], 10)) {
        count = parseInt(numMatch[1], 10);
      }

      const isColor = q.includes('color') || q.includes('কালার');
      const isLamination = q.includes('lamination') || q.includes('ল্যামিনেশন');
      const isBinding = q.includes('binding') || q.includes('বাইন্ডিং') || q.includes('স্পাইরাল');

      const printRate = isColor ? 10 : 3;
      const printTotal = count * printRate;
      const lamTotal = isLamination ? 20 : 0;
      const bindTotal = isBinding ? 40 : 0;
      const grandTotal = printTotal + lamTotal + bindTotal;

      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `📄 **জেরক্স ও প্রিন্ট হিসাব:**\n• ${isColor ? 'কালার প্রিন্ট' : 'B/W জেরক্স'} (${count} কপি @ ₹${printRate}): ₹${printTotal}\n${isLamination ? '• A4 ল্যামিনেশন (১ কপি): ₹২০\n' : ''}${isBinding ? '• স্পাইরাল বাইন্ডিং: ₹৪০\n' : ''}• **সর্বমোট বিল:** ₹${grandTotal}\n\nআপনি চাইলে এক ক্লিকে এই আইটেমগুলো সরাসরি বিলে যোগ করতে পারেন:`,
        timestamp: time,
        suggestedAction: {
          type: 'add_to_pos',
          label: `⚡ Add ₹${grandTotal} to POS Bill (সরাসরি বিলে যোগ করুন)`,
          totalAmount: grandTotal,
          items: [
            {
              id: isColor ? 'pr-col-print' : 'pos-xerox-bw',
              name: `${isColor ? 'Color Print' : 'B/W Xerox'} (${count} pages)`,
              price: printRate,
              quantity: count
            },
            ...(isLamination ? [{ id: 'pos-lam-a4', name: 'A4 Lamination (ল্যামিনেশন)', price: 20, quantity: 1 }] : []),
            ...(isBinding ? [{ id: 'pos-spiral-bind', name: 'Spiral Binding (বাইন্ডিং)', price: 40, quantity: 1 }] : [])
          ]
        }
      };
    }

    // 3. Learner Licence (LL) & Driving Licence Query
    if (q.includes('ll') || q.includes('licence') || q.includes('license') || q.includes('লাইসেন্স') || q.includes('driving') || q.includes('ড্রাইভিং')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `🚗 **Driving Learner Licence (LL) আবেদন তথ্য:**\n• **প্রয়োজনীয় ডকুমেন্টস:**\n  ১. বয়সের প্রমাণ (Aadhaar / মাধ্যমিক অ্যাডমিট)\n  ২. ঠিকানার প্রমাণ (Aadhaar / Voter ID)\n  ৩. পাসপোর্ট সাইজ ফটো ও সাদা কাগজে স্বাক্ষর (স্বাক্ষর ক্রপ করে আপলোড হবে)\n  ৪. ব্লাড গ্রুপ ও আধার লিঙ্ক মোবাইল নম্বর (OTP এর জন্য)\n• **মোট চার্জ:** সরকারি ফি + ফর্ম ফিলাপ + স্লট বুকিং = ₹৪৫০\n• **ডেলিভারি:** ১-২ কার্যদিবস (অনলাইন টেস্টের পর সরাসরি ডাউনলোড)`,
        timestamp: time,
        suggestedAction: {
          type: 'apply_service',
          label: '📝 Apply for Learner Licence (অনলাইনে আবেদন করুন)'
        }
      };
    }

    // 4. Passport Photo & Cropping Query
    if (q.includes('photo') || q.includes('ছবি') || q.includes('পাসপোর্ট') || q.includes('crop') || q.includes('ক্রপ')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `📸 **পাসপোর্ট সাইজ ফটো প্রিন্ট ও ক্রপার:**\n• **আকার (Size):** 3.5 cm x 4.5 cm (অফিসিয়াল পাসপোর্ট সাইজ)\n• **৮ কপি ইনস্ট্যান্ট কালার ফটো (Glossy Photo Paper):** মাত্র ₹৫০\n• **১৬ কপি ফটো প্যাক:** ₹৮০\n• **স্ট্যাম্প সাইজ (2.5 x 3.0 cm) ৪ কপি:** ₹৩০\n\n💡 আমাদের সিস্টেমে ছবি আপলোড করে **Crop** বাটনে ক্লিক করলেই মোবাইল বা কম্পিউটার থেকে নিখুঁত পাসপোর্ট সাইজে ক্রপ করে নেওয়া যায়!`,
        timestamp: time,
        suggestedAction: {
          type: 'add_to_pos',
          label: '⚡ Add 8 Copies Passport Photo (₹50) to Bill',
          totalAmount: 50,
          items: [{ id: 'pos-photo-8', name: 'Passport Photo (8 Copies / ৮ কপি ফটো)', price: 50, quantity: 1 }]
        }
      };
    }

    // 5. PAN Card Query
    if (q.includes('pan') || q.includes('প্যান')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `💳 **PAN Card (নতুন ও সংশোধন) বিবরণ:**\n• **নতুন প্যান কার্ড (Form 49A):** আধার কার্ড + ২ কপি ছবি + সিগনেচার। মোট ফি: ₹২২০\n• **প্যান কার্ড সংশোধন / কারেকশন:** পুরনো প্যান কপি + আধার লিঙ্ক। মোট ফি: ₹১৬০\n• **ইনস্ট্যান্ট ই-প্যান (Instant e-PAN):** আধার মোবাইল OTP দিয়ে ১ ঘণ্টায় প্রস্তুত। ফি: ₹১০০\n• **ডেলিভারি:** ফিজিক্যাল প্লাস্টিক PVC কার্ড ডাকযোগে বাড়িতে পৌঁছে যায়।`,
        timestamp: time,
        suggestedAction: {
          type: 'apply_service',
          label: '📝 Apply for PAN Card (প্যান কার্ড আবেদন করুন)'
        }
      };
    }

    // 6. Aadhaar Services & PVC Card
    if (q.includes('aadhaar') || q.includes('adhar') || q.includes('আধার')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `🆔 **Aadhaar সেবাসমূহ ও PVC কার্ড:**\n• **Aadhaar PVC প্লাস্টিক স্মার্ট কার্ড:** হাই-কোয়ালিটি ওয়াটারপ্রুফ কার্ড মাত্র ₹৬০\n• **আধার কার্ড ডাউনলোড ও কালার প্রিন্ট + ল্যামিনেশন:** ₹৩০\n• **ঠিকানা পরিবর্তন / অনলাইন আপডেট:** ₹১০০\n• **মোবাইল নম্বর লিঙ্কিং স্ট্যাটাস চেক:** বিনামূল্যে`,
        timestamp: time,
        suggestedAction: {
          type: 'apply_service',
          label: '📝 Order Aadhaar PVC Card (আধার স্মার্ট কার্ড)'
        }
      };
    }

    // 7. Voter Card Services
    if (q.includes('voter') || q.includes('ভোটার')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `🗳️ **Voter Card সেবাসমূহ:**\n• **নতুন ভোটার তালিকায় নাম তোলা (Form 6):** বয়স ১৮+ হলে আধার ও ছবি দিয়ে আবেদন। ফি: ₹৮০\n• **ভোটার কার্ড সংশোধন (Form 8):** নাম, বয়স, ছবি সংশোধন। ফি: ₹৮০\n• **Voter PVC স্মার্ট কার্ড প্রিন্ট:** মাত্র ₹৭০\n• **ডিজিটাল EPIC ডাউনলোড:** ₹৩০`,
        timestamp: time,
        suggestedAction: {
          type: 'apply_service',
          label: '📝 Apply for Voter Service (ভোটার সেবা আবেদন)'
        }
      };
    }

    // 8. Payment UPI & QR Code Query
    if (q.includes('qr') || q.includes('payment') || q.includes('পেমেন্ট') || q.includes('upi') || q.includes('number') || q.includes('নম্বর') || q.includes('টাকা') || q.includes('bank')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `📱 **AFRINA INTERNET CAFE পেমেন্ট ও যোগাযোগের তথ্য:**\n• **দোকানের নাম:** AFRINA INTERNET CAFE\n• **অপারেটর:** ABU KALAM SHEIKH\n• **মোবাইল:** 8609550430\n• **UPI ID:** 8609550430@ybl\n• **ঠিকানা:** BALI HATPARA NOWDA MSD 741156\n• গ্রাহক PhonePe, GPay, Paytm, BHIM দিয়ে সরাসরি পেমেন্ট করতে পারেন এবং পেমেন্ট স্লিপ ক্রপ করে আপলোড করতে পারেন।`,
        timestamp: time,
        suggestedAction: {
          type: 'show_qr',
          label: '📲 Show Shop Payment QR Code'
        }
      };
    }

    // 9. Rate Chart General Inquiry
    if (q.includes('rate') || q.includes('দাম') || q.includes('কত টাকা') || q.includes('খরচ') || q.includes('তালিকা') || q.includes('chart')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `📋 **AFRINA INTERNET CAFE প্রধান প্রধান সেবার রেট চার্ট:**\n• B/W জেরক্স: ₹৩ / পাতা\n• কালার প্রিন্ট: ₹১০ / পাতা\n• A4 ল্যামিনেশন: ₹২০\n• পাসপোর্ট ছবি (৮ কপি): ₹৫০\n• Aadhaar PVC কার্ড: ₹৬০\n• Voter PVC কার্ড: ₹৭০\n• নতুন PAN কার্ড: ₹২২০\n• ড্রাইভিং লার্নার লাইসেন্স (LL): ₹৪৫০\n• অনলাইন চাকরির ফর্ম ফিলাপ: ₹৮০`,
        timestamp: time,
        suggestedAction: {
          type: 'view_rates',
          label: '📜 Open Full Rate Chart (সম্পূর্ণ তালিকা দেখুন)'
        }
      };
    }

    // 10. Dynamic Match against any service in Rate Chart
    const matchedService = rateChart.find(r => 
      q.includes(r.serviceName.toLowerCase()) || 
      (r.serviceNameBn && q.includes(r.serviceNameBn.toLowerCase()))
    );

    if (matchedService) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `✅ **${matchedService.serviceName} (${matchedService.serviceNameBn || ''}):**\n• **মোট চার্জ:** ₹${matchedService.customerRate}\n${matchedService.govtFee ? `• সরকারি ফি: ₹${matchedService.govtFee}\n` : ''}• **সময়সীমা:** ${matchedService.durationDays || '১-২ কার্যদিবস'}\n• **প্রয়োজনীয় ডকুমেন্টস:** ${matchedService.requiredDocuments.join(', ')}`,
        timestamp: time,
        suggestedAction: {
          type: 'apply_service',
          label: `📝 Apply for ${matchedService.serviceName}`
        }
      };
    }

    // 11. Intelligent Default Guidance
    return {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: `আমি AFRINA INTERNET CAFE-র সব কাজ এবং জেরক্স হিসাব করতে পারি।\n\nআপনি আমাকে লিখতে পারেন:\n• "২০ কপি জেরক্স আর ১ টা ল্যামিনেশন কত?"\n• "LL ড্রাইভিং লাইসেন্স করতে কি লাগবে?"\n• "পাসপোর্ট ফটো ক্রপ সাইজ কি?"\n• "দোকানের পেমেন্ট QR কোড দেখাও"\n\nঅথবা নিচের বাটনে ক্লিক করে পুরো রেট চার্ট দেখে নিন:`,
      timestamp: time,
      suggestedAction: {
        type: 'view_rates',
        label: '📜 View Rate Chart (রেট চার্ট দেখুন)'
      }
    };
  };

  const handleActionClick = (action: ChatMessage['suggestedAction']) => {
    if (!action) return;

    if (action.type === 'add_to_pos' && action.items) {
      if (onAddToCart) {
        onAddToCart(action.items);
      } else {
        // Direct checkout to POS context
        directPosCheckout(
          action.items.map(it => ({
            productId: it.id,
            name: it.name,
            price: it.price,
            quantity: it.quantity,
            category: 'print_xerox'
          })),
          'cash',
          'Counter Customer'
        );
      }
      setAddedItemNotice(`যোগ করা হয়েছে: ${action.items.map(i => i.name).join(', ')} (₹${action.totalAmount})`);
      setTimeout(() => setAddedItemNotice(null), 3000);
    } else if (action.type === 'apply_service') {
      setActiveTab('portal');
      setIsOpen(false);
    } else if (action.type === 'view_rates') {
      setActiveTab('ratechart');
      setIsOpen(false);
    } else if (action.type === 'open_order') {
      openModal('newOrder');
    } else if (action.type === 'show_qr') {
      openModal('receipt');
    }
  };

  // If rendered as embedded tab inside POS
  if (isEmbedded) {
    return (
      <div className="flex flex-col h-[560px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Bot Header */}
        <div className="p-3.5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-sm">
              <Bot className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-white">Afrina Seva & Xerox AI Bot</h4>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-1.5 py-0.2 rounded font-mono">
                  Online
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Auto-bills Xerox, answers CSC questions, and adds directly to POS!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMessages([messages[0]])}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Reset Chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Action Notice Toast */}
        {addedItemNotice && (
          <div className="bg-emerald-950/90 border-b border-emerald-800/80 px-4 py-2 text-xs text-emerald-300 flex items-center gap-2 animate-in slide-in-from-top">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{addedItemNotice}</span>
          </div>
        )}

        {/* Message History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-cyan-600 text-white rounded-br-xs'
                    : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-bl-xs'
                }`}
              >
                <div className="whitespace-pre-line text-xs">{msg.text}</div>

                {msg.suggestedAction && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => handleActionClick(msg.suggestedAction)}
                      className="w-full py-2 px-3 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{msg.suggestedAction.label}</span>
                    </button>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 py-1.5 bg-slate-950/70 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(qp)}
              className="text-[10px] font-medium bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors shrink-0 cursor-pointer"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Type in Bangla or English (e.g. ১০ কপি জেরক্স আর ল্যামিনেশন কত?)..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm shadow-cyan-400/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Floating Widget Mode (Global on bottom right)
  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          title="Open AI Seva & Xerox Chatbot"
        >
          <div className="w-7 h-7 rounded-full bg-slate-950 text-cyan-300 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <span className="text-xs font-black tracking-tight pr-1">Afrina AI Bot</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950" />
          </span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-full max-w-sm sm:max-w-md h-[520px] rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center text-slate-950 font-bold shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Afrina Seva & Xerox AI Bot</h4>
                <p className="text-[10px] text-slate-400">
                  Instant Bengali/English Billing & CSC Assistant
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMessages([messages[0]])}
                className="p-1 rounded text-slate-400 hover:text-white"
                title="Reset Chat"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if (onClose) onClose();
                }}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Notice */}
          {addedItemNotice && (
            <div className="bg-emerald-950/90 border-b border-emerald-800/80 px-3 py-1.5 text-xs text-emerald-300 flex items-center gap-1.5 animate-in slide-in-from-top">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-medium text-[11px] truncate">{addedItemNotice}</span>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs bg-slate-900/60">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3 py-2 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-cyan-600 text-white rounded-br-xs'
                      : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-bl-xs'
                  }`}
                >
                  <div className="whitespace-pre-line text-xs">{msg.text}</div>

                  {msg.suggestedAction && (
                    <div className="mt-2 pt-2 border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={() => handleActionClick(msg.suggestedAction)}
                        className="w-full py-1.5 px-2.5 text-[11px] font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{msg.suggestedAction.label}</span>
                      </button>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-slate-500 mt-0.5 px-1">{msg.timestamp}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt chips */}
          <div className="px-2.5 py-1 bg-slate-950/80 border-t border-slate-800/80 flex items-center gap-1 overflow-x-auto scrollbar-none">
            {quickPrompts.slice(0, 3).map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(qp)}
                className="text-[10px] bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-2.5 bg-slate-950 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                placeholder="Ask in Bengali or English..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold transition-all disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
