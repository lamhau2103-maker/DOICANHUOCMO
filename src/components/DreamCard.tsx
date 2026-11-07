import React, { useRef, useState } from 'react';
import {
  Download,
  Printer,
  Sparkles,
  Share2,
  Copy,
  Check,
  Award,
  Star,
  Palette,
  Heart,
  ZoomIn,
} from 'lucide-react';
import { FRAME_THEMES, CardFrameTheme } from '../data/careerTemplates';

// Declare html2canvas window type in case loaded from CDN or imported
declare global {
  interface Window {
    html2canvas?: any;
  }
}

interface DreamCardProps {
  studentName: string;
  studentClass: string;
  dreamCareer: string;
  portraitUrl: string | null;
  careerTitleVi?: string;
  inspirationalMessage?: string;
  isGenerating: boolean;
  onRegenerate?: () => void;
  onOpenAnalysis?: () => void;
}

export const DreamCard: React.FC<DreamCardProps> = ({
  studentName,
  studentClass,
  dreamCareer,
  portraitUrl,
  careerTitleVi,
  inspirationalMessage,
  isGenerating,
  onRegenerate,
  onOpenAnalysis,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [selectedTheme, setSelectedTheme] = useState<CardFrameTheme>(FRAME_THEMES[0]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  // Safe filename generator
  const getDownloadFilename = () => {
    const cleanName = (studentName || 'HocSinh')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '_');
    const cleanClass = (studentClass || '2').replace(/[^a-zA-Z0-9]/g, '');
    return `Ky_Niem_Tien_Hung_${cleanClass}_${cleanName}.png`;
  };

  // Download complete framed card via html2canvas
  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);

    try {
      // Use imported or CDN html2canvas
      let h2c = window.html2canvas;
      if (!h2c) {
        const mod = await import('html2canvas');
        h2c = mod.default || mod;
      }

      if (!h2c) {
        throw new Error('Thư viện html2canvas chưa sẵn sàng.');
      }

      const canvas = await h2c(cardRef.current, {
        scale: 2.5, // High DPI for crystal sharp printing
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = getDownloadFilename();
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
      alert('Đã có lỗi khi tạo tệp ảnh tải xuống. Vui lòng thử lại.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Quick Print Card
  const handlePrint = () => {
    window.print();
  };

  // Copy Image or Link
  const handleCopy = async () => {
    try {
      if (!cardRef.current) return;
      let h2c = window.html2canvas;
      if (!h2c) {
        const mod = await import('html2canvas');
        h2c = mod.default || mod;
      }
      const canvas = await h2c(cardRef.current, { scale: 2, useCORS: true });
      canvas.toBlob(async (blob: Blob | null) => {
        if (blob && navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          setHasCopied(true);
          setTimeout(() => setHasCopied(false), 2500);
        } else {
          alert('Đã sao chép thông tin thẻ kỷ niệm vào bộ nhớ tạm.');
        }
      });
    } catch (e) {
      console.warn(e);
    }
  };

  const displayName = studentName.trim() || 'Nguyễn Minh Đức';
  const displayClass = studentClass.trim() || '2A';
  const displayCareer = careerTitleVi || dreamCareer.trim() || 'Bác sĩ nhi khoa';
  const displayQuote =
    inspirationalMessage ||
    `Chúc em luôn tự tin, chăm ngoan và sớm chạm tới ước mơ trở thành ${displayCareer}!`;

  return (
    <div className="space-y-4">
      {/* Top Frame Controls */}
      <div className="backdrop-blur-md bg-white/80 rounded-2xl border border-sky-100 p-3.5 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-sky-500" />
          <span className="text-xs font-bold text-slate-700">Khung Ảnh:</span>
          <div className="flex items-center gap-1.5">
            {FRAME_THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  selectedTheme.id === theme.id
                    ? 'bg-sky-600 text-white shadow-xs scale-105'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: theme.starColor }}
                />
                {theme.label || theme.name.split(' ').slice(0, 2).join(' ')}
              </button>
            ))}
          </div>
        </div>

        {portraitUrl && onOpenAnalysis && (
          <button
            type="button"
            onClick={onOpenAnalysis}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-xl transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Xem Phân Tích Nét Mặt 90%
          </button>
        )}
      </div>

      {/* Collectible Framing Card ("Khung Ảnh Kỷ Niệm Lớp 2") */}
      <div className="flex justify-center">
        <div
          ref={cardRef}
          id="collectible-dream-card"
          className={`w-full max-w-[440px] rounded-3xl overflow-hidden bg-white ${selectedTheme.borderStyle} transition-all duration-300 relative print:shadow-none print:border-none`}
        >
          {/* Card School Header Ribbon */}
          <div className={`${selectedTheme.headerBg} px-4 py-3 text-white text-center relative overflow-hidden shadow-xs`}>
            {/* Subtle background stars */}
            <div className="absolute top-1 left-2 text-white/30 text-xs select-none">✦</div>
            <div className="absolute top-2 right-4 text-white/40 text-sm select-none">★</div>
            <div className="absolute bottom-1 right-12 text-white/20 text-xs select-none">✦</div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-white/95">
              <Award className="w-3.5 h-3.5 text-amber-200" />
              <span>TRƯỜNG TIỂU HỌC TIẾN HƯNG</span>
            </div>

            <h3 className="text-base sm:text-lg font-black font-display tracking-wide drop-shadow-sm mt-0.5 uppercase">
              CHÂN DUNG ƯỚC MƠ
            </h3>
          </div>

          {/* Dream Portrait Area */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-b from-white via-sky-50/20 to-white">
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-slate-100 border-2 border-white shadow-inner flex items-center justify-center group">
              {portraitUrl ? (
                <>
                  <img
                    src={portraitUrl}
                    alt={`Ước mơ ${displayCareer} của bé ${displayName}`}
                    className="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Subtle glossy sheen */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/20 pointer-events-none" />

                  {/* Top-Right Career Badge */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-md border border-white/60 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{displayCareer}</span>
                  </div>

                  {/* True to life realism tag */}
                  <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-amber-300 border border-amber-300/40 flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-amber-300" />
                    <span>Chân Thực Như Ngoài Đời</span>
                  </div>
                </>
              ) : isGenerating ? (
                /* Loading State Inside Card */
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-amber-300 border-t-pink-500 animate-spin" />
                    <Sparkles className="w-8 h-8 text-amber-500 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Đang biến hóa ước mơ...
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Tái tạo chân thực như ngoài đời trong trang phục {displayCareer}
                    </p>
                  </div>
                </div>
              ) : (
                /* Placeholder State */
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 bg-gradient-to-b from-sky-50 to-amber-50/50 w-full h-full">
                  <div className="w-20 h-20 rounded-full bg-white/80 border-2 border-dashed border-sky-300 flex items-center justify-center shadow-xs text-sky-500 animate-float">
                    <Sparkles className="w-10 h-10 text-amber-400 fill-amber-300" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">Khung Ảnh Kỷ Niệm Sẵn Sàng</h4>
                    <p className="text-xs text-slate-500 max-w-[240px] mt-1">
                      Tải ảnh bé & bấm nút "Biến Ước Mơ Thành Sự Thật" để xuất hiện chân dung tại đây!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Banner: Student Information & Heartwarming Quote */}
          <div className={`${selectedTheme.footerBg} p-4 sm:p-5 border-t border-slate-100 space-y-3`}>
            {/* Student Nameplate Grid */}
            <div className="bg-white/95 rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    HỌ VÀ TÊN:
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-slate-800">
                    {displayName}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    LỚP:
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-sky-100 text-sky-800 text-xs font-bold border border-sky-200">
                    {displayClass}
                  </span>
                </div>
              </div>

              {/* Dream Career Highlight */}
              <div className="flex items-center gap-2 pt-0.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  ƯỚC MƠ:
                </span>
                <span className="text-xs sm:text-sm font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200 flex-1">
                  ✨ {displayCareer}
                </span>
              </div>
            </div>

            {/* Encouragement Quote & Seal */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex-1">
                <p className="text-[11px] sm:text-xs text-slate-600 italic leading-relaxed">
                  "{displayQuote}"
                </p>
              </div>

              {/* Official Seal Badge */}
              <div className="w-14 h-14 rounded-full border-2 border-dashed border-amber-400 bg-amber-50/80 flex flex-col items-center justify-center p-1 text-center shrink-0 shadow-xs">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="text-[8px] font-black text-amber-900 leading-tight">
                  KỶ NIỆM
                </span>
                <span className="text-[7px] font-bold text-amber-700">TIẾN HƯNG</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Toolbar Below Card */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={!portraitUrl || isDownloading}
          className={`px-5 py-3 rounded-2xl font-bold text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer ${
            !portraitUrl || isDownloading
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 hover:scale-105 active:scale-95'
          }`}
          title="Tải ảnh kỷ niệm đầy đủ khung và thông tin học sinh"
        >
          <Download className="w-4 h-4" />
          <span>{isDownloading ? 'Đang tạo ảnh...' : '📥 Tải Ảnh Kỷ Niệm (PNG)'}</span>
        </button>

        <button
          type="button"
          onClick={handlePrint}
          disabled={!portraitUrl}
          className={`px-4 py-3 rounded-2xl font-semibold text-xs sm:text-sm border transition-all flex items-center gap-1.5 cursor-pointer ${
            !portraitUrl
              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-xs hover:border-slate-400'
          }`}
        >
          <Printer className="w-4 h-4 text-slate-600" />
          <span>In Nhanh</span>
        </button>

        <button
          type="button"
          onClick={handleCopy}
          disabled={!portraitUrl}
          className={`px-4 py-3 rounded-2xl font-semibold text-xs sm:text-sm border transition-all flex items-center gap-1.5 cursor-pointer ${
            !portraitUrl
              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-xs hover:border-slate-400'
          }`}
        >
          {hasCopied ? (
            <>
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-700 font-bold">Đã chép!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-600" />
              <span>Sao Chép Thẻ</span>
            </>
          )}
        </button>

        {onRegenerate && portraitUrl && (
          <button
            type="button"
            onClick={onRegenerate}
            className="px-4 py-3 rounded-2xl font-semibold text-xs sm:text-sm bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span>Tạo Lại Biến Thể Mới</span>
          </button>
        )}
      </div>
    </div>
  );
};
