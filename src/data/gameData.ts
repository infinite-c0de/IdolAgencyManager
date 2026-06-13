import type { Agency, City, Group, PersonalityArchetype, PersonalityProfile, Trainee } from '../types';

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
const idolAria = require('../assets/idols/idol_aria.webp');
const idolRenjun = require('../assets/idols/idol_renjun.webp');
const idolMai = require('../assets/idols/idol_mai.webp');
const idolTheo = require('../assets/idols/idol_theo.webp');
const idolSky = require('../assets/idols/idol_sky.webp');

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

function profile(
  archetype: PersonalityArchetype,
  dominance: number,
  traits: PersonalityProfile['traits'],
): PersonalityProfile {
  return { archetype, dominance, traits };
}

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

export const initialTrainees: Trainee[] = [
  { id: 'anh', name: 'Anh', age: 17, nationality: 'Vietnamese', flag: '🇻🇳', languages: ['Vietnamese', 'Korean'], potential: 86, skill: 'Visual', personality: 'Graceful, Ambitious', personalityProfile: profile('Mediator', 60, { ambition: 78, ego: 42, teamwork: 72, responsibility: 70, discipline: 66, adaptability: 64 }), cost: 52_000_000, gradient: grads[0], image: idolAnh },
  { id: 'joon', name: 'Joon', age: 19, nationality: 'Korean', flag: '🇰🇷', languages: ['Korean', 'English'], potential: 90, skill: 'Vocal', personality: 'Focused, Charismatic', personalityProfile: profile('Strategist', 68, { ambition: 74, ego: 58, teamwork: 62, responsibility: 76, discipline: 82, adaptability: 60 }), cost: 72_000_000, gradient: grads[1], image: idolJoon },
  { id: 'lena', name: 'Lena', age: 18, nationality: 'Korean', flag: '🇰🇷', languages: ['Korean', 'Japanese'], potential: 88, skill: 'Visual', personality: 'Elegant, Calm', personalityProfile: profile('Anchor', 52, { ambition: 64, ego: 40, teamwork: 70, responsibility: 68, discipline: 66, adaptability: 62 }), cost: 68_000_000, gradient: grads[2], image: idolLena },
  { id: 'mina', name: 'Mina', age: 18, nationality: 'Korean', flag: '🇰🇷', languages: ['Korean', 'English'], potential: 85, skill: 'Dance', personality: 'Bright, Determined', personalityProfile: profile('Performer', 61, { ambition: 70, ego: 52, teamwork: 74, responsibility: 64, discipline: 70, adaptability: 76 }), cost: 58_000_000, gradient: grads[3], image: idolMina },
  { id: 'narin', name: 'Narin', age: 17, nationality: 'Korean', flag: '🇰🇷', languages: ['Korean', 'English', 'Japanese'], potential: 94, skill: 'Vocal', personality: 'Confident, Warm', personalityProfile: profile('Center', 78, { ambition: 82, ego: 72, teamwork: 68, responsibility: 66, discipline: 70, adaptability: 65 }), cost: 92_000_000, gradient: grads[4], image: idolNarin },
  { id: 'riku', name: 'Riku', age: 19, nationality: 'Japanese', flag: '🇯🇵', languages: ['Japanese', 'Korean'], potential: 89, skill: 'Dance', personality: 'Playful, Precise', personalityProfile: profile('Performer', 64, { ambition: 72, ego: 56, teamwork: 72, responsibility: 62, discipline: 78, adaptability: 74 }), cost: 70_000_000, gradient: grads[5], image: idolRiku },
  { id: 'sora', name: 'Sora', age: 17, nationality: 'Korean', flag: '🇰🇷', languages: ['Korean'], potential: 82, skill: 'Charisma', personality: 'Quiet, Hardworking', personalityProfile: profile('Anchor', 45, { ambition: 60, ego: 35, teamwork: 70, responsibility: 78, discipline: 80, adaptability: 58 }), cost: 45_000_000, gradient: grads[0], image: idolSora },
  { id: 'tao', name: 'Tao', age: 20, nationality: 'Chinese', flag: '🇨🇳', languages: ['Chinese', 'Korean', 'English'], potential: 87, skill: 'Rap', personality: 'Bold, Outgoing', personalityProfile: profile('Center', 80, { ambition: 78, ego: 74, teamwork: 60, responsibility: 58, discipline: 62, adaptability: 72 }), cost: 62_000_000, gradient: grads[1], image: idolTao },
  { id: 'wei', name: 'Wei', age: 19, nationality: 'Chinese', flag: '🇨🇳', languages: ['Chinese', 'Korean'], potential: 91, skill: 'Rap', personality: 'Calm, Strategic', personalityProfile: profile('Strategist', 58, { ambition: 72, ego: 44, teamwork: 66, responsibility: 74, discipline: 82, adaptability: 60 }), cost: 78_000_000, gradient: grads[2], image: idolWei },
  { id: 'yara', name: 'Yara', age: 17, nationality: 'Thai', flag: '🇹🇭', languages: ['Thai', 'Korean', 'English'], potential: 84, skill: 'Charisma', personality: 'Curious, Energetic', personalityProfile: profile('Performer', 63, { ambition: 68, ego: 52, teamwork: 76, responsibility: 60, discipline: 58, adaptability: 82 }), cost: 48_000_000, gradient: grads[3], image: idolYara },
  { id: 'aria', name: 'Aria', age: 17, nationality: 'Japanese', flag: '🇯🇵', languages: ['Japanese', 'Korean', 'English'], potential: 92, skill: 'Vocal', personality: 'Quiet, Driven', personalityProfile: profile('Strategist', 66, { ambition: 84, ego: 48, teamwork: 62, responsibility: 74, discipline: 86, adaptability: 55 }), cost: 80_000_000, gradient: grads[0], image: idolAria },
  { id: 'renjun', name: 'Renjun', age: 18, nationality: 'Chinese', flag: '🇨🇳', languages: ['Chinese', 'Korean'], potential: 88, skill: 'Dance', personality: 'Sharp, Bold', personalityProfile: profile('Center', 77, { ambition: 80, ego: 70, teamwork: 54, responsibility: 62, discipline: 76, adaptability: 60 }), cost: 65_000_000, gradient: grads[1], image: idolRenjun },
  { id: 'mai', name: 'Mai', age: 16, nationality: 'Vietnamese', flag: '🇻🇳', languages: ['Vietnamese', 'Korean', 'English'], potential: 84, skill: 'Visual', personality: 'Bright, Curious', personalityProfile: profile('Mediator', 55, { ambition: 66, ego: 44, teamwork: 78, responsibility: 64, discipline: 56, adaptability: 84 }), cost: 42_000_000, gradient: grads[2], image: idolMai },
  { id: 'theo', name: 'Theo', age: 19, nationality: 'Thai', flag: '🇹🇭', languages: ['Thai', 'English'], potential: 80, skill: 'Rap', personality: 'Calm, Witty', personalityProfile: profile('Strategist', 57, { ambition: 62, ego: 42, teamwork: 70, responsibility: 66, discipline: 72, adaptability: 76 }), cost: 36_000_000, gradient: grads[3], image: idolTheo },
  { id: 'sky', name: 'Sky', age: 17, nationality: 'Korean', flag: '🇰🇷', languages: ['Korean', 'Japanese'], potential: 94, skill: 'Charisma', personality: 'Magnetic, Warm', personalityProfile: profile('Center', 82, { ambition: 84, ego: 76, teamwork: 68, responsibility: 70, discipline: 64, adaptability: 70 }), cost: 95_000_000, gradient: grads[4], image: idolSky },
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
