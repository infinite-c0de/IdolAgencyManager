import type { Agency, City, Group, Trainee } from '../types';

const idolAnh = require('../assets/idols/idol_anh.webp');
const idolJoon = require('../assets/idols/idol_joon.webp');
const idolLena = require('../assets/idols/idol_lena.webp');
const idolMina = require('../assets/idols/idol_mina.webp');
const idolNarin = require('../assets/idols/idol_narin.webp');
const idolRiku = require('../assets/idols/idol_riku.webp');
const idolSora = require('../assets/idols/idol_sora.webp');
const idolTao = require('../assets/idols/idol_tao.webp');
const idolWei = require('../assets/idols/idol_wei.webp');
const idolYara = require('../assets/idols/idol_yara.webp');
const idolAria = require('../assets/idols/trainee_aria.webp');
const idolRenjun = require('../assets/idols/trainee_renjun.webp');
const idolMai = require('../assets/idols/trainee_mai.webp');
const idolTheo = require('../assets/idols/trainee_theo.webp');
const idolSky = require('../assets/idols/trainee_sky.webp');

export const idolGallery = [
  idolAnh,
  idolJoon,
  idolLena,
  idolMina,
  idolNarin,
  idolRiku,
  idolSora,
  idolTao,
  idolWei,
  idolYara,
  idolAria,
  idolRenjun,
  idolMai,
  idolTheo,
  idolSky,
];

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
    budget: '₩2.85B',
    startingBudget: 2_850_000_000,
    difficulty: 'Hard',
    fan: 1.2,
    cost: 1.3,
    revenue: 1.4,
    competition: 95,
    taxRate: 0.14,
    officeRentWeekly: 35_000_000,
    localReputationBoost: 6,
    domesticStreamingBonus: 0.2,
    operationalCostMultiplier: 1.18,
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    flag: '🇯🇵',
    desc: 'Strong idol market, stable fans, high promotion cost.',
    budget: '₩3.10B',
    startingBudget: 3_100_000_000,
    difficulty: 'Hard',
    fan: 1.1,
    cost: 1.25,
    revenue: 1.3,
    competition: 85,
    taxRate: 0.13,
    officeRentWeekly: 31_000_000,
    localReputationBoost: 4,
    domesticStreamingBonus: 0.15,
    operationalCostMultiplier: 1.12,
  },
  {
    id: 'beijing',
    name: 'Beijing',
    flag: '🇨🇳',
    desc: 'Huge market, high revenue, complex competition.',
    budget: '₩2.60B',
    startingBudget: 2_600_000_000,
    difficulty: 'Medium',
    fan: 1.3,
    cost: 1.1,
    revenue: 1.35,
    competition: 80,
    taxRate: 0.12,
    officeRentWeekly: 34_000_000,
    localReputationBoost: 3,
    domesticStreamingBonus: 0.12,
    operationalCostMultiplier: 1.0,
  },
  {
    id: 'hanoi',
    name: 'Hanoi',
    flag: '🇻🇳',
    desc: 'Emerging market, lower costs, strong growth potential.',
    budget: '₩1.80B',
    startingBudget: 1_800_000_000,
    difficulty: 'Easy',
    fan: 1.4,
    cost: 0.7,
    revenue: 0.9,
    competition: 40,
    taxRate: 0.08,
    officeRentWeekly: 17_000_000,
    localReputationBoost: 1,
    domesticStreamingBonus: 0.04,
    operationalCostMultiplier: 0.84,
  },
  {
    id: 'bangkok',
    name: 'Bangkok',
    flag: '🇹🇭',
    desc: 'Regional growth hub, balanced costs and fan expansion.',
    budget: '₩2.00B',
    startingBudget: 2_000_000_000,
    difficulty: 'Medium',
    fan: 1.25,
    cost: 0.85,
    revenue: 1.0,
    competition: 55,
    taxRate: 0.1,
    officeRentWeekly: 22_000_000,
    localReputationBoost: 2,
    domesticStreamingBonus: 0.07,
    operationalCostMultiplier: 0.9,
  },
];

const grads: string[][] = [
  ['rgba(217,70,239,0.4)', 'rgba(139,92,246,0.4)', 'rgba(34,211,238,0.4)'],
  ['rgba(34,211,238,0.4)', 'rgba(14,165,233,0.4)', 'rgba(139,92,246,0.4)'],
  ['rgba(251,113,133,0.4)', 'rgba(217,70,239,0.4)', 'rgba(99,102,241,0.4)'],
  ['rgba(52,211,153,0.4)', 'rgba(20,184,166,0.4)', 'rgba(6,182,212,0.4)'],
  ['rgba(252,211,77,0.4)', 'rgba(251,113,133,0.4)', 'rgba(217,70,239,0.4)'],
  ['rgba(129,140,248,0.4)', 'rgba(139,92,246,0.4)', 'rgba(236,72,153,0.4)'],
];

export const groups: Group[] = [];

export type ScheduleItem = {
  id: number;
  num: number;
  title: string;
  category: string;
  date: string;
  progress: number;
  accent: 'teal' | 'violet' | 'hot' | 'mint';
  badge: string;
};

export const schedule: ScheduleItem[] = [
  { id: 1, num: 1, title: 'MUSIC BANK', category: 'Performance', date: 'Oct 12, 18:00', progress: 75, accent: 'teal', badge: 'pinned' },
  { id: 2, num: 2, title: 'ALBUM RECORDING', category: 'Studio', date: 'Oct 13, 10:00', progress: 40, accent: 'violet', badge: 'ready' },
  { id: 3, num: 3, title: 'CF SHOOT', category: 'NEXUS Ads', date: 'Oct 15, 14:00', progress: 10, accent: 'hot', badge: 'alert' },
  { id: 4, num: 4, title: 'VOCAL LESSON', category: 'Studio', date: 'Oct 16, 09:00', progress: 0, accent: 'mint', badge: 'ready' },
];

export const revenueHistory = [
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

export const agencyRadar = [
  { skill: 'VOCAL', v: 0 },
  { skill: 'DANCE', v: 0 },
  { skill: 'RAP', v: 0 },
  { skill: 'VISUAL', v: 0 },
  { skill: 'CHARISMA', v: 0 },
];

export const rivals = [
  { id: 'nova', name: 'NOVA MEDIA', reputation: 92, groups: 5, share: 28, threat: 'High', recent: 'Debuted new boy group VANTA' },
  { id: 'prism', name: 'PRISM LABEL', reputation: 86, groups: 3, share: 19, threat: 'Medium', recent: "Top 10 chart entry with 'Mirror'" },
  { id: 'zenith', name: 'ZENITH ENT.', reputation: 78, groups: 4, share: 14, threat: 'Medium', recent: 'Signed rising trainee from Osaka' },
  { id: 'halo', name: 'HALO STUDIOS', reputation: 71, groups: 2, share: 9, threat: 'Low', recent: 'Scandal — reputation dropped 4 pts' },
];

export const transactions: Array<{
  id: number;
  label: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
}> = [];

export const promotions = [
  { id: 'ms', name: 'Music Show Performance', cost: 18_000_000, fans: '+12k', rep: '+3', fatigue: '+15', time: '1 day' },
  { id: 'sm', name: 'Social Media Campaign', cost: 6_500_000, fans: '+9k', rep: '+1', fatigue: '+3', time: '3 days' },
  { id: 'fm', name: 'Fan Meeting', cost: 22_000_000, fans: '+18k', rep: '+5', fatigue: '+12', time: '1 day' },
  { id: 'vs', name: 'Variety Show', cost: 14_000_000, fans: '+15k', rep: '+4', fatigue: '+10', time: '1 day' },
  { id: 'dc', name: 'Dance Challenge', cost: 3_500_000, fans: '+22k', rep: '+2', fatigue: '+5', time: '5 days' },
  { id: 'ri', name: 'Radio Interview', cost: 2_000_000, fans: '+4k', rep: '+1', fatigue: '+2', time: '2 hours' },
];

export const opportunities = [
  { region: 'Vietnam', text: 'Viral dance trend rising — boost dance challenges', tone: 'mint' as const },
  { region: 'Seoul', text: 'High competition this month — expect tougher charts', tone: 'hot' as const },
  { region: 'Japan', text: 'Market prefers elegant concept right now', tone: 'violet' as const },
  { region: 'Bangkok', text: 'Sponsorship interest increasing', tone: 'teal' as const },
];

export const markets = [
  { region: 'Korea', fans: '2.4M', revenue: '₩620M', trend: '+8%', rank: '#4' },
  { region: 'Japan', fans: '1.1M', revenue: '₩340M', trend: '+5%', rank: '#9' },
  { region: 'China', fans: '0.9M', revenue: '₩210M', trend: '+12%', rank: '#11' },
  { region: 'Vietnam', fans: '0.6M', revenue: '₩90M', trend: '+22%', rank: '#6' },
  { region: 'Thailand', fans: '0.5M', revenue: '₩80M', trend: '+14%', rank: '#7' },
  { region: 'Global', fans: '5.5M', revenue: '₩1.34B', trend: '+10%', rank: '#13' },
];

export const initialTrainees: Trainee[] = [
  { id: 'anh', name: 'Anh', age: 17, nationality: 'Vietnamese', flag: '🇻🇳', languages: ['Vietnamese', 'Korean'], potential: 86, skill: 'Visual', personality: 'Graceful, Ambitious', cost: 52_000_000, gradient: grads[0], image: idolAnh },
  { id: 'joon', name: 'Joon', age: 19, nationality: 'Korean', flag: '🇰🇷', languages: ['Korean', 'English'], potential: 90, skill: 'Vocal', personality: 'Focused, Charismatic', cost: 72_000_000, gradient: grads[1], image: idolJoon },
  { id: 'lena', name: 'Lena', age: 18, nationality: 'Korean', flag: '🇰🇷', languages: ['Korean', 'Japanese'], potential: 88, skill: 'Visual', personality: 'Elegant, Calm', cost: 68_000_000, gradient: grads[2], image: idolLena },
  { id: 'mina', name: 'Mina', age: 18, nationality: 'Korean', flag: '🇰🇷', languages: ['Korean', 'English'], potential: 85, skill: 'Dance', personality: 'Bright, Determined', cost: 58_000_000, gradient: grads[3], image: idolMina },
  { id: 'narin', name: 'Narin', age: 17, nationality: 'Korean', flag: '🇰🇷', languages: ['Korean', 'English', 'Japanese'], potential: 94, skill: 'Vocal', personality: 'Confident, Warm', cost: 92_000_000, gradient: grads[4], image: idolNarin },
  { id: 'riku', name: 'Riku', age: 19, nationality: 'Japanese', flag: '🇯🇵', languages: ['Japanese', 'Korean'], potential: 89, skill: 'Dance', personality: 'Playful, Precise', cost: 70_000_000, gradient: grads[5], image: idolRiku },
  { id: 'sora', name: 'Sora', age: 17, nationality: 'Korean', flag: '🇰🇷', languages: ['Korean'], potential: 82, skill: 'Charisma', personality: 'Quiet, Hardworking', cost: 45_000_000, gradient: grads[0], image: idolSora },
  { id: 'tao', name: 'Tao', age: 20, nationality: 'Chinese', flag: '🇨🇳', languages: ['Chinese', 'Korean', 'English'], potential: 87, skill: 'Rap', personality: 'Bold, Outgoing', cost: 62_000_000, gradient: grads[1], image: idolTao },
  { id: 'wei', name: 'Wei', age: 19, nationality: 'Chinese', flag: '🇨🇳', languages: ['Chinese', 'Korean'], potential: 91, skill: 'Rap', personality: 'Calm, Strategic', cost: 78_000_000, gradient: grads[2], image: idolWei },
  { id: 'yara', name: 'Yara', age: 17, nationality: 'Thai', flag: '🇹🇭', languages: ['Thai', 'Korean', 'English'], potential: 84, skill: 'Charisma', personality: 'Curious, Energetic', cost: 48_000_000, gradient: grads[3], image: idolYara },
  { id: 'aria', name: 'Aria', age: 17, nationality: 'Japanese', flag: '🇯🇵', languages: ['Japanese', 'Korean', 'English'], potential: 92, skill: 'Vocal', personality: 'Quiet, Driven', cost: 80_000_000, gradient: grads[0], image: idolAria },
  { id: 'renjun', name: 'Renjun', age: 18, nationality: 'Chinese', flag: '🇨🇳', languages: ['Chinese', 'Korean'], potential: 88, skill: 'Dance', personality: 'Sharp, Bold', cost: 65_000_000, gradient: grads[1], image: idolRenjun },
  { id: 'mai', name: 'Mai', age: 16, nationality: 'Vietnamese', flag: '🇻🇳', languages: ['Vietnamese', 'Korean', 'English'], potential: 84, skill: 'Visual', personality: 'Bright, Curious', cost: 42_000_000, gradient: grads[2], image: idolMai },
  { id: 'theo', name: 'Theo', age: 19, nationality: 'Thai', flag: '🇹🇭', languages: ['Thai', 'English'], potential: 80, skill: 'Rap', personality: 'Calm, Witty', cost: 36_000_000, gradient: grads[3], image: idolTheo },
  { id: 'sky', name: 'Sky', age: 17, nationality: 'Korean', flag: '🇰🇷', languages: ['Korean', 'Japanese'], potential: 94, skill: 'Charisma', personality: 'Magnetic, Warm', cost: 95_000_000, gradient: grads[4], image: idolSky },
];

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
