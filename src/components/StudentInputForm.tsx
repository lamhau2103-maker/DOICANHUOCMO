import React, { useRef, useState, useCallback } from 'react';
import {
  Upload,
  Camera,
  User,
  School,
  Sparkles,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Image as ImageIcon,
  Zap,
} from 'lucide-react';
import { SAMPLE_STUDENTS } from '../data/careerTemplates';
import { BlendSettings, DEFAULT_BLEND_SETTINGS } from '../utils/faceBlendEngine';

export interface StudentFormData {
  fullName: string;
  studentClass: string;
  dreamCareer: string;
  photoUrl: string | null;
  photoBase64: string | null;
  mode: 'ai-synthesis' | 'smart-blend';
  blendSettings: BlendSettings;
}

interface StudentInputFormProps {
  formData: StudentFormData;
  onChange: (data: Partial<StudentFormData>) => void;
  onSubmit: () => void;
  isLoading: boolean;
  loadingStep: string;
}

export const StudentInputForm: React.FC<StudentInputFormProps> = ({
  formData,
  onChange,
  onSubmit,
  isLoading,
  loadingStep,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showBlendControls, setShowBlendControls] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // File upload handler
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh hợp lệ (JPG, PNG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onChange({
        photoUrl: result,
        photoBase64: result,
      });
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, []);

  // Camera capture handlers
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 640, facingMode: 'user' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera error:', err);
      alert('Không thể truy cập máy ảnh. Vui lòng cho phép quyền máy ảnh trong trình duyệt hoặc tải ảnh lên.');
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, 600, 600);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      onChange({
        photoUrl: dataUrl,
        photoBase64: dataUrl,
      });
    }
    stopCamera();
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setIsCameraActive(false);
  };

  const selectSampleStudent = (sample: (typeof SAMPLE_STUDENTS)[0]) => {
    onChange({
      fullName: sample.name,
      studentClass: sample.studentClass,
      dreamCareer: sample.dreamCareer,
      photoUrl: sample.avatarSvg,
      photoBase64: sample.avatarSvg,
    });
  };

  const canSubmit =
    formData.fullName.trim() !== '' &&
    formData.studentClass.trim() !== '' &&
    formData.dreamCareer.trim() !== '' &&
    Boolean(formData.photoUrl);

  return (
    <div className="backdrop-blur-md bg-white/85 rounded-3xl border border-sky-100 shadow-xl shadow-sky-100/50 p-6 sm:p-7 space-y-6">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-sky-50">
        <div>
          <h2 className="text-lg font-bold font-display text-slate-800 flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-black">
              1
            </span>
            Thông Tin & Chân Dung Bé
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tải ảnh rõ khuôn mặt để tạo ảnh chân thực như ngoài đời
          </p>
        </div>

        {/* Quick Sample Selector */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-slate-400 font-medium mr-1 hidden sm:inline">Ảnh mẫu:</span>
          {SAMPLE_STUDENTS.map((sample, idx) => (
            <button
              key={sample.id}
              onClick={() => selectSampleStudent(sample)}
              className="w-7 h-7 rounded-full overflow-hidden border border-sky-300 hover:scale-110 transition-transform shadow-xs cursor-pointer"
              title={`Thử mẫu ${sample.name} - ${sample.dreamCareer}`}
            >
              <img src={sample.avatarSvg} alt={sample.name} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Photo Upload Zone */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Ảnh Chân Dung Học Sinh <span className="text-rose-500">*</span>
        </label>

        {isCameraActive ? (
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 border-2 border-sky-400 aspect-square max-w-[280px] mx-auto flex flex-col items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Circular face guide */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-44 h-56 rounded-full border-2 border-dashed border-amber-300/80 animate-pulse-glow" />
            </div>
            <div className="absolute bottom-3 flex items-center gap-2 z-10">
              <button
                type="button"
                onClick={capturePhoto}
                className="px-4 py-1.5 rounded-full bg-amber-400 hover:bg-amber-500 text-slate-900 text-xs font-bold shadow-md cursor-pointer flex items-center gap-1"
              >
                <Camera className="w-3.5 h-3.5" /> Chụp Ngay
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white text-xs font-medium cursor-pointer"
              >
                Hủy
              </button>
            </div>
          </div>
        ) : formData.photoUrl ? (
          /* Circular Cropped Preview Zone */
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-gradient-to-br from-sky-50 via-white to-amber-50/40 border border-sky-200/80 shadow-xs">
            <div className="relative group">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-amber-300 ring-4 ring-sky-200 shadow-md bg-white">
                <img
                  src={formData.photoUrl}
                  alt="Ảnh chân dung học sinh"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-xs">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-bold text-slate-700">Ảnh chân dung sẵn sàng</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  90% Nét Mặt
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Khuôn mặt đã được định vị trong khung tròn chuẩn ảnh thẻ kỷ niệm tiểu học.
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-sky-700 bg-sky-100/80 hover:bg-sky-200 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Đổi ảnh khác
                </button>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" /> Chụp máy ảnh
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Drag & drop upload box */
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragOver
                ? 'border-sky-500 bg-sky-50/80 scale-[1.01]'
                : 'border-sky-200 hover:border-sky-400 bg-gradient-to-b from-sky-50/40 via-white to-amber-50/20'
            }`}
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shadow-inner mb-3">
              <Upload className="w-7 h-7" />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              Kéo & thả ảnh chân dung của bé vào đây
            </p>
            <p className="text-xs text-slate-400 mt-1">
              hoặc bấm để chọn ảnh từ máy tính / điện thoại (JPG, PNG)
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-600 shadow-xs">
                <ImageIcon className="w-3.5 h-3.5 text-sky-500" /> Chọn ảnh
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  startCamera();
                }}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors shadow-xs"
              >
                <Camera className="w-3.5 h-3.5 text-amber-600" /> Bật Camera
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
        />
      </div>

      {/* Student Information Fields */}
      <div className="space-y-4 pt-1">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-sky-600" />
            Họ và tên học sinh <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            placeholder="Ví dụ: Nguyễn Minh Đức, Lê Bảo An..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/90 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all placeholder:text-slate-400 shadow-xs"
          />
        </div>

        {/* Class */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <School className="w-3.5 h-3.5 text-amber-600" />
            Lớp <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formData.studentClass}
            onChange={(e) => onChange({ studentClass: e.target.value })}
            placeholder="Ví dụ: 2A, 2B, 2/1..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/90 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all placeholder:text-slate-400 shadow-xs"
          />
        </div>

        {/* Dream Career - Clean input, NO suggestion chips as requested */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              Ước mơ của em <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400 italic">Nhập tự do ước mơ của bé</span>
          </div>
          <input
            type="text"
            value={formData.dreamCareer}
            onChange={(e) => onChange({ dreamCareer: e.target.value })}
            placeholder="Ví dụ: Bác sĩ, Phi hành gia, Cầu thủ bóng đá, Chú công an, Cô giáo..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/90 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all placeholder:text-slate-400 shadow-xs"
          />
        </div>
      </div>

      {/* Mode Selection: AI Synthesis vs Smart Face-Blend */}
      <div className="pt-2 border-t border-sky-50 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Chế độ kiến tạo ảnh
          </label>
          {formData.mode === 'smart-blend' && (
            <button
              type="button"
              onClick={() => setShowBlendControls(!showBlendControls)}
              className="text-xs font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              {showBlendControls ? 'Ẩn tinh chỉnh' : 'Tinh chỉnh khuôn mặt'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onChange({ mode: 'ai-synthesis' })}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              formData.mode === 'ai-synthesis'
                ? 'bg-gradient-to-br from-sky-50 to-indigo-50 border-sky-400 shadow-sm ring-2 ring-sky-200'
                : 'bg-white/60 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs text-sky-900 mb-0.5">
              <span>✨ AI Tái Tạo Siêu Thực</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Giữ 90% nét mặt, vẽ đồng phục & không gian bằng Gemini
            </p>
          </button>

          <button
            type="button"
            onClick={() => onChange({ mode: 'smart-blend' })}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              formData.mode === 'smart-blend'
                ? 'bg-gradient-to-br from-amber-50 to-rose-50 border-amber-400 shadow-sm ring-2 ring-amber-200'
                : 'bg-white/60 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs text-amber-900 mb-0.5">
              <span>🎨 Smart Face-Blend</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Giữ 100% pixel mặt gốc, khử viền & hòa sắc vào trang phục
            </p>
          </button>
        </div>

        {/* Fine-tuning sliders for Smart Face-Blend Mode */}
        {formData.mode === 'smart-blend' && showBlendControls && (
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3.5 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-700">
              <span>Bộ Tinh Chỉnh Khớp Mặt (Canvas)</span>
              <button
                type="button"
                onClick={() => onChange({ blendSettings: { ...DEFAULT_BLEND_SETTINGS } })}
                className="text-[11px] text-amber-700 hover:underline cursor-pointer"
              >
                Đặt lại chuẩn
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Độ phóng to mặt:</span>
                  <span className="font-semibold">{formData.blendSettings.scale.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.35"
                  step="0.05"
                  value={formData.blendSettings.scale}
                  onChange={(e) =>
                    onChange({
                      blendSettings: {
                        ...formData.blendSettings,
                        scale: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Độ mềm viền (Feather):</span>
                  <span className="font-semibold">{formData.blendSettings.feather}px</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="2"
                  value={formData.blendSettings.feather}
                  onChange={(e) =>
                    onChange({
                      blendSettings: {
                        ...formData.blendSettings,
                        feather: parseInt(e.target.value, 10),
                      },
                    })
                  }
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Vị trí dọc (Y):</span>
                  <span className="font-semibold">{formData.blendSettings.offsetY}px</span>
                </div>
                <input
                  type="range"
                  min="-60"
                  max="60"
                  step="2"
                  value={formData.blendSettings.offsetY}
                  onChange={(e) =>
                    onChange({
                      blendSettings: {
                        ...formData.blendSettings,
                        offsetY: parseInt(e.target.value, 10),
                      },
                    })
                  }
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Độ ấm màu da:</span>
                  <span className="font-semibold">{formData.blendSettings.warmth}</span>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="30"
                  step="2"
                  value={formData.blendSettings.warmth}
                  onChange={(e) =>
                    onChange({
                      blendSettings: {
                        ...formData.blendSettings,
                        warmth: parseInt(e.target.value, 10),
                      },
                    })
                  }
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Button: Nút Tạo Ảnh hiển thị rõ ngay dưới vùng chế độ kiến tạo ảnh */}
      <div className="pt-3 border-t border-sky-100">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit || isLoading}
          className={`w-full py-4 px-6 rounded-2xl font-black font-display text-base sm:text-lg tracking-wide transition-all duration-300 shadow-xl flex items-center justify-center gap-2.5 cursor-pointer ring-4 ${
            !canSubmit || isLoading
              ? 'bg-slate-200 text-slate-400 ring-slate-100 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 hover:from-amber-400 hover:via-yellow-300 hover:to-amber-400 text-blue-900 border-2 border-amber-400/90 ring-blue-300/60 shadow-amber-200/70 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-700" />
              <div className="text-left">
                <div className="text-sm font-black uppercase tracking-wider text-blue-900">Đang Xử Lý Tạo Ảnh...</div>
                <div className="text-xs font-semibold text-blue-800">{loadingStep}</div>
              </div>
            </div>
          ) : (
            <>
              <Sparkles className="w-6 h-6 text-blue-700 fill-blue-500 animate-pulse" />
              <span className="uppercase text-blue-900 font-black tracking-wider text-lg sm:text-xl drop-shadow-xs">
                ✨ TẠO ẢNH ƯỚC MƠ ✨
              </span>
              <span className="text-xs font-bold bg-blue-900 text-amber-200 px-2.5 py-0.5 rounded-full hidden sm:inline shadow-xs">
                Chân thực như ngoài đời
              </span>
            </>
          )}
        </button>

        {!canSubmit && (
          <p className="text-center text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200/80 rounded-xl py-2 px-3 mt-2.5">
            👉 Vui lòng tải ảnh và điền đủ <strong>Họ tên, Lớp, Ước mơ</strong> để bấm Tạo Ảnh.
          </p>
        )}
      </div>
    </div>
  );
};
