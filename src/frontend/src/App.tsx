import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "./backend";
import type { GalleryPhoto, GalleryVideo, Person } from "./backend.d";
import { useActor } from "./hooks/useActor";

// ─── Data ──────────────────────────────────────────────────────────────────

const INITIAL_NEWS = [
  {
    id: 6,
    title: "गाँव में बेसी शुरू — 23 से",
    body: "इस वर्ष गाँव में बेसी 23 तारीख से शुरू हो रही है। बेसी 11 दिन की होती है, लेकिन दिन और रात दोनों को मिलाकर गिनने के कारण यह 22 हो जाती है — इसीलिए इसे 'बेसी' कहा जाता है। सभी ग्रामवासियों से अनुरोध है कि इसमें बढ़-चढ़कर हिस्सा लें।",
    date: "16 मार्च 2026",
    tag: "उत्सव",
  },
];

type MarketItem = {
  id: number;
  item: string;
  price: string;
  change: string;
  trend: string;
  seller?: string;
  phone?: string;
  isUserAdded?: boolean;
};

const INITIAL_MARKET_PRICES: MarketItem[] = [
  { id: 1, item: "आलू", price: "₹20/किग्रा", change: "↓", trend: "down" },
  { id: 2, item: "टमाटर", price: "₹35/किग्रा", change: "↑", trend: "up" },
  { id: 3, item: "प्याज", price: "₹28/किग्रा", change: "→", trend: "stable" },
  { id: 4, item: "गेहूँ", price: "₹22/किग्रा", change: "↑", trend: "up" },
  { id: 5, item: "चावल", price: "₹42/किग्रा", change: "→", trend: "stable" },
  { id: 6, item: "मक्का", price: "₹18/किग्रा", change: "↓", trend: "down" },
  { id: 7, item: "सरसों", price: "₹55/किग्रा", change: "↑", trend: "up" },
  { id: 8, item: "दाल (मूँग)", price: "₹95/किग्रा", change: "→", trend: "stable" },
  { id: 9, item: "गोभी", price: "₹15/किग्रा", change: "↓", trend: "down" },
  { id: 10, item: "बैंगन", price: "₹25/किग्रा", change: "→", trend: "stable" },
];

const SERVICES = [
  {
    name: "प्राथमिक स्वास्थ्य केंद्र",
    phone: "01234-567890",
    timing: "सुबह 8 - दोपहर 2",
    icon: "🏥",
  },
  {
    name: "सरकारी प्राथमिक विद्यालय",
    phone: "01234-567891",
    timing: "सुबह 7 - दोपहर 1",
    icon: "🏫",
  },
  {
    name: "उचित मूल्य की दुकान",
    phone: "01234-567892",
    timing: "सुबह 9 - शाम 5",
    icon: "🏪",
  },
  {
    name: "ग्राम पंचायत कार्यालय",
    phone: "9917892601",
    timing: "सुबह 10 - शाम 4",
    icon: "🏛️",
  },
  {
    name: "स्टेट बैंक ऑफ इंडिया",
    phone: "01234-567894",
    timing: "सुबह 10 - दोपहर 2",
    icon: "🏦",
  },
  {
    name: "डाकघर",
    phone: "01234-567895",
    timing: "सुबह 9 - शाम 5",
    icon: "📮",
  },
  {
    name: "कृषि सेवा केंद्र",
    phone: "01234-567896",
    timing: "सुबह 9 - शाम 6",
    icon: "🌾",
  },
  {
    name: "पशु चिकित्सालय",
    phone: "01234-567897",
    timing: "सुबह 8 - दोपहर 1",
    icon: "🐄",
  },
];

const PHOTOS = [
  { id: 1, title: "गाँव का मंदिर", emoji: "🛕", color: "#e8d5b7" },
  { id: 2, title: "हरे-भरे खेत", emoji: "🌾", color: "#c8e6c9" },
  { id: 3, title: "गाँव का तालाब", emoji: "💧", color: "#b3e5fc" },
  { id: 4, title: "पंचायत भवन", emoji: "🏛️", color: "#f8bbd0" },
  { id: 5, title: "होली उत्सव", emoji: "🎨", color: "#ffe0b2" },
  { id: 6, title: "फसल कटाई", emoji: "🌻", color: "#f9fbe7" },
  { id: 7, title: "बैल-गाड़ी परेड", emoji: "🐂", color: "#fce4ec" },
  { id: 8, title: "ग्राम सभा", emoji: "👨‍👩‍👧‍👦", color: "#e1bee7" },
  { id: 9, title: "सूर्योदय", emoji: "🌅", color: "#fff9c4" },
];

const EMERGENCY = [
  { name: "पुलिस", number: "100", icon: "👮", color: "#1565c0", isFixed: true },
  { name: "एम्बुलेंस", number: "108", icon: "🚑", color: "#c62828", isFixed: true },
  {
    name: "अग्निशमन",
    number: "101",
    icon: "🚒",
    color: "#e65100",
    isFixed: true,
  },
  { name: "सरपंच", number: "98765-43210", icon: "👳", color: "#2D5016" },
  {
    name: "प्राथमिक स्वास्थ्य केंद्र",
    number: "01234-567890",
    icon: "🏥",
    color: "#00695c",
  },
  { name: "बिजली विभाग", number: "1912", icon: "⚡", color: "#f57f17" },
  { name: "ग्राम प्रधान", number: "98765-12345", icon: "🧑‍💼", color: "#4a148c" },
  { name: "जल निगम", number: "1800-180-5555", icon: "💧", color: "#01579b" },
  { name: "ग्राम पंचायत", number: "9917892601", icon: "🏛️", color: "#2D5016" },
];

const TAG_COLORS: Record<string, string> = {
  पंचायत: "#2D5016",
  विकास: "#1565c0",
  कृषि: "#f5a623",
  स्वास्थ्य: "#00695c",
  उत्सव: "#c62828",
};

// ─── Custom Village Logo SVG ────────────────────────────────────────────────

function VillageLogo() {
  return (
    <svg
      role="img"
      width="120"
      height="120"
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="बिष्ट गाँव जैन क्रांश logo"
    >
      <defs>
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4a7c26" />
          <stop offset="100%" stopColor="#2D5016" />
        </radialGradient>
        <radialGradient id="glowGrad" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#6aaa30" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#2D5016" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="58" fill="url(#bgGrad)" />
      <circle cx="60" cy="60" r="58" fill="url(#glowGrad)" />
      <circle
        cx="60"
        cy="60"
        r="58"
        fill="none"
        stroke="#f5a623"
        strokeWidth="2.5"
        strokeDasharray="4 3"
      />
      <circle
        cx="60"
        cy="60"
        r="52"
        fill="none"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="1"
      />
      <rect x="56" y="62" width="8" height="22" rx="2" fill="#8B5E3C" />
      <ellipse cx="60" cy="62" rx="20" ry="12" fill="#5aad2e" />
      <ellipse cx="60" cy="52" rx="16" ry="12" fill="#4a9c22" />
      <ellipse cx="60" cy="40" rx="11" ry="10" fill="#3d8a18" />
      <ellipse cx="60" cy="30" rx="6" ry="7" fill="#2d7010" />
      <line
        x1="22"
        y1="90"
        x2="22"
        y2="55"
        stroke="#f5a623"
        strokeWidth="1.8"
      />
      <ellipse cx="22" cy="52" rx="4" ry="6" fill="#f5a623" />
      <line
        x1="22"
        y1="65"
        x2="16"
        y2="58"
        stroke="#f5a623"
        strokeWidth="1.2"
      />
      <ellipse cx="14" cy="56" rx="3" ry="5" fill="#e8951a" />
      <line
        x1="22"
        y1="70"
        x2="29"
        y2="63"
        stroke="#f5a623"
        strokeWidth="1.2"
      />
      <ellipse cx="30" cy="61" rx="3" ry="5" fill="#e8951a" />
      <line
        x1="98"
        y1="90"
        x2="98"
        y2="55"
        stroke="#f5a623"
        strokeWidth="1.8"
      />
      <ellipse cx="98" cy="52" rx="4" ry="6" fill="#f5a623" />
      <line
        x1="98"
        y1="65"
        x2="91"
        y2="58"
        stroke="#f5a623"
        strokeWidth="1.2"
      />
      <ellipse cx="90" cy="56" rx="3" ry="5" fill="#e8951a" />
      <line
        x1="98"
        y1="70"
        x2="105"
        y2="63"
        stroke="#f5a623"
        strokeWidth="1.2"
      />
      <ellipse cx="106" cy="61" rx="3" ry="5" fill="#e8951a" />
      <line
        x1="32"
        y1="90"
        x2="32"
        y2="62"
        stroke="#f5a623"
        strokeWidth="1.5"
      />
      <ellipse cx="32" cy="59" rx="3" ry="5" fill="#f5a623" />
      <line x1="32" y1="72" x2="26" y2="66" stroke="#f5a623" strokeWidth="1" />
      <ellipse cx="25" cy="64" rx="2.5" ry="4" fill="#e8951a" />
      <line
        x1="88"
        y1="90"
        x2="88"
        y2="62"
        stroke="#f5a623"
        strokeWidth="1.5"
      />
      <ellipse cx="88" cy="59" rx="3" ry="5" fill="#f5a623" />
      <line x1="88" y1="72" x2="94" y2="66" stroke="#f5a623" strokeWidth="1" />
      <ellipse cx="95" cy="64" rx="2.5" ry="4" fill="#e8951a" />
      <path
        d="M 15 90 Q 60 86 105 90"
        stroke="rgba(255,220,100,0.5)"
        strokeWidth="1.5"
        fill="none"
      />
      <rect
        x="47"
        y="80"
        width="26"
        height="14"
        rx="1"
        fill="rgba(255,255,255,0.85)"
      />
      <polygon points="44,80 60,68 76,80" fill="rgba(255,220,100,0.9)" />
      <rect x="57" y="86" width="6" height="8" rx="1" fill="#8B5E3C" />
      <rect
        x="49"
        y="83"
        width="5"
        height="5"
        rx="0.5"
        fill="rgba(100,200,255,0.8)"
      />
      <rect
        x="66"
        y="83"
        width="5"
        height="5"
        rx="0.5"
        fill="rgba(100,200,255,0.8)"
      />
      <circle cx="20" cy="22" r="1.5" fill="rgba(255,220,100,0.8)" />
      <circle cx="100" cy="22" r="1.5" fill="rgba(255,220,100,0.8)" />
      <circle cx="14" cy="35" r="1" fill="rgba(255,220,100,0.6)" />
      <circle cx="106" cy="35" r="1" fill="rgba(255,220,100,0.6)" />
    </svg>
  );
}

// ─── Tab Navigation ─────────────────────────────────────────────────────────

type Tab =
  | "home"
  | "news"
  | "market"
  | "services"
  | "photos"
  | "emergency"
  | "people";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "home", label: "होम", icon: "🏡" },
  { id: "news", label: "खबरें", icon: "📰" },
  { id: "market", label: "बाजार", icon: "🛒" },
  { id: "services", label: "सेवाएँ", icon: "🏛️" },
  { id: "photos", label: "फोटो", icon: "📷" },
  { id: "emergency", label: "आपातकाल", icon: "🆘" },
  { id: "people", label: "लोग", icon: "👥" },
];

// ─── Page Components ─────────────────────────────────────────────────────────

const INITIAL_QUICK_SERVICES = [
  { id: 1, label: "राशन कार्ड", icon: "📋" },
  { id: 2, label: "जन्म प्रमाण", icon: "📜" },
  { id: 3, label: "आय प्रमाण", icon: "💼" },
  { id: 4, label: "नरेगा", icon: "⛏️" },
  { id: 5, label: "पेंशन", icon: "👴" },
  { id: 6, label: "वृक्षारोपण", icon: "🌳" },
];

function HomePage() {
  const [quickServices, setQuickServices] = useState(INITIAL_QUICK_SERVICES);
  const [qsEditIdx, setQsEditIdx] = useState<number | null>(null);
  const [qsEditLabel, setQsEditLabel] = useState("");
  const [qsEditIcon, setQsEditIcon] = useState("");
  const [qsAddOpen, setQsAddOpen] = useState(false);
  const [qsNewLabel, setQsNewLabel] = useState("");
  const [qsNewIcon, setQsNewIcon] = useState("");
  const [qsNextId, setQsNextId] = useState(7);

  return (
    <div className="flex flex-col items-center gap-6 pb-4">
      <div
        className="w-full flex flex-col items-center py-8 px-4 text-white"
        style={{
          background:
            "linear-gradient(160deg, #2D5016 0%, #4a7c26 60%, #5d9a2e 100%)",
          borderRadius: "0 0 32px 32px",
        }}
      >
        <VillageLogo />
        <h1
          className="mt-4 text-2xl font-bold text-center"
          style={{
            fontFamily: "'Tiro Devanagari Hindi', serif",
            textShadow: "0 1px 4px rgba(0,0,0,0.3)",
          }}
        >
          बिष्ट गाँव जैन क्रांश
        </h1>
        <p className="text-sm mt-1 opacity-80">बिश्ट गाँव जैन क्रांश</p>
        <p className="text-xs mt-2 opacity-70 text-center px-4">
          हमारा गाँव, हमारी पहचान — एकता, सेवा और समृद्धि
        </p>
      </div>

      <div className="w-full px-4">
        <div
          className="rounded-2xl p-4"
          style={{
            background: "linear-gradient(135deg, #c62828 0%, #e53935 100%)",
            border: "1px solid #ef9a9a",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🎉</span>
            <span className="text-white font-bold text-base">
              गाँव में बेसी शुरू!
            </span>
          </div>
          <p className="text-white text-xs leading-relaxed opacity-90">
            23 तारीख से गाँव में बेसी शुरू हो रही है। बेसी 11 दिन की होती है, लेकिन दिन और
            रात दोनों मिलाकर गिनने से 22 हो जाती है — इसीलिए इसे{" "}
            <strong>"बेसी"</strong> कहते हैं।
          </p>
        </div>
      </div>

      <div className="w-full px-4">
        <h2
          className="text-base font-semibold mb-3"
          style={{ color: "#2D5016" }}
        >
          गाँव की जानकारी
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "जनसंख्या", value: "131", icon: "👥" },
            { label: "क्षेत्रफल", value: "33.9 हेक्टेयर", icon: "🗺️" },
            { label: "घर", value: "30", icon: "🏠" },
            { label: "साक्षरता", value: "78%", icon: "📚" },
          ].map((stat) => (
            <Card
              key={stat.label}
              className="card-hover"
              style={{ borderColor: "#c8ddb2" }}
            >
              <CardContent className="p-3 flex items-center gap-3">
                <span className="text-2xl">{stat.icon}</span>
                <div>
                  <p className="text-xs" style={{ color: "#5a7a40" }}>
                    {stat.label}
                  </p>
                  <p className="font-bold text-sm" style={{ color: "#2D5016" }}>
                    {stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="w-full px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold" style={{ color: "#2D5016" }}>
            त्वरित सेवाएँ
          </h2>
          <button
            type="button"
            data-ocid="quick_services.open_modal_button"
            className="text-xs px-2 py-1 rounded-lg font-medium"
            style={{ background: "#2D5016", color: "white" }}
            onClick={() => {
              setQsNewLabel("");
              setQsNewIcon("");
              setQsAddOpen(true);
            }}
          >
            + जोड़ें
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {quickServices.map((svc, idx) => (
            <div
              key={svc.id}
              data-ocid={`quick_services.item.${idx + 1}`}
              className="relative flex flex-col items-center gap-1 p-3 rounded-xl"
              style={{
                background: "rgba(45,80,22,0.07)",
                border: "1px solid #c8ddb2",
              }}
            >
              <button
                type="button"
                data-ocid={`quick_services.edit_button.${idx + 1}`}
                className="absolute top-1 right-1 text-xs px-1 rounded"
                style={{ color: "#2D5016", background: "transparent" }}
                onClick={() => {
                  setQsEditIdx(idx);
                  setQsEditLabel(svc.label);
                  setQsEditIcon(svc.icon);
                }}
                title="संपादित करें"
              >
                ✏️
              </button>
              <button
                type="button"
                data-ocid={`quick_services.delete_button.${idx + 1}`}
                className="absolute top-1 left-1 text-xs px-1 rounded"
                style={{ color: "#c62828", background: "transparent" }}
                onClick={() =>
                  setQuickServices(quickServices.filter((_, i) => i !== idx))
                }
                title="हटाएँ"
              >
                ✕
              </button>
              <span className="text-2xl mt-2">{svc.icon}</span>
              <span
                className="text-xs text-center"
                style={{ color: "#2D5016" }}
              >
                {svc.label}
              </span>
            </div>
          ))}
        </div>

        {/* Edit dialog */}
        <Dialog
          open={qsEditIdx !== null}
          onOpenChange={(o) => {
            if (!o) setQsEditIdx(null);
          }}
        >
          <DialogContent data-ocid="quick_services.dialog">
            <DialogHeader>
              <DialogTitle>सेवा संपादित करें</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3 mt-2">
              <div>
                <Label>आइकन (emoji)</Label>
                <Input
                  data-ocid="quick_services.icon.input"
                  value={qsEditIcon}
                  onChange={(e) => setQsEditIcon(e.target.value)}
                  placeholder="जैसे: 📋"
                />
              </div>
              <div>
                <Label>सेवा का नाम</Label>
                <Input
                  data-ocid="quick_services.label.input"
                  value={qsEditLabel}
                  onChange={(e) => setQsEditLabel(e.target.value)}
                  placeholder="सेवा का नाम"
                />
              </div>
              <Button
                data-ocid="quick_services.save_button"
                disabled={!qsEditLabel.trim()}
                onClick={() => {
                  if (qsEditIdx === null) return;
                  const updated = [...quickServices];
                  updated[qsEditIdx] = {
                    ...updated[qsEditIdx],
                    label: qsEditLabel.trim(),
                    icon: qsEditIcon.trim() || updated[qsEditIdx].icon,
                  };
                  setQuickServices(updated);
                  setQsEditIdx(null);
                }}
                style={{ background: "#2D5016" }}
              >
                सहेजें
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add dialog */}
        <Dialog open={qsAddOpen} onOpenChange={setQsAddOpen}>
          <DialogContent data-ocid="quick_services.add.dialog">
            <DialogHeader>
              <DialogTitle>नई सेवा जोड़ें</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3 mt-2">
              <div>
                <Label>आइकन (emoji)</Label>
                <Input
                  data-ocid="quick_services.new_icon.input"
                  value={qsNewIcon}
                  onChange={(e) => setQsNewIcon(e.target.value)}
                  placeholder="जैसे: 🏥"
                />
              </div>
              <div>
                <Label>सेवा का नाम</Label>
                <Input
                  data-ocid="quick_services.new_label.input"
                  value={qsNewLabel}
                  onChange={(e) => setQsNewLabel(e.target.value)}
                  placeholder="सेवा का नाम लिखें"
                />
              </div>
              <Button
                data-ocid="quick_services.add.submit_button"
                disabled={!qsNewLabel.trim()}
                onClick={() => {
                  setQuickServices([
                    ...quickServices,
                    {
                      id: qsNextId,
                      label: qsNewLabel.trim(),
                      icon: qsNewIcon.trim() || "📌",
                    },
                  ]);
                  setQsNextId(qsNextId + 1);
                  setQsAddOpen(false);
                }}
                style={{ background: "#2D5016" }}
              >
                जोड़ें
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="w-full px-4">
        <h2
          className="text-base font-semibold mb-3"
          style={{ color: "#2D5016" }}
        >
          ताजा खबर
        </h2>
        <Card
          style={{ borderLeft: "4px solid #c62828", borderColor: "#c8ddb2" }}
        >
          <CardContent className="p-3">
            <p className="text-xs font-semibold" style={{ color: "#c62828" }}>
              उत्सव
            </p>
            <p
              className="text-sm font-bold mt-0.5"
              style={{ color: "#2D5016" }}
            >
              गाँव में बेसी शुरू — 23 से
            </p>
            <p className="text-xs mt-1" style={{ color: "#5a7a40" }}>
              23 से गाँव में बेसी शुरू हो रही है। बेसी 11 दिन की होती है, दिन-रात मिलाकर
              22 — इसीलिए इसे बेसी कहते हैं।
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function NewsPage() {
  const [newsList, setNewsList] = useState(INITIAL_NEWS);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState("");

  function handleAdd() {
    if (!title.trim() || !body.trim()) return;
    const today = new Date();
    const months = [
      "जनवरी",
      "फरवरी",
      "मार्च",
      "अप्रैल",
      "मई",
      "जून",
      "जुलाई",
      "अगस्त",
      "सितंबर",
      "अक्टूबर",
      "नवंबर",
      "दिसंबर",
    ];
    const dateStr = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
    setNewsList((prev) => [
      {
        id: Date.now(),
        title: title.trim(),
        body: body.trim(),
        tag: tag.trim() || "सामान्य",
        date: dateStr,
      },
      ...prev,
    ]);
    setTitle("");
    setBody("");
    setTag("");
    setOpen(false);
    toast.success("खबर जोड़ दी गई!");
  }

  return (
    <div className="px-4 py-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2
          className="text-lg font-bold"
          style={{
            color: "#2D5016",
            fontFamily: "'Tiro Devanagari Hindi', serif",
          }}
        >
          गाँव की खबरें
        </h2>
        <Button
          size="sm"
          data-ocid="news.open_modal_button"
          onClick={() => setOpen(true)}
          style={{ background: "#2D5016", color: "white" }}
        >
          + खबर जोड़ें
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle
              style={{
                color: "#2D5016",
                fontFamily: "'Tiro Devanagari Hindi', serif",
              }}
            >
              नई खबर जोड़ें
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-1">
            <div>
              <Label
                className="text-xs mb-1 block"
                style={{ color: "#4a5a30" }}
              >
                शीर्षक *
              </Label>
              <Input
                data-ocid="news.title.input"
                placeholder="खबर का शीर्षक लिखें"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <Label
                className="text-xs mb-1 block"
                style={{ color: "#4a5a30" }}
              >
                विवरण *
              </Label>
              <Textarea
                data-ocid="news.body.textarea"
                placeholder="खबर का विवरण लिखें"
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
            <div>
              <Label
                className="text-xs mb-1 block"
                style={{ color: "#4a5a30" }}
              >
                टैग (जैसे: उत्सव, पंचायत, विकास)
              </Label>
              <Input
                data-ocid="news.tag.input"
                placeholder="उत्सव, पंचायत, विकास..."
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              />
            </div>
            <Button
              data-ocid="news.submit_button"
              onClick={handleAdd}
              disabled={!title.trim() || !body.trim()}
              style={{ background: "#2D5016", color: "white" }}
            >
              खबर प्रकाशित करें
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {newsList.map((item, idx) => (
        <Card
          key={item.id}
          data-ocid={`news.item.${idx + 1}`}
          className="card-hover"
          style={{ borderLeft: "4px solid #2D5016", borderColor: "#c8ddb2" }}
        >
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center justify-between">
              <Badge
                style={{
                  backgroundColor: TAG_COLORS[item.tag] ?? "#2D5016",
                  color: "white",
                  fontSize: "0.65rem",
                }}
              >
                {item.tag}
              </Badge>
              <span className="text-xs" style={{ color: "#8a9a70" }}>
                {item.date}
              </span>
            </div>
            <CardTitle className="text-sm mt-2" style={{ color: "#2D5016" }}>
              {item.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <p className="text-xs leading-relaxed" style={{ color: "#4a5a30" }}>
              {item.body}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function MarketPage() {
  const [prices, setPrices] = useState<MarketItem[]>(INITIAL_MARKET_PRICES);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    seller: "",
    item: "",
    price: "",
    phone: "",
  });
  const [nextId, setNextId] = useState(11);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState("");

  function handleAdd() {
    if (!form.seller.trim() || !form.item.trim() || !form.price.trim()) return;
    const newItem: MarketItem = {
      id: nextId,
      item: form.item.trim(),
      price: form.price.trim(),
      change: "🆕",
      trend: "stable",
      seller: form.seller.trim(),
      phone: form.phone.trim() || undefined,
      isUserAdded: true,
    };
    setPrices((prev) => [newItem, ...prev]);
    setNextId((n) => n + 1);
    setForm({ seller: "", item: "", price: "", phone: "" });
    setDialogOpen(false);
    toast.success("उत्पाद जोड़ा गया!");
  }

  function handleDelete(id: number) {
    setPrices((prev) => prev.filter((p) => p.id !== id));
  }

  function handleEditOpen(row: MarketItem) {
    setEditId(row.id);
    setEditPrice(row.price);
    setEditDialogOpen(true);
  }

  function handleEditSave() {
    if (!editPrice.trim() || editId === null) return;
    setPrices((prev) =>
      prev.map((p) =>
        p.id === editId ? { ...p, price: editPrice.trim() } : p,
      ),
    );
    setEditDialogOpen(false);
    setEditId(null);
    setEditPrice("");
    toast.success("भाव अपडेट हुआ!");
  }

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-1">
        <h2
          className="text-lg font-bold"
          style={{
            color: "#2D5016",
            fontFamily: "'Tiro Devanagari Hindi', serif",
          }}
        >
          बाजार भाव
        </h2>
        <button
          type="button"
          data-ocid="market.add_button"
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-1 text-white text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{ background: "#2D5016" }}
        >
          + उत्पाद जोड़ें
        </button>
      </div>
      <p className="text-xs mb-4" style={{ color: "#8a9a70" }}>
        आज के ताजा बाजार भाव — 16 मार्च 2026
      </p>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          data-ocid="market.add_product.dialog"
          className="mx-4 rounded-2xl"
        >
          <DialogHeader>
            <DialogTitle
              style={{
                color: "#2D5016",
                fontFamily: "'Tiro Devanagari Hindi', serif",
              }}
            >
              नया उत्पाद जोड़ें
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-1">
            <div>
              <Label
                className="text-xs mb-1 block"
                style={{ color: "#2D5016" }}
              >
                विक्रेता का नाम *
              </Label>
              <Input
                data-ocid="market.seller_name.input"
                placeholder="जैसे: रामलाल यादव"
                value={form.seller}
                onChange={(e) =>
                  setForm((f) => ({ ...f, seller: e.target.value }))
                }
              />
            </div>
            <div>
              <Label
                className="text-xs mb-1 block"
                style={{ color: "#2D5016" }}
              >
                उत्पाद का नाम *
              </Label>
              <Input
                data-ocid="market.product_name.input"
                placeholder="जैसे: आलू, टमाटर, दूध"
                value={form.item}
                onChange={(e) =>
                  setForm((f) => ({ ...f, item: e.target.value }))
                }
              />
            </div>
            <div>
              <Label
                className="text-xs mb-1 block"
                style={{ color: "#2D5016" }}
              >
                मूल्य *
              </Label>
              <Input
                data-ocid="market.price.input"
                placeholder="जैसे: ₹20/किग्रा"
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: e.target.value }))
                }
              />
            </div>
            <div>
              <Label
                className="text-xs mb-1 block"
                style={{ color: "#2D5016" }}
              >
                फोन नंबर (वैकल्पिक)
              </Label>
              <Input
                data-ocid="market.phone.input"
                placeholder="जैसे: 9876543210"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                type="tel"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                data-ocid="market.submit_button"
                onClick={handleAdd}
                disabled={
                  !form.seller.trim() || !form.item.trim() || !form.price.trim()
                }
                className="flex-1 text-white font-semibold py-2 rounded-xl text-sm disabled:opacity-50"
                style={{ background: "#2D5016" }}
              >
                जोड़ें
              </button>
              <button
                type="button"
                data-ocid="market.cancel_button"
                onClick={() => {
                  setDialogOpen(false);
                  setForm({ seller: "", item: "", price: "", phone: "" });
                }}
                className="flex-1 font-semibold py-2 rounded-xl text-sm border"
                style={{ borderColor: "#c8ddb2", color: "#2D5016" }}
              >
                रद्द करें
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent
          data-ocid="market.edit_price.dialog"
          className="mx-4 rounded-2xl"
        >
          <DialogHeader>
            <DialogTitle
              style={{
                color: "#2D5016",
                fontFamily: "'Tiro Devanagari Hindi', serif",
              }}
            >
              भाव अपडेट करें
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-1">
            <div>
              <Label
                className="text-xs mb-1 block"
                style={{ color: "#2D5016" }}
              >
                नया मूल्य *
              </Label>
              <Input
                data-ocid="market.edit_price.input"
                placeholder="जैसे: ₹25/किग्रा"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                data-ocid="market.edit_price.save_button"
                onClick={handleEditSave}
                disabled={!editPrice.trim()}
                className="flex-1 text-white font-semibold py-2 rounded-xl text-sm disabled:opacity-50"
                style={{ background: "#2D5016" }}
              >
                सहेजें
              </button>
              <button
                type="button"
                data-ocid="market.edit_price.cancel_button"
                onClick={() => setEditDialogOpen(false)}
                className="flex-1 font-semibold py-2 rounded-xl text-sm border"
                style={{ borderColor: "#c8ddb2", color: "#2D5016" }}
              >
                रद्द करें
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid #c8ddb2" }}
      >
        <div
          className="grid grid-cols-3 px-4 py-2 text-xs font-semibold text-white"
          style={{ background: "#2D5016" }}
        >
          <span>वस्तु / विक्रेता</span>
          <span className="text-center">मूल्य</span>
          <span className="text-right">बदलाव</span>
        </div>
        {prices.map((row, idx) => (
          <div
            key={row.id}
            data-ocid={`market.item.${idx + 1}`}
            className="grid grid-cols-3 px-4 py-3 text-sm items-center"
            style={{
              background: idx % 2 === 0 ? "#faf8f0" : "#f3f0e4",
              borderTop: "1px solid #e8e4d4",
            }}
          >
            <div>
              <div className="flex items-center gap-1">
                <span
                  style={{
                    color: "#2D5016",
                    fontWeight: row.isUserAdded ? 600 : 400,
                  }}
                >
                  {row.item}
                </span>
                {row.isUserAdded && (
                  <span
                    className="text-white text-[9px] font-bold px-1 rounded"
                    style={{ background: "#5a7a40" }}
                  >
                    नया
                  </span>
                )}
              </div>
              {row.seller && (
                <div
                  className="text-[10px] mt-0.5"
                  style={{ color: "#8a9a70" }}
                >
                  👤 {row.seller}
                  {row.phone ? ` · ${row.phone}` : ""}
                </div>
              )}
            </div>
            <span
              className="text-center font-semibold"
              style={{ color: "#2D5016" }}
            >
              {row.price}
            </span>
            <div className="flex items-center justify-end gap-1">
              <span
                className="font-bold text-base"
                style={{
                  color:
                    row.trend === "up"
                      ? "#c62828"
                      : row.trend === "down"
                        ? "#1565c0"
                        : "#5a7a40",
                }}
              >
                {row.change}
              </span>
              <button
                type="button"
                data-ocid={`market.edit_button.${idx + 1}`}
                onClick={() => handleEditOpen(row)}
                className="text-xs opacity-60 hover:opacity-100 ml-1"
                title="भाव बदलें"
              >
                ✏️
              </button>
              {row.isUserAdded && (
                <button
                  type="button"
                  data-ocid={`market.delete_button.${idx + 1}`}
                  onClick={() => handleDelete(row.id)}
                  className="text-xs text-red-400 hover:text-red-600 ml-1"
                  title="हटाएं"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs mt-3 text-center" style={{ color: "#8a9a70" }}>
        * भाव प्रतिदिन अपडेट किए जाते हैं
      </p>
    </div>
  );
}

function ServicesPage() {
  const [services, setServices] = useState(SERVICES);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editTiming, setEditTiming] = useState("");

  function openEdit(idx: number) {
    setEditIdx(idx);
    setEditName(services[idx].name);
    setEditPhone(services[idx].phone);
    setEditTiming(services[idx].timing);
  }

  function saveEdit() {
    if (editIdx === null) return;
    setServices((prev) =>
      prev.map((s, i) =>
        i === editIdx
          ? { ...s, name: editName, phone: editPhone, timing: editTiming }
          : s,
      ),
    );
    setEditIdx(null);
  }

  return (
    <div className="px-4 py-4 flex flex-col gap-3">
      <h2
        className="text-lg font-bold"
        style={{
          color: "#2D5016",
          fontFamily: "'Tiro Devanagari Hindi', serif",
        }}
      >
        सरकारी सेवाएँ
      </h2>
      {services.map((svc, idx) => (
        <Card
          key={svc.name}
          data-ocid={`services.item.${idx + 1}`}
          className="card-hover"
          style={{ borderColor: "#c8ddb2" }}
        >
          <CardContent className="p-3 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xl"
              style={{ background: "rgba(45,80,22,0.1)" }}
            >
              {svc.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="font-semibold text-sm truncate"
                style={{ color: "#2D5016" }}
              >
                {svc.name}
              </p>
              <p className="text-xs" style={{ color: "#5a7a40" }}>
                📞 {svc.phone}
              </p>
              <p className="text-xs" style={{ color: "#8a9a70" }}>
                ⏰ {svc.timing}
              </p>
            </div>
            <button
              type="button"
              data-ocid={`services.edit_button.${idx + 1}`}
              onClick={() => openEdit(idx)}
              className="text-sm opacity-60 hover:opacity-100 transition-opacity p-1 rounded"
              title="संपादित करें"
            >
              ✏️
            </button>
          </CardContent>
        </Card>
      ))}

      <Dialog
        open={editIdx !== null}
        onOpenChange={(o) => !o && setEditIdx(null)}
      >
        <DialogContent
          data-ocid="services.edit.dialog"
          className="max-w-sm mx-4"
        >
          <DialogHeader>
            <DialogTitle
              style={{
                color: "#2D5016",
                fontFamily: "'Tiro Devanagari Hindi', serif",
              }}
            >
              सेवा संपादित करें
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-2">
            <div>
              <Label
                className="text-xs mb-1 block"
                style={{ color: "#2D5016" }}
              >
                नाम
              </Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div>
              <Label
                className="text-xs mb-1 block"
                style={{ color: "#2D5016" }}
              >
                फोन
              </Label>
              <Input
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
              />
            </div>
            <div>
              <Label
                className="text-xs mb-1 block"
                style={{ color: "#2D5016" }}
              >
                समय
              </Label>
              <Input
                value={editTiming}
                onChange={(e) => setEditTiming(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditIdx(null)}
              >
                रद्द करें
              </Button>
              <Button
                size="sm"
                onClick={saveEdit}
                style={{ background: "#2D5016" }}
              >
                सहेजें
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type PhotoItem = (typeof PHOTOS)[number];
type SelectedPhoto =
  | { kind: "static"; photo: PhotoItem }
  | { kind: "uploaded"; photo: GalleryPhoto }
  | { kind: "video"; photo: GalleryVideo };

function PhotosPage() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<SelectedPhoto | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [activeGalleryTab, setActiveGalleryTab] = useState<"photos" | "videos">(
    "photos",
  );
  const [videoUploadOpen, setVideoUploadOpen] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [videoSizeError, setVideoSizeError] = useState<string | null>(null);

  const { data: uploadedPhotos = [] } = useQuery<GalleryPhoto[]>({
    queryKey: ["photos"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPhotos();
    },
    enabled: !!actor && !isFetching,
  });

  const handleUpload = async () => {
    if (!actor || !uploadTitle.trim() || !uploadFile) return;
    const maxPhotoSize = 10 * 1024 * 1024; // 10MB
    if (uploadFile.size > maxPhotoSize) {
      toast.error("फोटो 10MB से बड़ी नहीं होनी चाहिए। कृपया छोटी फोटो चुनें।");
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const bytes = new Uint8Array(await uploadFile.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
        setUploadProgress(pct);
      });
      await actor.addPhoto(uploadTitle.trim(), blob);
      toast.success("फोटो सफलतापूर्वक अपलोड हो गई! 🎉");
      queryClient.invalidateQueries({ queryKey: ["photos"] });
      setUploadOpen(false);
      setUploadTitle("");
      setUploadFile(null);
      setUploadProgress(0);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("Photo upload error:", e);
      if (msg.includes("size") || msg.includes("large")) {
        toast.error("फोटो बहुत बड़ी है। 10MB से छोटी फोटो चुनें।");
      } else {
        toast.error(`फोटो अपलोड नहीं हो सकी: ${msg.slice(0, 80)}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const closeUploadDialog = () => {
    if (isUploading) return;
    setUploadOpen(false);
    setUploadTitle("");
    setUploadFile(null);
    setUploadProgress(0);
  };

  const { data: uploadedVideos = [] } = useQuery<GalleryVideo[]>({
    queryKey: ["videos"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getVideos();
    },
    enabled: !!actor && !isFetching,
  });

  const handleVideoUpload = async () => {
    if (!actor || !videoTitle.trim() || !videoFile || videoSizeError) return;
    setIsVideoUploading(true);
    setVideoProgress(0);
    try {
      const bytes = new Uint8Array(await videoFile.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
        setVideoProgress(pct);
      });
      await actor.addVideo(videoTitle.trim(), blob);
      toast.success("वीडियो सफलतापूर्वक अपलोड हो गया! 🎉");
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      setVideoUploadOpen(false);
      setVideoTitle("");
      setVideoFile(null);
      setVideoProgress(0);
      setVideoSizeError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("Video upload error:", e);
      toast.error(`वीडियो अपलोड नहीं हो सका: ${msg.slice(0, 80)}`);
    } finally {
      setIsVideoUploading(false);
    }
  };

  const closeVideoUploadDialog = () => {
    if (isVideoUploading) return;
    setVideoUploadOpen(false);
    setVideoTitle("");
    setVideoFile(null);
    setVideoProgress(0);
    setVideoSizeError(null);
  };

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <h2
          className="text-lg font-bold"
          style={{
            color: "#2D5016",
            fontFamily: "'Tiro Devanagari Hindi', serif",
          }}
        >
          गैलरी
        </h2>
        <Button
          data-ocid={
            activeGalleryTab === "photos"
              ? "photos.upload_button"
              : "videos.upload_button"
          }
          size="sm"
          onClick={() =>
            activeGalleryTab === "photos"
              ? setUploadOpen(true)
              : setVideoUploadOpen(true)
          }
          className="text-xs font-semibold rounded-xl px-3 py-2"
          style={{ background: "#2D5016", color: "white", border: "none" }}
        >
          {activeGalleryTab === "photos" ? "+ फोटो जोड़ें" : "+ वीडियो जोड़ें"}
        </Button>
      </div>

      {/* Gallery Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          data-ocid="gallery.photos.tab"
          onClick={() => setActiveGalleryTab("photos")}
          className="flex-1 py-2 text-sm font-semibold rounded-xl transition-all"
          style={{
            background: activeGalleryTab === "photos" ? "#2D5016" : "#f0f7e8",
            color: activeGalleryTab === "photos" ? "white" : "#4a7c26",
            border: "1px solid #c8ddb2",
          }}
        >
          📷 फोटो
        </button>
        <button
          type="button"
          data-ocid="gallery.videos.tab"
          onClick={() => setActiveGalleryTab("videos")}
          className="flex-1 py-2 text-sm font-semibold rounded-xl transition-all"
          style={{
            background: activeGalleryTab === "videos" ? "#2D5016" : "#f0f7e8",
            color: activeGalleryTab === "videos" ? "white" : "#4a7c26",
            border: "1px solid #c8ddb2",
          }}
        >
          🎬 वीडियो
        </button>
      </div>

      {/* Photos Tab */}
      {activeGalleryTab === "photos" && (
        <>
          {/* Uploaded Photos */}
          {uploadedPhotos.length > 0 && (
            <div className="mb-4">
              <p
                className="text-xs font-semibold mb-2"
                style={{ color: "#4a7c26" }}
              >
                📤 अपलोड की गई तस्वीरें
              </p>
              <div className="grid grid-cols-3 gap-2">
                {uploadedPhotos.map((photo, idx) => (
                  <button
                    type="button"
                    key={String(photo.id)}
                    data-ocid={`photos.item.${idx + 1}`}
                    onClick={() => setSelected({ kind: "uploaded", photo })}
                    className="rounded-xl overflow-hidden flex flex-col items-center justify-center cursor-pointer w-full"
                    style={{
                      aspectRatio: "1",
                      border: "1px solid #c8ddb2",
                      background: "#f0f7e8",
                    }}
                    aria-label={`${photo.title} देखें`}
                  >
                    <img
                      src={photo.blob.getDirectURL()}
                      alt={photo.title}
                      className="w-full h-full object-cover"
                      style={{ borderRadius: "12px" }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Static Photos */}
          {uploadedPhotos.length === 0 && (
            <div className="grid grid-cols-3 gap-2">
              {PHOTOS.map((photo, _idx) => (
                <button
                  type="button"
                  key={photo.id}
                  data-ocid="photos.open_modal_button"
                  onClick={() => setSelected({ kind: "static", photo })}
                  className="rounded-xl overflow-hidden flex flex-col items-center justify-center card-hover cursor-pointer w-full"
                  style={{
                    background: photo.color,
                    aspectRatio: "1",
                    border: "1px solid #c8ddb2",
                  }}
                  aria-label={`${photo.title} देखें`}
                >
                  <span className="text-3xl">{photo.emoji}</span>
                  <p
                    className="text-xs text-center mt-1 px-1 leading-tight"
                    style={{ color: "#2D5016", fontWeight: 600 }}
                  >
                    {photo.title}
                  </p>
                </button>
              ))}
            </div>
          )}

          <p className="text-xs text-center mt-4" style={{ color: "#8a9a70" }}>
            गाँव की यादगार तस्वीरें
          </p>
        </>
      )}

      {/* Videos Tab */}
      {activeGalleryTab === "videos" && (
        <>
          {uploadedVideos.length === 0 ? (
            <div
              data-ocid="videos.empty_state"
              className="flex flex-col items-center justify-center py-12 gap-3"
            >
              <span className="text-5xl">🎬</span>
              <p className="text-sm font-semibold" style={{ color: "#4a7c26" }}>
                अभी कोई वीडियो नहीं है
              </p>
              <p className="text-xs text-center" style={{ color: "#8a9a70" }}>
                "+ वीडियो जोड़ें" बटन से पहला वीडियो डालें
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {uploadedVideos.map((video, idx) => (
                <button
                  type="button"
                  key={String(video.id)}
                  data-ocid={`videos.item.${idx + 1}`}
                  onClick={() => setSelected({ kind: "video", photo: video })}
                  className="rounded-xl overflow-hidden cursor-pointer w-full relative"
                  style={{
                    aspectRatio: "16/9",
                    border: "1px solid #c8ddb2",
                    background: "#1a1a2e",
                  }}
                  aria-label={`${video.title} चलाएं`}
                >
                  <video
                    src={video.blob.getDirectURL()}
                    preload="metadata"
                    className="w-full h-full object-cover"
                    style={{ borderRadius: "12px", opacity: 0.7 }}
                  >
                    <track kind="captions" />
                  </video>
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-1"
                    style={{ borderRadius: "12px" }}
                  >
                    <div
                      className="w-10 h-10 flex items-center justify-center rounded-full"
                      style={{ background: "rgba(255,255,255,0.9)" }}
                    >
                      <span style={{ fontSize: "1.2rem", marginLeft: "2px" }}>
                        ▶
                      </span>
                    </div>
                    <p
                      className="text-xs text-center font-semibold px-2 mt-1"
                      style={{
                        color: "white",
                        textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                      }}
                    >
                      {video.title}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
          <p className="text-xs text-center mt-4" style={{ color: "#8a9a70" }}>
            गाँव के वीडियो
          </p>
        </>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={closeUploadDialog}>
        <DialogContent
          data-ocid="photos.upload.dialog"
          className="flex flex-col gap-4 py-6 px-5"
          style={{
            background: "#faf8f0",
            border: "2px solid #c8ddb2",
            borderRadius: "20px",
            maxWidth: 360,
          }}
        >
          <DialogHeader>
            <DialogTitle
              className="text-base font-bold"
              style={{
                color: "#2D5016",
                fontFamily: "'Tiro Devanagari Hindi', serif",
              }}
            >
              📷 नई फोटो जोड़ें
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div>
              <Label
                htmlFor="upload-title"
                className="text-xs font-semibold mb-1 block"
                style={{ color: "#2D5016" }}
              >
                फोटो का नाम *
              </Label>
              <Input
                id="upload-title"
                data-ocid="photos.upload.title.input"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="जैसे: गाँव का मेला 2024"
                disabled={isUploading}
                className="text-sm rounded-xl"
                style={{ borderColor: "#c8ddb2" }}
              />
            </div>

            <div>
              <Label
                htmlFor="upload-file"
                className="text-xs font-semibold mb-1 block"
                style={{ color: "#2D5016" }}
              >
                फोटो चुनें (JPG/PNG/WEBP) *
              </Label>
              <input
                ref={fileInputRef}
                id="upload-file"
                data-ocid="photos.upload_button"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={isUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setUploadFile(file);
                    if (!uploadTitle.trim()) {
                      setUploadTitle(file.name.replace(/\.[^.]+$/, ""));
                    }
                  }
                }}
              />
              <label
                htmlFor="upload-file"
                onClick={(e) => {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    fileInputRef.current?.click();
                }}
                data-ocid="photos.upload.dropzone"
                className="flex flex-col items-center justify-center gap-2 rounded-xl cursor-pointer transition-all"
                style={{
                  border: "2px dashed #c8ddb2",
                  background: uploadFile ? "#e8f5d8" : "#f4fae8",
                  minHeight: 80,
                  padding: "16px",
                  display: "flex",
                }}
              >
                {uploadFile ? (
                  <>
                    <span className="text-2xl">✅</span>
                    <p
                      className="text-xs text-center font-semibold"
                      style={{ color: "#2D5016" }}
                    >
                      {uploadFile.name}
                    </p>
                    <p className="text-xs" style={{ color: "#8a9a70" }}>
                      बदलने के लिए यहाँ tap करें
                    </p>
                  </>
                ) : (
                  <>
                    <span className="text-2xl">📁</span>
                    <p
                      className="text-xs text-center"
                      style={{ color: "#4a7c26" }}
                    >
                      फोटो चुनने के लिए यहाँ tap करें
                    </p>
                  </>
                )}
              </label>
            </div>

            {isUploading && (
              <div
                data-ocid="photos.upload.loading_state"
                className="flex flex-col gap-1"
              >
                <div
                  className="flex justify-between text-xs"
                  style={{ color: "#4a7c26" }}
                >
                  <span>अपलोड हो रहा है...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div
                  className="w-full rounded-full overflow-hidden"
                  style={{ height: 8, background: "#e0eccc" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${uploadProgress}%`,
                      background: "linear-gradient(90deg, #2D5016, #4a7c26)",
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-1">
            <Button
              data-ocid="photos.upload.cancel_button"
              variant="outline"
              onClick={closeUploadDialog}
              disabled={isUploading}
              className="flex-1 rounded-xl text-sm"
              style={{ borderColor: "#c8ddb2", color: "#4a7c26" }}
            >
              रद्द करें
            </Button>
            <Button
              data-ocid="photos.upload.submit_button"
              onClick={handleUpload}
              disabled={isUploading || !uploadTitle.trim() || !uploadFile}
              className="flex-1 rounded-xl text-sm font-semibold"
              style={{ background: "#2D5016", color: "white", border: "none" }}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  अपलोड हो रहा है...
                </>
              ) : (
                "अपलोड करें"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Upload Dialog */}
      <Dialog open={videoUploadOpen} onOpenChange={closeVideoUploadDialog}>
        <DialogContent
          data-ocid="videos.upload.dialog"
          className="flex flex-col gap-4 py-6 px-5"
          style={{
            background: "#faf8f0",
            border: "2px solid #c8ddb2",
            borderRadius: "20px",
            maxWidth: 360,
          }}
        >
          <DialogHeader>
            <DialogTitle
              className="text-base font-bold"
              style={{
                color: "#2D5016",
                fontFamily: "'Tiro Devanagari Hindi', serif",
              }}
            >
              🎬 नया वीडियो जोड़ें
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div>
              <Label
                htmlFor="video-title"
                className="text-xs font-semibold mb-1 block"
                style={{ color: "#2D5016" }}
              >
                वीडियो का नाम *
              </Label>
              <Input
                id="video-title"
                data-ocid="videos.upload.title.input"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="जैसे: गाँव का उत्सव 2024"
                disabled={isVideoUploading}
                className="text-sm rounded-xl"
                style={{ borderColor: "#c8ddb2" }}
              />
            </div>

            <div>
              <Label
                htmlFor="video-file"
                className="text-xs font-semibold mb-1 block"
                style={{ color: "#2D5016" }}
              >
                वीडियो चुनें (MP4/MOV/WEBM) *
              </Label>
              <input
                ref={videoInputRef}
                id="video-file"
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                className="hidden"
                disabled={isVideoUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const maxSize = 50 * 1024 * 1024; // 50MB
                    const autoTitle = file.name.replace(/\.[^.]+$/, "");
                    if (file.size > maxSize) {
                      setVideoSizeError(
                        "वीडियो 50MB से बड़ा नहीं होना चाहिए। कृपया छोटा वीडियो चुनें।",
                      );
                      setVideoFile(file);
                      if (!videoTitle.trim()) setVideoTitle(autoTitle);
                    } else {
                      setVideoSizeError(null);
                      setVideoFile(file);
                      if (!videoTitle.trim()) setVideoTitle(autoTitle);
                    }
                  }
                }}
              />
              <label
                htmlFor="video-file"
                onClick={(e) => {
                  e.preventDefault();
                  videoInputRef.current?.click();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    videoInputRef.current?.click();
                }}
                data-ocid="videos.upload.dropzone"
                className="flex flex-col items-center justify-center gap-2 rounded-xl cursor-pointer transition-all w-full"
                style={{
                  border: "2px dashed #c8ddb2",
                  background: videoFile ? "#e8f5d8" : "#f4fae8",
                  minHeight: 80,
                  padding: "16px",
                  display: "flex",
                }}
              >
                {videoFile ? (
                  <>
                    <span className="text-2xl">✅</span>
                    <p
                      className="text-xs text-center font-semibold"
                      style={{ color: "#2D5016" }}
                    >
                      {videoFile.name}
                    </p>
                    <p className="text-xs" style={{ color: "#8a9a70" }}>
                      {(videoFile.size / (1024 * 1024)).toFixed(1)} MB — बदलने के
                      लिए यहाँ tap करें
                    </p>
                  </>
                ) : (
                  <>
                    <span className="text-2xl">🎬</span>
                    <p
                      className="text-xs text-center"
                      style={{ color: "#4a7c26" }}
                    >
                      वीडियो चुनने के लिए यहाँ tap करें
                    </p>
                  </>
                )}
              </label>
            </div>

            {videoSizeError && (
              <p className="text-xs font-semibold" style={{ color: "#c0392b" }}>
                ⚠️ {videoSizeError}
              </p>
            )}

            {isVideoUploading && (
              <div
                className="rounded-xl overflow-hidden"
                style={{ height: 8, background: "#e8f0d8" }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${videoProgress}%`,
                    background: "#2D5016",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-1">
            <Button
              data-ocid="videos.upload.cancel_button"
              variant="outline"
              onClick={closeVideoUploadDialog}
              disabled={isVideoUploading}
              className="flex-1 rounded-xl text-sm"
              style={{ borderColor: "#c8ddb2", color: "#4a7c26" }}
            >
              रद्द करें
            </Button>
            <Button
              data-ocid="videos.upload.submit_button"
              onClick={handleVideoUpload}
              disabled={
                isVideoUploading ||
                !videoTitle.trim() ||
                !videoFile ||
                !!videoSizeError
              }
              className="flex-1 rounded-xl text-sm font-semibold"
              style={{ background: "#2D5016", color: "white", border: "none" }}
            >
              {isVideoUploading ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  अपलोड हो रहा है...
                </>
              ) : (
                "अपलोड करें"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox Dialog */}
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent
          data-ocid="photos.dialog"
          className="flex flex-col items-center gap-4 py-8 px-6"
          style={{
            background:
              selected?.kind === "static"
                ? (selected.photo as PhotoItem).color
                : "#faf8f0",
            border: "2px solid #c8ddb2",
            borderRadius: "24px",
            maxWidth: 360,
          }}
        >
          <button
            type="button"
            data-ocid="photos.close_button"
            onClick={() => setSelected(null)}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full transition-all"
            style={{
              background: "rgba(45,80,22,0.12)",
              color: "#2D5016",
            }}
            aria-label="बंद करें"
          >
            <X size={16} />
          </button>

          <DialogHeader className="items-center gap-2 w-full">
            <div
              className="flex items-center justify-center rounded-2xl overflow-hidden"
              style={{
                width: selected?.kind === "video" ? "100%" : 180,
                height: selected?.kind === "video" ? "auto" : 180,
                background: "rgba(0,0,0,0.8)",
                border: "2px solid rgba(45,80,22,0.15)",
              }}
            >
              {selected?.kind === "video" ? (
                <video
                  controls
                  src={(selected.photo as GalleryVideo).blob.getDirectURL()}
                  className="w-full rounded-xl"
                  style={{ maxHeight: 240 }}
                >
                  <track kind="captions" />
                </video>
              ) : selected?.kind === "uploaded" ? (
                <img
                  src={(selected.photo as GalleryPhoto).blob.getDirectURL()}
                  alt={(selected.photo as GalleryPhoto).title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span style={{ fontSize: "5rem", lineHeight: 1 }}>
                  {selected?.kind === "static"
                    ? (selected.photo as PhotoItem).emoji
                    : "📷"}
                </span>
              )}
            </div>
            <DialogTitle
              className="text-center text-lg font-bold mt-2"
              style={{
                color: "#2D5016",
                fontFamily: "'Tiro Devanagari Hindi', serif",
              }}
            >
              {selected?.kind === "video"
                ? (selected.photo as GalleryVideo).title
                : selected?.kind === "uploaded"
                  ? (selected.photo as GalleryPhoto).title
                  : selected?.kind === "static"
                    ? (selected.photo as PhotoItem).title
                    : ""}
            </DialogTitle>
          </DialogHeader>

          <Button
            onClick={() => setSelected(null)}
            className="mt-2 px-8 font-semibold"
            style={{
              background: "#2D5016",
              color: "white",
              border: "none",
              borderRadius: "12px",
            }}
          >
            बंद करें
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmergencyPage() {
  const [contacts, setContacts] = useState(EMERGENCY);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editNumber, setEditNumber] = useState("");

  function openEdit(idx: number) {
    setEditIdx(idx);
    setEditName(contacts[idx].name);
    setEditNumber(contacts[idx].number);
  }

  function saveEdit() {
    if (editIdx === null) return;
    setContacts((prev) =>
      prev.map((c, i) =>
        i === editIdx ? { ...c, name: editName, number: editNumber } : c,
      ),
    );
    setEditIdx(null);
  }

  return (
    <div className="px-4 py-4 flex flex-col gap-3">
      <div
        className="rounded-2xl p-3 flex items-center gap-3"
        style={{ background: "#fff3f3", border: "1px solid #f5c6c6" }}
      >
        <span className="text-2xl">⚠️</span>
        <p className="text-xs" style={{ color: "#c62828" }}>
          आपातकाल में नीचे दिए गए नंबर पर तुरंत संपर्क करें
        </p>
      </div>
      <h2
        className="text-lg font-bold"
        style={{
          color: "#2D5016",
          fontFamily: "'Tiro Devanagari Hindi', serif",
        }}
      >
        आपातकालीन संपर्क
      </h2>
      {contacts.map((contact, idx) => (
        <div
          key={contact.name}
          className="relative"
          data-ocid={`emergency.item.${idx + 1}`}
        >
          <a href={`tel:${contact.number}`} className="block">
            <Card className="card-hover" style={{ borderColor: "#c8ddb2" }}>
              <CardContent className="p-3 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xl"
                  style={{ background: `${contact.color}20` }}
                >
                  {contact.icon}
                </div>
                <div className="flex-1">
                  <p
                    className="font-semibold text-sm"
                    style={{ color: "#2D5016" }}
                  >
                    {contact.name}
                  </p>
                  <p
                    className="text-base font-bold"
                    style={{ color: contact.color }}
                  >
                    {contact.number}
                  </p>
                </div>
                <span
                  className="text-xs px-2 py-1 rounded-full"
                  style={{
                    background: `${contact.color}20`,
                    color: contact.color,
                  }}
                >
                  कॉल करें
                </span>
              </CardContent>
            </Card>
          </a>
          {!contact.isFixed && (
            <button
              type="button"
              data-ocid={`emergency.edit_button.${idx + 1}`}
              onClick={(e) => {
                e.preventDefault();
                openEdit(idx);
              }}
              className="absolute top-2 right-2 text-sm opacity-60 hover:opacity-100 transition-opacity p-1 rounded z-10"
              title="संपादित करें"
            >
              ✏️
            </button>
          )}
        </div>
      ))}

      <Dialog
        open={editIdx !== null}
        onOpenChange={(o) => !o && setEditIdx(null)}
      >
        <DialogContent
          data-ocid="emergency.edit.dialog"
          className="max-w-sm mx-4"
        >
          <DialogHeader>
            <DialogTitle
              style={{
                color: "#2D5016",
                fontFamily: "'Tiro Devanagari Hindi', serif",
              }}
            >
              संपर्क संपादित करें
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-2">
            <div>
              <Label
                className="text-xs mb-1 block"
                style={{ color: "#2D5016" }}
              >
                नाम
              </Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div>
              <Label
                className="text-xs mb-1 block"
                style={{ color: "#2D5016" }}
              >
                नंबर
              </Label>
              <Input
                value={editNumber}
                onChange={(e) => setEditNumber(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditIdx(null)}
              >
                रद्द करें
              </Button>
              <Button
                size="sm"
                onClick={saveEdit}
                style={{ background: "#2D5016" }}
              >
                सहेजें
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── People Page ─────────────────────────────────────────────────────────────

function PeoplePage() {
  const { actor, isFetching: actorLoading } = useActor();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [profession, setProfession] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");

  const { data: people, isLoading } = useQuery<Person[]>({
    queryKey: ["persons"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPersons();
    },
    enabled: !!actor && !actorLoading,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      await actor.addPerson(
        name.trim(),
        profession.trim(),
        phone.trim() || null,
        description.trim() || null,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["persons"] });
      setName("");
      setProfession("");
      setPhone("");
      setDescription("");
      toast.success("जानकारी सफलतापूर्वक सेव हो गई! 🎉");
    },
    onError: () => {
      toast.error("जानकारी सेव नहीं हो सकी, कृपया दोबारा प्रयास करें।");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !profession.trim()) return;
    addMutation.mutate();
  }

  return (
    <div className="px-4 py-4 flex flex-col gap-4">
      {/* Form Section */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: "linear-gradient(135deg, #2D5016 0%, #4a7c26 100%)",
          border: "1px solid #3d6b1c",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">👥</span>
          <h2
            className="text-white font-bold text-base"
            style={{ fontFamily: "'Tiro Devanagari Hindi', serif" }}
          >
            अपनी जानकारी जोड़ें
          </h2>
        </div>
        <p className="text-green-200 text-xs mb-4 opacity-90">
          गाँव के सभी लोग यहाँ अपना परिचय दे सकते हैं
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label className="text-green-100 text-xs font-semibold">
              नाम *
            </Label>
            <Input
              data-ocid="people.name.input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="आपका पूरा नाम"
              required
              className="bg-white/90 border-green-300 text-sm h-9"
              style={{ color: "#2D5016" }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label className="text-green-100 text-xs font-semibold">
              पेशा / काम *
            </Label>
            <Input
              data-ocid="people.profession.input"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              placeholder="जैसे: किसान, दुकानदार, शिक्षक..."
              required
              className="bg-white/90 border-green-300 text-sm h-9"
              style={{ color: "#2D5016" }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label className="text-green-100 text-xs font-semibold">
              फोन नंबर (वैकल्पिक)
            </Label>
            <Input
              data-ocid="people.phone.input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="मोबाइल नंबर"
              type="tel"
              className="bg-white/90 border-green-300 text-sm h-9"
              style={{ color: "#2D5016" }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label className="text-green-100 text-xs font-semibold">
              परिचय (वैकल्पिक)
            </Label>
            <Textarea
              data-ocid="people.description.textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="अपने बारे में कुछ बताएं..."
              className="bg-white/90 border-green-300 text-sm resize-none"
              style={{ color: "#2D5016" }}
              rows={3}
            />
          </div>

          <Button
            type="submit"
            data-ocid="people.submit_button"
            disabled={
              addMutation.isPending || !name.trim() || !profession.trim()
            }
            className="w-full font-bold h-10 mt-1"
            style={{ background: "#f5a623", color: "#2D5016", border: "none" }}
          >
            {addMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> सेव हो रहा है...
              </>
            ) : (
              "जानकारी सेव करें ✓"
            )}
          </Button>
        </form>
      </div>

      {/* People List */}
      <div>
        <h3
          className="text-base font-bold mb-3"
          style={{
            color: "#2D5016",
            fontFamily: "'Tiro Devanagari Hindi', serif",
          }}
        >
          गाँव के लोग
        </h3>

        {isLoading || actorLoading ? (
          <div data-ocid="people.loading_state" className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl p-4 animate-pulse"
                style={{ background: "#e8edd8", height: 80 }}
              />
            ))}
          </div>
        ) : !people || people.length === 0 ? (
          <div
            data-ocid="people.empty_state"
            className="flex flex-col items-center py-10 gap-3"
            style={{ color: "#8a9a70" }}
          >
            <span className="text-5xl">🏡</span>
            <p className="text-sm font-semibold" style={{ color: "#2D5016" }}>
              अभी कोई जानकारी नहीं
            </p>
            <p
              className="text-xs text-center px-8"
              style={{ color: "#8a9a70" }}
            >
              सबसे पहले आप अपनी जानकारी जोड़ें और गाँव के बाकी लोगों को भी बताएं!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {people.map((person, idx) => (
              <Card
                key={`${person.name}-${idx}`}
                data-ocid={`people.item.${idx + 1}`}
                className="card-hover"
                style={{
                  borderColor: "#c8ddb2",
                  borderLeft: "4px solid #4a7c26",
                }}
              >
                <CardContent className="p-3 flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-base text-white"
                    style={{
                      background:
                        "linear-gradient(135deg, #2D5016 0%, #4a7c26 100%)",
                      minWidth: 40,
                    }}
                  >
                    {person.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-bold text-sm"
                      style={{ color: "#2D5016" }}
                    >
                      {person.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#5a7a40" }}>
                      💼 {person.profession}
                    </p>
                    {person.phoneNumber && (
                      <a
                        href={`tel:${person.phoneNumber}`}
                        className="text-xs mt-0.5 block"
                        style={{ color: "#1565c0" }}
                      >
                        📞 {person.phoneNumber}
                      </a>
                    )}
                    {person.description && (
                      <p
                        className="text-xs mt-1 leading-relaxed"
                        style={{ color: "#4a5a30" }}
                      >
                        {person.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <div
      className="text-center py-3 text-xs"
      style={{ color: "#8a9a70", borderTop: "1px solid #e0dac8" }}
    >
      <div className="flex items-center justify-center gap-2 mb-1">
        <img
          src="/assets/uploads/WhatsApp-Image-2024-10-24-at-11.38.25-1.jpeg"
          alt="Gaurav Bisht"
          className="w-8 h-8 rounded-full object-cover border-2"
          style={{ borderColor: "#2D5016" }}
        />
        <span>
          Created by{" "}
          <span style={{ color: "#2D5016", fontWeight: 600 }}>
            Gaurav Bisht
          </span>
        </span>
      </div>
      <p className="mt-0.5 opacity-70">
        © {new Date().getFullYear()}{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Built with caffeine.ai
        </a>
      </p>
    </div>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("home");

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "#faf8f0",
        maxWidth: 480,
        margin: "0 auto",
        position: "relative",
      }}
    >
      <Toaster position="top-center" richColors />

      {/* Top Header */}
      <header
        className="flex items-center gap-2 px-4 py-3 sticky top-0 z-30"
        style={{
          background: "linear-gradient(90deg, #2D5016 0%, #4a7c26 100%)",
          boxShadow: "0 2px 8px rgba(45,80,22,0.25)",
        }}
      >
        <div className="w-7 h-7">
          <svg
            role="img"
            aria-label="बिष्ट गाँव जैन क्रांश logo small"
            width="28"
            height="28"
            viewBox="0 0 120 120"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="60" cy="60" r="58" fill="#3d6b1c" />
            <rect x="56" y="62" width="8" height="22" rx="2" fill="#8B5E3C" />
            <ellipse cx="60" cy="62" rx="18" ry="10" fill="#5aad2e" />
            <ellipse cx="60" cy="52" rx="14" ry="10" fill="#4a9c22" />
            <ellipse cx="60" cy="40" rx="9" ry="9" fill="#3d8a18" />
            <polygon points="44,80 60,68 76,80" fill="rgba(255,220,100,0.9)" />
            <rect
              x="47"
              y="80"
              width="26"
              height="14"
              rx="1"
              fill="rgba(255,255,255,0.85)"
            />
            <rect x="57" y="86" width="6" height="8" rx="1" fill="#8B5E3C" />
          </svg>
        </div>
        <div>
          <h1 className="text-white font-bold text-sm leading-tight">
            बिष्ट गाँव जैन क्रांश
          </h1>
          <p className="text-green-200 text-xs opacity-80">बिश्ट गाँव जैन क्रांश</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {activeTab === "home" && <HomePage />}
        {activeTab === "news" && <NewsPage />}
        {activeTab === "market" && <MarketPage />}
        {activeTab === "services" && <ServicesPage />}
        {activeTab === "photos" && <PhotosPage />}
        {activeTab === "emergency" && <EmergencyPage />}
        {activeTab === "people" && <PeoplePage />}
        <Footer />
      </main>

      {/* Bottom Tab Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40"
        style={{
          maxWidth: 480,
          margin: "0 auto",
          background: "white",
          borderTop: "1px solid #e0dac8",
          boxShadow: "0 -2px 12px rgba(45,80,22,0.1)",
        }}
      >
        <div className="grid grid-cols-7">
          {TABS.map((tab) => (
            <button
              type="button"
              key={tab.id}
              data-ocid={`nav.${tab.id}.tab`}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center justify-center py-2 gap-0.5 transition-all"
              style={{
                color: activeTab === tab.id ? "#2D5016" : "#8a9a70",
                borderTop:
                  activeTab === tab.id
                    ? "2.5px solid #2D5016"
                    : "2.5px solid transparent",
                background:
                  activeTab === tab.id ? "rgba(45,80,22,0.06)" : "transparent",
              }}
            >
              <span className="text-base leading-none">{tab.icon}</span>
              <span
                className="text-center leading-tight"
                style={{
                  fontSize: "0.5rem",
                  fontWeight: activeTab === tab.id ? 700 : 400,
                }}
              >
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
