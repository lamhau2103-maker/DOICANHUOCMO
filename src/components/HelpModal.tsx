import React from 'react';
import { X, Sparkles, GraduationCap, CheckCircle2, ShieldAlert, Heart, Download } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl border border-sky-100 shadow-2xl max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 via-indigo-500 to-pink-500 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="w-6 h-6 text-amber-200" />
            <h3 className="font-bold font-display text-base sm:text-lg">
              Hướng Dẫn Sử Dụng "Đôi Cánh Ước Mơ"
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-700">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                1
              </span>
              <div>
                <p className="font-bold text-slate-800">Tải Ảnh Chân Dung Bé</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chọn ảnh chụp thẳng, rõ ngũ quan, mắt mở to và nụ cười tự nhiên. Có thể tải ảnh có sẵn, dùng Camera hoặc bấm vào 4 ảnh mẫu có sẵn để trải nghiệm ngay.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                2
              </span>
              <div>
                <p className="font-bold text-slate-800">Điền Họ Tên, Lớp & Ước Mơ</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Nhập tự do ước mơ nghề nghiệp của học sinh (ví dụ: Bác sĩ, Phi hành gia, Cầu thủ bóng đá, Chú bộ đội, v.v.).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                3
              </span>
              <div>
                <p className="font-bold text-slate-800">Chọn Chế Độ & Bấm "TẠO ẢNH ƯỚC MƠ"</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hệ thống thực hiện phân tích đặc điểm nhân diện qua Gemini AI và tái tạo chân dung chân thực như ngoài đời với đồng phục chuyên nghiệp và bối cảnh sống động.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                4
              </span>
              <div>
                <p className="font-bold text-slate-800">Tải Thẻ Kỷ Niệm (PNG) hoặc In</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tải ảnh kỷ niệm hoàn chỉnh gồm cả khung trang trí và bảng tên học sinh để in ấn, gửi phụ huynh hoặc lưu vào kỷ yếu Trường Tiểu Học Tiến Hưng!
                </p>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200/80 text-xs text-sky-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-sky-800">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Công Nghệ Tái Tạo Chân Thực Như Ngoài Đời
            </div>
            <p className="text-slate-600 leading-relaxed">
              Trí tuệ nhân tạo trích xuất chi tiết hình học mắt, nụ cười, sống mũi, nước da của bé và kết hợp vào công thức chụp ảnh chân dung thực tế, mang lại tấm ảnh kỷ niệm sinh động và chân thực nhất.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
};
