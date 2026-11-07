/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { StudentInputForm, StudentFormData } from './components/StudentInputForm';
import { DreamCard } from './components/DreamCard';
import { AnalysisInspector, FacialAnalysisResult } from './components/AnalysisInspector';
import { HelpModal } from './components/HelpModal';
import { DEFAULT_BLEND_SETTINGS, renderFaceBlendPortrait } from './utils/faceBlendEngine';
import { SAMPLE_STUDENTS } from './data/careerTemplates';
import { Sparkles, AlertCircle, Heart, Star } from 'lucide-react';

export default function App() {
  // Initialize with the first sample student ready for immediate delight
  const [formData, setFormData] = useState<StudentFormData>({
    fullName: SAMPLE_STUDENTS[0].name,
    studentClass: SAMPLE_STUDENTS[0].studentClass,
    dreamCareer: SAMPLE_STUDENTS[0].dreamCareer,
    photoUrl: SAMPLE_STUDENTS[0].avatarSvg,
    photoBase64: SAMPLE_STUDENTS[0].avatarSvg,
    mode: 'ai-synthesis',
    blendSettings: { ...DEFAULT_BLEND_SETTINGS },
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

  // Main 2-step generation pipeline
  const handleGenerate = async () => {
    if (!formData.photoUrl || !formData.fullName || !formData.dreamCareer) {
      alert('Vui lòng điền đầy đủ họ tên, lớp, ước mơ và tải ảnh chân dung học sinh.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Step 1: Deep Facial Analysis via Gemini 2.5 Flash
      setLoadingStep('Đang phân tích nét mặt đặc trưng (mắt, sống mũi, nụ cười)...');
      
      let analysisData: FacialAnalysisResult | null = null;
      try {
        const analyzeRes = await fetch('/api/analyze-face', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: formData.photoBase64,
            studentName: formData.fullName,
            studentClass: formData.studentClass,
            dreamCareer: formData.dreamCareer,
          }),
        });

        if (analyzeRes.ok) {
          analysisData = await analyzeRes.json();
          setAnalysisResult(analysisData);
        } else {
          const errJson = await analyzeRes.json().catch(() => null);
          console.warn('Face analysis returned non-200:', errJson);
        }
      } catch (err) {
        console.warn('API analyze-face request error:', err);
      }

      // If server analysis didn't return, provide default graceful analysis
      if (!analysisData) {
        analysisData = {
          facialAnalysis: 'Khuôn mặt tròn trịa, biểu cảm hồn nhiên, đôi mắt to sáng của học sinh tiểu học 7 tuổi.',
          hairDetails: 'Mái tóc đen mềm mại tự nhiên, đường viền chân tóc gọn gàng chuẩn học sinh.',
          skinAndEyes: 'Nước da mịn màng, khóe miệng tươi tắn bừng sáng niềm tin yêu học tập.',
          careerAttire: `Trang phục nghề nghiệp ${formData.dreamCareer} thu nhỏ chuẩn chỉnh, đính kèm huy hiệu tên ${formData.fullName}.`,
          careerSetting: `Không gian làm việc sinh động, hiện đại và ngập tràn ánh sáng của ước mơ ${formData.dreamCareer}.`,
          generatedPrompt: `8k photorealistic portrait photography, shot on 85mm f/1.4 lens, cinematic studio lighting. A 7-year-old Vietnamese child with round bright face, lively expressive eyes, joyful smile, wearing a realistic miniature ${formData.dreamCareer} uniform, standing in an authentic vivid professional environment. Maintain 90% exact facial likeness, natural skin texture, bright expressive eyes.`,
          careerTitleVi: formData.dreamCareer,
          inspirationalMessage: `Chúc em luôn tự tin, chăm ngoan và sớm chạm tới ước mơ trở thành ${formData.dreamCareer}!`,
        };
        setAnalysisResult(analysisData);
      }

      // Step 2: Photorealistic Dream Synthesis / Smart Face-Blend
      setLoadingStep('Đang kiến tạo bộ trang phục & không gian ước mơ...');

      let finalPortraitUrl: string | null = null;

      if (formData.mode === 'ai-synthesis') {
        try {
          const genRes = await fetch('/api/generate-dream-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: analysisData.generatedPrompt,
              imageBase64: formData.photoBase64,
              dreamCareer: formData.dreamCareer,
              studentName: formData.fullName,
            }),
          });

          if (genRes.ok) {
            const genData = await genRes.json();
            if (genData.imageUrl) {
              finalPortraitUrl = genData.imageUrl;
            }
          }
        } catch (genErr) {
          console.warn('Image synthesis attempt error:', genErr);
        }
      }

      // If AI synthesis returned no image or user selected Smart Face-Blend mode:
      if (!finalPortraitUrl || formData.mode === 'smart-blend') {
        setLoadingStep('Hoàn thiện phối ghép khuôn mặt vào trang phục...');
        // Execute Canvas Face-Blend engine
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = formData.photoUrl!;
        });

        finalPortraitUrl = await renderFaceBlendPortrait(
          img,
          formData.dreamCareer,
          formData.blendSettings
        );
      }

      // Step 3: Complete Keepsake Card
      setLoadingStep('Hoàn thiện khung ảnh kỷ niệm chân thực...');
      await new Promise((r) => setTimeout(r, 400));

      setPortraitResult(finalPortraitUrl);
      triggerConfetti();
    } catch (error: any) {
      console.error('Generation pipeline error:', error);
      setErrorMessage(error.message || 'Đã có lỗi xảy ra trong quá trình kiến tạo ảnh.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // Re-render face blend if settings change while in smart-blend mode with an existing portrait
  useEffect(() => {
    if (formData.mode === 'smart-blend' && portraitResult && formData.photoUrl && !isLoading) {
      const updateBlend = async () => {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = async () => {
            const updated = await renderFaceBlendPortrait(
              img,
              formData.dreamCareer,
              formData.blendSettings
            );
            setPortraitResult(updated);
          };
          img.src = formData.photoUrl!;
        } catch (e) {
          console.warn('Blend update error:', e);
        }
      };
      updateBlend();
    }
  }, [formData.blendSettings, formData.mode]);

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
          <div className="max-w-2xl mx-auto mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs font-bold underline cursor-pointer"
            >
              Bỏ qua
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
