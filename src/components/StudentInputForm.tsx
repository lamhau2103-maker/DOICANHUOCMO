import React, { useRef, useState, useCallback } from 'react';
import {
  Upload,
  Camera,
  User,
  School,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Image as ImageIcon,
  ShieldAlert,
  Lock,
} from 'lucide-react';
import { SAMPLE_STUDENTS } from '../data/careerTemplates';

export interface StudentFormData {
  fullName: string;
  studentClass: string;
  dreamCareer: string;
  photoUrl: string | null;
  photoBase64: string | null;
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

  // Convert image URL to base64
  const urlToBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const selectSampleStudent = async (sample: (typeof SAMPLE_STUDENTS)[0]) => {
    onChange({
      fullName: sample.name,
      studentClass: sample.studentClass,
      dreamCareer: sample.dreamCareer,
      photoUrl: sample.avatarUrl,
      photoBase64: sample.avatarUrl,
    });
    try {
      const b64 = await urlToBase64(sample.avatarUrl);
      onChange({ photoBase64: b64, photoUrl: sample.avatarUrl });
    } catch (e) {
      console.warn('Could not convert sample to base64, using raw url:', e);
    }
  };

  const canSubmit =
    formData.fullName.trim() !== '' &&
    formData.studentClass.trim() !== '' &&
    formData.dreamCareer.trim() !== '' &&
    Boolean(formData.photoUrl);

  return (
    <div className="backdrop-blur-md bg-white/90 rounded-3xl border border-sky-100 shadow-xl shadow-sky-100/50 p-6 sm:p-7 space-y-5">
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
            Tải ảnh chụp chân thực, rõ khuôn mặt để model AI tái tạo chính xác
          </p>
        </div>

        {/* Quick Sample Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-medium mr-1 hidden sm:inline">Ảnh mẫu thật:</span>
          {SAMPLE_STUDENTS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => selectSampleStudent(sample)}
              className="w-8 h-8 rounded-full overflow-hidden border-2 border-amber-300 hover:scale-110 transition-transform shadow-xs cursor-pointer bg-slate-100"
              title={`Thử ảnh học sinh: ${sample.name} - ${sample.dreamCareer}`}
            >
              <img src={sample.avatarUrl} alt={sample.name} className="w-full h-full object-cover" />
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
                  Ảnh Chụp Thật
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Ảnh gốc được dùng làm tham chiếu nhận diện để giữ trọn vẹn nét mặt của bé.
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
              Kéo & thả ảnh chân dung chụp thật của bé vào đây
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Ảnh chụp rõ mặt, không mờ nhòe (JPG, PNG)
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-600 shadow-xs">
                <ImageIcon className="w-3.5 h-3.5 text-sky-500" /> Chọn ảnh từ máy
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

        {/* Dream Career - Clean input, NO suggestion chips */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              Ước mơ của em <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400 italic">Nhập tự do (bác sĩ, cầu thủ, phi công...)</span>
          </div>
          <input
            type="text"
            value={formData.dreamCareer}
            onChange={(e) => onChange({ dreamCareer: e.target.value })}
            placeholder="Ví dụ: Bác sĩ nhi khoa, Cầu thủ bóng đá, Phi công, Công an, Giáo viên..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/90 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all placeholder:text-slate-400 shadow-xs"
          />
        </div>
      </div>

      {/* Action Button: Nút Tạo Ảnh hiển thị rõ ngay dưới vùng nhập liệu */}
      <div className="pt-2">
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
                <div className="text-sm font-black uppercase tracking-wider text-blue-900">
                  Đang Xử Lý Tạo Ảnh...
                </div>
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

      {/* Privacy & Parental Consent Notice */}
      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 flex items-start gap-2 leading-relaxed">
        <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>
          <strong>Quyền riêng tư:</strong> Ảnh học sinh được xử lý trực tiếp trong phiên làm việc và không lưu trữ trên máy chủ. Thầy cô vui lòng xin phép phụ huynh trước khi chụp và tải ảnh.
        </span>
      </div>
    </div>
  );
};
