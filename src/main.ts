import './style.css';
import { mountSphere, type Tile } from './sphere';

const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;
const html = (s: string) => { const t = document.createElement('template'); t.innerHTML = s.trim(); return t.content.firstElementChild as HTMLElement; };

/* Плитки: первые экраны сайтов вперемешку с карточками-заглушками про заявки */
type Spec = { img: string; ratio: number } | { card: 'yellow' | 'white'; big?: string; small?: string; pills?: string[]; bars?: number[]; ratio: number };
const SEQ: Spec[] = [
  { img: 'works/w3.webp', ratio: 900 / 552 },
  { card: 'yellow', big: '92 заявки', small: '7 договоров за первый месяц', ratio: 1.3 },
  { img: 'works/case-lime.webp', ratio: 16 / 9 },
  { img: 'works/potok.webp', ratio: 1000 / 648 },
  { card: 'white', big: '1 240', small: 'запросов в месяц в вашем городе', bars: [30, 45, 40, 62, 58, 80, 100], ratio: 1.3 },
  { img: 'works/mac20.webp', ratio: 1200 / 744 },
  { img: 'works/w4.webp', ratio: 900 / 498 },
  { card: 'white', pills: ['Сайт', 'Квиз', 'Бот', 'CRM'], small: 'связка под нишу', ratio: 1 },
  { img: 'works/case-formo.webp', ratio: 16 / 9 },
  { img: 'works/w2.webp', ratio: 900 / 505 },
  { card: 'yellow', big: '2 дня', small: 'от брифа до первой заявки', ratio: 1 },
  { img: 'works/mac8.webp', ratio: 1200 / 744 },
  { img: 'works/w1.webp', ratio: 900 / 500 },
  { card: 'white', big: '9 из 10', small: 'запусков дают заявки в первый день', ratio: 1.3 },
  { img: 'works/site-v7.webp', ratio: 16 / 9 },
];

const small = matchMedia('(max-width: 768px)').matches, narrow = matchMedia('(max-width: 900px)').matches;
const TILE = small ? 92 : narrow ? 120 : 168;
const make = (i: number): Tile => {
  const s = SEQ[i % SEQ.length];
  if ('img' in s) return { el: html(`<img class="shot" src="${asset(s.img)}" alt="" loading="lazy" draggable="false">`), ratio: s.ratio };
  return { ratio: s.ratio, el: html(`
    <div class="card ${s.card === 'yellow' ? 'card--yellow' : ''}" style="font-size:${TILE * 0.075}px">
      ${s.pills ? `<div class="pills">${s.pills.map((x) => `<span>${x}</span>`).join('')}</div>` : ''}
      ${s.big ? `<b class="big">${s.big}</b>` : ''}
      ${s.bars ? `<div class="bars">${s.bars.map((h) => `<i style="height:${h}%"></i>`).join('')}</div>` : ''}
      ${s.small ? `<span class="small">${s.small}</span>` : ''}
    </div>`) };
};

mountSphere(document.getElementById('stage')!, {
  count: small ? 40 : narrow ? 44 : 56,
  radius: small ? 165 : narrow ? 300 : 470,
  tile: TILE,
  perspective: small ? 1200 : narrow ? 1800 : 2600,
  blur: matchMedia('(hover: hover) and (pointer: fine)').matches && !small,
  head: document.getElementById('head')!,
  make,
});
