import React from 'react';
import { Sparkles, GraduationCap, Heart, HelpCircle } from 'lucide-react';

interface NavbarProps {
  onOpenHelp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenHelp }) => {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 border-b border-sky-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 via-amber-300 to-pink-400 flex items-center justify-center shadow-md shadow-sky-200/50 text-white animate-float">
            <GraduationCap className="w-7 h-7 text-white drop-shadow-sm" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black font-display bg-gradient-to-r from-sky-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
                ĐÔI CÁNH ƯỚC MƠ
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                🏫 TRƯỜNG TIỂU HỌC TIẾN HƯNG
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenHelp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:text-sky-600 hover:bg-sky-50 transition-colors border border-slate-200/80 cursor-pointer"
            title="Hướng dẫn sử dụng"
          >
            <HelpCircle className="w-4 h-4 text-sky-500" />
            <span className="hidden md:inline">Hướng dẫn</span>
          </button>

          <div className="flex items-center gap-1 text-xs font-medium bg-gradient-to-r from-sky-100 to-pink-100 text-slate-700 px-3 py-1.5 rounded-full border border-sky-200/60 shadow-xs">
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
            <span>Dành cho Thầy Cô & Học Sinh</span>
          </div>
        </div>
      </div>
    </header>
  );
};
