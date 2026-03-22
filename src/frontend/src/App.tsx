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
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "./backend";
import type {
  GalleryPhoto,
  GalleryVideo,
  GraminProduct,
  Person,
  TransportEntry,
} from "./backend.d";
import type { VillageInfo } from "./backend.d";
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

type NewsItem = {
  id: number;
  title: string;
  body: string;
  date: string;
  tag: string;
};

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
  | "people"
  | "admin";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "home", label: "होम", icon: "🏡" },
  { id: "news", label: "खबरें", icon: "📰" },
  { id: "market", label: "उत्पाद", icon: "🌾" },
  { id: "services", label: "सेवाएँ", icon: "🏛️" },
  { id: "photos", label: "फोटो", icon: "📷" },
  { id: "people", label: "लोग", icon: "👥" },
];

// ─── Page Components ─────────────────────────────────────────────────────────

const INITIAL_QUICK_SERVICES = [
  {
    id: 1,
    label: "राशन कार्ड",
    icon: "📋",
    detail:
      "राशन कार्ड के लिए ग्राम पंचायत कार्यालय में आवेदन करें। आवश्यक दस्तावेज: आधार कार्ड, परिवार के सदस्यों की जानकारी।",
  },
  {
    id: 2,
    label: "जन्म प्रमाण",
    icon: "📜",
    detail:
      "जन्म प्रमाण पत्र के लिए नगर पालिका या ग्राम पंचायत से संपर्क करें। जन्म के 21 दिन के भीतर पंजीकरण करवाएँ।",
  },
  {
    id: 3,
    label: "आय प्रमाण",
    icon: "💼",
    detail:
      "आय प्रमाण पत्र के लिए तहसील कार्यालय जाएँ। आधार कार्ड और स्व-घोषणा पत्र साथ लेकर जाएँ।",
  },
  {
    id: 4,
    label: "नरेगा",
    icon: "⛏️",
    detail:
      "मनरेगा जॉब कार्ड के लिए ग्राम पंचायत में पंजीकरण करवाएँ। प्रति वर्ष 100 दिन का रोजगार गारंटी के साथ मिलता है।",
  },
  {
    id: 5,
    label: "पेंशन",
    icon: "👴",
    detail:
      "वृद्धावस्था पेंशन के लिए तहसील कार्यालय में आवेदन करें। 60 वर्ष से अधिक आयु के नागरिकों को पेंशन मिलती है।",
  },
  {
    id: 6,
    label: "वृक्षारोपण",
    icon: "🌳",
    detail:
      "ग्राम में वृक्षारोपण कार्यक्रम के लिए ग्राम पंचायत से संपर्क करें। पौधे निःशुल्क उपलब्ध कराए जाते हैं।",
  },
];

function HomePage({
  villageInfo,
  isVillageLoading,
  newsList,
}: {
  villageInfo?: VillageInfo;
  isVillageLoading?: boolean;
  newsList: NewsItem[];
}) {
  const { actor, isFetching: qsIsFetching } = useActor();
  const [qsEditIdx, setQsEditIdx] = useState<number | null>(null);
  const [qsEditLabel, setQsEditLabel] = useState("");
  const [qsEditIcon, setQsEditIcon] = useState("");
  const [qsAddOpen, setQsAddOpen] = useState(false);
  const [qsNewLabel, setQsNewLabel] = useState("");
  const [qsNewIcon, setQsNewIcon] = useState("");
  const [qsViewIdx, setQsViewIdx] = useState<number | null>(null);
  const [qsEditDetail, setQsEditDetail] = useState("");
  const [qsNewDetail, setQsNewDetail] = useState("");
  const [qsViewEditMode, setQsViewEditMode] = useState(false);
  const [qsSaving, setQsSaving] = useState(false);

  const DEFAULT_QS_SEED = [
    {
      icon: "📋",
      name: "राशन कार्ड",
      detail: "राशन कार्ड के लिए ग्राम पंचायत कार्यालय में आवेदन करें।",
    },
    {
      icon: "📜",
      name: "जन्म प्रमाण",
      detail: "जन्म प्रमाण पत्र के लिए नगर पालिका या ग्राम पंचायत से संपर्क करें।",
    },
    {
      icon: "💼",
      name: "आय प्रमाण",
      detail: "आय प्रमाण पत्र के लिए तहसील कार्यालय जाएँ।",
    },
    {
      icon: "⛏️",
      name: "नरेगा",
      detail: "मनरेगा जॉब कार्ड के लिए ग्राम पंचायत में पंजीकरण करवाएँ।",
    },
    {
      icon: "👴",
      name: "पेंशन",
      detail: "वृद्धावस्था पेंशन के लिए तहसील कार्यालय में आवेदन करें।",
    },
    {
      icon: "🌳",
      name: "वृक्षारोपण",
      detail: "ग्राम में वृक्षारोपण कार्यक्रम के लिए ग्राम पंचायत से संपर्क करें।",
    },
  ];

  const { data: quickServices = [], refetch: refetchQs } = useQuery<any[]>({
    queryKey: ["quickServices"],
    queryFn: async () => {
      if (!actor) return INITIAL_QUICK_SERVICES;
      const items = await (actor as any).getQuickServices();
      if ((items as any[]).length === 0) {
        await Promise.all(
          DEFAULT_QS_SEED.map((s) =>
            (actor as any).addQuickService(s.icon, s.name, s.detail),
          ),
        );
        const seeded = await (actor as any).getQuickServices();
        return (seeded as any[]).map((s: any) => ({
          id: s.id,
          label: s.name,
          icon: s.icon,
          detail: s.detail,
        }));
      }
      return (items as any[]).map((s: any) => ({
        id: s.id,
        label: s.name,
        icon: s.icon,
        detail: s.detail,
      }));
    },
    enabled: !!actor && !qsIsFetching,
  });

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

      {/* Village cultural description */}
      <div className="w-full px-4 mt-3 mb-1">
        <div
          style={{
            background: "linear-gradient(90deg, #c62828 0%, #e53935 100%)",
            borderRadius: "10px",
            padding: "10px 14px",
            color: "white",
            fontSize: "0.82rem",
            fontWeight: 500,
            lineHeight: "1.6",
            letterSpacing: "0.01em",
          }}
        >
          🏔️ जैन कराश गाँव अपनी समृद्ध संस्कृति, प्राचीन इतिहास और गोलू देवता, हरजू देवता,
          मायिका और गणनाथ जैसे पवित्र मंदिरों के कारण एक विशेष पहचान रखता है।
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
          {isVillageLoading
            ? [1, 2, 3, 4].map((i) => (
                <Card key={i} style={{ borderColor: "#c8ddb2" }}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                    <div className="flex-1">
                      <div className="h-2 bg-gray-200 rounded animate-pulse mb-1 w-16" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-12" />
                    </div>
                  </CardContent>
                </Card>
              ))
            : [
                {
                  label: "जनसंख्या",
                  value: villageInfo?.population ?? "131",
                  icon: "👥",
                },
                {
                  label: "क्षेत्रफल",
                  value: villageInfo?.area ?? "33.9 हेक्टेयर",
                  icon: "🗺️",
                },
                { label: "घर", value: villageInfo?.houses ?? "30", icon: "🏠" },
                {
                  label: "साक्षरता",
                  value: villageInfo?.literacy ?? "78%",
                  icon: "📚",
                },
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
                      <p
                        className="font-bold text-sm"
                        style={{ color: "#2D5016" }}
                      >
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
                onClick={async () => {
                  if (!actor) return;
                  try {
                    await (actor as any).deleteQuickService(svc.id);
                    refetchQs();
                    toast.success("सेवा हटा दी गई!");
                  } catch (_) {
                    toast.error("सेवा नहीं हटाई जा सकी।");
                  }
                }}
                title="हटाएँ"
              >
                ✕
              </button>
              <button
                type="button"
                data-ocid={`quick_services.view_button.${idx + 1}`}
                className="flex flex-col items-center gap-1 w-full bg-transparent border-none cursor-pointer mt-2"
                onClick={() => {
                  setQsViewIdx(idx);
                  setQsViewEditMode(false);
                  setQsEditLabel(svc.label);
                  setQsEditIcon(svc.icon);
                  setQsEditDetail(svc.detail || "");
                }}
              >
                <span className="text-2xl">{svc.icon}</span>
                <span
                  className="text-xs text-center"
                  style={{ color: "#2D5016" }}
                >
                  {svc.label}
                </span>
              </button>
            </div>
          ))}
        </div>

        {/* Detail / View-Edit dialog */}
        <Dialog
          open={qsViewIdx !== null}
          onOpenChange={(o) => {
            if (!o) {
              setQsViewIdx(null);
              setQsViewEditMode(false);
            }
          }}
        >
          <DialogContent data-ocid="quick_services.view.dialog">
            <DialogHeader>
              <DialogTitle>
                {qsViewIdx !== null
                  ? `${quickServices[qsViewIdx]?.icon} ${quickServices[qsViewIdx]?.label}`
                  : ""}
              </DialogTitle>
            </DialogHeader>
            {qsViewIdx !== null && !qsViewEditMode && (
              <div className="flex flex-col gap-4 mt-2">
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#374151" }}
                >
                  {quickServices[qsViewIdx]?.detail ||
                    "इस सेवा के लिए कोई विवरण उपलब्ध नहीं है।"}
                </p>
                <Button
                  data-ocid="quick_services.view.edit_button"
                  variant="outline"
                  onClick={() => {
                    setQsViewEditMode(true);
                    setQsEditLabel(quickServices[qsViewIdx].label);
                    setQsEditIcon(quickServices[qsViewIdx].icon);
                    setQsEditDetail(quickServices[qsViewIdx].detail || "");
                  }}
                  style={{ borderColor: "#2D5016", color: "#2D5016" }}
                >
                  ✏️ संपादित करें
                </Button>
              </div>
            )}
            {qsViewIdx !== null && qsViewEditMode && (
              <div className="flex flex-col gap-3 mt-2">
                <div>
                  <Label>आइकन (emoji)</Label>
                  <Input
                    data-ocid="quick_services.view.icon.input"
                    value={qsEditIcon}
                    onChange={(e) => setQsEditIcon(e.target.value)}
                    placeholder="जैसे: 📋"
                  />
                </div>
                <div>
                  <Label>सेवा का नाम</Label>
                  <Input
                    data-ocid="quick_services.view.label.input"
                    value={qsEditLabel}
                    onChange={(e) => setQsEditLabel(e.target.value)}
                    placeholder="सेवा का नाम"
                  />
                </div>
                <div>
                  <Label>विवरण / जानकारी</Label>
                  <textarea
                    data-ocid="quick_services.view.detail.textarea"
                    value={qsEditDetail}
                    onChange={(e) => setQsEditDetail(e.target.value)}
                    placeholder="सेवा की जानकारी लिखें..."
                    rows={4}
                    className="w-full border rounded-md px-3 py-2 text-sm resize-none"
                    style={{ borderColor: "#c8ddb2", outline: "none" }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    data-ocid="quick_services.view.save_button"
                    disabled={!qsEditLabel.trim() || qsSaving}
                    onClick={async () => {
                      if (qsViewIdx === null || !actor) return;
                      const svc = quickServices[qsViewIdx];
                      try {
                        setQsSaving(true);
                        await (actor as any).updateQuickService(
                          svc.id,
                          qsEditIcon.trim() || svc.icon,
                          qsEditLabel.trim(),
                          qsEditDetail.trim(),
                        );
                        refetchQs();
                        setQsViewEditMode(false);
                        toast.success("✅ सेवा अपडेट हो गई!");
                      } catch (_) {
                        toast.error("अपडेट नहीं हो सका।");
                      } finally {
                        setQsSaving(false);
                      }
                    }}
                    style={{ background: "#2D5016", flex: 1 }}
                  >
                    सहेजें
                  </Button>
                  <Button
                    data-ocid="quick_services.view.cancel_button"
                    variant="outline"
                    onClick={() => setQsViewEditMode(false)}
                    style={{ flex: 1 }}
                  >
                    रद्द करें
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

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
                disabled={!qsEditLabel.trim() || qsSaving}
                onClick={async () => {
                  if (qsEditIdx === null || !actor) return;
                  const svc = quickServices[qsEditIdx];
                  try {
                    setQsSaving(true);
                    await (actor as any).updateQuickService(
                      svc.id,
                      qsEditIcon.trim() || svc.icon,
                      qsEditLabel.trim(),
                      qsEditDetail.trim(),
                    );
                    refetchQs();
                    setQsEditIdx(null);
                    toast.success("✅ सेवा अपडेट हो गई!");
                  } catch (_) {
                    toast.error("अपडेट नहीं हो सका।");
                  } finally {
                    setQsSaving(false);
                  }
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
              <div>
                <Label>विवरण / जानकारी</Label>
                <textarea
                  data-ocid="quick_services.new_detail.textarea"
                  value={qsNewDetail}
                  onChange={(e) => setQsNewDetail(e.target.value)}
                  placeholder="सेवा की जानकारी लिखें (वैकल्पिक)"
                  rows={3}
                  className="w-full border rounded-md px-3 py-2 text-sm resize-none"
                  style={{ borderColor: "#c8ddb2", outline: "none" }}
                />
              </div>
              <Button
                data-ocid="quick_services.add.submit_button"
                disabled={!qsNewLabel.trim() || qsSaving}
                onClick={async () => {
                  if (!actor) return;
                  try {
                    setQsSaving(true);
                    await (actor as any).addQuickService(
                      qsNewIcon.trim() || "📌",
                      qsNewLabel.trim(),
                      qsNewDetail.trim(),
                    );
                    refetchQs();
                    setQsNewLabel("");
                    setQsNewIcon("");
                    setQsNewDetail("");
                    setQsAddOpen(false);
                    toast.success("✅ नई सेवा जोड़ी गई!");
                  } catch (_) {
                    toast.error("सेवा नहीं जोड़ी जा सकी।");
                  } finally {
                    setQsSaving(false);
                  }
                }}
                style={{ background: "#2D5016" }}
              >
                जोड़ें
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Animated News Ticker + Cards */}
      <div className="w-full">
        {/* Scrolling ticker strip */}
        <div
          data-ocid="home.news_ticker"
          className="w-full overflow-hidden"
          style={{
            background: "linear-gradient(90deg, #c62828 0%, #e53935 100%)",
            padding: "7px 0",
          }}
        >
          <div
            style={{
              display: "inline-block",
              whiteSpace: "nowrap",
              animation: "marquee 22s linear infinite",
              fontSize: "0.78rem",
              color: "white",
              fontWeight: 600,
              letterSpacing: "0.01em",
            }}
          >
            {newsList.length > 0
              ? newsList.map((n) => `📰 ${n.title}`).join("  •  ")
              : "📰 गाँव में बेसी शुरू — 23 से"}
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </div>
        </div>

        {/* Latest news cards */}
        <div className="px-4 mt-3">
          <h2
            className="text-base font-semibold mb-2"
            style={{ color: "#2D5016" }}
          >
            ताजा खबरें
          </h2>
          <div className="flex flex-col gap-2">
            {newsList.slice(0, 3).map((item, idx) => (
              <div
                key={item.id}
                data-ocid={`home.news.item.${idx + 1}`}
                style={{
                  borderLeft: "4px solid #2D5016",
                  background: "white",
                  borderRadius: "10px",
                  boxShadow: "0 1px 6px rgba(45,80,22,0.08)",
                  padding: "10px 12px",
                  animation: "slideUp 0.4s ease both",
                  animationDelay: `${idx * 100}ms`,
                  opacity: 0,
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: TAG_COLORS[item.tag] ?? "#2D5016",
                      color: "white",
                    }}
                  >
                    {item.tag}
                  </span>
                  <span className="text-xs" style={{ color: "#8a9a70" }}>
                    {item.date}
                  </span>
                </div>
                <p className="text-sm font-bold" style={{ color: "#2D5016" }}>
                  {item.title}
                </p>
                <p
                  className="text-xs mt-0.5 leading-relaxed"
                  style={{
                    color: "#4a5a30",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NewsPage({
  newsList,
  refetchNews,
}: {
  newsList: NewsItem[];
  refetchNews: () => void;
}) {
  const { actor } = useActor();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState("");
  // Edit state
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<NewsItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editTag, setEditTag] = useState("");

  function handleOpenEdit(item: NewsItem) {
    setEditItem(item);
    setEditTitle(item.title);
    setEditBody(item.body);
    setEditTag(item.tag);
    setEditOpen(true);
  }

  async function handleSaveEdit() {
    if (!editItem || !editTitle.trim() || !editBody.trim() || !actor) return;
    try {
      await (actor as any).updateNews(
        BigInt(editItem.id),
        editTitle.trim(),
        editBody.trim(),
        editTag.trim() || "सामान्य",
        editItem.date,
      );
      refetchNews();
      setEditOpen(false);
      setEditItem(null);
      toast.success("✏️ खबर अपडेट हो गई!");
    } catch (_) {
      toast.error("खबर अपडेट नहीं हो सकी। Page refresh करें।");
    } finally {
    }
  }

  async function handleDeleteNews(id: number) {
    if (!actor) return;
    try {
      await (actor as any).deleteNews(BigInt(id));
      refetchNews();
      toast.success("🗑️ खबर हटा दी गई!");
    } catch (_) {
      toast.error("खबर नहीं हटाई जा सकी।");
    }
  }

  async function handleAdd() {
    if (!title.trim() || !body.trim() || !actor) return;
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
    try {
      await (actor as any).addNews(
        title.trim(),
        body.trim(),
        tag.trim() || "सामान्य",
        dateStr,
      );
      refetchNews();
      setTitle("");
      setBody("");
      setTag("");
      setOpen(false);
      toast.success("📰 नई खबर जोड़ी गई!", { duration: 5000 });
    } catch (_) {
      toast.error("खबर नहीं जोड़ी जा सकी। Page refresh करें।");
    } finally {
    }
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

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle
              style={{
                color: "#2D5016",
                fontFamily: "'Tiro Devanagari Hindi', serif",
              }}
            >
              खबर संपादित करें ✏️
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
                data-ocid="news.edit.title.input"
                placeholder="खबर का शीर्षक"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
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
                data-ocid="news.edit.body.textarea"
                placeholder="खबर का विवरण"
                rows={4}
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
              />
            </div>
            <div>
              <Label
                className="text-xs mb-1 block"
                style={{ color: "#4a5a30" }}
              >
                टैग
              </Label>
              <Input
                data-ocid="news.edit.tag.input"
                placeholder="उत्सव, पंचायत, विकास..."
                value={editTag}
                onChange={(e) => setEditTag(e.target.value)}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                data-ocid="news.edit.save_button"
                onClick={handleSaveEdit}
                disabled={!editTitle.trim() || !editBody.trim()}
                className="flex-1 font-semibold"
                style={{ background: "#2D5016", color: "white" }}
              >
                सेव करें ✓
              </Button>
              <Button
                data-ocid="news.edit.cancel_button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                className="flex-1"
                style={{ borderColor: "#c8ddb2", color: "#2D5016" }}
              >
                रद्द करें
              </Button>
            </div>
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
              <div className="flex items-center gap-1">
                <span className="text-xs" style={{ color: "#8a9a70" }}>
                  {item.date}
                </span>
                <button
                  type="button"
                  data-ocid={`news.edit_button.${idx + 1}`}
                  onClick={() => handleOpenEdit(item)}
                  className="text-green-600 hover:text-green-800 px-1 text-sm"
                  title="संपादित करें"
                >
                  ✏️
                </button>
                <button
                  type="button"
                  data-ocid={`news.delete_button.${idx + 1}`}
                  onClick={() => handleDeleteNews(item.id)}
                  className="text-red-400 hover:text-red-600 px-1 text-sm"
                  title="हटाएं"
                >
                  🗑️
                </button>
              </div>
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
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState<"products" | "transport">(
    "products",
  );

  // ── ग्रामीन उत्पाद ──
  const { data: products = [], isLoading: productsLoading } = useQuery<
    GraminProduct[]
  >({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts();
    },
    enabled: !!actor && !isFetching,
  });

  const [prodDialogOpen, setProdDialogOpen] = useState(false);
  const [prodForm, setProdForm] = useState({
    farmerName: "",
    productName: "",
    quantity: "",
    price: "",
    phone: "",
  });

  const addProductMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("कनेक्शन नहीं है, Page refresh करें");
      const productName = prodForm.farmerName.trim()
        ? `${prodForm.productName.trim()} (${prodForm.farmerName.trim()})`
        : prodForm.productName.trim();
      return actor.addProduct(
        productName,
        prodForm.quantity.trim(),
        prodForm.price.trim(),
        "",
        prodForm.phone.trim(),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setProdForm({
        farmerName: "",
        productName: "",
        quantity: "",
        price: "",
        phone: "",
      });
      setProdDialogOpen(false);
      const prevProd = Number(
        localStorage.getItem("bisht_products_count") ?? 0,
      );
      localStorage.setItem("bisht_products_count", String(prevProd + 1));
      toast.success("🌾 नया उत्पाद जोड़ा गया!", { duration: 5000 });
    },
    onError: (err) => {
      console.error("addProduct error:", err);
      if (!actor) {
        toast.error("कनेक्शन नहीं है, Page refresh करें");
      } else {
        toast.error("उत्पाद जोड़ने में त्रुटि हुई, पुनः प्रयास करें");
      }
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const [editProdOpen, setEditProdOpen] = useState(false);
  const [editProdItem, setEditProdItem] = useState<GraminProduct | null>(null);
  const [editProdForm, setEditProdForm] = useState({
    productName: "",
    farmerName: "",
    quantity: "",
    price: "",
    phone: "",
  });

  function handleOpenEditProd(p: GraminProduct) {
    const match = p.productName.match(/^(.+?)\s*\((.+)\)$/);
    setEditProdForm({
      productName: match ? match[1].trim() : p.productName,
      farmerName: match ? match[2].trim() : "",
      quantity: p.quantity,
      price: p.pricePerKg,
      phone: p.contactNumber,
    });
    setEditProdItem(p);
    setEditProdOpen(true);
  }

  const updateProductMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !editProdItem) throw new Error("कनेक्शन नहीं है");
      const fullName = editProdForm.farmerName.trim()
        ? `${editProdForm.productName.trim()} (${editProdForm.farmerName.trim()})`
        : editProdForm.productName.trim();
      return (actor as any).updateProduct(
        editProdItem.id,
        fullName,
        editProdForm.quantity.trim(),
        editProdForm.price.trim(),
        "",
        editProdForm.phone.trim(),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setEditProdOpen(false);
      setEditProdItem(null);
      toast.success("✏️ उत्पाद की जानकारी अपडेट हो गई!");
    },
    onError: () => {
      toast.error("अपडेट नहीं हो सका, पुनः प्रयास करें");
    },
  });

  function handleAddProduct() {
    if (!prodForm.productName.trim() || !prodForm.price.trim()) return;
    addProductMutation.mutate();
  }

  // ── ग्रामीन यातायात ──
  const { data: transports = [], isLoading: transportsLoading } = useQuery<
    TransportEntry[]
  >({
    queryKey: ["transports"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTransports();
    },
    enabled: !!actor && !isFetching,
  });

  const [transDialogOpen, setTransDialogOpen] = useState(false);
  const [transForm, setTransForm] = useState({
    driverName: "",
    vehicleType: "",
    departureTime: "",
    destination: "",
    availableSeats: "",
    phone: "",
  });

  const addTransportMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addTransport(
        transForm.vehicleType.trim(),
        transForm.departureTime.trim(),
        transForm.destination.trim(),
        BigInt(Number.parseInt(transForm.availableSeats) || 0),
        transForm.phone.trim(),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transports"] });
      setTransForm({
        driverName: "",
        vehicleType: "",
        departureTime: "",
        destination: "",
        availableSeats: "",
        phone: "",
      });
      setTransDialogOpen(false);
      const prevTrans = Number(
        localStorage.getItem("bisht_transport_count") ?? 0,
      );
      localStorage.setItem("bisht_transport_count", String(prevTrans + 1));
      toast.success("🚗 नई यातायात सेवा जोड़ी गई!", { duration: 5000 });
    },
    onError: () => {
      toast.error("यातायात सेवा जोड़ने में त्रुटि हुई, पुनः प्रयास करें");
    },
  });

  const deleteTransportMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteTransport(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transports"] });
    },
  });

  const [editTransOpen, setEditTransOpen] = useState(false);
  const [editTransItem, setEditTransItem] = useState<TransportEntry | null>(
    null,
  );
  const [editTransForm, setEditTransForm] = useState({
    vehicleType: "",
    departureTime: "",
    destination: "",
    availableSeats: "",
    phone: "",
  });

  function handleOpenEditTrans(t: TransportEntry) {
    setEditTransForm({
      vehicleType: t.vehicleType,
      departureTime: t.departureTime,
      destination: t.destination,
      availableSeats: t.availableSeats.toString(),
      phone: t.contactNumber,
    });
    setEditTransItem(t);
    setEditTransOpen(true);
  }

  const updateTransportMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !editTransItem) throw new Error("कनेक्शन नहीं है");
      return (actor as any).updateTransport(
        editTransItem.id,
        editTransForm.vehicleType.trim(),
        editTransForm.departureTime.trim(),
        editTransForm.destination.trim(),
        BigInt(editTransForm.availableSeats || "0"),
        editTransForm.phone.trim(),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transports"] });
      setEditTransOpen(false);
      setEditTransItem(null);
      toast.success("✏️ यातायात जानकारी अपडेट हो गई!");
    },
    onError: () => {
      toast.error("अपडेट नहीं हो सका, पुनः प्रयास करें");
    },
  });

  function handleAddTransport() {
    if (!transForm.vehicleType.trim() || !transForm.destination.trim()) return;
    addTransportMutation.mutate();
  }

  return (
    <div className="px-4 py-4">
      {/* Sub-tab selector */}
      <div
        className="flex rounded-xl overflow-hidden border mb-4"
        style={{ borderColor: "#c8ddb2" }}
      >
        <button
          type="button"
          data-ocid="market.products.tab"
          onClick={() => setActiveSubTab("products")}
          className="flex-1 py-2.5 text-sm font-semibold transition-colors"
          style={{
            background: activeSubTab === "products" ? "#2D5016" : "#f5f5eb",
            color: activeSubTab === "products" ? "white" : "#2D5016",
          }}
        >
          🌾 ग्रामीन उत्पाद
        </button>
        <button
          type="button"
          data-ocid="market.transport.tab"
          onClick={() => setActiveSubTab("transport")}
          className="flex-1 py-2.5 text-sm font-semibold transition-colors"
          style={{
            background: activeSubTab === "transport" ? "#2D5016" : "#f5f5eb",
            color: activeSubTab === "transport" ? "white" : "#2D5016",
          }}
        >
          🚗 ग्रामीन यातायात
        </button>
      </div>

      {/* ── ग्रामीन उत्पाद ── */}
      {activeSubTab === "products" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2
                className="text-lg font-bold"
                style={{
                  color: "#2D5016",
                  fontFamily: "'Tiro Devanagari Hindi', serif",
                }}
              >
                ग्रामीन उत्पाद
              </h2>
              <p className="text-xs" style={{ color: "#8a9a70" }}>
                किसान अपने उत्पाद यहाँ सूचीबद्ध करें
              </p>
            </div>
            <button
              type="button"
              data-ocid="market.add_product.button"
              onClick={() => setProdDialogOpen(true)}
              className="flex items-center gap-1 text-white text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: "#2D5016" }}
            >
              + उत्पाद जोड़ें
            </button>
          </div>

          <Dialog open={prodDialogOpen} onOpenChange={setProdDialogOpen}>
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
                    किसान का नाम
                  </Label>
                  <Input
                    data-ocid="market.farmer_name.input"
                    placeholder="जैसे: रामलाल यादव"
                    value={prodForm.farmerName}
                    onChange={(e) =>
                      setProdForm((f) => ({ ...f, farmerName: e.target.value }))
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
                    placeholder="जैसे: गेहूँ, मक्का, सब्जी"
                    value={prodForm.productName}
                    onChange={(e) =>
                      setProdForm((f) => ({
                        ...f,
                        productName: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label
                    className="text-xs mb-1 block"
                    style={{ color: "#2D5016" }}
                  >
                    उपलब्ध मात्रा
                  </Label>
                  <Input
                    data-ocid="market.quantity.input"
                    placeholder="जैसे: 50 किग्रा, 2 क्विंटल"
                    value={prodForm.quantity}
                    onChange={(e) =>
                      setProdForm((f) => ({ ...f, quantity: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label
                    className="text-xs mb-1 block"
                    style={{ color: "#2D5016" }}
                  >
                    कीमत *
                  </Label>
                  <Input
                    data-ocid="market.price.input"
                    placeholder="जैसे: ₹22/किग्रा या ₹2200/क्विंटल"
                    value={prodForm.price}
                    onChange={(e) =>
                      setProdForm((f) => ({ ...f, price: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label
                    className="text-xs mb-1 block"
                    style={{ color: "#2D5016" }}
                  >
                    संपर्क नंबर
                  </Label>
                  <Input
                    data-ocid="market.phone.input"
                    placeholder="जैसे: 9876543210"
                    type="tel"
                    value={prodForm.phone}
                    onChange={(e) =>
                      setProdForm((f) => ({ ...f, phone: e.target.value }))
                    }
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    data-ocid="market.product_submit.button"
                    onClick={handleAddProduct}
                    disabled={
                      !prodForm.productName.trim() ||
                      !prodForm.price.trim() ||
                      addProductMutation.isPending
                    }
                    className="flex-1 text-white font-semibold py-2 rounded-xl text-sm disabled:opacity-50"
                    style={{ background: "#2D5016" }}
                  >
                    {addProductMutation.isPending ? "जोड़ा जा रहा है..." : "जोड़ें"}
                  </button>
                  <button
                    type="button"
                    data-ocid="market.product_cancel.button"
                    onClick={() => {
                      setProdDialogOpen(false);
                      setProdForm({
                        farmerName: "",
                        productName: "",
                        quantity: "",
                        price: "",
                        phone: "",
                      });
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

          {/* Edit Product Dialog */}
          <Dialog open={editProdOpen} onOpenChange={setEditProdOpen}>
            <DialogContent className="mx-4 rounded-2xl">
              <DialogHeader>
                <DialogTitle
                  style={{
                    color: "#2D5016",
                    fontFamily: "'Tiro Devanagari Hindi', serif",
                  }}
                >
                  उत्पाद संपादित करें ✏️
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-3 pt-1">
                <div>
                  <Label
                    className="text-xs mb-1 block"
                    style={{ color: "#2D5016" }}
                  >
                    उत्पाद का नाम *
                  </Label>
                  <Input
                    data-ocid="market.edit_product_name.input"
                    placeholder="गेहूँ, मक्का, सब्जी..."
                    value={editProdForm.productName}
                    onChange={(e) =>
                      setEditProdForm((f) => ({
                        ...f,
                        productName: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label
                    className="text-xs mb-1 block"
                    style={{ color: "#2D5016" }}
                  >
                    किसान का नाम
                  </Label>
                  <Input
                    data-ocid="market.edit_farmer_name.input"
                    placeholder="किसान का नाम"
                    value={editProdForm.farmerName}
                    onChange={(e) =>
                      setEditProdForm((f) => ({
                        ...f,
                        farmerName: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label
                    className="text-xs mb-1 block"
                    style={{ color: "#2D5016" }}
                  >
                    मात्रा
                  </Label>
                  <Input
                    data-ocid="market.edit_quantity.input"
                    placeholder="जैसे: 50 किलो"
                    value={editProdForm.quantity}
                    onChange={(e) =>
                      setEditProdForm((f) => ({
                        ...f,
                        quantity: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label
                    className="text-xs mb-1 block"
                    style={{ color: "#2D5016" }}
                  >
                    कीमत *
                  </Label>
                  <Input
                    data-ocid="market.edit_price.input"
                    placeholder="प्रति किलो / क्विंटल"
                    value={editProdForm.price}
                    onChange={(e) =>
                      setEditProdForm((f) => ({ ...f, price: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label
                    className="text-xs mb-1 block"
                    style={{ color: "#2D5016" }}
                  >
                    संपर्क नंबर
                  </Label>
                  <Input
                    data-ocid="market.edit_product_phone.input"
                    type="tel"
                    placeholder="मोबाइल नंबर"
                    value={editProdForm.phone}
                    onChange={(e) =>
                      setEditProdForm((f) => ({ ...f, phone: e.target.value }))
                    }
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    data-ocid="market.edit_product_save.button"
                    onClick={() => updateProductMutation.mutate()}
                    disabled={
                      !editProdForm.productName.trim() ||
                      !editProdForm.price.trim() ||
                      updateProductMutation.isPending
                    }
                    className="flex-1 text-white font-semibold py-2 rounded-xl text-sm disabled:opacity-50"
                    style={{ background: "#2D5016" }}
                  >
                    {updateProductMutation.isPending
                      ? "अपडेट हो रहा है..."
                      : "सेव करें ✓"}
                  </button>
                  <button
                    type="button"
                    data-ocid="market.edit_product_cancel.button"
                    onClick={() => setEditProdOpen(false)}
                    className="flex-1 font-semibold py-2 rounded-xl text-sm border"
                    style={{ borderColor: "#c8ddb2", color: "#2D5016" }}
                  >
                    रद्द करें
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {productsLoading ? (
            <div
              data-ocid="market.products.loading_state"
              className="text-center py-12"
              style={{ color: "#8a9a70" }}
            >
              <p className="text-sm">लोड हो रहा है...</p>
            </div>
          ) : products.length === 0 ? (
            <div
              data-ocid="market.products.empty_state"
              className="text-center py-12"
              style={{ color: "#8a9a70" }}
            >
              <div className="text-4xl mb-3">🌾</div>
              <p className="text-sm font-medium">अभी कोई उत्पाद सूचीबद्ध नहीं है</p>
              <p className="text-xs mt-1">
                किसान "+ उत्पाद जोड़ें" से अपनी फसल की जानकारी दें
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {products.map((p, idx) => (
                <Card
                  key={String(p.id)}
                  data-ocid={`market.product.item.${idx + 1}`}
                  className="rounded-xl"
                  style={{
                    borderColor: "#c8ddb2",
                    borderLeft: "4px solid #2D5016",
                  }}
                >
                  <CardContent className="px-4 py-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-sm font-bold"
                            style={{ color: "#2D5016" }}
                          >
                            🌾 {p.productName}
                          </span>
                          <span
                            className="text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ background: "#5a7a40" }}
                          >
                            नया
                          </span>
                        </div>
                        {p.quantity && (
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: "#4a5a30" }}
                          >
                            📦 मात्रा: {p.quantity}
                          </p>
                        )}
                        <p
                          className="text-xs font-semibold mt-0.5"
                          style={{ color: "#2D5016" }}
                        >
                          💰 कीमत: {p.pricePerKg}
                        </p>
                        {p.contactNumber && (
                          <a
                            href={`tel:${p.contactNumber}`}
                            className="flex items-center gap-1 text-xs mt-1 font-medium"
                            style={{ color: "#1565c0" }}
                          >
                            📞 {p.contactNumber}
                          </a>
                        )}
                      </div>
                      <div className="flex flex-col items-center gap-1 ml-2">
                        <button
                          type="button"
                          data-ocid={`market.product.edit_button.${idx + 1}`}
                          onClick={() => handleOpenEditProd(p)}
                          className="text-green-600 hover:text-green-800 text-base leading-none"
                          title="संपादित करें"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          data-ocid={`market.product.delete_button.${idx + 1}`}
                          onClick={() => deleteProductMutation.mutate(p.id)}
                          className="text-red-400 hover:text-red-600 text-lg leading-none"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ग्रामीन यातायात सेवा ── */}
      {activeSubTab === "transport" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2
                className="text-lg font-bold"
                style={{
                  color: "#2D5016",
                  fontFamily: "'Tiro Devanagari Hindi', serif",
                }}
              >
                ग्रामीन यातायात सेवा
              </h2>
              <p className="text-xs" style={{ color: "#8a9a70" }}>
                वाहन चालक अपनी गाड़ी की जानकारी यहाँ दें
              </p>
            </div>
            <button
              type="button"
              data-ocid="market.add_transport.button"
              onClick={() => setTransDialogOpen(true)}
              className="flex items-center gap-1 text-white text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: "#2D5016" }}
            >
              + गाड़ी जोड़ें
            </button>
          </div>

          <Dialog open={transDialogOpen} onOpenChange={setTransDialogOpen}>
            <DialogContent
              data-ocid="market.add_transport.dialog"
              className="mx-4 rounded-2xl"
            >
              <DialogHeader>
                <DialogTitle
                  style={{
                    color: "#2D5016",
                    fontFamily: "'Tiro Devanagari Hindi', serif",
                  }}
                >
                  गाड़ी की जानकारी जोड़ें
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-3 pt-1">
                <div>
                  <Label
                    className="text-xs mb-1 block"
                    style={{ color: "#2D5016" }}
                  >
                    चालक का नाम
                  </Label>
                  <Input
                    data-ocid="market.driver_name.input"
                    placeholder="जैसे: सुरेश कुमार"
                    value={transForm.driverName}
                    onChange={(e) =>
                      setTransForm((f) => ({
                        ...f,
                        driverName: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label
                    className="text-xs mb-1 block"
                    style={{ color: "#2D5016" }}
                  >
                    गाड़ी का प्रकार *
                  </Label>
                  <Input
                    data-ocid="market.vehicle_type.input"
                    placeholder="जैसे: जीप, टैक्सी, पिकअप"
                    value={transForm.vehicleType}
                    onChange={(e) =>
                      setTransForm((f) => ({
                        ...f,
                        vehicleType: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label
                    className="text-xs mb-1 block"
                    style={{ color: "#2D5016" }}
                  >
                    निकलने का समय
                  </Label>
                  <Input
                    data-ocid="market.departure_time.input"
                    placeholder="जैसे: सुबह 7:00 बजे"
                    value={transForm.departureTime}
                    onChange={(e) =>
                      setTransForm((f) => ({
                        ...f,
                        departureTime: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label
                    className="text-xs mb-1 block"
                    style={{ color: "#2D5016" }}
                  >
                    गंतव्य स्थान *
                  </Label>
                  <Input
                    data-ocid="market.destination.input"
                    placeholder="जैसे: हल्द्वानी, नैनीताल"
                    value={transForm.destination}
                    onChange={(e) =>
                      setTransForm((f) => ({
                        ...f,
                        destination: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label
                    className="text-xs mb-1 block"
                    style={{ color: "#2D5016" }}
                  >
                    खाली सीटें
                  </Label>
                  <Input
                    data-ocid="market.available_seats.input"
                    placeholder="जैसे: 4"
                    type="number"
                    min="0"
                    value={transForm.availableSeats}
                    onChange={(e) =>
                      setTransForm((f) => ({
                        ...f,
                        availableSeats: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label
                    className="text-xs mb-1 block"
                    style={{ color: "#2D5016" }}
                  >
                    संपर्क नंबर
                  </Label>
                  <Input
                    data-ocid="market.transport_phone.input"
                    placeholder="जैसे: 9876543210"
                    type="tel"
                    value={transForm.phone}
                    onChange={(e) =>
                      setTransForm((f) => ({ ...f, phone: e.target.value }))
                    }
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    data-ocid="market.transport_submit.button"
                    onClick={handleAddTransport}
                    disabled={
                      !transForm.vehicleType.trim() ||
                      !transForm.destination.trim() ||
                      addTransportMutation.isPending
                    }
                    className="flex-1 text-white font-semibold py-2 rounded-xl text-sm disabled:opacity-50"
                    style={{ background: "#2D5016" }}
                  >
                    {addTransportMutation.isPending
                      ? "जोड़ा जा रहा है..."
                      : "जोड़ें"}
                  </button>
                  <button
                    type="button"
                    data-ocid="market.transport_cancel.button"
                    onClick={() => {
                      setTransDialogOpen(false);
                      setTransForm({
                        driverName: "",
                        vehicleType: "",
                        departureTime: "",
                        destination: "",
                        availableSeats: "",
                        phone: "",
                      });
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

          {/* Edit Transport Dialog */}
          <Dialog open={editTransOpen} onOpenChange={setEditTransOpen}>
            <DialogContent className="mx-4 rounded-2xl">
              <DialogHeader>
                <DialogTitle
                  style={{
                    color: "#2D5016",
                    fontFamily: "'Tiro Devanagari Hindi', serif",
                  }}
                >
                  यातायात जानकारी संपादित करें ✏️
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-3 pt-1">
                <div>
                  <Label
                    className="text-xs mb-1 block"
                    style={{ color: "#2D5016" }}
                  >
                    गाड़ी का प्रकार *
                  </Label>
                  <Input
                    data-ocid="market.edit_vehicle_type.input"
                    placeholder="जीप, टैक्सी, पिकअप"
                    value={editTransForm.vehicleType}
                    onChange={(e) =>
                      setEditTransForm((f) => ({
                        ...f,
                        vehicleType: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label
                    className="text-xs mb-1 block"
                    style={{ color: "#2D5016" }}
                  >
                    निकलने का समय
                  </Label>
                  <Input
                    data-ocid="market.edit_departure_time.input"
                    placeholder="सुबह 7:00 बजे"
                    value={editTransForm.departureTime}
                    onChange={(e) =>
                      setEditTransForm((f) => ({
                        ...f,
                        departureTime: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label
                    className="text-xs mb-1 block"
                    style={{ color: "#2D5016" }}
                  >
                    गंतव्य स्थान *
                  </Label>
                  <Input
                    data-ocid="market.edit_destination.input"
                    placeholder="हल्द्वानी, नैनीताल"
                    value={editTransForm.destination}
                    onChange={(e) =>
                      setEditTransForm((f) => ({
                        ...f,
                        destination: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label
                    className="text-xs mb-1 block"
                    style={{ color: "#2D5016" }}
                  >
                    खाली सीटें
                  </Label>
                  <Input
                    data-ocid="market.edit_available_seats.input"
                    type="number"
                    min="0"
                    placeholder="4"
                    value={editTransForm.availableSeats}
                    onChange={(e) =>
                      setEditTransForm((f) => ({
                        ...f,
                        availableSeats: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label
                    className="text-xs mb-1 block"
                    style={{ color: "#2D5016" }}
                  >
                    संपर्क नंबर
                  </Label>
                  <Input
                    data-ocid="market.edit_transport_phone.input"
                    type="tel"
                    placeholder="9876543210"
                    value={editTransForm.phone}
                    onChange={(e) =>
                      setEditTransForm((f) => ({ ...f, phone: e.target.value }))
                    }
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    data-ocid="market.edit_transport_save.button"
                    onClick={() => updateTransportMutation.mutate()}
                    disabled={
                      !editTransForm.vehicleType.trim() ||
                      !editTransForm.destination.trim() ||
                      updateTransportMutation.isPending
                    }
                    className="flex-1 text-white font-semibold py-2 rounded-xl text-sm disabled:opacity-50"
                    style={{ background: "#2D5016" }}
                  >
                    {updateTransportMutation.isPending
                      ? "अपडेट हो रहा है..."
                      : "सेव करें ✓"}
                  </button>
                  <button
                    type="button"
                    data-ocid="market.edit_transport_cancel.button"
                    onClick={() => setEditTransOpen(false)}
                    className="flex-1 font-semibold py-2 rounded-xl text-sm border"
                    style={{ borderColor: "#c8ddb2", color: "#2D5016" }}
                  >
                    रद्द करें
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {transportsLoading ? (
            <div
              data-ocid="market.transport.loading_state"
              className="text-center py-12"
              style={{ color: "#8a9a70" }}
            >
              <p className="text-sm">लोड हो रहा है...</p>
            </div>
          ) : transports.length === 0 ? (
            <div
              data-ocid="market.transport.empty_state"
              className="text-center py-12"
              style={{ color: "#8a9a70" }}
            >
              <div className="text-4xl mb-3">🚗</div>
              <p className="text-sm font-medium">अभी कोई गाड़ी सूचीबद्ध नहीं है</p>
              <p className="text-xs mt-1">
                वाहन चालक "+ गाड़ी जोड़ें" से अपनी यात्रा की जानकारी दें
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {transports.map((t, idx) => (
                <Card
                  key={String(t.id)}
                  data-ocid={`market.transport.item.${idx + 1}`}
                  className="rounded-xl"
                  style={{
                    borderColor: "#c8ddb2",
                    borderLeft: "4px solid #5a7a40",
                  }}
                >
                  <CardContent className="px-4 py-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-sm font-bold"
                            style={{ color: "#2D5016" }}
                          >
                            🚗 {t.vehicleType}
                          </span>
                          <span
                            className="text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ background: "#5a7a40" }}
                          >
                            उपलब्ध
                          </span>
                        </div>
                        <p
                          className="text-xs mt-0.5 font-semibold"
                          style={{ color: "#2D5016" }}
                        >
                          📍 गंतव्य: {t.destination}
                        </p>
                        {t.departureTime && (
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: "#4a5a30" }}
                          >
                            ⏰ समय: {t.departureTime}
                          </p>
                        )}
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "#4a5a30" }}
                        >
                          💺 खाली सीटें: {t.availableSeats.toString()}
                        </p>
                        {t.contactNumber && (
                          <a
                            href={`tel:${t.contactNumber}`}
                            className="flex items-center gap-1 text-xs mt-1 font-medium"
                            style={{ color: "#1565c0" }}
                          >
                            📞 {t.contactNumber}
                          </a>
                        )}
                      </div>
                      <div className="flex flex-col items-center gap-1 ml-2">
                        <button
                          type="button"
                          data-ocid={`market.transport.edit_button.${idx + 1}`}
                          onClick={() => handleOpenEditTrans(t)}
                          className="text-green-600 hover:text-green-800 text-base leading-none"
                          title="संपादित करें"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          data-ocid={`market.transport.delete_button.${idx + 1}`}
                          onClick={() => deleteTransportMutation.mutate(t.id)}
                          className="text-red-400 hover:text-red-600 text-lg leading-none"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ServicesPage() {
  const { actor, isFetching } = useActor();
  // Icon/color maps for emergency contacts
  const FIXED_EMERGENCY_PHONES = ["100", "101", "108", "1091"];
  const EMERGENCY_ICON_MAP: Record<string, { icon: string; color: string }> = {
    पुलिस: { icon: "👮", color: "#1565c0" },
    अग्निशमन: { icon: "🚒", color: "#e65100" },
    एम्बुलेंस: { icon: "🚑", color: "#c62828" },
    "महिला हेल्पलाइन": { icon: "👩", color: "#ad1457" },
  };
  const DEFAULT_EMERGENCY_ICON = { icon: "📞", color: "#2D5016" };
  const SERVICE_ICON_MAP: Record<string, string> = {
    "प्राथमिक स्वास्थ्य केंद्र": "🏥",
    "सरकारी प्राथमिक विद्यालय": "🏫",
    "उचित मूल्य की दुकान": "🏪",
    "ग्राम पंचायत कार्यालय": "🏛️",
    "स्टेट बैंक ऑफ इंडिया": "🏦",
    डाकघर: "📮",
    "कृषि सेवा केंद्र": "🌾",
    "पशु चिकित्सालय": "🐄",
    "ग्राम पंचायत": "🏛️",
    "नजदीकी बैंक": "🏦",
    "नजदीकी अस्पताल": "🏥",
    "प्राथमिक विद्यालय": "🏫",
  };

  const DEFAULT_SERVICES_SEED = [
    {
      name: "ग्राम पंचायत",
      phone: "01234-56789",
      timing: "10:00-17:00",
      contactType: "service",
    },
    {
      name: "नजदीकी बैंक",
      phone: "01234-56790",
      timing: "10:00-14:00",
      contactType: "service",
    },
    {
      name: "नजदीकी अस्पताल",
      phone: "01234-56791",
      timing: "24 घंटे",
      contactType: "service",
    },
    {
      name: "प्राथमिक विद्यालय",
      phone: "01234-56792",
      timing: "8:00-14:00",
      contactType: "service",
    },
  ];
  const DEFAULT_EMERGENCY_SEED = [
    { name: "पुलिस", phone: "100", timing: "24 घंटे", contactType: "emergency" },
    {
      name: "अग्निशमन",
      phone: "101",
      timing: "24 घंटे",
      contactType: "emergency",
    },
    { name: "एम्बुलेंस", phone: "108", timing: "24 घंटे", contactType: "emergency" },
    {
      name: "महिला हेल्पलाइन",
      phone: "1091",
      timing: "24 घंटे",
      contactType: "emergency",
    },
  ];

  const { data: allContacts = [], refetch: refetchContacts } = useQuery<any[]>({
    queryKey: ["serviceContacts"],
    queryFn: async () => {
      if (!actor) return [];
      const items = await (actor as any).getServiceContacts();
      if ((items as any[]).length === 0) {
        // Seed defaults
        await Promise.all(
          [...DEFAULT_EMERGENCY_SEED, ...DEFAULT_SERVICES_SEED].map((s) =>
            (actor as any).addServiceContact(
              s.name,
              s.phone,
              s.timing,
              s.contactType,
            ),
          ),
        );
        const seeded = await (actor as any).getServiceContacts();
        return seeded;
      }
      return items;
    },
    enabled: !!actor && !isFetching,
  });

  const services = allContacts.filter((c: any) => c.contactType === "service");
  const contacts = allContacts.filter(
    (c: any) => c.contactType === "emergency",
  );

  const [editId, setEditId] = useState<bigint | null>(null);
  const [editContactType, setEditContactType] = useState<string>("service");
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editTiming, setEditTiming] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function openEditService(c: any) {
    setEditId(c.id);
    setEditContactType(c.contactType);
    setEditName(c.name);
    setEditPhone(c.phone);
    setEditTiming(c.timing || "");
  }

  async function saveEdit() {
    if (editId === null || !actor) return;
    try {
      setIsSaving(true);
      await (actor as any).updateServiceContact(
        editId,
        editName,
        editPhone,
        editTiming,
        editContactType,
      );
      refetchContacts();
      setEditId(null);
      toast.success("✅ जानकारी सहेज ली गई!");
    } catch (_) {
      toast.error("सहेजा नहीं जा सका। Page refresh करें।");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="px-4 py-4 flex flex-col gap-3">
      {/* Emergency Section */}
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
      {contacts.length === 0 && isFetching && (
        <div className="text-center py-4 text-sm" style={{ color: "#8a9a70" }}>
          लोड हो रहा है...
        </div>
      )}
      {contacts.map((contact: any, idx: number) => {
        const meta = EMERGENCY_ICON_MAP[contact.name] ?? DEFAULT_EMERGENCY_ICON;
        const isFixed = FIXED_EMERGENCY_PHONES.includes(contact.phone);
        return (
          <div
            key={String(contact.id)}
            className="relative"
            data-ocid={`emergency.item.${idx + 1}`}
          >
            <a href={`tel:${contact.phone}`} className="block">
              <Card className="card-hover" style={{ borderColor: "#c8ddb2" }}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xl"
                    style={{ background: `${meta.color}20` }}
                  >
                    {meta.icon}
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
                      style={{ color: meta.color }}
                    >
                      {contact.phone}
                    </p>
                  </div>
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{ background: `${meta.color}20`, color: meta.color }}
                  >
                    कॉल करें
                  </span>
                </CardContent>
              </Card>
            </a>
            {!isFixed && (
              <button
                type="button"
                data-ocid={`emergency.edit_button.${idx + 1}`}
                onClick={(e) => {
                  e.preventDefault();
                  openEditService(contact);
                }}
                className="absolute top-2 right-2 text-sm opacity-60 hover:opacity-100 transition-opacity p-1 rounded z-10"
                title="संपादित करें"
              >
                ✏️
              </button>
            )}
          </div>
        );
      })}

      {/* Services Section */}
      <h2
        className="text-lg font-bold mt-4"
        style={{
          color: "#2D5016",
          fontFamily: "'Tiro Devanagari Hindi', serif",
        }}
      >
        सरकारी सेवाएँ
      </h2>
      {services.length === 0 && isFetching && (
        <div className="text-center py-4 text-sm" style={{ color: "#8a9a70" }}>
          लोड हो रहा है...
        </div>
      )}
      {services.map((svc: any, idx: number) => (
        <Card
          key={String(svc.id)}
          data-ocid={`services.item.${idx + 1}`}
          className="card-hover"
          style={{ borderColor: "#c8ddb2" }}
        >
          <CardContent className="p-3 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xl"
              style={{ background: "rgba(45,80,22,0.1)" }}
            >
              {SERVICE_ICON_MAP[svc.name] ?? "🏛️"}
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
              onClick={() => openEditService(svc)}
              className="text-sm opacity-60 hover:opacity-100 transition-opacity p-1 rounded"
              title="संपादित करें"
            >
              ✏️
            </button>
          </CardContent>
        </Card>
      ))}

      <Dialog
        open={editId !== null}
        onOpenChange={(o) => !o && setEditId(null)}
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
              {editContactType === "emergency"
                ? "संपर्क संपादित करें"
                : "सेवा संपादित करें"}
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
                {editContactType === "emergency" ? "नंबर" : "फोन"}
              </Label>
              <Input
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
              />
            </div>
            {editContactType === "service" && (
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
            )}
            <div className="flex gap-2 justify-end pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditId(null)}
              >
                रद्द करें
              </Button>
              <Button
                size="sm"
                onClick={saveEdit}
                disabled={isSaving}
                style={{ background: "#2D5016" }}
              >
                {isSaving ? "सहेज रहे हैं..." : "सहेजें"}
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

function PhotosPage({ isAdmin }: { isAdmin?: boolean }) {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<SelectedPhoto | null>(null);

  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      await (actor as any).deletePhoto(photoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photos"] });
      toast.success("फोटो हटा दी गई!");
    },
    onError: () => toast.error("फोटो नहीं हटाई जा सकी।"),
  });

  const deleteVideoMutation = useMutation({
    mutationFn: async (videoId: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      await (actor as any).deleteVideo(videoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      toast.success("वीडियो हटा दिया गया!");
    },
    onError: () => toast.error("वीडियो नहीं हटाया जा सका।"),
  });
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [longPressId, setLongPressId] = useState<string | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  const makeLongPressHandlers = (id: string) => ({
    onTouchStart: () => {
      didLongPress.current = false;
      longPressTimer.current = setTimeout(() => {
        didLongPress.current = true;
        setLongPressId(id);
      }, 500);
    },
    onTouchEnd: () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    },
    onTouchMove: () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    },
    onMouseDown: () => {
      didLongPress.current = false;
      longPressTimer.current = setTimeout(() => {
        didLongPress.current = true;
        setLongPressId(id);
      }, 500);
    },
    onMouseUp: () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    },
  });
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

  const compressImage = (
    file: File,
    quality = 0.5,
  ): Promise<Uint8Array<ArrayBuffer>> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) {
        file
          .arrayBuffer()
          .then((b) => resolve(new Uint8Array(b)))
          .catch(reject);
        return;
      }
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        const maxDim = 800;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (b) => {
            if (!b) {
              reject(new Error("Compression failed"));
              return;
            }
            b.arrayBuffer()
              .then((ab) => resolve(new Uint8Array(ab)))
              .catch(reject);
          },
          "image/jpeg",
          quality,
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Image load failed"));
      };
      img.src = url;
    });
  };

  const handleUpload = async () => {
    if (!actor || !uploadTitle.trim() || !uploadFile) return;
    const maxPhotoSize = 20 * 1024 * 1024; // 20MB
    if (uploadFile.size > maxPhotoSize) {
      toast.error("फोटो 20MB से बड़ी नहीं होनी चाहिए। कृपया छोटी फोटो चुनें।");
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);
    let lastError: unknown = null;
    const qualities = [0.7, 0.5, 0.4, 0.3, 0.2];
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const quality = qualities[attempt] ?? 0.2;
        const bytes = await compressImage(uploadFile, quality);
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
        setIsUploading(false);
        return;
      } catch (e) {
        lastError = e;
        const msg = e instanceof Error ? e.message : String(e);
        console.error(`Photo upload attempt ${attempt + 1} failed:`, msg);
        if (attempt < 4) {
          const delay =
            msg.includes("v3") || msg.includes("Expected") ? 2000 : 1500;
          toast.loading(`अपलोड हो रहा है... प्रयास ${attempt + 2}/5`, {
            id: "upload-retry",
          });
          await new Promise((r) => setTimeout(r, delay));
          toast.dismiss("upload-retry");
          setUploadProgress(0);
        }
      }
    }
    const msg =
      lastError instanceof Error ? lastError.message : String(lastError);
    if (msg.includes("size") || msg.includes("large")) {
      toast.error("फोटो बहुत बड़ी है। छोटी फोटो चुनें।");
    } else if (msg.includes("unauthorized") || msg.includes("Unauthorized")) {
      toast.error("अपलोड की अनुमति नहीं। Page refresh करें और दोबारा try करें।");
    } else if (msg.includes("v3") || msg.includes("Expected")) {
      toast.error("नेटवर्क समस्या है। कुछ देर बाद दोबारा try करें।");
    } else {
      toast.error("फोटो अपलोड नहीं हो सकी। कृपया दोबारा प्रयास करें।");
    }
    setIsUploading(false);
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
    let lastErr: unknown = null;
    for (let attempt = 0; attempt < 5; attempt++) {
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
        setIsVideoUploading(false);
        return;
      } catch (e) {
        lastErr = e;
        const msg2 = e instanceof Error ? e.message : String(e);
        console.error(`Video upload attempt ${attempt + 1} failed:`, msg2);
        if (attempt < 4) {
          const delay =
            msg2.includes("v3") || msg2.includes("Expected") ? 2000 : 1500;
          toast.loading(`वीडियो अपलोड हो रहा है... प्रयास ${attempt + 2}/5`, {
            id: "video-retry",
          });
          await new Promise((r) => setTimeout(r, delay));
          toast.dismiss("video-retry");
          setVideoProgress(0);
        }
      }
    }
    const msg = lastErr instanceof Error ? lastErr.message : String(lastErr);
    if (msg.includes("unauthorized") || msg.includes("Unauthorized")) {
      toast.error("अपलोड की अनुमति नहीं। Page refresh करें और दोबारा try करें।");
    } else if (msg.includes("v3") || msg.includes("Expected")) {
      toast.error("नेटवर्क समस्या है। कुछ देर बाद दोबारा try करें।");
    } else {
      toast.error("वीडियो अपलोड नहीं हो सका। कृपया दोबारा प्रयास करें।");
    }
    setIsVideoUploading(false);
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
          {/* Unified Photos Grid: uploaded first, then static placeholders */}
          <div className="grid grid-cols-3 gap-2">
            {/* Uploaded Photos with actual thumbnails */}
            {uploadedPhotos.map((photo, idx) => (
              <div
                key={String(photo.id)}
                className="relative"
                {...makeLongPressHandlers(String(photo.id))}
              >
                <button
                  type="button"
                  data-ocid={`photos.item.${idx + 1}`}
                  onClick={() => {
                    if (!didLongPress.current)
                      setSelected({ kind: "uploaded", photo });
                  }}
                  className="rounded-xl overflow-hidden cursor-pointer w-full relative"
                  style={{
                    aspectRatio: "1",
                    border: "2px solid #4a7c26",
                    background: "#f0f7e8",
                  }}
                  aria-label={`${photo.title} देखें`}
                >
                  <img
                    src={photo.blob.getDirectURL()}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                    style={{ borderRadius: "10px" }}
                  />
                  <div
                    className="absolute bottom-0 left-0 right-0 px-1 py-0.5 text-center"
                    style={{
                      background: "rgba(0,0,0,0.45)",
                      borderBottomLeftRadius: "10px",
                      borderBottomRightRadius: "10px",
                    }}
                  >
                    <p
                      className="text-white text-xs truncate"
                      style={{ fontSize: "10px" }}
                    >
                      {photo.title}
                    </p>
                  </div>
                </button>
                {isAdmin && (
                  <button
                    type="button"
                    data-ocid={`photos.delete_button.${idx + 1}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePhotoMutation.mutate(photo.id);
                    }}
                    className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full text-white z-10"
                    style={{
                      background: "rgba(198,40,40,0.85)",
                      fontSize: "11px",
                    }}
                    title="फोटो हटाएं"
                  >
                    🗑
                  </button>
                )}
                {longPressId === String(photo.id) && (
                  <div
                    className="absolute inset-0 z-20 flex items-center justify-center rounded-xl"
                    style={{ background: "rgba(0,0,0,0.65)" }}
                    onClick={() => setLongPressId(null)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setLongPressId(null);
                    }}
                    aria-hidden="true"
                  >
                    <button
                      type="button"
                      data-ocid={`photos.delete_button.${idx + 1}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isAdmin) {
                          deletePhotoMutation.mutate(photo.id);
                          setLongPressId(null);
                        } else {
                          toast.error("केवल admin हटा सकते हैं");
                          setLongPressId(null);
                        }
                      }}
                      className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-white font-bold text-sm"
                      style={{ background: "rgba(198,40,40,0.9)" }}
                    >
                      🗑 हटाएं
                    </button>
                  </div>
                )}
              </div>
            ))}
            {/* Static placeholder photos (shown when no uploads yet) */}
            {uploadedPhotos.length === 0 &&
              PHOTOS.map((photo, _idx) => (
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
                <div
                  key={String(video.id)}
                  className="relative"
                  {...makeLongPressHandlers(`v-${String(video.id)}`)}
                >
                  <button
                    type="button"
                    data-ocid={`videos.item.${idx + 1}`}
                    onClick={() => {
                      if (!didLongPress.current)
                        setSelected({ kind: "video", photo: video });
                    }}
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
                  {isAdmin && (
                    <button
                      type="button"
                      data-ocid={`videos.delete_button.${idx + 1}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteVideoMutation.mutate(video.id);
                      }}
                      className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full text-white z-10"
                      style={{
                        background: "rgba(198,40,40,0.85)",
                        fontSize: "11px",
                      }}
                      title="वीडियो हटाएं"
                    >
                      🗑
                    </button>
                  )}
                  {longPressId === `v-${String(video.id)}` && (
                    <div
                      className="absolute inset-0 z-20 flex items-center justify-center rounded-xl"
                      style={{ background: "rgba(0,0,0,0.65)" }}
                      onClick={() => setLongPressId(null)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") setLongPressId(null);
                      }}
                      aria-hidden="true"
                    >
                      <button
                        type="button"
                        data-ocid={`videos.delete_button.${idx + 1}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isAdmin) {
                            deleteVideoMutation.mutate(video.id);
                            setLongPressId(null);
                          } else {
                            toast.error("केवल admin हटा सकते हैं");
                            setLongPressId(null);
                          }
                        }}
                        className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-white font-bold text-sm"
                        style={{ background: "rgba(198,40,40,0.9)" }}
                      >
                        🗑 हटाएं
                      </button>
                    </div>
                  )}
                </div>
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
    onError: (err) => {
      console.error("addPerson error:", err);
      if (!actor) {
        toast.error("कनेक्शन नहीं है, Page refresh करें");
      } else {
        toast.error("जानकारी सेव नहीं हो सकी, कृपया दोबारा प्रयास करें।");
      }
    },
  });

  const [editPersonOpen, setEditPersonOpen] = useState(false);
  const [editPersonItem, setEditPersonItem] = useState<Person | null>(null);
  const [editPersonForm, setEditPersonForm] = useState({
    name: "",
    profession: "",
    phone: "",
    description: "",
  });

  function handleOpenEditPerson(person: Person) {
    setEditPersonForm({
      name: person.name,
      profession: person.profession,
      phone: person.phoneNumber ?? "",
      description: person.description ?? "",
    });
    setEditPersonItem(person);
    setEditPersonOpen(true);
  }

  const updatePersonMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !editPersonItem) throw new Error("Actor not ready");
      await (actor as any).updatePerson(
        editPersonItem.name,
        editPersonForm.name.trim(),
        editPersonForm.profession.trim(),
        editPersonForm.phone.trim() || null,
        editPersonForm.description.trim() || null,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["persons"] });
      setEditPersonOpen(false);
      setEditPersonItem(null);
      toast.success("✏️ जानकारी अपडेट हो गई!");
    },
    onError: () => {
      toast.error("अपडेट नहीं हो सका, पुनः प्रयास करें");
    },
  });

  const deletePersonMutation = useMutation({
    mutationFn: async (personName: string) => {
      if (!actor) throw new Error("Actor not ready");
      await (actor as any).deletePerson(personName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["persons"] });
      toast.success("🗑️ जानकारी हटा दी गई!");
    },
    onError: () => {
      toast.error("हटाने में त्रुटि हुई");
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

      {/* Edit Person Dialog */}
      <Dialog open={editPersonOpen} onOpenChange={setEditPersonOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle
              style={{
                color: "#2D5016",
                fontFamily: "'Tiro Devanagari Hindi', serif",
              }}
            >
              जानकारी संपादित करें ✏️
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-1">
            <div>
              <Label
                className="text-xs mb-1 block"
                style={{ color: "#4a5a30" }}
              >
                नाम *
              </Label>
              <Input
                data-ocid="people.edit.name.input"
                placeholder="पूरा नाम"
                value={editPersonForm.name}
                onChange={(e) =>
                  setEditPersonForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div>
              <Label
                className="text-xs mb-1 block"
                style={{ color: "#4a5a30" }}
              >
                पेशा / काम *
              </Label>
              <Input
                data-ocid="people.edit.profession.input"
                placeholder="किसान, दुकानदार, शिक्षक..."
                value={editPersonForm.profession}
                onChange={(e) =>
                  setEditPersonForm((f) => ({
                    ...f,
                    profession: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label
                className="text-xs mb-1 block"
                style={{ color: "#4a5a30" }}
              >
                फोन नंबर
              </Label>
              <Input
                data-ocid="people.edit.phone.input"
                type="tel"
                placeholder="मोबाइल नंबर"
                value={editPersonForm.phone}
                onChange={(e) =>
                  setEditPersonForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
            </div>
            <div>
              <Label
                className="text-xs mb-1 block"
                style={{ color: "#4a5a30" }}
              >
                परिचय
              </Label>
              <Textarea
                data-ocid="people.edit.description.textarea"
                placeholder="अपने बारे में..."
                rows={3}
                value={editPersonForm.description}
                onChange={(e) =>
                  setEditPersonForm((f) => ({
                    ...f,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                data-ocid="people.edit.save_button"
                onClick={() => updatePersonMutation.mutate()}
                disabled={
                  !editPersonForm.name.trim() ||
                  !editPersonForm.profession.trim() ||
                  updatePersonMutation.isPending
                }
                className="flex-1 font-semibold"
                style={{ background: "#2D5016", color: "white" }}
              >
                {updatePersonMutation.isPending ? "सेव हो रहा है..." : "सेव करें ✓"}
              </Button>
              <Button
                data-ocid="people.edit.cancel_button"
                variant="outline"
                onClick={() => setEditPersonOpen(false)}
                className="flex-1"
                style={{ borderColor: "#c8ddb2", color: "#2D5016" }}
              >
                रद्द करें
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
                  <div className="flex flex-col items-center gap-1 ml-1">
                    <button
                      type="button"
                      data-ocid={`people.edit_button.${idx + 1}`}
                      onClick={() => handleOpenEditPerson(person)}
                      className="text-green-600 hover:text-green-800 text-base leading-none"
                      title="संपादित करें"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      data-ocid={`people.delete_button.${idx + 1}`}
                      onClick={() => deletePersonMutation.mutate(person.name)}
                      className="text-red-400 hover:text-red-600 text-base leading-none"
                      title="हटाएं"
                    >
                      🗑️
                    </button>
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

// ─── Admin Panel ─────────────────────────────────────────────────────────────

function AdminPage({
  villageInfo,
  onVillageUpdated,
}: {
  villageInfo?: VillageInfo;
  onVillageUpdated: () => void;
}) {
  const { actor } = useActor();
  const [name, setName] = useState(villageInfo?.name ?? "");
  const [slogan, setSlogan] = useState(villageInfo?.slogan ?? "");
  const [population, setPopulation] = useState(villageInfo?.population ?? "");
  const [houses, setHouses] = useState(villageInfo?.houses ?? "");
  const [area, setArea] = useState(villageInfo?.area ?? "");
  const [literacy, setLiteracy] = useState(villageInfo?.literacy ?? "");

  // Sync when villageInfo loads
  useState(() => {
    if (villageInfo) {
      setName(villageInfo.name);
      setSlogan(villageInfo.slogan);
      setPopulation(villageInfo.population);
      setHouses(villageInfo.houses);
      setArea(villageInfo.area);
      setLiteracy(villageInfo.literacy);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      await (actor as any).updateVillageInfo(
        name.trim(),
        slogan.trim(),
        population.trim(),
        houses.trim(),
        area.trim(),
        literacy.trim(),
      );
    },
    onSuccess: () => {
      toast.success("जानकारी सफलतापूर्वक अपडेट हुई! 🎉");
      onVillageUpdated();
    },
    onError: () => {
      toast.error("जानकारी अपडेट नहीं हो सकी। कृपया पुनः प्रयास करें।");
    },
  });

  return (
    <div className="p-4" style={{ background: "#faf8f0", minHeight: "100%" }}>
      <div
        className="rounded-2xl p-4"
        style={{ border: "2px solid #2D5016", background: "white" }}
      >
        <h2
          className="text-base font-bold flex items-center gap-2 mb-3"
          style={{
            color: "#2D5016",
            fontFamily: "'Tiro Devanagari Hindi', serif",
          }}
        >
          🔐 एडमिन पैनल
        </h2>

        <div
          className="rounded-xl p-3 mb-4 text-xs"
          style={{ background: "rgba(45,80,22,0.08)", color: "#2D5016" }}
        >
          गाँव की जानकारी, लोगो का नाम और स्लोगन यहाँ से बदलें।
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <Label
              className="text-xs font-semibold block mb-1"
              style={{ color: "#2D5016" }}
            >
              गाँव का नाम (लोगो में दिखेगा)
            </Label>
            <Input
              data-ocid="admin.name.input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="गाँव का नाम"
              style={{ borderColor: "#c8ddb2" }}
            />
          </div>
          <div>
            <Label
              className="text-xs font-semibold block mb-1"
              style={{ color: "#2D5016" }}
            >
              स्लोगन (लोगो के नीचे)
            </Label>
            <Textarea
              data-ocid="admin.slogan.textarea"
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              placeholder="स्लोगन"
              rows={2}
              style={{ borderColor: "#c8ddb2" }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label
                className="text-xs font-semibold block mb-1"
                style={{ color: "#2D5016" }}
              >
                जनसंख्या
              </Label>
              <Input
                data-ocid="admin.population.input"
                value={population}
                onChange={(e) => setPopulation(e.target.value)}
                placeholder="जनसंख्या"
                style={{ borderColor: "#c8ddb2" }}
              />
            </div>
            <div>
              <Label
                className="text-xs font-semibold block mb-1"
                style={{ color: "#2D5016" }}
              >
                घर (संख्या)
              </Label>
              <Input
                data-ocid="admin.houses.input"
                value={houses}
                onChange={(e) => setHouses(e.target.value)}
                placeholder="घर"
                style={{ borderColor: "#c8ddb2" }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label
                className="text-xs font-semibold block mb-1"
                style={{ color: "#2D5016" }}
              >
                क्षेत्रफल
              </Label>
              <Input
                data-ocid="admin.area.input"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="जैसे: 33.9 हेक्टेयर"
                style={{ borderColor: "#c8ddb2" }}
              />
            </div>
            <div>
              <Label
                className="text-xs font-semibold block mb-1"
                style={{ color: "#2D5016" }}
              >
                साक्षरता
              </Label>
              <Input
                data-ocid="admin.literacy.input"
                value={literacy}
                onChange={(e) => setLiteracy(e.target.value)}
                placeholder="जैसे: 78%"
                style={{ borderColor: "#c8ddb2" }}
              />
            </div>
          </div>
          <button
            type="button"
            data-ocid="admin.save_button"
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            className="w-full py-2 rounded-xl font-semibold text-sm disabled:opacity-60"
            style={{ background: "#2D5016", color: "white" }}
          >
            {updateMutation.isPending ? "सहेजा जा रहा है..." : "✅ जानकारी सहेजें"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Footer({
  isAdmin,
  onAdminClaimed,
  onLogout,
}: {
  isAdmin?: boolean;
  onAdminClaimed?: () => void;
  onLogout?: () => void;
}) {
  const [showPwField, setShowPwField] = useState(false);
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const [photoSrc, setPhotoSrc] = useState(
    "/assets/uploads/WhatsApp-Image-2024-11-07-at-18.20.22-1.jpeg",
  );

  function handleAdminLogin() {
    if (password === "bisht@admin2024") {
      localStorage.setItem("bisht_admin", "true");
      setPassword("");
      setShowPwField(false);
      setPwError(false);
      onAdminClaimed?.();
    } else {
      setPwError(true);
    }
  }

  return (
    <div
      className="text-center py-3 text-xs"
      style={{ color: "#8a9a70", borderTop: "1px solid #e0dac8" }}
    >
      <div className="flex items-center justify-center gap-2 mb-1">
        {photoError ? (
          <div
            className="w-12 h-12 rounded-full border-2 flex items-center justify-center text-white font-bold text-sm"
            style={{ borderColor: "#2D5016", background: "#2D5016" }}
          >
            GB
          </div>
        ) : (
          <img
            src={photoSrc}
            alt="Gaurav Bisht"
            className="w-12 h-12 rounded-full object-cover object-top border-2"
            style={{ borderColor: "#2D5016" }}
            onError={() => {
              if (photoSrc.includes("-1-1.jpeg")) {
                setPhotoSrc(
                  "/assets/uploads/WhatsApp-Image-2024-11-07-at-18.20.22-1.jpeg",
                );
              } else {
                setPhotoError(true);
              }
            }}
          />
        )}
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
      <div className="mt-2 flex flex-col items-center gap-1">
        {isAdmin ? (
          <button
            type="button"
            data-ocid="admin.logout_button"
            onClick={onLogout}
            className="text-xs px-3 py-1 rounded-lg"
            style={{ color: "#c62828", border: "1px solid #f5c6c6" }}
          >
            लॉगआउट
          </button>
        ) : showPwField ? (
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
              <input
                type="password"
                placeholder="एडमिन पासवर्ड"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPwError(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdminLogin();
                }}
                data-ocid="admin.input"
                className="text-xs px-2 py-1 rounded border outline-none"
                style={{
                  borderColor: "#c0b99a",
                  background: "#faf7f0",
                  color: "#3a3328",
                  width: "140px",
                }}
              />
              <button
                type="button"
                data-ocid="admin.submit_button"
                onClick={handleAdminLogin}
                disabled={!password}
                className="text-xs px-2 py-1 rounded font-semibold disabled:opacity-50"
                style={{ background: "#2D5016", color: "white" }}
              >
                ✓ एडमिन
              </button>
              <button
                type="button"
                data-ocid="admin.cancel_button"
                onClick={() => {
                  setShowPwField(false);
                  setPassword("");
                  setPwError(false);
                }}
                className="text-xs px-2 py-1 rounded"
                style={{ color: "#8a9a70", border: "1px solid #c0b99a" }}
              >
                ✕
              </button>
            </div>
            {pwError && (
              <p
                data-ocid="admin.error_state"
                className="text-xs"
                style={{ color: "#c62828" }}
              >
                ❌ गलत पासवर्ड
              </p>
            )}
          </div>
        ) : (
          <button
            type="button"
            data-ocid="admin.login_button"
            onClick={() => setShowPwField(true)}
            className="text-xs px-3 py-1.5 rounded-lg font-semibold border"
            style={{
              color: "#2D5016",
              borderColor: "#2D5016",
              background: "rgba(45,80,22,0.07)",
            }}
          >
            🔐 Admin
          </button>
        )}
      </div>
    </div>
  );
}
// ─── App ───────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(
    window.location.hash === "#admin" ? "admin" : "home",
  );
  const { actor, isFetching } = useActor();
  const [isAdmin, setIsAdmin] = useState(
    () => localStorage.getItem("bisht_admin") === "true",
  );
  const { data: newsList = INITIAL_NEWS, refetch: refetchNews } = useQuery<
    NewsItem[]
  >({
    queryKey: ["news"],
    queryFn: async () => {
      if (!actor) return INITIAL_NEWS;
      const items = await (actor as any).getNews();
      return (items as any[]).map((n: any) => ({
        id: Number(n.id),
        title: n.title,
        body: n.body,
        date: n.date,
        tag: n.tag,
      }));
    },
    enabled: !!actor && !isFetching,
  });

  // Inject animation CSS
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "bisht-animations";
    style.textContent = `
      @keyframes marquee {
        0% { transform: translateX(100vw); }
        100% { transform: translateX(-100%); }
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(16px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    if (!document.getElementById("bisht-animations")) {
      document.head.appendChild(style);
    }
    return () => {
      const existing = document.getElementById("bisht-animations");
      if (existing) existing.remove();
    };
  }, []);

  // ── Notification polling: show toast when new photos/videos/persons added ──
  useEffect(() => {
    if (!actor || isFetching) return;

    const initAndPoll = async () => {
      try {
        const [photos, videos, persons] = await Promise.all([
          (actor as any).getPhotos(),
          (actor as any).getVideos(),
          (actor as any).getPersons(),
        ]);
        const pCount = (photos as any[]).length;
        const vCount = (videos as any[]).length;
        const peCount = (persons as any[]).length;

        // Initialize baseline if not set
        if (!localStorage.getItem("bisht_photos_count")) {
          localStorage.setItem("bisht_photos_count", String(pCount));
        }
        if (!localStorage.getItem("bisht_videos_count")) {
          localStorage.setItem("bisht_videos_count", String(vCount));
        }
        if (!localStorage.getItem("bisht_persons_count")) {
          localStorage.setItem("bisht_persons_count", String(peCount));
        }
      } catch (_) {}
    };

    initAndPoll();

    const interval = setInterval(async () => {
      try {
        const [photos, videos, persons] = await Promise.all([
          (actor as any).getPhotos(),
          (actor as any).getVideos(),
          (actor as any).getPersons(),
        ]);
        const pCount = (photos as any[]).length;
        const vCount = (videos as any[]).length;
        const peCount = (persons as any[]).length;

        const prevP = Number(
          localStorage.getItem("bisht_photos_count") ?? pCount,
        );
        const prevV = Number(
          localStorage.getItem("bisht_videos_count") ?? vCount,
        );
        const prevPe = Number(
          localStorage.getItem("bisht_persons_count") ?? peCount,
        );

        if (pCount > prevP) {
          toast.success("📸 नई फ़ोटो जोड़ी गई!", { duration: 5000 });
          localStorage.setItem("bisht_photos_count", String(pCount));
        }
        if (vCount > prevV) {
          toast.success("🎥 नया वीडियो जोड़ा गया!", { duration: 5000 });
          localStorage.setItem("bisht_videos_count", String(vCount));
        }
        if (peCount > prevPe) {
          toast.success("👤 नया व्यक्ति जोड़ा गया!", { duration: 5000 });
          localStorage.setItem("bisht_persons_count", String(peCount));
        }

        // News notifications (backend-based)
        try {
          const newsItems = await (actor as any).getNews();
          const newsCount = (newsItems as any[]).length;
          const prevNews = Number(
            localStorage.getItem("bisht_news_count_prev") ?? newsCount,
          );
          if (newsCount > prevNews) {
            toast.success("📰 नई खबर जोड़ी गई!", { duration: 5000 });
            refetchNews();
          }
          localStorage.setItem("bisht_news_count_prev", String(newsCount));
        } catch (_) {}

        // Product notifications
        const prodCount = Number(
          localStorage.getItem("bisht_products_count") ?? 0,
        );
        const prevProd2 = Number(
          localStorage.getItem("bisht_products_count_prev") ?? prodCount,
        );
        if (prodCount > prevProd2) {
          toast.success("🌾 नया उत्पाद जोड़ा गया!", { duration: 5000 });
        }
        localStorage.setItem("bisht_products_count_prev", String(prodCount));

        // Transport notifications
        const transCount = Number(
          localStorage.getItem("bisht_transport_count") ?? 0,
        );
        const prevTrans2 = Number(
          localStorage.getItem("bisht_transport_count_prev") ?? transCount,
        );
        if (transCount > prevTrans2) {
          toast.success("🚗 नई यातायात सेवा जोड़ी गई!", { duration: 5000 });
        }
        localStorage.setItem("bisht_transport_count_prev", String(transCount));
      } catch (_) {}
    }, 30000);

    return () => clearInterval(interval);
  }, [actor, isFetching, refetchNews]);

  const {
    data: villageInfo,
    isLoading: isVillageLoading,
    refetch: refetchVillageInfo,
  } = useQuery<VillageInfo>({
    queryKey: ["villageInfo"],
    queryFn: async () => {
      if (!actor)
        return {
          name: "",
          slogan: "",
          population: "131",
          houses: "30",
          area: "33.9 हेक्टेयर",
          literacy: "78%",
        };
      return (actor as any).getVillageInfo();
    },
    enabled: !!actor && !isFetching,
  });

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
      <Toaster
        position="top-center"
        richColors
        toastOptions={{ duration: 5000, style: { fontSize: "16px" } }}
      />

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
        {activeTab === "home" && (
          <HomePage
            villageInfo={villageInfo}
            isVillageLoading={isVillageLoading}
            newsList={newsList}
          />
        )}
        {activeTab === "news" && (
          <NewsPage newsList={newsList} refetchNews={refetchNews} />
        )}
        {activeTab === "market" && <MarketPage />}
        {activeTab === "services" && <ServicesPage />}
        {activeTab === "photos" && <PhotosPage isAdmin={!!isAdmin} />}
        {activeTab === "people" && <PeoplePage />}
        {activeTab === "admin" && (
          <AdminPage
            villageInfo={villageInfo}
            onVillageUpdated={() => refetchVillageInfo()}
          />
        )}
        <Footer
          isAdmin={isAdmin}
          onAdminClaimed={() => {
            setIsAdmin(true);
            setActiveTab("admin");
          }}
          onLogout={() => {
            localStorage.removeItem("bisht_admin");
            setIsAdmin(false);
          }}
        />
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
        <div className={isAdmin ? "grid grid-cols-8" : "grid grid-cols-7"}>
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
          {isAdmin && (
            <button
              type="button"
              data-ocid="nav.admin.tab"
              onClick={() => setActiveTab("admin")}
              className="flex flex-col items-center justify-center py-2 gap-0.5 transition-all"
              style={{
                color: activeTab === "admin" ? "#2D5016" : "#8a9a70",
                borderTop:
                  activeTab === "admin"
                    ? "2.5px solid #2D5016"
                    : "2.5px solid transparent",
                background:
                  activeTab === "admin" ? "rgba(45,80,22,0.06)" : "transparent",
              }}
            >
              <span className="text-base leading-none">🔐</span>
              <span
                className="text-center leading-tight"
                style={{
                  fontSize: "0.5rem",
                  fontWeight: activeTab === "admin" ? 700 : 400,
                }}
              >
                एडमिन
              </span>
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}
