import { CAREER_TEMPLATES, CareerTemplate } from '../data/careerTemplates';

export interface BlendSettings {
  scale: number;
  offsetX: number;
  offsetY: number;
  feather: number;
  brightness: number;
  warmth: number;
}

export const DEFAULT_BLEND_SETTINGS: BlendSettings = {
  scale: 1.0,
  offsetX: 0,
  offsetY: 0,
  feather: 28,
  brightness: 1.0,
  warmth: 0,
};

/**
 * Renders a high-resolution 3:4 portrait blending the student's face seamlessly
 * onto a career outfit with authentic background scenery.
 */
export async function renderFaceBlendPortrait(
  studentImg: HTMLImageElement,
  careerQuery: string,
  settings: BlendSettings = DEFAULT_BLEND_SETTINGS
): Promise<string> {
  const width = 900;
  const height = 1200;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get 2d context');

  // Match career template or pick closest
  const normalized = careerQuery.toLowerCase();
  let template = CAREER_TEMPLATES.find((t) =>
    normalized.includes(t.id) ||
    normalized.includes(t.name.toLowerCase()) ||
    t.category.toLowerCase().includes(normalized)
  );

  if (!template) {
    if (normalized.includes('bác sĩ') || normalized.includes('y tá') || normalized.includes('doctor')) {
      template = CAREER_TEMPLATES[0];
    } else if (normalized.includes('vũ trụ') || normalized.includes('phi hành gia') || normalized.includes('astronaut')) {
      template = CAREER_TEMPLATES[1];
    } else if (normalized.includes('bóng đá') || normalized.includes('cầu thủ') || normalized.includes('thể thao')) {
      template = CAREER_TEMPLATES[2];
    } else if (normalized.includes('công an') || normalized.includes('cảnh sát') || normalized.includes('police')) {
      template = CAREER_TEMPLATES[3];
    } else if (normalized.includes('giáo viên') || normalized.includes('cô giáo') || normalized.includes('thầy giáo')) {
      template = CAREER_TEMPLATES[4];
    } else if (normalized.includes('phi công') || normalized.includes('máy bay') || normalized.includes('pilot')) {
      template = CAREER_TEMPLATES[5];
    } else if (normalized.includes('họa sĩ') || normalized.includes('vẽ') || normalized.includes('art')) {
      template = CAREER_TEMPLATES[6];
    } else {
      template = CAREER_TEMPLATES[0]; // default to doctor
    }
  }

  // 1. Draw rich professional backdrop
  drawCareerBackground(ctx, width, height, template);

  // 2. Draw career uniform body (shoulders, torso, clothing, badge, collar)
  drawCareerBody(ctx, width, height, template);

  // 3. Render blended student face with soft feather mask, scale & tone adjustment
  drawBlendedFace(ctx, width, height, studentImg, template, settings);

  // 4. Draw career foreground details (collar lapels, stethoscope over shoulders, space helmet rim or hair top touch)
  drawCareerForeground(ctx, width, height, template);

  // 5. Ambient studio lighting & vignette overlay
  drawStudioLighting(ctx, width, height);

  return canvas.toDataURL('image/png', 0.95);
}

function drawCareerBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  template: CareerTemplate
) {
  const grad = ctx.createRadialGradient(w / 2, h * 0.35, 50, w / 2, h * 0.5, w);

  if (template.id === 'phi-hanh-gia') {
    // Deep cosmic space
    grad.addColorStop(0, '#1e1b4b');
    grad.addColorStop(0.5, '#0f172a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Distant stars & nebulae
    for (let i = 0; i < 90; i++) {
      const sx = (Math.sin(i * 99) * 0.5 + 0.5) * w;
      const sy = (Math.cos(i * 33) * 0.5 + 0.5) * h * 0.6;
      const sr = (i % 3) + 1;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fillStyle = i % 4 === 0 ? '#38bdf8' : i % 3 === 0 ? '#f472b6' : '#ffffff';
      ctx.globalAlpha = 0.4 + (i % 5) * 0.12;
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // Distant Earth crescent
    ctx.save();
    ctx.beginPath();
    ctx.arc(w * 0.85, h * 0.22, 120, 0, Math.PI * 2);
    ctx.fillStyle = '#0284c7';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w * 0.88, h * 0.20, 115, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.restore();
  } else if (template.id === 'cau-thu-bong-da') {
    // Stadium lights & lush pitch
    grad.addColorStop(0, '#1e3a8a');
    grad.addColorStop(0.6, '#064e3b');
    grad.addColorStop(1, '#022c22');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Stadium floodlights glow
    const lightGlow1 = ctx.createRadialGradient(150, 100, 10, 150, 100, 250);
    lightGlow1.addColorStop(0, 'rgba(254, 240, 138, 0.8)');
    lightGlow1.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = lightGlow1;
    ctx.fillRect(0, 0, 400, 300);

    const lightGlow2 = ctx.createRadialGradient(w - 150, 100, 10, w - 150, 100, 250);
    lightGlow2.addColorStop(0, 'rgba(254, 240, 138, 0.8)');
    lightGlow2.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = lightGlow2;
    ctx.fillRect(w - 400, 0, 400, 300);
  } else if (template.id === 'bac-si') {
    // Modern medical pediatric clinic
    grad.addColorStop(0, '#f0f9ff');
    grad.addColorStop(0.6, '#e0f2fe');
    grad.addColorStop(1, '#bae6fd');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Soft bokeh lights
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(w * 0.2, h * 0.2, 80, 0, Math.PI * 2);
    ctx.arc(w * 0.8, h * 0.25, 110, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Generic bright studio backdrop
    grad.addColorStop(0, '#f8fafc');
    grad.addColorStop(0.5, template.colorTheme.secondary);
    grad.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
}

function drawCareerBody(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  template: CareerTemplate
) {
  const neckY = h * 0.44;

  ctx.save();

  // Draw Neck
  ctx.beginPath();
  ctx.moveTo(w * 0.42, neckY);
  ctx.lineTo(w * 0.58, neckY);
  ctx.lineTo(w * 0.60, neckY + 80);
  ctx.lineTo(w * 0.40, neckY + 80);
  ctx.closePath();
  ctx.fillStyle = '#fed7aa';
  ctx.fill();

  // Neck shadow under chin
  ctx.beginPath();
  ctx.ellipse(w * 0.5, neckY + 20, 70, 25, 0, 0, Math.PI);
  ctx.fillStyle = 'rgba(194, 65, 12, 0.15)';
  ctx.fill();

  // Main Torso / Uniform Shoulders
  ctx.beginPath();
  ctx.moveTo(w * 0.5, neckY + 50);
  ctx.bezierCurveTo(w * 0.35, neckY + 55, w * 0.12, neckY + 110, w * 0.05, h);
  ctx.lineTo(w * 0.95, h);
  ctx.bezierCurveTo(w * 0.88, neckY + 110, w * 0.65, neckY + 55, w * 0.5, neckY + 50);
  ctx.closePath();

  if (template.id === 'bac-si') {
    // Doctor white coat with blue inner scrub
    ctx.fillStyle = '#0284c7';
    ctx.fill();

    // White lab coat lapels
    ctx.beginPath();
    ctx.moveTo(w * 0.38, neckY + 50);
    ctx.lineTo(w * 0.05, h);
    ctx.lineTo(w * 0.35, h);
    ctx.lineTo(w * 0.48, neckY + 140);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(w * 0.62, neckY + 50);
    ctx.lineTo(w * 0.95, h);
    ctx.lineTo(w * 0.65, h);
    ctx.lineTo(w * 0.52, neckY + 140);
    ctx.closePath();
    ctx.fillStyle = '#f8fafc';
    ctx.fill();

    // Lab coat shadows and stitches
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 4;
    ctx.stroke();
  } else if (template.id === 'phi-hanh-gia') {
    // Space Suit
    ctx.fillStyle = '#f1f5f9';
    ctx.fill();

    // Chest control pack
    ctx.fillStyle = '#334155';
    ctx.roundRect(w * 0.38, neckY + 140, w * 0.24, 180, 16);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(w * 0.42, neckY + 165, 45, 12);
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(w * 0.56, neckY + 171, 10, 0, Math.PI * 2);
    ctx.fill();

    // Suit rings & seams
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(w * 0.5, neckY + 40, 130, 0, Math.PI);
    ctx.stroke();
  } else if (template.id === 'cau-thu-bong-da') {
    // Soccer jersey (Red with golden trim, Vietnam style!)
    ctx.fillStyle = '#dc2626';
    ctx.fill();

    // Gold V-neck collar
    ctx.beginPath();
    ctx.moveTo(w * 0.40, neckY + 50);
    ctx.lineTo(w * 0.50, neckY + 120);
    ctx.lineTo(w * 0.60, neckY + 50);
    ctx.lineTo(w * 0.56, neckY + 50);
    ctx.lineTo(w * 0.50, neckY + 105);
    ctx.lineTo(w * 0.44, neckY + 50);
    ctx.closePath();
    ctx.fillStyle = '#facc15';
    ctx.fill();

    // Jersey number 10
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 84px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('10', w * 0.5, neckY + 280);

    // Golden star crest on chest
    drawMiniStar(ctx, w * 0.35, neckY + 160, 24, '#facc15');
  } else if (template.id === 'cong-an') {
    // Police Uniform (Olive green or Navy)
    ctx.fillStyle = '#115e59';
    ctx.fill();

    // Golden epaulets on shoulders
    ctx.fillStyle = '#eab308';
    ctx.fillRect(w * 0.14, neckY + 80, 90, 36);
    ctx.fillRect(w * 0.86 - 90, neckY + 80, 90, 36);

    // Collar
    ctx.beginPath();
    ctx.moveTo(w * 0.42, neckY + 50);
    ctx.lineTo(w * 0.5, neckY + 110);
    ctx.lineTo(w * 0.58, neckY + 50);
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 6;
    ctx.stroke();
  } else if (template.id === 'phi-cong') {
    // Pilot uniform with golden shoulder stripes
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    // White shirt center
    ctx.beginPath();
    ctx.moveTo(w * 0.44, neckY + 50);
    ctx.lineTo(w * 0.50, neckY + 120);
    ctx.lineTo(w * 0.56, neckY + 50);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Black pilot tie
    ctx.beginPath();
    ctx.moveTo(w * 0.48, neckY + 100);
    ctx.lineTo(w * 0.52, neckY + 100);
    ctx.lineTo(w * 0.54, neckY + 300);
    ctx.lineTo(w * 0.50, neckY + 320);
    ctx.lineTo(w * 0.46, neckY + 300);
    ctx.closePath();
    ctx.fillStyle = '#020617';
    ctx.fill();

    // Golden 4-bar captain shoulder straps
    drawPilotBars(ctx, w * 0.15, neckY + 85);
    drawPilotBars(ctx, w * 0.85 - 80, neckY + 85);
  } else {
    // Standard professional uniform
    ctx.fillStyle = template.colorTheme.primary;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 6;
    ctx.stroke();
  }

  ctx.restore();
}

function drawMiniStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function drawPilotBars(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#eab308';
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(x, y + i * 10, 70, 6);
  }
}

function drawBlendedFace(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  studentImg: HTMLImageElement,
  template: CareerTemplate,
  settings: BlendSettings
) {
  ctx.save();

  const faceCenterX = (w * template.headCoords.centerX) / 100 + settings.offsetX;
  const faceCenterY = (h * template.headCoords.centerY) / 100 + settings.offsetY;
  const faceRadiusX = (w * (template.headCoords.widthPercent / 200)) * settings.scale;
  const faceRadiusY = (h * (template.headCoords.heightPercent / 200)) * settings.scale * 1.15;

  // Create an offscreen canvas to process the face with soft feathered border
  const faceCanvas = document.createElement('canvas');
  faceCanvas.width = faceRadiusX * 2.8;
  faceCanvas.height = faceRadiusY * 2.8;
  const fctx = faceCanvas.getContext('2d');

  if (fctx) {
    const fcw = faceCanvas.width;
    const fch = faceCanvas.height;
    const fcx = fcw / 2;
    const fcy = fch / 2;

    // 1. Draw student image cropped to center
    // Find aspect ratio crop
    const sw = studentImg.width || 400;
    const sh = studentImg.height || 400;
    const cropSize = Math.min(sw, sh);
    const sx = (sw - cropSize) / 2;
    const sy = (sh - cropSize) / 2;

    fctx.drawImage(studentImg, sx, sy, cropSize, cropSize, 0, 0, fcw, fch);

    // Apply color tone / brightness / warmth if needed
    if (settings.brightness !== 1.0 || settings.warmth !== 0) {
      fctx.save();
      if (settings.brightness > 1) {
        fctx.fillStyle = `rgba(255, 255, 255, ${settings.brightness - 1})`;
        fctx.globalCompositeOperation = 'screen';
        fctx.fillRect(0, 0, fcw, fch);
      } else if (settings.brightness < 1) {
        fctx.fillStyle = `rgba(0, 0, 0, ${1 - settings.brightness})`;
        fctx.globalCompositeOperation = 'multiply';
        fctx.fillRect(0, 0, fcw, fch);
      }

      if (settings.warmth > 0) {
        fctx.fillStyle = `rgba(251, 146, 60, ${settings.warmth * 0.01})`;
        fctx.globalCompositeOperation = 'soft-light';
        fctx.fillRect(0, 0, fcw, fch);
      }
      fctx.restore();
    }

    // 2. Feather mask using destination-in
    fctx.globalCompositeOperation = 'destination-in';

    const maskGrad = fctx.createRadialGradient(
      fcx,
      fcy,
      Math.min(faceRadiusX, faceRadiusY) * 0.65,
      fcx,
      fcy,
      Math.min(faceRadiusX, faceRadiusY) * 1.05
    );
    maskGrad.addColorStop(0, 'rgba(0,0,0,1)');
    maskGrad.addColorStop(0.8, 'rgba(0,0,0,0.9)');
    maskGrad.addColorStop(1, 'rgba(0,0,0,0)');

    fctx.fillStyle = maskGrad;
    fctx.beginPath();
    fctx.ellipse(fcx, fcy, faceRadiusX * 1.1, faceRadiusY * 1.15, 0, 0, Math.PI * 2);
    fctx.fill();

    // 3. Draw onto main canvas
    ctx.drawImage(
      faceCanvas,
      faceCenterX - fcw / 2,
      faceCenterY - fcy / 2
    );
  }

  ctx.restore();
}

function drawCareerForeground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  template: CareerTemplate
) {
  const neckY = h * 0.44;

  if (template.id === 'bac-si') {
    // Realistic Stethoscope around neck
    ctx.save();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    // Stethoscope tubing loops around shoulders down to chest
    ctx.moveTo(w * 0.36, neckY + 40);
    ctx.bezierCurveTo(w * 0.30, neckY + 120, w * 0.34, neckY + 220, w * 0.42, neckY + 240);
    ctx.bezierCurveTo(w * 0.50, neckY + 260, w * 0.58, neckY + 180, w * 0.64, neckY + 40);
    ctx.stroke();

    // Chest piece (bell/diaphragm)
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(w * 0.42, neckY + 240, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(w * 0.42, neckY + 240, 16, 0, Math.PI * 2);
    ctx.fill();

    // Doctor ID badge clipped to pocket
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 8;
    ctx.roundRect(w * 0.65, neckY + 180, 85, 110, 8);
    ctx.fill();
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(w * 0.65, neckY + 180, 85, 25);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BÁC SĨ NHÍ', w * 0.65 + 42, neckY + 197);
    ctx.restore();
  } else if (template.id === 'phi-hanh-gia') {
    // Glass helmet reflection rim
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.28, 210, Math.PI * 0.8, Math.PI * 1.4);
    ctx.stroke();
    ctx.restore();
  }
}

function drawStudioLighting(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Vignette
  ctx.save();
  const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.4, w / 2, h / 2, w * 0.8);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(15,23,42,0.3)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}
