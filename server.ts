import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { CANONICAL_CAREERS, buildPhotorealisticPrompt, CareerSpec } from './src/data/careerDictionary.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ limit: '35mb', extended: true }));

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Normalizes Vietnamese strings for dictionary matching
 */
function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .trim();
}

/**
 * Matches user's entered career against canonical table or deduces via Gemini
 */
async function resolveCareerSpec(dreamCareer: string, studentName: string): Promise<CareerSpec> {
  const norm = normalizeKey(dreamCareer);

  if (norm.includes('bac si') || norm.includes('nhi khoa') || norm.includes('y ta') || norm.includes('doctor')) {
    return CANONICAL_CAREERS['bac-si'];
  }
  if (norm.includes('bong da') || norm.includes('cau thu') || norm.includes('soccer') || norm.includes('football')) {
    return CANONICAL_CAREERS['cau-thu-bong-da'];
  }
  if (norm.includes('co khi') || norm.includes('tho ky thuat') || norm.includes('mechanic') || norm.includes('technician')) {
    return CANONICAL_CAREERS['tho-ky-thuat'];
  }
  if (norm.includes('phi cong') || norm.includes('may bay') || norm.includes('pilot')) {
    return CANONICAL_CAREERS['phi-cong'];
  }
  if (norm.includes('giao vien') || norm.includes('co giao') || norm.includes('thay giao') || norm.includes('teacher')) {
    return CANONICAL_CAREERS['giao-vien'];
  }
  if (norm.includes('cong an') || norm.includes('canh sat') || norm.includes('police')) {
    return CANONICAL_CAREERS['cong-an'];
  }
  if (norm.includes('bo doi') || norm.includes('quan doi') || norm.includes('soldier')) {
    return CANONICAL_CAREERS['bo-doi'];
  }
  if (norm.includes('ky su') || norm.includes('xay dung') || norm.includes('engineer')) {
    return CANONICAL_CAREERS['ky-su-xay-dung'];
  }
  if (norm.includes('khoa hoc') || norm.includes('scientist')) {
    return CANONICAL_CAREERS['nha-khoa-hoc'];
  }
  if (norm.includes('dau bep') || norm.includes('chef') || norm.includes('nau an')) {
    return CANONICAL_CAREERS['dau-bep'];
  }
  if (norm.includes('phi hanh gia') || norm.includes('vu tru') || norm.includes('astronaut')) {
    return CANONICAL_CAREERS['phi-hanh-gia'];
  }
  if (norm.includes('hoa si') || norm.includes('ve tranh') || norm.includes('artist')) {
    return CANONICAL_CAREERS['hoa-si'];
  }
  if (norm.includes('nong dan') || norm.includes('farmer')) {
    return CANONICAL_CAREERS['nong-dan'];
  }
  if (norm.includes('ca si') || norm.includes('singer')) {
    return CANONICAL_CAREERS['ca-si'];
  }
  if (norm.includes('lap trinh') || norm.includes('it') || norm.includes('developer') || norm.includes('programmer')) {
    return CANONICAL_CAREERS['lap-trinh-vien'];
  }

  // If not found in table, deduce via Gemini
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Quy tắc: Cho nghề "${dreamCareer}" của học sinh, hãy mô tả chân thực theo ĐÚNG khuôn mẫu:
trang phục thật, dụng cụ thật, địa điểm thật, ánh sáng phù hợp.
Trả về JSON duy nhất:
{
  "professionEn": "tên nghề tiếng Anh",
  "outfitAndProps": "mô tả trang phục và dụng cụ chi tiết bằng tiếng Anh",
  "setting": "mô tả bối cảnh thật chi tiết bằng tiếng Anh",
  "pose": "mô tả dáng chụp tự nhiên bằng tiếng Anh",
  "lighting": "mô tả ánh sáng tự nhiên bằng tiếng Anh",
  "vietnameseTitle": "tên nghề tiếng Việt chuẩn"
}`,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        return {
          professionEn: parsed.professionEn || dreamCareer,
          outfitAndProps: parsed.outfitAndProps || `authentic realistic tailored miniature ${dreamCareer} uniform`,
          setting: parsed.setting || `authentic real-world professional ${dreamCareer} workplace`,
          pose: parsed.pose || 'natural confident friendly smile, looking at camera',
          lighting: parsed.lighting || 'natural soft ambient lighting',
          vietnameseTitle: parsed.vietnameseTitle || dreamCareer,
        };
      }
    } catch (e) {
      console.warn('Deduce career spec error:', e);
    }
  }

  return {
    professionEn: dreamCareer,
    outfitAndProps: `authentic realistic tailored miniature ${dreamCareer} uniform with name badge "${studentName || 'Student'}"`,
    setting: `authentic real-life workplace for a ${dreamCareer}`,
    pose: 'natural confident friendly smile, looking at camera, upper body framing',
    lighting: 'natural documentary daylight',
    vietnameseTitle: dreamCareer,
  };
}

/**
 * Step 1: Kiểm tra ảnh tải lên có đúng 1 khuôn mặt rõ nét
 */
app.post('/api/validate-face', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        valid: false,
        error: 'Vui lòng tải lên ảnh chân dung của học sinh.',
      });
    }

    if (!process.env.GEMINI_API_KEY || !ai) {
      return res.status(500).json({
        valid: false,
        error: 'Hệ thống chưa tìm thấy GEMINI_API_KEY. Vui lòng cấu hình API key trong bảng Secrets của AI Studio.',
      });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const checkPrompt = `Kiểm tra ảnh này:
Yêu cầu bắt buộc:
1. Ảnh có khuôn mặt người/học sinh thật, rõ nét ngũ quan, không bị mờ nhòe nghiêm trọng?
2. Ảnh KHÔNG PHẢI là tranh vẽ, hoạt hình, anime, chibi, 3D CGI, hình vẽ vector hay avatar nhân tạo?
3. Nếu ảnh thỏa mãn: trả về JSON { "valid": true, "reason": "Ảnh chân dung người thật hợp lệ" }.
4. Nếu ảnh KHÔNG có mặt, có nhiều hơn 1 người, quá mờ, hoặc là hoạt hình/hình vẽ: trả về JSON { "valid": false, "reason": "Không tìm thấy khuôn mặt rõ nét của học sinh trong ảnh. Vui lòng tải lên ảnh chụp chính diện, rõ mặt và không bị mờ nhòe." }.`;

    try {
      const resp = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType || 'image/jpeg',
              },
            },
            { text: checkPrompt },
          ],
        },
        config: { responseMimeType: 'application/json' },
      });

      if (resp.text) {
        const parsed = JSON.parse(resp.text.trim());
        if (parsed.valid === false) {
          return res.json({
            valid: false,
            error: parsed.reason || 'Không tìm thấy khuôn mặt rõ nét của học sinh trong ảnh. Vui lòng tải lên ảnh chụp chính diện, rõ mặt và không bị mờ nhòe.',
          });
        }
      }
    } catch (err) {
      console.warn('Face validation API warning (skipped to allow upload):', err);
    }

    return res.json({ valid: true });
  } catch (err: any) {
    console.error('Error in /api/validate-face:', err);
    res.json({ valid: true });
  }
});

/**
 * Step 2: Tạo ảnh ước mơ chân thực bằng mô hình ảnh AI
 */
app.post('/api/process-dream-photo', async (req, res) => {
  try {
    const {
      imageBase64,
      mimeType = 'image/jpeg',
      studentName = 'Học sinh',
      studentClass = '2',
      dreamCareer,
    } = req.body;

    // 1. Kiểm tra API Key
    if (!process.env.GEMINI_API_KEY || !ai) {
      console.error('Lỗi: Thiếu GEMINI_API_KEY trên máy chủ.');
      return res.status(500).json({
        error: 'Thiếu API Key: Hệ thống chưa cấu hình GEMINI_API_KEY. Vui lòng kiểm tra bảng điều khiển AI Studio Secrets.',
        code: 'MISSING_API_KEY',
      });
    }

    if (!imageBase64) {
      return res.status(400).json({
        error: 'Vui lòng tải lên ảnh chân dung của học sinh.',
      });
    }

    if (!dreamCareer) {
      return res.status(400).json({
        error: 'Vui lòng nhập ước mơ của học sinh.',
      });
    }

    // Lấy chuỗi base64 thuần, bỏ tiền tố "data:image/...;base64,"
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    // 2. Tra cứu & Ghép vào PROMPT MẪU
    const spec = await resolveCareerSpec(dreamCareer, studentName);
    const photorealisticPrompt = buildPhotorealisticPrompt(spec);
    console.log('--- BẮT ĐẦU TẠO ẢNH CHÂN THỰC ---');
    console.log('Học sinh:', studentName, '| Ước mơ:', spec.vietnameseTitle);
    console.log('Prompt:', photorealisticPrompt);

    // 3. Danh sách model tạo ảnh chân thực hỗ trợ ảnh đầu vào theo tài liệu
    const candidateModels = [
      'gemini-2.5-flash-image',
      'gemini-3.1-flash-lite-image',
      'gemini-nano-banana-2.1',
      'imagen-3.0-generate-002',
    ];

    let generatedImageUrl: string | null = null;
    let lastFailureReason = '';
    let attemptCount = 0;
    const maxAttempts = 3; // 1 lần đầu + tối đa 2 lần thử lại

    while (!generatedImageUrl && attemptCount < maxAttempts) {
      attemptCount++;
      console.log(`[Lần thử ${attemptCount}/${maxAttempts}] Đang gọi mô hình tạo ảnh chân thực...`);

      for (const modelName of candidateModels) {
        try {
          console.log(`Đang gọi mô hình: ${modelName}`);

          if (modelName.startsWith('imagen-')) {
            // Gọi Imagen 3
            const imgRes = await ai.models.generateImages({
              model: modelName,
              prompt: photorealisticPrompt,
              config: {
                numberOfImages: 1,
                aspectRatio: '3:4',
              },
            });
            console.log(`[${modelName}] Response:`, JSON.stringify(imgRes, null, 2));

            const bytes = imgRes.generatedImages?.[0]?.image?.imageBytes;
            if (bytes) {
              generatedImageUrl = `data:image/jpeg;base64,${bytes}`;
              console.log(`==> Tạo ảnh thành công với model ${modelName}!`);
              break;
            }
          } else {
            // Gọi Gemini Image Model với cả TEXT và IMAGE trong responseModalities
            const resp = await ai.models.generateContent({
              model: modelName,
              contents: {
                parts: [
                  {
                    inlineData: {
                      data: cleanBase64,
                      mimeType: mimeType || 'image/jpeg',
                    },
                  },
                  {
                    text: photorealisticPrompt,
                  },
                ],
              },
              config: {
                responseModalities: ['TEXT', 'IMAGE'],
                imageConfig: {
                  aspectRatio: '3:4',
                },
              },
            });

            console.log(`[${modelName}] Response:`, JSON.stringify(resp, null, 2));

            // Kiểm tra candidates và finishReason
            const candidate = resp.candidates?.[0];
            const finishReason = candidate?.finishReason;
            const promptFeedback = (resp as any).promptFeedback;

            if (finishReason === 'SAFETY' || promptFeedback?.blockReason === 'SAFETY') {
              lastFailureReason = 'Ảnh bị bộ lọc an toàn của AI từ chối. Vui lòng chọn ảnh chân dung khác rõ ràng và tươm tất hơn.';
              console.warn(`[${modelName}] Bị bộ lọc an toàn chặn (finishReason: ${finishReason})`);
              continue;
            }

            // Duyệt qua parts tìm inlineData
            for (const part of candidate?.content?.parts ?? []) {
              if (part.inlineData?.data) {
                const partMime = part.inlineData.mimeType || 'image/png';
                generatedImageUrl = `data:${partMime};base64,${part.inlineData.data}`;
                console.log(`==> Tạo ảnh thành công với model ${modelName}! Kích thước dữ liệu:`, part.inlineData.data.length);
                break;
              } else if (part.text) {
                console.log(`[${modelName}] Model trả về text thay vì ảnh:`, part.text.slice(0, 150));
              }
            }

            if (generatedImageUrl) break;

            if (finishReason) {
              lastFailureReason = `Model không trả ảnh (finishReason: ${finishReason}).`;
            }
          }
        } catch (modelErr: any) {
          const errMsg = modelErr.message || String(modelErr);
          console.error(`[${modelName}] Thất bại ở lần thử ${attemptCount}:`, errMsg);

          if (errMsg.includes('403') || errMsg.includes('PERMISSION_DENIED') || errMsg.includes('API_KEY_INVALID')) {
            lastFailureReason = 'Khóa API (GEMINI_API_KEY) không có quyền sử dụng model tạo ảnh này hoặc không hợp lệ. Vui lòng kiểm tra quyền hạn của khóa API.';
          } else if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED')) {
            lastFailureReason = 'Đã hết hạn mức yêu cầu API (Quota / Rate limit). Vui lòng thử lại sau vài phút.';
          } else if (errMsg.includes('404') || errMsg.includes('NOT_FOUND')) {
            lastFailureReason = `Model ${modelName} hiện không khả dụng trên tài khoản này.`;
          } else {
            lastFailureReason = `Lỗi từ AI: ${errMsg}`;
          }
        }
      }

      if (generatedImageUrl) break;

      // Chờ 1 giây trước khi tự động thử lại
      if (attemptCount < maxAttempts) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    // Nếu sau tất cả các lần thử vẫn không nhận được ảnh
    if (!generatedImageUrl) {
      console.error('==> Thất bại hoàn toàn sau 3 lần thử:', lastFailureReason);
      return res.status(500).json({
        error: lastFailureReason || 'Không thể tạo được ảnh chân thực vào lúc này do máy chủ ảnh đang bận. Vui lòng bấm thử lại sau giây lát.',
      });
    }

    const inspirationalMessage = `Chúc ${studentName} học sinh Trường Tiểu Học Tiến Hưng luôn tự tin, chăm ngoan và sớm chạm tới ước mơ trở thành ${spec.vietnameseTitle}!`;

    res.json({
      imageUrl: generatedImageUrl,
      careerTitleVi: spec.vietnameseTitle,
      inspirationalMessage,
      promptUsed: photorealisticPrompt,
    });
  } catch (error: any) {
    console.error('Error in /api/process-dream-photo:', error);
    res.status(500).json({
      error: error.message || 'Lỗi khi xử lý ảnh ước mơ. Vui lòng thử lại.',
    });
  }
});

// Vite middleware in dev or static files in production
if (process.env.NODE_ENV !== 'production') {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`✨ Server "Đôi Cánh Ước Mơ - Trường Tiểu Học Tiến Hưng" running on http://0.0.0.0:${port}`);
});
