import React from 'react';
import { X, Sparkles, UserCheck, ShieldCheck, Eye, Smile, Shirt, Building, Terminal } from 'lucide-react';

export interface FacialAnalysisResult {
  facialAnalysis: string;
  hairDetails: string;
  skinAndEyes: string;
  careerAttire: string;
  careerSetting: string;
  generatedPrompt: string;
  careerTitleVi?: string;
  inspirationalMessage?: string;
}

interface AnalysisInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: FacialAnalysisResult | null;
  studentName: string;
  dreamCareer: string;
}

export const AnalysisInspector: React.FC<AnalysisInspectorProps> = ({
  isOpen,
  onClose,
  analysis,
  studentName,
  dreamCareer,
}) => {
  if (!isOpen || !analysis) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl border border-sky-100 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-pink-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="font-bold font-display text-base sm:text-lg">
                Hồ Sơ Nhận Diện & Tái Tạo Chân Thực
              </h3>
              <p className="text-xs text-sky-100">
                Phân tích bởi Gemini AI • Học sinh: {studentName} ({dreamCareer})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Identity Likeness Meter */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-emerald-50 border border-emerald-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-sm text-center px-1 shadow-sm leading-tight">
                CHUẨN THỰC
              </div>
              <div>
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Độ Chân Thực Như Ngoài Đời
                </div>
                <p className="text-xs text-slate-500">
                  Bảo tồn trọn vẹn đặc trưng ngũ quan và biểu cảm tự nhiên của học sinh Trường Tiểu Học Tiến Hưng
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-bold bg-white text-emerald-700 border border-emerald-300 shadow-xs">
              Chuẩn Nhân Trắc Học
            </span>
          </div>

          {/* Deep Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-xs text-sky-800">
                <UserCheck className="w-4 h-4 text-sky-600" />
                <span>Hình Học & Đường Nét Khuôn Mặt</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {analysis.facialAnalysis}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-100 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-xs text-pink-800">
                <Eye className="w-4 h-4 text-pink-600" />
                <span>Đôi Mắt & Nụ Cười Tuổi Thơ</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {analysis.skinAndEyes}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-xs text-amber-800">
                <Smile className="w-4 h-4 text-amber-600" />
                <span>Chân Tóc & Kiểu Mái Tự Nhiên</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {analysis.hairDetails}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-800">
                <Shirt className="w-4 h-4 text-indigo-600" />
                <span>Trang Phục Ước Mơ Thu Nhỏ</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {analysis.careerAttire}
              </p>
            </div>
          </div>

          {/* Career Environment */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-700">
              <Building className="w-4 h-4 text-slate-600" />
              <span>Bối Cảnh Không Gian Nghề Nghiệp</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {analysis.careerSetting}
            </p>
          </div>

          {/* Prompt Formula Applied */}
          <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-300">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-4 h-4" />
                <span>Công Thức Prompt Studio 8K Chuẩn</span>
              </div>
              <span className="text-[10px] text-slate-400">85mm f/1.4 Cinematic Lighting</span>
            </div>
            <div className="text-xs font-mono bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300 overflow-x-auto leading-relaxed">
              {analysis.generatedPrompt}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Đóng bảng phân tích
          </button>
        </div>
      </div>
    </div>
  );
};
