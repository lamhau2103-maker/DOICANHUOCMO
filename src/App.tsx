/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { StudentInputForm, StudentFormData } from './components/StudentInputForm';
import { DreamCard } from './components/DreamCard';
import { AnalysisInspector, FacialAnalysisResult } from './components/AnalysisInspector';
import { HelpModal } from './components/HelpModal';
import { SAMPLE_STUDENTS } from './data/careerTemplates';
import { Sparkles, AlertCircle } from 'lucide-react';

export default function App() {
  // Initialize with the first sample student (real photograph)
  const [formData, setFormData] = useState<StudentFormData>({
    fullName: SAMPLE_STUDENTS[0].name,
    studentClass: SAMPLE_STUDENTS[0].studentClass,
    dreamCareer: SAMPLE_STUDENTS[0].dreamCareer,
    photoUrl: SAMPLE_STUDENTS[0].avatarUrl,
    photoBase64: SAMPLE_STUDENTS[0].avatarUrl,
  });

  const [portraitResult, setPortraitResult] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<FacialAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Trigger celebratory confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#facc15', '#f472b6', '#4ade80', '#a855f7'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 250);
    } catch (e) {
      console.warn('Confetti error:', e);
    }
  };

  // Convert image URL to base64 if not already data URI
  const ensureBase64 = async (input: string): Promise<string> => {
    if (input.startsWith('data:image/')) return input;
    const response = await fetch(input);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Main 5-step strict photorealistic generation pipeline
  const handleGenerate = async () => {
    if (!formData.photoUrl || !formData.fullName || !formData.dreamCareer) {
      alert('Vui lòng điền đầy đủ họ tên, lớp, ước mơ và tải ảnh chân dung học sinh.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Chuẩn bị dữ liệu base64 ảnh gốc
      const base64Data = await ensureBase64(formData.photoBase64 || formData.photoUrl);

      // Bước 1: Quét khuôn mặt
      setLoadingStep('Đang quét khuôn mặt…');
      const valRes = await fetch('/api/validate-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Data }),
      });
      const valData = await valRes.json().catch(() => ({ valid: true }));
      if (valData.valid === false) {
        throw new Error(
          valData.error ||
            'Không tìm thấy khuôn mặt rõ nét của học sinh trong ảnh. Vui lòng tải lên ảnh chụp chính diện, rõ mặt và không bị mờ nhòe.'
        );
      }

      // Bước 2: Tách nền & thiết lập mô tả nghề
      setLoadingStep('Đang tách nền…');
      await new Promise((r) => setTimeout(r, 600));

      // Bước 3, 4, 5: Tạo ảnh chân thực bằng model AI với ảnh gốc làm tham chiếu
      setLoadingStep('Đang tạo ảnh chân thực…');
      const processRes = await fetch('/api/process-dream-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          studentName: formData.fullName,
          studentClass: formData.studentClass,
          dreamCareer: formData.dreamCareer,
        }),
      });

      const resultData = await processRes.json();

      if (!processRes.ok || !resultData.imageUrl) {
        throw new Error(
          resultData.error ||
            'Không thể tạo được ảnh chân thực vào lúc này do máy chủ đang bận. Vui lòng bấm thử lại sau giây lát.'
        );
      }

      setPortraitResult(resultData.imageUrl);
      setAnalysisResult({
        facialAnalysis: 'Khuôn mặt chụp thật được bảo tồn trọn vẹn đặc trưng nhận dạng nhân trắc học.',
        hairDetails: 'Chân tóc và kiểu tóc thật của học sinh được giữ nguyên.',
        skinAndEyes: 'Ánh mắt và nụ cười thật, kết cấu da tự nhiên có lỗ chân lông và ánh sáng chân thực.',
        careerAttire: `Trang phục nghề nghiệp thật chuẩn tỉ lệ thu nhỏ ngành ${resultData.careerTitleVi || formData.dreamCareer}.`,
        careerSetting: 'Bối cảnh thực tế sống động với độ sâu trường ảnh tự nhiên của ống kính 85mm f/1.4.',
        generatedPrompt: resultData.promptUsed || '',
        careerTitleVi: resultData.careerTitleVi || formData.dreamCareer,
        inspirationalMessage: resultData.inspirationalMessage,
      });

      triggerConfetti();
    } catch (error: any) {
      console.error('Generation pipeline error:', error);
      setErrorMessage(error.message || 'Đã có lỗi xảy ra trong quá trình tạo ảnh.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100/70 via-amber-50/50 to-pink-100/60 text-slate-800 relative selection:bg-amber-200 selection:text-amber-900 pb-16">
      {/* Background Decorative Sparkles and Cloud Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-12 left-10 text-amber-300 text-3xl animate-twinkle">✦</div>
        <div className="absolute top-48 right-16 text-pink-300 text-4xl animate-twinkle delay-700">★</div>
        <div className="absolute bottom-24 left-1/4 text-sky-300 text-2xl animate-twinkle delay-1000">✦</div>
        <div className="absolute top-1/3 left-6 w-72 h-72 bg-sky-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-8 w-80 h-80 bg-pink-200/25 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-amber-100/35 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <Navbar onOpenHelp={() => setIsHelpOpen(true)} />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 relative z-10">
        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-white/90 text-sky-700 border border-sky-200/80 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>TRƯỜNG TIỂU HỌC TIẾN HƯNG</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-slate-900 uppercase">
            Đôi Cánh Ước Mơ
          </h2>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="max-w-2xl mx-auto mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between shadow-xs animate-shake">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span className="font-medium leading-relaxed">{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs font-bold underline cursor-pointer ml-3 shrink-0"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Two-Column Responsive Bento Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Input Form & Photo Upload (5 cols on lg) */}
          <div className="lg:col-span-6 xl:col-span-5">
            <StudentInputForm
              formData={formData}
              onChange={(updated) => setFormData((prev) => ({ ...prev, ...updated }))}
              onSubmit={handleGenerate}
              isLoading={isLoading}
              loadingStep={loadingStep}
            />
          </div>

          {/* Right Column: Live Preview & Collectible Dream Card Output (7 cols on lg) */}
          <div className="lg:col-span-6 xl:col-span-7">
            <DreamCard
              studentName={formData.fullName}
              studentClass={formData.studentClass}
              dreamCareer={formData.dreamCareer}
              portraitUrl={portraitResult}
              careerTitleVi={analysisResult?.careerTitleVi}
              inspirationalMessage={analysisResult?.inspirationalMessage}
              isGenerating={isLoading}
              onRegenerate={handleGenerate}
              onOpenAnalysis={() => setIsAnalysisModalOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* Analysis Inspector Modal */}
      <AnalysisInspector
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        analysis={analysisResult}
        studentName={formData.fullName}
        dreamCareer={formData.dreamCareer}
      />

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
