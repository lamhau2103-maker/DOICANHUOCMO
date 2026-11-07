/**
 * Bảng mô tả nghề nghiệp chuẩn chụp ảnh chân thực theo yêu cầu
 */
export interface CareerSpec {
  professionEn: string;
  outfitAndProps: string;
  setting: string;
  pose: string;
  lighting: string;
  vietnameseTitle: string;
}

export const CANONICAL_CAREERS: Record<string, CareerSpec> = {
  'bac-si': {
    professionEn: 'pediatrician',
    outfitAndProps: 'white lab coat with name badge, stethoscope around the neck, medical scrubs underneath',
    setting: "bright modern children's clinic with soft pastel walls and a blurred exam room",
    pose: 'arms relaxed or one hand holding the stethoscope',
    lighting: 'soft window light plus clean clinic lighting',
    vietnameseTitle: 'Bác sĩ nhi khoa',
  },
  'cau-thu-bong-da': {
    professionEn: 'soccer player',
    outfitAndProps: 'real football jersey with number, shorts, socks, holding a football under one arm',
    setting: 'real stadium with green grass pitch and blurred crowd stands',
    pose: 'holding football under one arm, standing tall and athletic',
    lighting: 'golden-hour sunlight with warm rim light',
    vietnameseTitle: 'Cầu thủ bóng đá',
  },
  'tho-ky-thuat': {
    professionEn: 'technician/mechanic',
    outfitAndProps: 'work coverall or uniform, safety helmet, protective gloves, a wrench or tool in hand',
    setting: 'real workshop or garage with machinery and tools blurred behind',
    pose: 'holding tool confidently, ready to work',
    lighting: 'warm workshop lighting',
    vietnameseTitle: 'Thợ kỹ thuật / Cơ khí',
  },
  'phi-cong': {
    professionEn: 'airline pilot',
    outfitAndProps: 'pilot uniform with epaulettes and cap, tie, gold sleeve stripes',
    setting: 'airport apron with an airplane or cockpit in the background',
    pose: 'standing proudly, pilot cap straight, hands relaxed',
    lighting: 'bright daylight',
    vietnameseTitle: 'Phi công',
  },
  'giao-vien': {
    professionEn: 'teacher',
    outfitAndProps: 'neat teacher shirt or traditional ao dai, holding a book',
    setting: 'real classroom with blackboard and desks blurred in background',
    pose: 'holding textbook close to chest with a warm welcoming posture',
    lighting: 'soft natural window light',
    vietnameseTitle: 'Giáo viên',
  },
  'cong-an': {
    professionEn: 'Vietnamese police officer',
    outfitAndProps: 'accurate official uniform, service cap, shoulder insignia, badge',
    setting: 'dignified outdoor setting with national flag softly blurred in background',
    pose: 'standing upright and dignified, respectful posture',
    lighting: 'clear natural daylight',
    vietnameseTitle: 'Chiến sĩ công an',
  },
  'bo-doi': {
    professionEn: 'Vietnamese soldier',
    outfitAndProps: 'neat military uniform, camouflage cap, official insignia',
    setting: 'dignified outdoor military grounds with green trees softly blurred',
    pose: 'standing disciplined and proud',
    lighting: 'crisp daylight',
    vietnameseTitle: 'Chú bộ đội',
  },
  'ky-su-xay-dung': {
    professionEn: 'civil engineer',
    outfitAndProps: 'white safety helmet, high-visibility reflective vest, holding blueprints',
    setting: 'real construction site blurred in background with modern architecture',
    pose: 'holding blueprints under arm or unrolled with one hand',
    lighting: 'bright outdoor daylight',
    vietnameseTitle: 'Kỹ sư xây dựng',
  },
  'nha-khoa-hoc': {
    professionEn: 'scientist',
    outfitAndProps: 'lab coat, safety goggles pushed up, holding a glass test tube',
    setting: 'real laboratory with glassware and science equipment blurred',
    pose: 'holding test tube at eye level with curious expression',
    lighting: 'clean cool lab lighting',
    vietnameseTitle: 'Nhà khoa học',
  },
  'dau-bep': {
    professionEn: 'chef',
    outfitAndProps: 'white chef jacket with double buttons and traditional chef hat (toque)',
    setting: 'professional commercial kitchen blurred in background with stainless steel counters',
    pose: 'arms folded or holding a wooden spoon',
    lighting: 'warm kitchen ambient light',
    vietnameseTitle: 'Đầu bếp',
  },
  'phi-hanh-gia': {
    professionEn: 'astronaut',
    outfitAndProps: 'detailed miniature white astronaut spacesuit with mission flags and patches',
    setting: 'futuristic spaceship observation cupola with stars and Earth in the background',
    pose: 'standing proudly in space exploration gear',
    lighting: 'dramatic cinematic spacecraft lighting',
    vietnameseTitle: 'Phi hành gia',
  },
  'hoa-si': {
    professionEn: 'fine artist',
    outfitAndProps: 'artist apron with gentle paint spots, holding a wooden palette and paintbrush',
    setting: 'sunlit art studio with canvas easel and artworks blurred behind',
    pose: 'holding palette in one hand and brush in the other',
    lighting: 'soft natural northern studio light',
    vietnameseTitle: 'Họa sĩ',
  },
  'nong-dan': {
    professionEn: 'modern agricultural farmer',
    outfitAndProps: 'practical outdoor farming outfit, conical leaf hat (nón lá) or sun hat, fresh produce in hand',
    setting: 'lush green organic farm field with crops blurred under open sky',
    pose: 'holding fresh fruits or vegetables with a bright genuine smile',
    lighting: 'warm morning sunlight',
    vietnameseTitle: 'Bác nông dân',
  },
  'ca-si': {
    professionEn: 'performing singer',
    outfitAndProps: 'neat concert performance attire or formal stage outfit, holding a studio microphone',
    setting: 'warm musical performance stage or recording studio with soundproofing blurred',
    pose: 'holding microphone gently, expressive joyful stance',
    lighting: 'warm stage spotlights with soft bokeh',
    vietnameseTitle: 'Ca sĩ',
  },
  'lap-trinh-vien': {
    professionEn: 'software engineer / programmer',
    outfitAndProps: 'casual smart tech polo shirt, headphones around neck, modern tablet in hand',
    setting: 'modern high-tech innovation office with monitors and clean glass walls',
    pose: 'standing holding a tablet or laptop with friendly confidence',
    lighting: 'clean modern office lighting',
    vietnameseTitle: 'Lập trình viên',
  },
};

/**
 * Builds the exact PROMPT MẪU requested by user
 */
export function buildPhotorealisticPrompt(spec: CareerSpec): string {
  return `Using the attached photo as the identity reference, generate a single photorealistic photograph of this exact same child as a real ${spec.professionEn}. This must look like an actual photo taken by a professional photographer, NOT an illustration, NOT a cartoon, NOT a 3D render.
IDENTITY: keep the child's real face exactly: same face shape, eyes, eyebrows, nose, mouth, skin tone, hairstyle, and apparent age. Do not beautify, stylize, or change the face. A real human face with natural skin texture, visible pores, and natural catchlights in the eyes must be clearly visible and in sharp focus.
OUTFIT AND PROPS: ${spec.outfitAndProps}
SETTING: ${spec.setting}, background softly blurred with natural depth of field.
POSE: ${spec.pose}, natural confident friendly smile, looking at the camera, upper body to waist-up framing, portrait orientation 3:4.
PHOTOGRAPHY: shot on a Canon EOS R5, 85mm f/1.4 lens, ${spec.lighting}, realistic fabric texture with natural wrinkles and folds, true-to-life colors, subtle film grain, 4K, ultra-detailed, editorial documentary photography. Wholesome and child-appropriate.
NEGATIVE: cartoon, anime, illustration, vector, flat color, painting, drawing, 3D render, CGI, doll, plastic skin, airbrushed, blurry or missing face, faceless, distorted face, deformed hands, extra fingers, text, watermark, logo, a different person.`;
}
