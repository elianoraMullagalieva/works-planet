import './style.css';
import { mountSphere, type Tile } from './sphere';

const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;
const html = (s: string) => { const t = document.createElement('template'); t.innerHTML = s.trim(); return t.content.firstElementChild as HTMLElement; };

/* Плитки: первые экраны сайтов вперемешку с карточками-заглушками про заявки */
type Spec = { img: string; ratio: number } | { card: 'red' | 'white' | 'dark'; big?: string; small?: string; pills?: string[]; bars?: number[]; ratio: number };
const SEQ: Spec[] = [
  { img: 'works/w3.webp', ratio: 900 / 552 },
  { card: 'red', big: '+38%', small: 'визитов после редизайна', ratio: 1.3 },
  { img: 'works/c1.webp', ratio: 16 / 9 },
  { img: 'works/case-lime.webp', ratio: 16 / 9 },
  { card: 'white', big: '14 дней', small: 'от брифа до запуска', ratio: 1.3 },
  { img: 'works/mac20.webp', ratio: 1200 / 744 },
  { img: 'works/c4.webp', ratio: 16 / 9 },
  { card: 'dark', big: '4,8%', small: 'конверсия в заявку', ratio: 1 },
  { img: 'works/case-formo.webp', ratio: 16 / 9 },
  { img: 'works/w2.webp', ratio: 900 / 505 },
  { card: 'white', pills: ['Лендинг', 'Квиз', 'Кабинет'], small: 'три типа сайтов', ratio: 1 },
  { img: 'works/c5.webp', ratio: 16 / 9 },
  { img: 'works/mac8.webp', ratio: 1200 / 744 },
  { card: 'red', big: '24', small: 'заявки за первую неделю', ratio: 1.3 },
  { img: 'works/w1.webp', ratio: 900 / 500 },
  { img: 'works/c6.webp', ratio: 16 / 9 },
];


const small = matchMedia('(max-width: 768px)').matches, narrow = matchMedia('(max-width: 900px)').matches;
const TILE = small ? 92 : narrow ? 120 : 168;
const make = (i: number): Tile => {
  const s = SEQ[i % SEQ.length];
  if ('img' in s) return { el: html(`<img class="shot" src="${asset(s.img)}" alt="" loading="lazy" draggable="false">`), ratio: s.ratio };
  return { ratio: s.ratio, el: html(`
    <div class="card card--${s.card}" style="font-size:${TILE * 0.075}px">
      ${s.pills ? `<div class="pills">${s.pills.map((x) => `<span>${x}</span>`).join('')}</div>` : ''}
      ${s.big ? `<b class="big">${s.big}</b>` : ''}
      ${s.bars ? `<div class="bars">${s.bars.map((h) => `<i style="height:${h}%"></i>`).join('')}</div>` : ''}
      ${s.small ? `<span class="small">${s.small}</span>` : ''}
    </div>`) };
};

mountSphere(document.getElementById('stage')!, {
  count: small ? 36 : narrow ? 40 : 46,
  radius: small ? 165 : narrow ? 300 : 470,
  tile: TILE,
  perspective: small ? 1200 : narrow ? 1800 : 2600,
  blur: false, // размытие плиток дорого на каждом кадре, вместо него только прозрачность
  head: document.getElementById('head')!,
  make,
});
