import type { Agency, City, Group } from '../types';

const idolAnh = require('../assets/idols/idol_anh.webp');
const idolJoon = require('../assets/idols/idol_joon.webp');
const idolLena = require('../assets/idols/idol_lena.webp');
const idolWei = require('../assets/idols/idol_wei.webp');
const idolYara = require('../assets/idols/idol_yara.webp');
const idolMai = require('../assets/idols/idol_mai.webp');
const idolTheo = require('../assets/idols/idol_theo.webp');
const idolSky = require('../assets/idols/idol_sky.webp');
const idolSora = require('../assets/idols/idol_sora.webp');
const idolNarin = require('../assets/idols/idol_narin.webp');
const idolHyeri = require('../assets/idols/idol_hyeri.webp');
const idolKaito = require('../assets/idols/idol_kaito.webp');
const idolXinyi = require('../assets/idols/idol_xinyi.webp');
const idolPim = require('../assets/idols/idol_pim.webp');
const idolMinhan = require('../assets/idols/idol_minhan.webp');
const idolAkari = require('../assets/idols/idol_akari.webp');
const idolDonghyun = require('../assets/idols/idol_donghyun.webp');
const idolQuynh = require('../assets/idols/idol_quynh.webp');
const idolMing = require('../assets/idols/idol_ming.webp');
const idolFah = require('../assets/idols/idol_fah.webp');
const idolYejun = require('../assets/idols/idol_yejun.webp');
const idolNana = require('../assets/idols/idol_nana.webp');
const idolLan = require('../assets/idols/idol_lan.webp');
const idolTonkla = require('../assets/idols/idol_tonkla.webp');
const idolTrang = require('../assets/idols/idol_trang.webp');
const idolHyerin = require('../assets/idols/idol_hyerin.webp');
const idolShion = require('../assets/idols/idol_shion.webp');
const idolYue = require('../assets/idols/idol_yue.webp');
const idolMint = require('../assets/idols/idol_mint.webp');
const idolDuy = require('../assets/idols/idol_duy.webp');
const idolSeojin = require('../assets/idols/idol_seojin.webp');
const idolRen = require('../assets/idols/idol_ren.webp');
const idolJia = require('../assets/idols/idol_jia.webp');
const idolNamfon = require('../assets/idols/idol_namfon.webp');
const idolBaominh = require('../assets/idols/idol_baominh.webp');
const idolChaewon = require('../assets/idols/idol_chaewon.webp');
const idolDaichi = require('../assets/idols/idol_daichi.webp');
const idolMeilin = require('../assets/idols/idol_meilin.webp');
const idolArun = require('../assets/idols/idol_arun.webp');
const idolHaianh = require('../assets/idols/idol_haianh.webp');
const idolKiyomi = require('../assets/idols/idol_kiyomi.webp');
const idolJihwan = require('../assets/idols/idol_jihwan.webp');
const idolWanling = require('../assets/idols/idol_wanling.webp');
const idolKanon = require('../assets/idols/idol_kanon.webp');
const idolKiet = require('../assets/idols/idol_kiet.webp');
const idolSubin = require('../assets/idols/idol_subin.webp');
const idolZefeng = require('../assets/idols/idol_zefeng.webp');
const idolPraew = require('../assets/idols/idol_praew.webp');
const idolHayato = require('../assets/idols/idol_hayato.webp');
const idolBich = require('../assets/idols/idol_bich.webp');

// const idolMina = require('../assets/idols/idol_mina.webp');
// const idolRiku = require('../assets/idols/idol_riku.webp');
// const idolTao = require('../assets/idols/idol_tao.webp');
// const idolAria = require('../assets/idols/idol_aria.webp');
// const idolRenjun = require('../assets/idols/idol_renjun.webp');

export const initialAgency: Agency = {
  name: 'NEW AGENCY',
  ceoName: '',
  level: 1,
  money: 0,
  gems: 0,
  energy: 100,
  energyMax: 100,
  reputation: 0,
  monthlyIncome: 0,
  ranking: 999,
  city: '-',
  logo: { kind: 'none' },
};

export const cities: City[] = [
  {
    id: 'seoul',
    name: 'Seoul',
    flag: '🇰🇷',
    desc: 'High competition, strong K-Pop market, high revenue potential.',
    budget: '₩720M',
    startingBudget: 720_000_000,
    difficulty: 'Hard',
    fan: 1.2,
    cost: 1.3,
    revenue: 1.4,
    competition: 95,
    taxRate: 0.14,
    officeRentWeekly: 12_000_000,
    localReputationBoost: 6,
    domesticStreamingBonus: 0.2,
    operationalCostMultiplier: 1.18,
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    flag: '🇯🇵',
    desc: 'Strong idol market, stable fans, high promotion cost.',
    budget: '₩760M',
    startingBudget: 760_000_000,
    difficulty: 'Hard',
    fan: 1.1,
    cost: 1.25,
    revenue: 1.3,
    competition: 85,
    taxRate: 0.13,
    officeRentWeekly: 11_000_000,
    localReputationBoost: 4,
    domesticStreamingBonus: 0.15,
    operationalCostMultiplier: 1.12,
  },
  {
    id: 'beijing',
    name: 'Beijing',
    flag: '🇨🇳',
    desc: 'Huge market, high revenue, complex competition.',
    budget: '₩680M',
    startingBudget: 680_000_000,
    difficulty: 'Medium',
    fan: 1.3,
    cost: 1.1,
    revenue: 1.35,
    competition: 80,
    taxRate: 0.12,
    officeRentWeekly: 10_000_000,
    localReputationBoost: 3,
    domesticStreamingBonus: 0.12,
    operationalCostMultiplier: 1.0,
  },
  {
    id: 'hanoi',
    name: 'Hanoi',
    flag: '🇻🇳',
    desc: 'Emerging market, lower costs, strong growth potential.',
    budget: '₩520M',
    startingBudget: 520_000_000,
    difficulty: 'Easy',
    fan: 1.4,
    cost: 0.7,
    revenue: 0.9,
    competition: 40,
    taxRate: 0.08,
    officeRentWeekly: 6_500_000,
    localReputationBoost: 1,
    domesticStreamingBonus: 0.04,
    operationalCostMultiplier: 0.84,
  },
  {
    id: 'bangkok',
    name: 'Bangkok',
    flag: '🇹🇭',
    desc: 'Regional growth hub, balanced costs and fan expansion.',
    budget: '₩590M',
    startingBudget: 590_000_000,
    difficulty: 'Medium',
    fan: 1.25,
    cost: 0.85,
    revenue: 1.0,
    competition: 55,
    taxRate: 0.1,
    officeRentWeekly: 7_500_000,
    localReputationBoost: 2,
    domesticStreamingBonus: 0.07,
    operationalCostMultiplier: 0.9,
  },
];

export const initialGroups: Group[] = [];

export const initialRevenueHistory = [
  { m: 'JAN', group: 0, solo: 0, merch: 0 },
  { m: 'FEB', group: 0, solo: 0, merch: 0 },
  { m: 'MAR', group: 0, solo: 0, merch: 0 },
  { m: 'APR', group: 0, solo: 0, merch: 0 },
  { m: 'MAY', group: 0, solo: 0, merch: 0 },
  { m: 'JUN', group: 0, solo: 0, merch: 0 },
  { m: 'JUL', group: 0, solo: 0, merch: 0 },
  { m: 'AUG', group: 0, solo: 0, merch: 0 },
  { m: 'SEP', group: 0, solo: 0, merch: 0 },
];

export const initialTransactions: Array<{
  id: number;
  label: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
}> = [];

export const traineeArtPool = [
  { artKey: 1, gender: 'female', availableNationality: 'All', image: idolAnh },
  { artKey: 2, gender: 'male', availableNationality: 'All', image: idolJoon },
  { artKey: 3, gender: 'female', availableNationality: 'All', image: idolLena },
  { artKey: 4, gender: 'female', availableNationality: 'All', image: idolSeojin },
  { artKey: 5, gender: 'female', availableNationality: 'All', image: idolNarin },
  { artKey: 6, gender: 'male', availableNationality: 'All', image: idolRen },
  { artKey: 7, gender: 'female', availableNationality: 'All', image: idolSora },
  { artKey: 8, gender: 'female', availableNationality: 'All', image: idolJia },
  { artKey: 9, gender: 'male', availableNationality: 'All', image: idolWei },
  { artKey: 10, gender: 'female', availableNationality: 'All', image: idolYara },
  { artKey: 11, gender: 'female', availableNationality: 'All', image: idolNamfon },
  { artKey: 12, gender: 'male', availableNationality: 'All', image: idolBaominh },
  { artKey: 13, gender: 'female', availableNationality: 'All', image: idolMai },
  { artKey: 14, gender: 'male', availableNationality: 'All', image: idolTheo },
  { artKey: 15, gender: 'female', availableNationality: 'All', image: idolSky },
  { artKey: 16, gender: 'female', availableNationality: 'All', image: idolHyeri },
  { artKey: 17, gender: 'male', availableNationality: 'All', image: idolKaito },
  { artKey: 18, gender: 'female', availableNationality: 'All', image: idolXinyi },
  { artKey: 19, gender: 'female', availableNationality: 'All', image: idolPim },
  { artKey: 20, gender: 'male', availableNationality: 'All', image: idolMinhan },
  { artKey: 21, gender: 'female', availableNationality: 'All', image: idolAkari },
  { artKey: 22, gender: 'male', availableNationality: 'All', image: idolDonghyun },
  { artKey: 23, gender: 'female', availableNationality: 'All', image: idolQuynh },
  { artKey: 24, gender: 'male', availableNationality: 'All', image: idolMing },
  { artKey: 25, gender: 'female', availableNationality: 'All', image: idolFah },
  { artKey: 26, gender: 'male', availableNationality: 'All', image: idolYejun },
  { artKey: 27, gender: 'female', availableNationality: 'Japanese', image: idolNana },
  { artKey: 28, gender: 'female', availableNationality: 'All', image: idolLan },
  { artKey: 29, gender: 'male', availableNationality: 'Thai, Chinese', image: idolTonkla },
  { artKey: 30, gender: 'female', availableNationality: 'All', image: idolTrang },
  { artKey: 31, gender: 'female', availableNationality: 'All', image: idolHyerin },
  { artKey: 32, gender: 'male', availableNationality: 'All', image: idolShion },
  { artKey: 33, gender: 'female', availableNationality: 'All', image: idolYue },
  { artKey: 34, gender: 'female', availableNationality: 'All', image: idolMint },
  { artKey: 35, gender: 'male', availableNationality: 'Vietnamese, Thai', image: idolDuy },
  { artKey: 36, gender: 'female', availableNationality: 'Korean, Japanese, Chinese', image: idolSubin },
  { artKey: 37, gender: 'male', availableNationality: 'Chinese, Thai, Vietnamese', image: idolZefeng },
  { artKey: 38, gender: 'female', availableNationality: 'Thai, Vietnamese', image: idolPraew },
  { artKey: 39, gender: 'male', availableNationality: 'Japanese, Korean', image: idolHayato },
  { artKey: 40, gender: 'female', availableNationality: 'Vietnamese, Thai, Chinese', image: idolBich },
  { artKey: 41, gender: 'female', availableNationality: 'Korean, Japanese, Chinese', image: idolChaewon },
  { artKey: 42, gender: 'male', availableNationality: 'Japanese, Korean, Chinese', image: idolDaichi },
  { artKey: 43, gender: 'female', availableNationality: 'All', image: idolMeilin },
  { artKey: 44, gender: 'male', availableNationality: 'All', image: idolArun },
  { artKey: 45, gender: 'female', availableNationality: 'Vietnamese, Thai, Chinese', image: idolHaianh },
  { artKey: 46, gender: 'female', availableNationality: 'Japanese, Korean', image: idolKiyomi },
  { artKey: 47, gender: 'male', availableNationality: 'Korean, Chinese, Vietnamese, Thai', image: idolJihwan },
  { artKey: 48, gender: 'female', availableNationality: 'Chinese', image: idolWanling },
  { artKey: 49, gender: 'female', availableNationality: 'Japanese, Korean, Chinese', image: idolKanon },
  { artKey: 50, gender: 'male', availableNationality: 'Vietnamese, Thai, Chinese', image: idolKiet },
 
  // { artKey: 4, gender: 'female', availableNationality: 'All', image: idolMina },
  // { artKey: 6, gender: 'male', availableNationality: 'All', image: idolRiku },
  // { artKey: 8, gender: 'male', availableNationality: 'All', image: idolTao },
  // { artKey: 11, gender: 'female', availableNationality: 'All', image: idolAria },
  // { artKey: 12, gender: 'male', availableNationality: 'All', image: idolRenjun },
] as const;

export const trainingTypes = [
  { id: 'vocal', name: 'Vocal Coaching', effect: '+Vocal', cost: '−Energy' },
  { id: 'dance', name: 'Dance Practice', effect: '+Dance', cost: '−Energy' },
  { id: 'rap', name: 'Rap Training', effect: '+Rap', cost: '−Energy' },
  { id: 'acting', name: 'Acting Class', effect: '+Acting', cost: '−Energy' },
  { id: 'lang', name: 'Language Lab', effect: '+Language', cost: '−Energy' },
  { id: 'media', name: 'Media Training', effect: '+Variety', cost: '−Energy' },
  { id: 'rest', name: 'Rest Day', effect: '+Morale', cost: '+Energy' },
];

export const conceptOptions = ['Girl Crush', 'Fresh', 'Elegant', 'Hip-Hop', 'Ballad', 'Experimental', 'Global Pop'];
export const languageOptions = ['Korean', 'Japanese', 'Chinese', 'Vietnamese', 'English'];

export const scoutingNationalityProfiles = [
  {
    nationality: 'Korean',
    flag: '🇰🇷',
    languages: ['Korean', 'English'],
    stageNames: [
      'Yuna',
      'Jin',
      'Sori',
      'Nari',
      'Min',
      'Jae',
      'Haneul',
      'Ara',
      'Hyun',
      'Dami',
      'Yeon',
      'Taeyang',
      'Rina',
      'Eun',
    ],
    familyNames: ['Kim', 'Park', 'Lee', 'Choi', 'Ahn', 'Kang', 'Jung', 'Yoon', 'Shin', 'Im'],
    givenNames: [
      'Minji',
      'Jisoo',
      'Yujin',
      'Hana',
      'Seojun',
      'Jiwon',
      'Sora',
      'Eunwoo',
      'Chaeyoung',
      'Hyerin',
      'Taemin',
      'Donghyun',
      'Naeun',
      'Yerin',
    ],
  },
  {
    nationality: 'Japanese',
    flag: '🇯🇵',
    languages: ['Japanese', 'Korean'],
    stageNames: [
      'Rin',
      'Haru',
      'Mio',
      'Yuki',
      'Noa',
      'Sena',
      'Riku',
      'Aoi',
      'Hina',
      'Rei',
      'Sora',
      'Kou',
      'Nana',
      'Mao',
    ],
    familyNames: [
      'Sato',
      'Tanaka',
      'Suzuki',
      'Nakamura',
      'Kobayashi',
      'Ito',
      'Yamamoto',
      'Watanabe',
      'Kato',
      'Yoshida',
    ],
    givenNames: [
      'Yuki',
      'Haruka',
      'Airi',
      'Ren',
      'Yuna',
      'Kaito',
      'Mina',
      'Sora',
      'Rina',
      'Hinata',
      'Takumi',
      'Shion',
      'Akari',
      'Miyu',
    ],
  },
  {
    nationality: 'Chinese',
    flag: '🇨🇳',
    languages: ['Chinese', 'Korean'],
    stageNames: [
      'Lin',
      'Mei',
      'Yun',
      'Wei',
      'Tao',
      'Rui',
      'Jia',
      'An',
      'Xin',
      'Qi',
      'Lan',
      'Bo',
      'Yan',
      'Ming',
    ],
    familyNames: ['Li', 'Wang', 'Zhang', 'Liu', 'Chen', 'Zhao', 'Huang', 'Wu', 'Xu', 'Sun'],
    givenNames: [
      'Mei',
      'Xiao',
      'Yun',
      'Rui',
      'Lin',
      'An',
      'Jia',
      'Wei',
      'Xin',
      'Qian',
      'Ming',
      'Yue',
      'Ting',
      'Bo',
    ],
  },
  {
    nationality: 'Thai',
    flag: '🇹🇭',
    languages: ['Thai', 'Korean', 'English'],
    stageNames: [
      'Ning',
      'Ploy',
      'Mew',
      'Rain',
      'Nara',
      'Tae',
      'Yara',
      'Beam',
      'Fah',
      'Mint',
      'Nam',
      'Pond',
      'Aom',
      'Ton',
    ],
    familyNames: [
      'Chai',
      'Suk',
      'Viroj',
      'Anan',
      'Prasert',
      'Kitt',
      'Somchai',
      'Niran',
      'Suda',
      'Wirot',
    ],
    givenNames: [
      'Nara',
      'Pim',
      'Dao',
      'Tawan',
      'Mew',
      'Kwan',
      'Yara',
      'Beam',
      'Fah',
      'Mint',
      'Nok',
      'Ploen',
      'Namfon',
      'Tonkla',
    ],
  },
  {
    nationality: 'Vietnamese',
    flag: '🇻🇳',
    languages: ['Vietnamese', 'Korean', 'English'],
    stageNames: [
      'Anh',
      'Linh',
      'Mai',
      'Bao',
      'Nhi',
      'Huy',
      'Lena',
      'Vivi',
      'Trang',
      'Khanh',
      'Quynh',
      'Son',
      'Thao',
      'Nam',
    ],
    familyNames: [
      'Nguyen',
      'Tran',
      'Le',
      'Pham',
      'Vo',
      'Hoang',
      'Bui',
      'Dang',
      'Do',
      'Vu',
    ],
    givenNames: [
      'Anh',
      'Linh',
      'Mai',
      'Bao',
      'Nhi',
      'Thanh',
      'Minh',
      'Vy',
      'Trang',
      'Khanh',
      'Quynh',
      'Thao',
      'Duy',
      'Nam',
    ],
  },
] as const;

export const scoutingSkillOptions = ['Vocal', 'Dance', 'Rap', 'Visual', 'Charisma'] as const;
