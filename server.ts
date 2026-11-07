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

  // Check direct matches in canonical dictionary
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

  // If not found in table, use Gemini text model to deduce according to the exact same schema
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Quy tắc: Cho nghề "${dreamCareer}" của học sinh tiểu học, hãy tự suy luận mô tả theo ĐÚNG khuôn mẫu:
trang phục thật, dụng cụ thật, địa điểm thật, ánh sáng phù hợp.
Trả về định dạng JSON:
{
  "professionEn": "tên nghề tiếng Anh (ví dụ: marine biologist)",
  "outfitAndProps": "mô tả trang phục thật và dụng cụ chi tiết bằng tiếng Anh",
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
          outfitAndProps: parsed.outfitAndProps || `authentic realistic miniature ${dreamCareer} uniform`,
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

  // Default fallback spec
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

    if (!ai) {
      // Mock validation when offline
      return res.json({ valid: true });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const checkPrompt = `Kiểm tra ảnh này:
Yêu cầu bắt buộc:
1. Ảnh có đúng 1 khuôn mặt người/trẻ em thật, nhìn rõ nét ngũ quan, không bị mờ nhòe nghiêm trọng?
2. Ảnh KHÔNG PHẢI là tranh vẽ, hoạt hình, anime, chibi, 3D CGI, hình vẽ vector hay avatar nhân tạo?
3. Nếu ảnh thỏa mãn: trả về JSON { "valid": true, "reason": "Ảnh chân dung người thật hợp lệ" }.
4. Nếu ảnh KHÔNG có mặt, có nhiều hơn 1 người, quá mờ, hoặc là hoạt hình/hình vẽ: trả về JSON { "valid": false, "reason": "Không tìm thấy khuôn mặt rõ nét của học sinh trong ảnh. Vui lòng tải lên ảnh chụp chính diện, rõ mặt và không bị mờ nhòe." }.`;

    let validationRes: any = null;
    const modelsToCheck = ['gemini-2.5-flash', 'gemini-3.8-flash'];
    for (const model of modelsToCheck) {
      try {
        const resp = await ai.models.generateContent({
          model,
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
          validationRes = JSON.parse(resp.text.trim());
          break;
        }
      } catch (err) {
        console.warn(`Validation check with ${model} failed, trying next...`);
      }
    }

    if (!validationRes || validationRes.valid !== false) {
      return res.json({ valid: true });
    }

    return res.json({
      valid: false,
      error: validationRes.reason || 'Không tìm thấy khuôn mặt rõ nét của học sinh trong ảnh. Vui lòng tải lên ảnh chụp chính diện, rõ mặt và không bị mờ nhòe.',
    });
  } catch (err: any) {
    console.error('Error in /api/validate-face:', err);
    res.json({ valid: true }); // Graceful fallback
  }
});

/**
 * Complete Pipeline: Process Real Photographic Dream Image
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

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    if (!ai) {
      return res.status(500).json({
        error: 'Chưa cấu hình GEMINI_API_KEY. Vui lòng kiểm tra khóa API trong hệ thống.',
      });
    }

    // Bước 1: Kiểm tra khuôn mặt rõ nét
    const checkPrompt = `Kiểm tra ảnh này: có đúng 1 khuôn mặt người thật rõ nét không? Trả về JSON { "valid": boolean, "reason": string }`;
    try {
      const faceCheck = await ai.models.generateContent({
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

      if (faceCheck.text) {
        const parsedCheck = JSON.parse(faceCheck.text.trim());
        if (parsedCheck.valid === false) {
          return res.status(422).json({
            error: parsedCheck.reason || 'Không tìm thấy khuôn mặt rõ nét của học sinh trong ảnh. Vui lòng tải lên ảnh chụp chính diện, rõ mặt và không bị mờ nhòe.',
          });
        }
      }
    } catch (checkErr) {
      console.warn('Face check skipped/transient error:', checkErr);
    }

    // Bước 2 & 3: Chọn mô tả nghề tương ứng trong bảng
    const spec = await resolveCareerSpec(dreamCareer, studentName);

    // Bước 4: Ghép vào PROMPT MẪU bắt buộc
    const photorealisticPrompt = buildPhotorealisticPrompt(spec);
    console.log('Sending photorealistic prompt to image model:\n', photorealisticPrompt);

    // Bước 5: Gửi cùng ảnh gốc tới model ảnh thật (Thử lại tối đa 2 lần nếu chưa đạt)
    const imageModels = [
      'gemini-2.5-flash-image',
      'gemini-3.1-flash-lite-image',
      'imagen-3.0-generate-002',
    ];

    let generatedImageUrl: string | null = null;
    let attempts = 0;
    const maxAttempts = 3; // 1 lần đầu + tối đa 2 lần thử lại

    while (!generatedImageUrl && attempts < maxAttempts) {
      attempts++;
      console.log(`Generating real photograph - Attempt ${attempts}/${maxAttempts}...`);

      for (const modelName of imageModels) {
        try {
          if (modelName.startsWith('imagen-')) {
            // Imagen 3 call
            const imgRes = await ai.models.generateImages({
              model: modelName,
              prompt: photorealisticPrompt,
              config: {
                numberOfImages: 1,
                aspectRatio: '3:4',
              },
            });
            const bytes = imgRes.generatedImages?.[0]?.image?.imageBytes;
            if (bytes) {
              generatedImageUrl = `data:image/jpeg;base64,${bytes}`;
              console.log(`Successfully generated photo using ${modelName}`);
              break;
            }
          } else {
            // Multimodal Image model (gemini-2.5-flash-image / gemini-3.1-flash-lite-image)
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
            });

            for (const part of resp.candidates?.[0]?.content?.parts ?? []) {
              if (part.inlineData?.data) {
                const partMime = part.inlineData.mimeType || 'image/png';
                generatedImageUrl = `data:${partMime};base64,${part.inlineData.data}`;
                console.log(`Successfully generated photo using ${modelName}`);
                break;
              }
            }
            if (generatedImageUrl) break;
          }
        } catch (modelErr: any) {
          console.warn(`Model ${modelName} failed on attempt ${attempts}:`, modelErr.message);
        }
      }

      if (generatedImageUrl) break;
      // Wait 1.2s before next retry if needed
      await new Promise((r) => setTimeout(r, 1200));
    }

    if (!generatedImageUrl) {
      // Báo lỗi tiếng Việt, cấm tuyệt đối trả về ảnh hoạt hình/canvas
      return res.status(503).json({
        error: 'Không thể tạo được ảnh chân thực vào lúc này do máy chủ ảnh đang bận. Vui lòng bấm thử lại sau giây lát.',
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
