export interface CareerTemplate {
  id: string;
  name: string;
  category: string;
  badge: string;
  colorTheme: {
    primary: string;
    secondary: string;
    accent: string;
    bgGradient: string;
  };
  headCoords: {
    centerX: number; // percentage (0 - 100)
    centerY: number; // percentage (0 - 100)
    widthPercent: number;
    heightPercent: number;
  };
  inspirationalQuote: string;
  defaultPromptDescription: string;
}

export const CAREER_TEMPLATES: CareerTemplate[] = [
  {
    id: 'bac-si',
    name: 'Bác sĩ nhi khoa',
    category: 'Y tế & Chăm sóc sức khỏe',
    badge: '🩺 Bác sĩ',
    colorTheme: {
      primary: '#0284c7',
      secondary: '#e0f2fe',
      accent: '#0369a1',
      bgGradient: 'from-sky-50 to-blue-100',
    },
    headCoords: {
      centerX: 50,
      centerY: 27,
      widthPercent: 28,
      heightPercent: 28,
    },
    inspirationalQuote: 'Bàn tay nhỏ cứu chữa muôn người, trái tim ấm áp xoa dịu nỗi đau!',
    defaultPromptDescription: 'wearing miniature white doctor coat, stethoscope around neck, standing in a brightly lit modern pediatric clinic with colorful murals',
  },
  {
    id: 'phi-hanh-gia',
    name: 'Phi hành gia',
    category: 'Khoa học & Vũ trụ',
    badge: '🚀 Phi hành gia',
    colorTheme: {
      primary: '#6366f1',
      secondary: '#e0e7ff',
      accent: '#4338ca',
      bgGradient: 'from-indigo-50 to-violet-100',
    },
    headCoords: {
      centerX: 50,
      centerY: 26,
      widthPercent: 29,
      heightPercent: 29,
    },
    inspirationalQuote: 'Vươn xa ngàn dặm giữa dải ngân hà, khám phá những vì sao rực rỡ!',
    defaultPromptDescription: 'wearing detailed miniature NASA-style space suit with mission patches, inside a futuristic spaceship cockpit looking out at stars and Earth',
  },
  {
    id: 'cau-thu-bong-da',
    name: 'Cầu thủ bóng đá',
    category: 'Thể thao & Vận động',
    badge: '⚽ Cầu thủ',
    colorTheme: {
      primary: '#16a34a',
      secondary: '#dcfce7',
      accent: '#15803d',
      bgGradient: 'from-emerald-50 to-green-100',
    },
    headCoords: {
      centerX: 50,
      centerY: 28,
      widthPercent: 28,
      heightPercent: 28,
    },
    inspirationalQuote: 'Từng bước chạy dũng mãnh trên sân cỏ, ghi bàn thắng vàng vinh quang!',
    defaultPromptDescription: 'wearing vibrant red number 10 football jersey, holding a soccer ball on a lush green championship stadium pitch under golden floodlights',
  },
  {
    id: 'cong-an',
    name: 'Chiến sĩ cảnh sát',
    category: 'An ninh & Xã hội',
    badge: '👮 Chú công an',
    colorTheme: {
      primary: '#0f766e',
      secondary: '#ccfbf1',
      accent: '#115e59',
      bgGradient: 'from-teal-50 to-cyan-100',
    },
    headCoords: {
      centerX: 50,
      centerY: 27,
      widthPercent: 28,
      heightPercent: 28,
    },
    inspirationalQuote: 'Bảo vệ bình yên cho từng con phố, mang lại nụ cười cho nhân dân!',
    defaultPromptDescription: 'wearing crisp police officer uniform with golden insignia and cap, standing proudly near a patrol vehicle in an urban city avenue',
  },
  {
    id: 'giao-vien',
    name: 'Cô giáo / Thầy giáo',
    category: 'Giáo dục & Tri thức',
    badge: '📚 Giáo viên',
    colorTheme: {
      primary: '#ea580c',
      secondary: '#ffedd5',
      accent: '#c2410c',
      bgGradient: 'from-amber-50 to-orange-100',
    },
    headCoords: {
      centerX: 50,
      centerY: 27,
      widthPercent: 28,
      heightPercent: 28,
    },
    inspirationalQuote: 'Người lái đò thầm lặng, gieo những hạt mầm tri thức cho tương lai!',
    defaultPromptDescription: 'wearing elegant teaching attire, holding a book, standing in a cheerful sunny elementary classroom with chalk blackboard and colorful student projects',
  },
  {
    id: 'phi-cong',
    name: 'Phi công',
    category: 'Hàng không',
    badge: '✈️ Phi công',
    colorTheme: {
      primary: '#2563eb',
      secondary: '#dbeafe',
      accent: '#1d4ed8',
      bgGradient: 'from-sky-50 to-indigo-100',
    },
    headCoords: {
      centerX: 50,
      centerY: 26,
      widthPercent: 28,
      heightPercent: 28,
    },
    inspirationalQuote: 'Lướt trên tầng mây xanh biếc, dẫn dắt những chuyến bay an toàn!',
    defaultPromptDescription: 'wearing sharp commercial airline pilot uniform with golden stripes on shoulders and aviator cap, standing inside flight cockpit',
  },
  {
    id: 'hoa-si',
    name: 'Họa sĩ sáng tạo',
    category: 'Nghệ thuật & Sáng tạo',
    badge: '🎨 Họa sĩ',
    colorTheme: {
      primary: '#db2777',
      secondary: '#fce7f3',
      accent: '#be185d',
      bgGradient: 'from-pink-50 to-rose-100',
    },
    headCoords: {
      centerX: 50,
      centerY: 28,
      widthPercent: 28,
      heightPercent: 28,
    },
    inspirationalQuote: 'Vẽ nên thế giới đầy sắc màu kỳ diệu bằng tình yêu và trí tưởng tượng!',
    defaultPromptDescription: 'wearing French artist beret and paint-splattered creative apron, holding wooden palette and brush in a sunlit art studio with colorful canvas paintings',
  },
  {
    id: 'dau-bep',
    name: 'Đầu bếp siêu sao',
    category: 'Ẩm thực',
    badge: '🍳 Đầu bếp',
    colorTheme: {
      primary: '#d97706',
      secondary: '#fef3c7',
      accent: '#b45309',
      bgGradient: 'from-amber-50 to-yellow-100',
    },
    headCoords: {
      centerX: 50,
      centerY: 27,
      widthPercent: 28,
      heightPercent: 28,
    },
    inspirationalQuote: 'Chế biến những món ăn ngập tràn niềm vui và tình yêu thương!',
    defaultPromptDescription: 'wearing tall white chef toque hat and pristine chef coat, in a sparkling gourmet professional kitchen with fresh delicious ingredients',
  },
];

export interface CardFrameTheme {
  id: string;
  name: string;
  label: string;
  borderStyle: string;
  headerBg: string;
  footerBg: string;
  accentText: string;
  badgeBg: string;
  starColor: string;
}

export const FRAME_THEMES: CardFrameTheme[] = [
  {
    id: 'cau-vong',
    name: 'Cầu Vồng Tươi Sáng',
    label: 'Cầu Vồng',
    borderStyle: 'border-4 border-amber-300 shadow-xl shadow-amber-200/50 ring-4 ring-pink-200/60',
    headerBg: 'bg-gradient-to-r from-amber-400 via-pink-400 to-sky-400',
    footerBg: 'bg-gradient-to-r from-amber-50 via-rose-50 to-sky-50',
    accentText: 'text-amber-800',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    starColor: '#f59e0b',
  },
  {
    id: 'ngoi-sao',
    name: 'Ngôi Sao Tri Thức',
    label: 'Ngôi Sao',
    borderStyle: 'border-4 border-sky-400 shadow-xl shadow-sky-200/50 ring-4 ring-blue-200/60',
    headerBg: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500',
    footerBg: 'bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50',
    accentText: 'text-blue-900',
    badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
    starColor: '#3b82f6',
  },
  {
    id: 'vu-tru',
    name: 'Vũ Trụ Ước Mơ',
    label: 'Vũ Trụ',
    borderStyle: 'border-4 border-purple-400 shadow-xl shadow-purple-200/50 ring-4 ring-indigo-300/60',
    headerBg: 'bg-gradient-to-r from-indigo-800 via-purple-700 to-pink-600',
    footerBg: 'bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white',
    accentText: 'text-purple-300',
    badgeBg: 'bg-purple-900/80 text-purple-200 border-purple-500',
    starColor: '#a855f7',
  },
  {
    id: 'mam-xanh',
    name: 'Mầm Xanh Hy Vọng',
    label: 'Mầm Xanh',
    borderStyle: 'border-4 border-emerald-400 shadow-xl shadow-emerald-200/50 ring-4 ring-teal-200/60',
    headerBg: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500',
    footerBg: 'bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50',
    accentText: 'text-emerald-900',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    starColor: '#10b981',
  },
];

/**
 * 4 Diverse sample student presets for 1-click teacher demonstration
 */
export const SAMPLE_STUDENTS = [
  {
    id: 'sample-1',
    name: 'Nguyễn Minh Đức',
    studentClass: '2A',
    dreamCareer: 'Bác sĩ nhi khoa',
    gender: 'boy',
    avatarUrl: 'https://images.unsplash.com/photo-1595454223600-91fbdd91129b?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'sample-2',
    name: 'Lê Ngọc Hân',
    studentClass: '2B',
    dreamCareer: 'Phi hành gia',
    gender: 'girl',
    avatarUrl: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'sample-3',
    name: 'Trần Gia Huy',
    studentClass: '2C',
    dreamCareer: 'Cầu thủ bóng đá',
    gender: 'boy',
    avatarUrl: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'sample-4',
    name: 'Phạm Bảo Trân',
    studentClass: '2D',
    dreamCareer: 'Giáo viên',
    gender: 'girl',
    avatarUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=600&q=80',
  },
];
