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
const idolSooyeon = require('../assets/idols/idol_sooyeon.webp');
const idolDawon = require('../assets/idols/idol_dawon.webp');
const idolHaruto = require('../assets/idols/idol_haruto.webp');
const idolReina = require('../assets/idols/idol_reina.webp');
const idolTaewoo = require('../assets/idols/idol_taewoo.webp');
const idolYuting = require('../assets/idols/idol_yuting.webp');
const idolChenxi = require('../assets/idols/idol_chenxi.webp');
const idolBusaba = require('../assets/idols/idol_busaba.webp');
const idolManow = require('../assets/idols/idol_manow.webp');
const idolChakri = require('../assets/idols/idol_chakri.webp');
const idolCamtu = require('../assets/idols/idol_camtu.webp');
const idolPhong = require('../assets/idols/idol_phong.webp');
const idolThanhlong = require('../assets/idols/idol_thanhlong.webp');
const idolJunho = require('../assets/idols/idol_junho.webp');
const idolWoojin = require('../assets/idols/idol_woojin.webp');
const idolHana = require('../assets/idols/idol_hana.webp');
const idolSota = require('../assets/idols/idol_sota.webp');
const idolXiaoxia = require('../assets/idols/idol_xiaoxia.webp');
const idolLinh = require('../assets/idols/idol_linh.webp');
const idolWeiming = require('../assets/idols/idol_weiming.webp');
const idolMina = require('../assets/idols/idol_mina.webp');
const idolRiku = require('../assets/idols/idol_riku.webp');
const idolTao = require('../assets/idols/idol_tao.webp');
const idolAria = require('../assets/idols/idol_aria.webp');
const idolRenjun = require('../assets/idols/idol_renjun.webp');
const idolBee = require('../assets/idols/idol_bee.webp');
const idolEm = require('../assets/idols/idol_em.webp');
const idolSaOn = require('../assets/idols/idol_saon.webp');
const idolSeR = require('../assets/idols/idol_ser.webp');
const idolTos = require('../assets/idols/idol_tos.webp');
const idolSehun = require('../assets/idols/idol_sehun.webp');
const idolItsuki = require('../assets/idols/idol_itsuki.webp');
const idolJisun = require('../assets/idols/idol_jisun.webp');
const idolYoojung = require('../assets/idols/idol_yoojung.webp');
const idolHyemi = require('../assets/idols/idol_hyemi.webp');
const idolFluke = require('../assets/idols/idol_fluke.webp');
const idolFanta = require('../assets/idols/idol_fanta.webp');
const idolPrae = require('../assets/idols/idol_prae.webp');
const idolYam = require('../assets/idols/idol_yam.webp'); 
const idolKoi = require('../assets/idols/idol_koi.webp');
const idolHyunjin = require('../assets/idols/idol_hyunjin.webp');
const idolSoyeon = require('../assets/idols/idol_soyeon.webp');
const idolTzuyu = require('../assets/idols/idol_tzuyu.webp');
const idolYeji = require('../assets/idols/idol_yeji.webp');
const idolJiwon = require('../assets/idols/idol_jiwon.webp');
const idolTaeil = require('../assets/idols/idol_taeil.webp');
const idolXuanyi = require('../assets/idols/idol_xuanyi.webp');
const idolNattawee = require('../assets/idols/idol_nattawee.webp');
const idolThida = require('../assets/idols/idol_thida.webp');
const idolMinhyuk = require('../assets/idols/idol_minhyuk.webp');

export const LOGO_IMAGES: Record<number, ReturnType<typeof require>> = {
  1:  require('../assets/logos/1.webp'),
  2:  require('../assets/logos/2.webp'),
  3:  require('../assets/logos/3.webp'),
  4:  require('../assets/logos/4.webp'),
  5:  require('../assets/logos/5.webp'),
  6:  require('../assets/logos/6.webp'),
  7:  require('../assets/logos/7.webp'),
  8:  require('../assets/logos/8.webp'),
  9:  require('../assets/logos/9.webp'),
  10: require('../assets/logos/10.webp'),
  11: require('../assets/logos/11.webp'),
  12: require('../assets/logos/12.webp'),
  13: require('../assets/logos/13.webp'),
  14: require('../assets/logos/14.webp'),
  15: require('../assets/logos/15.webp'),
  16: require('../assets/logos/16.webp'),
  17: require('../assets/logos/17.webp'),
  18: require('../assets/logos/18.webp'),
  19: require('../assets/logos/19.webp'),
  20: require('../assets/logos/20.webp'),
  21: require('../assets/logos/21.webp'),
  22: require('../assets/logos/22.webp'),
  23: require('../assets/logos/23.webp'),
  24: require('../assets/logos/24.webp'),
  25: require('../assets/logos/25.webp'),
  26: require('../assets/logos/26.webp'),
  27: require('../assets/logos/27.webp'),
  28: require('../assets/logos/28.webp'),
  29: require('../assets/logos/29.webp'),
  30: require('../assets/logos/30.webp'),
  31: require('../assets/logos/31.webp'),
  32: require('../assets/logos/32.webp'),
  33: require('../assets/logos/33.webp'),
  34: require('../assets/logos/34.webp'),
  35: require('../assets/logos/35.webp'),
  36: require('../assets/logos/36.webp'),
};

export const initialAgency: Agency = {
  name: 'NEW AGENCY',
  ceoName: '',
  money: 0,
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
  { artKey: 51, gender: 'female', availableNationality: 'Korean', image: idolSooyeon },
  { artKey: 52, gender: 'female', availableNationality: 'Korean, Japanese', image: idolDawon },
  { artKey: 53, gender: 'male', availableNationality: 'Japanese', image: idolHaruto },
  { artKey: 54, gender: 'female', availableNationality: 'Japanese', image: idolReina },
  { artKey: 55, gender: 'male', availableNationality: 'Korean', image: idolTaewoo },
  { artKey: 56, gender: 'female', availableNationality: 'Chinese', image: idolYuting },
  { artKey: 57, gender: 'male', availableNationality: 'Chinese, Korean', image: idolChenxi },
  { artKey: 58, gender: 'female', availableNationality: 'Thai', image: idolBusaba },
  { artKey: 59, gender: 'female', availableNationality: 'Thai, Vietnamese', image: idolManow },
  { artKey: 60, gender: 'male', availableNationality: 'Thai', image: idolChakri },
  { artKey: 61, gender: 'female', availableNationality: 'Vietnamese', image: idolCamtu },
  { artKey: 62, gender: 'male', availableNationality: 'Vietnamese', image: idolPhong },
  { artKey: 63, gender: 'male', availableNationality: 'Vietnamese, Chinese', image: idolThanhlong },
  { artKey: 64, gender: 'male', availableNationality: 'Korean', image: idolJunho },
  { artKey: 65, gender: 'male', availableNationality: 'Korean', image: idolWoojin },
  { artKey: 66, gender: 'female', availableNationality: 'Japanese', image: idolHana },
  { artKey: 67, gender: 'male', availableNationality: 'Japanese', image: idolSota },
  { artKey: 68, gender: 'female', availableNationality: 'Chinese', image: idolXiaoxia },
  { artKey: 69, gender: 'female', availableNationality: 'Vietnamese', image: idolLinh },
  { artKey: 70, gender: 'male', availableNationality: 'Chinese', image: idolWeiming },
  { artKey: 71, gender: 'female', availableNationality: 'All', image: idolMina },
  { artKey: 72, gender: 'male', availableNationality: 'All', image: idolRiku },
  { artKey: 73, gender: 'male', availableNationality: 'All', image: idolTao },
  { artKey: 74, gender: 'female', availableNationality: 'All', image: idolAria },
  { artKey: 75, gender: 'male', availableNationality: 'All', image: idolRenjun },
  { artKey: 76, gender: 'female', availableNationality: 'All', image: idolBee },
  { artKey: 77, gender: 'male', availableNationality: 'All', image: idolEm },
  { artKey: 78, gender: 'female', availableNationality: 'All', image: idolSaOn },
  { artKey: 79, gender: 'female', availableNationality: 'All', image: idolSeR },
  { artKey: 80, gender: 'male', availableNationality: 'All', image: idolTos },
  { artKey: 81, gender: 'male', availableNationality: 'Korean, Japanese', image: idolSehun },
  { artKey: 82, gender: 'male', availableNationality: 'Korean, Japanese', image: idolItsuki },
  { artKey: 83, gender: 'female', availableNationality: 'Korean, Japanese', image: idolJisun },
  { artKey: 84, gender: 'female', availableNationality: 'Korean, Japanese', image: idolYoojung },
  { artKey: 85, gender: 'female', availableNationality: 'Korean, Japanese', image: idolHyemi },
  { artKey: 86, gender: 'male', availableNationality: 'Thai, Vietnamese', image: idolFluke },
  { artKey: 87, gender: 'female', availableNationality: 'Thai, Vietnamese', image: idolFanta },
  { artKey: 88, gender: 'female', availableNationality: 'Thai, Vietnamese', image: idolPrae },
  { artKey: 89, gender: 'female', availableNationality: 'Thai, Vietnamese', image: idolKoi },
  { artKey: 90, gender: 'female', availableNationality: 'Thai, Vietnamese', image: idolYam },
  { artKey: 91, gender: 'female', availableNationality: 'Korean', image: idolHyunjin },
  { artKey: 92, gender: 'female', availableNationality: 'Korean', image: idolSoyeon },
  { artKey: 93, gender: 'female', availableNationality: 'Chinese, Korean', image: idolTzuyu },
  { artKey: 94, gender: 'female', availableNationality: 'Korean', image: idolYeji },
  { artKey: 95, gender: 'male', availableNationality: 'Korean', image: idolJiwon },
  { artKey: 96, gender: 'male', availableNationality: 'Korean', image: idolTaeil },
  { artKey: 97, gender: 'female', availableNationality: 'Chinese', image: idolXuanyi },
  { artKey: 98, gender: 'male', availableNationality: 'Thai', image: idolNattawee },
  { artKey: 99, gender: 'female', availableNationality: 'Thai', image: idolThida },
  { artKey: 100, gender: 'male', availableNationality: 'Korean', image: idolMinhyuk },
] as const;

export const trainingTypes = [
  { id: 'vocal', name: 'Vocal Coaching', effect: '+Vocal', cost: '−Energy' },
  { id: 'dance', name: 'Dance Practice', effect: '+Dance', cost: '−Energy' },
  { id: 'rap', name: 'Rap Training', effect: '+Rap', cost: '−Energy' },
  { id: 'visual', name: 'Visual Styling', effect: '+Visual', cost: '−Energy' },
  { id: 'acting', name: 'Acting Class', effect: '+Acting', cost: '−Energy' },
  { id: 'lang', name: 'Language Lab', effect: '+Charisma', cost: '−Energy' },
  { id: 'media', name: 'Media Training', effect: '+Variety', cost: '−Energy' },
  { id: 'stamina', name: 'Conditioning', effect: '+Stamina', cost: '−Energy' },
  { id: 'rest', name: 'Rest Day', effect: '+Morale', cost: '+Energy' },
];

export const BASE_REFRESH_COST = 10_000_000;

// ── Roster & group size limits ──────────────────────────────────────────────
export const MAX_ROSTER_SIZE = 30;
export const MIN_GROUP_MEMBERS = 2;
export const MAX_GROUP_MEMBERS = 6;

export const conceptOptions = ['Girl Crush', 'Fresh', 'Elegant', 'Hip-Hop', 'Ballad', 'Experimental', 'Global Pop'];
export const languageOptions = ['Korean', 'Japanese', 'Chinese', 'Vietnamese', 'English'];

export const scoutingNationalityProfiles = [
  {
    nationality: 'Korean',
    flag: '🇰🇷',
    languages: ['Korean', 'English'],
    familyNames: ['Kim', 'Park', 'Lee', 'Choi', 'Ahn', 'Kang', 'Jung', 'Yoon', 'Shin', 'Im', 'Han', 'Seo', 'Lim', 'Moon', 'Baek', 'Jeon', 'Kwon', 'Nam', 'Oh', 'Song', 'Hwang', 'Jang', 'Ryu', 'Yoo', 'Yang', 'Bae', 'Ji', 'Byeon', 'Cha', 'Woo', 'Pyo', 'Seok', 'No', 'Eom', 'Gi'],
    male: {
      stageNames: ['Jin', 'Min', 'Jae', 'Hyun', 'Taeyang', 'Seojun', 'Eunwoo', 'Donghyun', 'Taemin', 'Jihwan', 'Siwoo', 'Joonho', 'Hobin', 'Noel', 'Yul', 'Ian', 'Rion', 'Doha', 'Minseok', 'Taeho', 'Geon', 'Yong', 'Hwan', 'Rael', 'Kael', 'Jino', 'Lio', 'Hael', 'Daon', 'Jian', 'Jio', 'Suel', 'Taeul', 'Seungho', 'Woobin', 'Junyoung', 'Sangyeon', 'Hyunwoo', 'Jiwoo', 'Sehun'],
      givenNames: ['Seojun', 'Eunwoo', 'Taemin', 'Donghyun', 'Jihwan', 'Minho', 'Joon', 'Sungmin', 'Siwoo', 'Joonho', 'Hobin', 'Noel', 'Yul', 'Ian', 'Rion', 'Doha', 'Minseok', 'Taeho', 'Geon', 'Yong', 'Hwan', 'Seungho', 'Woobin', 'Junyoung', 'Sangyeon', 'Hyunwoo', 'Jiwoo', 'Sehun', 'Wonjun', 'Yoohan', 'Taewoo', 'Jaehan', 'Sungwoo', 'Yongmin', 'Taejun', 'Minjun', 'Kyungho', 'Jihan', 'Soohyun', 'Youngmin'],
    },
    female: {
      stageNames: ['Yuna', 'Sori', 'Nari', 'Haneul', 'Ara', 'Dami', 'Yeon', 'Rina', 'Hana', 'Subin', 'Nabi', 'Byul', 'Yerin', 'Haerin', 'Roa', 'Jiyu', 'Mira', 'Eden', 'Seina', 'Gyuri', 'Yoonji', 'Bora', 'Haruin', 'Rein', 'Daon', 'Woori', 'Ari', 'Seol', 'Yuha', 'Sael', 'Kiri', 'Jio', 'Soo', 'Hayoon', 'Sooyeon', 'Areum', 'Jooyeon', 'Hyemi', 'Yoojung', 'Jisun'],
      givenNames: ['Minji', 'Jisoo', 'Yujin', 'Hana', 'Jiwon', 'Sora', 'Naeun', 'Yerin', 'Chaeyoung', 'Subin', 'Yubin', 'Haerin', 'Wonhee', 'Dahye', 'Roa', 'Jiyu', 'Mira', 'Eden', 'Seina', 'Gyuri', 'Yoonji', 'Bora', 'Haruin', 'Hayoon', 'Sooyeon', 'Jisun', 'Taehee', 'Yumin', 'Seoyeon', 'Nayeon', 'Hyelim', 'Jooyeon', 'Areum', 'Hyemi', 'Yoojung', 'Jiyun', 'Soobin', 'Sarang', 'Harin', 'Dayeon'],
    },
  },
  {
    nationality: 'Japanese',
    flag: '🇯🇵',
    languages: ['Japanese', 'Korean'],
    familyNames: ['Sato', 'Tanaka', 'Suzuki', 'Nakamura', 'Kobayashi', 'Ito', 'Yamamoto', 'Watanabe', 'Kato', 'Yoshida', 'Shimizu', 'Abe', 'Saito', 'Mori', 'Fujita', 'Inoue', 'Nakajima', 'Okada', 'Hashimoto', 'Ishikawa', 'Nakano', 'Hayashi', 'Yamaguchi', 'Matsumoto', 'Ogawa', 'Ikeda', 'Nishimura', 'Fujii', 'Nagata', 'Kimura', 'Yamada', 'Takahashi', 'Miura', 'Aoki', 'Ueda'],
    male: {
      stageNames: ['Haru', 'Riku', 'Kou', 'Ren', 'Kaito', 'Takumi', 'Shion', 'Hayato', 'Daichi', 'Sena', 'Rui', 'Asa', 'Toma', 'Yori', 'Kei', 'Rio', 'Jun', 'Asahi', 'Hiro', 'Kai', 'Yuto', 'Rento', 'Soma', 'Shu', 'Ryo', 'Ao', 'Nagi', 'Leo', 'Arata', 'Hayate', 'Ryota', 'Sota', 'Hiroki', 'Daito', 'Kenji', 'Taiga', 'Kazuki', 'Itsuki', 'Haruto', 'Kento'],
      givenNames: ['Ren', 'Kaito', 'Takumi', 'Shion', 'Hayato', 'Daichi', 'Kou', 'Sora', 'Rui', 'Asahi', 'Toma', 'Yori', 'Kei', 'Rio', 'Jun', 'Aoi', 'Hiroto', 'Kai', 'Yuto', 'Rento', 'Soma', 'Shu', 'Ryo', 'Arata', 'Hayate', 'Ryota', 'Sota', 'Hiroki', 'Daito', 'Kenji', 'Taiga', 'Kazuki', 'Itsuki', 'Haruto', 'Kento', 'Ryusei', 'Sosuke', 'Issei', 'Tomoya', 'Shota'],
    },
    female: {
      stageNames: ['Rin', 'Mio', 'Yuki', 'Noa', 'Aoi', 'Hina', 'Rei', 'Nana', 'Mao', 'Kiyomi', 'Kira', 'Niko', 'Mina', 'Akari', 'Mika', 'Yui', 'Ami', 'Koko', 'Rena', 'Miku', 'Suzu', 'Yua', 'Aina', 'Emi', 'Mana', 'Saki', 'Kaho', 'Yume', 'Riko', 'Tsumugi', 'Nagi', 'Oto', 'Tsuki', 'Maki', 'Ao', 'Koharu', 'Hinano', 'Momoka', 'Hana', 'Natsu'],
      givenNames: ['Yuki', 'Haruka', 'Airi', 'Yuna', 'Mina', 'Rina', 'Akari', 'Miyu', 'Kiyomi', 'Kanon', 'Kanna', 'Noa', 'Mika', 'Yui', 'Ami', 'Koko', 'Rena', 'Miku', 'Suzu', 'Yua', 'Aina', 'Emi', 'Mana', 'Saki', 'Kaho', 'Yume', 'Riko', 'Tsumugi', 'Nagi', 'Oto', 'Tsuki', 'Maki', 'Ao', 'Koharu', 'Hinano', 'Momoka', 'Hana', 'Fuyu', 'Kotone', 'Nanami'],
    },
  },
  {
    nationality: 'Chinese',
    flag: '🇨🇳',
    languages: ['Chinese', 'Korean'],
    familyNames: ['Li', 'Wang', 'Zhang', 'Liu', 'Chen', 'Zhao', 'Huang', 'Wu', 'Xu', 'Sun', 'Zhou', 'Guo', 'Ma', 'He', 'Lin', 'Feng', 'Tang', 'Cao', 'Deng', 'Xie', 'Song', 'Yang', 'Lu', 'Jiang', 'Luo', 'Peng', 'Han', 'Hu', 'Zhu', 'Qian', 'Shi', 'Cui', 'Wei', 'Cheng', 'Bai'],
    male: {
      stageNames: ['Wei', 'Tao', 'Bo', 'Ming', 'Zefeng', 'Rui', 'An', 'Yun', 'Qi', 'Lin', 'Lei', 'Tian', 'Shu', 'Yu', 'Han', 'Jin', 'Fei', 'Qiu', 'Kai', 'Zhi', 'Rong', 'Xing', 'Hao', 'Chen', 'Feng', 'Si', 'Yi', 'Qing', 'Wu', 'Bei', 'Dong', 'Nan', 'Tianqi', 'Yunxi', 'Chenxi', 'Xuanming', 'Qinghe', 'Siyuan', 'Heyun', 'Wuming'],
      givenNames: ['Wei', 'Bo', 'Ming', 'Zefeng', 'Rui', 'An', 'Yun', 'Qi', 'Lei', 'Tian', 'Shu', 'Yu', 'Han', 'Jin', 'Fei', 'Qiu', 'Kai', 'Zhi', 'Rong', 'Xing', 'Hao', 'Chen', 'Feng', 'Si', 'Yi', 'Wu', 'Bei', 'Dong', 'Tianqi', 'Yunxi', 'Chenxi', 'Xuanming', 'Qinghe', 'Siyuan', 'Heyun', 'Wuming', 'Dongle', 'Haoran', 'Zirui', 'Junhao'],
    },
    female: {
      stageNames: ['Mei', 'Jia', 'Lan', 'Yue', 'Xin', 'Qian', 'Ting', 'Wanling', 'Meilin', 'Xinyi', 'Nuo', 'Yao', 'Yan', 'Shu', 'Xuan', 'Luo', 'Ping', 'Mo', 'Lian', 'Ying', 'Na', 'Xue', 'Qi', 'Ling', 'Bai', 'He', 'Hong', 'Hua', 'Zhen', 'Xi', 'Xiaoxiao', 'Ruoxi', 'Mingzhu', 'Ziyi', 'Yilin', 'Baihe', 'Fengling', 'Xueli', 'Beinuo', 'Nange'],
      givenNames: ['Mei', 'Xiao', 'Yun', 'Jia', 'Xin', 'Qian', 'Yue', 'Ting', 'Wanling', 'Meilin', 'Nuo', 'Yao', 'Xuan', 'Luo', 'Ping', 'Mo', 'Lian', 'Ying', 'Na', 'Xue', 'Qi', 'Xiaoxiao', 'Ruoxi', 'Mingzhu', 'Ziyi', 'Yilin', 'Baihe', 'Fengling', 'Xueli', 'Beinuo', 'Nange', 'Xiyu', 'Yunxi', 'Qinghe', 'Heyun', 'Lihua', 'Zixuan', 'Waner', 'Mengqi', 'Yuxin'],
    },
  },
  {
    nationality: 'Thai',
    flag: '🇹🇭',
    languages: ['Thai', 'Korean', 'English'],
    familyNames: ['Chai', 'Suk', 'Viroj', 'Anan', 'Prasert', 'Kitt', 'Somchai', 'Niran', 'Suda', 'Wirot', 'Preecha', 'Somsak', 'Thanin', 'Kamon', 'Rattan', 'Sirin', 'Chantara', 'Nattapong', 'Siriya', 'Phrom', 'Lertchai', 'Surin', 'Panya', 'Chaiya', 'Wicha', 'Nakhon', 'Kongkae', 'Montri', 'Rattana', 'Somchat', 'Boonma', 'Thongchai', 'Jirakul', 'Yodying', 'Saengsri'],
    male: {
      stageNames: ['Tae', 'Pond', 'Ton', 'Arun', 'Niran', 'Tonkla', 'Beam', 'Nam', 'Kitt', 'Anan', 'Korn', 'Aun', 'Bam', 'Wit', 'Win', 'Pete', 'Film', 'June', 'Nine', 'Sky', 'Jett', 'Krit', 'Mek', 'Petch', 'Nut', 'Bright', 'Great', 'Mark', 'Off', 'Krist', 'Gun', 'Pun', 'Bie', 'Ford', 'Fluke', 'Bank', 'Pop', 'Top', 'Put', 'New'],
      givenNames: ['Tae', 'Pond', 'Ton', 'Arun', 'Niran', 'Tonkla', 'Nam', 'Anan', 'Korn', 'Aun', 'Wit', 'Bam', 'Win', 'Pete', 'Film', 'June', 'Nine', 'Sky', 'Jett', 'Krit', 'Mek', 'Petch', 'Nut', 'Bright', 'Great', 'Mark', 'Off', 'Krist', 'Gun', 'Pun', 'Bie', 'Ford', 'Fluke', 'Bank', 'Pop', 'Top', 'Put', 'New', 'Khun', 'Nat'],
    },
    female: {
      stageNames: ['Ning', 'Ploy', 'Mew', 'Rain', 'Nara', 'Yara', 'Fah', 'Mint', 'Praew', 'Namfon', 'Prao', 'Lune', 'Nook', 'Dao', 'Rin', 'May', 'Bell', 'Pang', 'Mali', 'Fonn', 'Pimmy', 'Lita', 'Ging', 'Bow', 'Neng', 'Koy', 'Nit', 'Ink', 'Joy', 'Gift', 'Mild', 'Poppy', 'Liz', 'Lookpla', 'Fanta', 'Prae', 'Yam', 'Koi', 'Nuch', 'Plern'],
      givenNames: ['Nara', 'Pim', 'Dao', 'Tawan', 'Mew', 'Kwan', 'Yara', 'Fah', 'Mint', 'Praew', 'Namfon', 'Nook', 'Rin', 'May', 'Bell', 'Pang', 'Mali', 'Fonn', 'Pimmy', 'Lita', 'Ging', 'Bow', 'Neng', 'Koy', 'Nit', 'Ink', 'Joy', 'Gift', 'Mild', 'Poppy', 'Liz', 'Lookpla', 'Fanta', 'Prae', 'Yam', 'Koi', 'Nuch', 'Plern', 'Fon', 'Jeen'],
    },
  },
  {
    nationality: 'Vietnamese',
    flag: '🇻🇳',
    languages: ['Vietnamese', 'Korean', 'English'],
    familyNames: ['Nguyen', 'Tran', 'Le', 'Pham', 'Vo', 'Hoang', 'Bui', 'Dang', 'Do', 'Vu', 'Trinh', 'Phan', 'Ngo', 'Duong', 'Huynh', 'Ta', 'Mai', 'Ly', 'Luu', 'Ton', 'Cao', 'Lam', 'Tong', 'Bach', 'Ha', 'Dinh', 'Mac', 'Dam', 'To', 'Chu', 'Luong', 'Au', 'Lieu', 'Vinh', 'Truong'],
    male: {
      stageNames: ['Bao', 'Huy', 'Son', 'Nam', 'Duy', 'Kiet', 'Minh', 'Thanh', 'Hai', 'Phong', 'Hieu', 'An', 'Khanh', 'Long', 'Phuc', 'Lam', 'Quoc', 'Luan', 'Khoa', 'Nhat', 'Quang', 'Hao', 'Viet', 'Chi', 'Hung', 'Toan', 'Quan', 'Dong', 'Giang', 'Tung', 'Cuong', 'Duc', 'Bac', 'Canh', 'Thinh', 'Nghia', 'Tan', 'Trung', 'Hai', 'Phong'],
      givenNames: ['Bao', 'Huy', 'Son', 'Nam', 'Duy', 'Kiet', 'Minh', 'Thanh', 'Hieu', 'An', 'Khanh', 'Long', 'Phuc', 'Lam', 'Quoc', 'Luan', 'Khoa', 'Nhat', 'Quang', 'Hao', 'Viet', 'Hung', 'Toan', 'Quan', 'Dong', 'Tung', 'Cuong', 'Duc', 'Bac', 'Canh', 'Thinh', 'Nghia', 'Tan', 'Trung', 'Phong', 'Kien', 'Tien', 'Manh', 'Bach', 'Liem'],
    },
    female: {
      stageNames: ['Anh', 'Linh', 'Mai', 'Nhi', 'Trang', 'Quynh', 'Thao', 'Vy', 'Bich', 'Hai Anh', 'My', 'Tina', 'Lena', 'Vivi', 'Ngan', 'Bomi', 'NhiNhi', 'Annie', 'Truc', 'Yen', 'Hoai', 'Nhu', 'Moc', 'Chi', 'Thu', 'Lan', 'Huong', 'Cam', 'Tuyet', 'Xuan', 'Phuong', 'Hien', 'Dao', 'Kim', 'Thuy', 'Hoa', 'Ngoc', 'Loan', 'Nhung', 'Suong'],
      givenNames: ['Anh', 'Linh', 'Mai', 'Nhi', 'Trang', 'Quynh', 'Thao', 'Vy', 'Bich', 'Hai Anh', 'My', 'Tina', 'Ngan', 'Bomi', 'NhiNhi', 'Annie', 'Truc', 'Yen', 'Hoai', 'Nhu', 'Moc', 'Chi', 'Thu', 'Lan', 'Huong', 'Cam', 'Tuyet', 'Xuan', 'Phuong', 'Hien', 'Dao', 'Kim', 'Thuy', 'Hoa', 'Ngoc', 'Loan', 'Nhung', 'Suong', 'Diem', 'Chau'],
    },
  },
] as const;

export const scoutingSkillOptions = ['Vocal', 'Dance', 'Rap', 'Visual', 'Charisma'] as const;
