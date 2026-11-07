import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

// Allow large base64 image uploads for student portraits
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));

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
 * Step 1: Deep Facial Analysis & Prompt Engineering
 */
app.post('/api/analyze-face', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', studentName, studentClass, dreamCareer } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Vui lòng tải lên ảnh chân dung của học sinh.' });
    }

    if (!dreamCareer) {
      return res.status(400).json({ error: 'Vui lòng nhập ước mơ của học sinh.' });
    }

    // Clean base64 if it has prefix
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    if (!ai) {
      // Mock / Offline response if no API key is present
      return res.json({
        facialAnalysis: 'Khuôn mặt tròn tươi tắn của trẻ 7 tuổi, đôi mắt sáng thông minh, sống mũi nhỏ nhắn, khuôn miệng cười rạng rỡ đặc trưng học sinh lớp 2.',
        hairDetails: 'Tóc đen mượt tự nhiên, mái ngố nhẹ nhàng đúng lứa tuổi học sinh tiểu học Việt Nam.',
        skinAndEyes: 'Làn da mịn màng, đôi mắt đen láy bừng sáng ánh lên niềm vui và sự tự tin.',
        careerAttire: `Bộ trang phục thu nhỏ chuyên nghiệp chuẩn ngành ${dreamCareer}, vừa vặn và tươm tất với huy hiệu tên ${studentName || 'Học Sinh'}.`,
        careerSetting: `Không gian làm việc sinh động, chân thực như ngoài đời và ngập tràn ánh sáng phù hợp ước mơ ${dreamCareer}.`,
        generatedPrompt: `Ultra-photorealistic real-world portrait photography, shot on 85mm f/1.4 lens, natural lighting, documentary authentic style. A real 7-year-old Vietnamese child with round bright face, genuine lively eyes, realistic natural skin texture with subtle pores, natural black hair, wearing an authentic tailored miniature ${dreamCareer} uniform with name badge "${studentName || 'Student'}", standing in a realistic, vivid real-life work environment for ${dreamCareer}. True-to-life photography, lifelike depth of field, sharp focus, zero artificial cartoon look.`,
        careerTitleVi: dreamCareer,
        inspirationalMessage: `Chúc ${studentName ? studentName : 'em'} học sinh Trường Tiểu Học Tiến Hưng luôn tự tin, chăm ngoan và sớm chạm tới ước mơ trở thành ${dreamCareer}!`,
      });
    }

    const systemPrompt = `Bạn là chuyên gia phân tích nhân trắc học và tạo prompt AI hình ảnh chân thực như ngoài đời cho học sinh Trường Tiểu Học Tiến Hưng (lớp 2, khoảng 7-8 tuổi) Việt Nam.
Nhiệm vụ của bạn là:
1. Phân tích ảnh khuôn mặt của học sinh với độ chi tiết cực cao để ảnh sau khi tạo chân thực như ngoài đời thật (life-like, authentic real-world photography).
2. Chiết xuất chi tiết hình học khuôn mặt, dáng mắt, mí mắt, sống mũi, cánh mũi, khóe miệng, nụ cười, sắc tố da tự nhiên, kết cấu tóc và nét biểu cảm chân thực.
3. Kết hợp hồ sơ nhân diện này với ước mơ nghề nghiệp "${dreamCareer}" của học sinh tên "${studentName || 'Học sinh'}" lớp "${studentClass || '2'}".
4. Tạo ra công thức prompt chuẩn chụp ảnh chân dung thực tế cao cấp (85mm f/1.4 natural portrait photography), không mang tính hoạt hình hay nhân tạo, đạt độ chân thực tối đa:
"Ultra-photorealistic real-world portrait photography, shot on 85mm f/1.4 lens, documentary authentic lighting. A real 7-year-old Vietnamese child with [MÔ TẢ CHI TIẾT ĐẶC ĐIỂM KHUÔN MẶT ĐÃ TRÍCH XUẤT] wearing an authentic tailored miniature [TRANG PHỤC NGHỀ NGHIỆP THU NHỎ] uniform, standing in a real believable [MÔI TRƯỜNG NGHỀ NGHIỆP]. True-to-life skin texture, natural soft facial lighting, genuine expressive eyes, authentic joyful smile, lifelike depth of field, zero cartoon or plastic render."

Trả về kết quả dưới định dạng JSON với các khóa sau:
{
  "facialAnalysis": "Tóm tắt phân tích nét mặt chi tiết (tiếng Việt)",
  "hairDetails": "Mô tả kiểu tóc, chất tóc và đường viền trán (tiếng Việt)",
  "skinAndEyes": "Mô tả mắt, ánh nhìn, nụ cười và nước da tự nhiên (tiếng Việt)",
  "careerAttire": "Mô tả trang phục nghề nghiệp thu nhỏ chân thực (tiếng Việt)",
  "careerSetting": "Mô tả bối cảnh nghề nghiệp như ngoài đời thật (tiếng Việt)",
  "generatedPrompt": "Prompt tiếng Anh hoàn chỉnh theo đúng công thức ở trên",
  "careerTitleVi": "Tên nghề nghiệp chuẩn tiếng Việt truyền cảm hứng",
  "inspirationalMessage": "Lời chúc ngắn ấm áp gửi tới học sinh Trường Tiểu Học Tiến Hưng"
}`;

    // Try gemini-2.5-flash or gemini-3.8-flash
    let responseText = '';
    const modelsToTry = ['gemini-2.5-flash', 'gemini-3.8-flash'];
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: {
            parts: [
              {
                inlineData: {
                  data: cleanBase64,
                  mimeType: mimeType || 'image/jpeg',
                },
              },
              {
                text: `Hãy phân tích khuôn mặt học sinh này và tạo prompt ước mơ "${dreamCareer}". Trả về JSON duy nhất.`,
              },
            ],
          },
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
          },
        });

        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err) {
        lastError = err;
        console.warn(`Analysis with ${model} failed, trying next...`, err);
      }
    }

    if (!responseText) {
      throw lastError || new Error('Không thể phân tích khuôn mặt từ hình ảnh.');
    }

    // Parse JSON
    let parsed: any;
    try {
      parsed = JSON.parse(responseText.trim());
    } catch {
      // Clean markdown code blocks if any
      const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/analyze-face:', error);
    res.status(500).json({
      error: error.message || 'Lỗi khi phân tích khuôn mặt.',
    });
  }
});

/**
 * Step 2: Photorealistic Dream Image Synthesis
 */
app.post('/api/generate-dream-image', async (req, res) => {
  try {
    const {
      prompt,
      imageBase64,
      mimeType = 'image/jpeg',
      dreamCareer,
      studentName,
    } = req.body;

    if (!prompt && !dreamCareer) {
      return res.status(400).json({ error: 'Thiếu thông tin prompt hoặc ước mơ.' });
    }

    const cleanBase64 = imageBase64 ? imageBase64.replace(/^data:image\/\w+;base64,/, '') : null;

    if (!ai) {
      // Mock generated career image if API key is missing
      return res.json({
        imageUrl: null,
        method: 'mock',
        message: 'Chưa cấu hình GEMINI_API_KEY. Vui lòng sử dụng chế độ Smart Face-Blend.',
      });
    }

    let generatedImageUrl: string | null = null;
    let methodUsed = '';

    // Attempt 1: Imagen 3 (imagen-3.0-generate-002)
    try {
      console.log('Attempting image generation with imagen-3.0-generate-002...');
      const imagenResponse = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: prompt || `A 7-year-old Vietnamese child wearing a realistic miniature ${dreamCareer} uniform in a vivid professional ${dreamCareer} setting, 8k portrait photography, studio lighting.`,
        config: {
          numberOfImages: 1,
          aspectRatio: '3:4',
        },
      });

      const firstImage = imagenResponse.generatedImages?.[0]?.image?.imageBytes;
      if (firstImage) {
        generatedImageUrl = `data:image/jpeg;base64,${firstImage}`;
        methodUsed = 'imagen-3.0-generate-002';
      }
    } catch (imagenErr) {
      console.warn('Imagen 3 attempt error:', (imagenErr as Error).message);
    }

    // Attempt 2: Image-to-image with gemini-3.1-flash-lite-image or gemini-2.0-flash-exp
    if (!generatedImageUrl && cleanBase64) {
      const editModels = ['gemini-3.1-flash-lite-image', 'gemini-2.0-flash-exp'];
      for (const editModel of editModels) {
        try {
          console.log(`Attempting image generation with ${editModel}...`);
          const editResponse = await ai.models.generateContent({
            model: editModel,
            contents: {
              parts: [
                {
                  inlineData: {
                    data: cleanBase64,
                    mimeType: mimeType || 'image/jpeg',
                  },
                },
                {
                  text: `Keep this exact child's real-life face, facial geometry, nose, smile and eyes authentic and identical. Transform their body and clothing into a realistic 7-year-old ${dreamCareer} professional uniform, standing in an authentic true-to-life real world environment of a ${dreamCareer}. True-to-life documentary portrait photography, natural skin texture and realistic ambient lighting, zero cartoon or artificial render look.`,
                },
              ],
            },
          });

          for (const part of editResponse.candidates?.[0]?.content?.parts ?? []) {
            if (part.inlineData?.data) {
              const partMime = part.inlineData.mimeType || 'image/png';
              generatedImageUrl = `data:${partMime};base64,${part.inlineData.data}`;
              methodUsed = editModel;
              break;
            }
          }
          if (generatedImageUrl) break;
        } catch (editErr) {
          console.warn(`${editModel} attempt error:`, (editErr as Error).message);
        }
      }
    }

    res.json({
      imageUrl: generatedImageUrl,
      method: methodUsed || 'none',
      promptUsed: prompt,
    });
  } catch (error: any) {
    console.error('Error in /api/generate-dream-image:', error);
    res.status(500).json({
      error: error.message || 'Lỗi khi tạo ảnh ước mơ.',
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
  console.log(`✨ Server "Đôi Cánh Ước Mơ Lớp 2" running on http://0.0.0.0:${port}`);
});
