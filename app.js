/* Альфа-Бизнес для селлеров: данные из материалов этапов 1–4, логика интерактива */
(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const $ = (s, r = document) => r.querySelector(s);
  const NS = 'http://www.w3.org/2000/svg';
  const svg = (tag, attrs = {}, parent) => {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  };
  const nf = new Intl.NumberFormat('ru-RU');
  const rub = v => nf.format(Math.round(v)) + ' ₽';
  const short = v => v >= 1e6 ? (Math.round(v / 1e5) / 10).toString().replace('.', ',') + ' млн ₽' : Math.round(v / 1e3) + ' тыс. ₽';
  const plural = (n, a, b, c) => { const m = n % 10, h = n % 100; return (m === 1 && h !== 11) ? a : (m >= 2 && m <= 4 && (h < 10 || h >= 20)) ? b : c; };
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const swap = el => { el.classList.remove('swap'); void el.offsetWidth; el.classList.add('swap'); };

  /* ---------- счётчики в шапке ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const runCounter = el => {
    const to = parseFloat(el.dataset.count), dec = +(el.dataset.decimals || 0);
    const pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    if (reduce) return;
    const t0 = performance.now(), dur = 1200;
    const tick = now => {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + (to * e).toFixed(dec).replace('.', ',') + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  counters.forEach(runCounter);

  /* ---------- 1. кольца конкуренции ---------- */
  const RINGS = [
    { t: 'Прямая', who: 'Т-Бизнес, Точка, СберБизнес, Модульбанк, ВТБ', why: 'Тот же клиент и тот же набор: счёт, эквайринг, кредит' },
    { t: 'Косвенная', who: 'Озон Банк', why: 'Ядро его бизнес-клиентов – селлеры, кредиты он развивает именно для них' },
    { t: 'Товарная', who: 'Бухгалтерские сервисы со счётом, платёжные агенты для ВЭД', why: 'Закрывают одну часть задачи без полноценного банка' },
    { t: 'Неявная', who: 'Остаться в текущем банке, личный счёт, приложение «Мой налог»', why: 'Главный барьер из интервью: «зачем менять то, что работает». Так отвечали все три респондента', hot: true },
    { t: 'По JTBD', who: 'Кредит от самой площадки, предоплата поставщику из своих денег', why: 'Тоже дают деньги на закупку, хотя к банкам отношения не имеют' }
  ];
  const ringsSvg = $('#ringsSvg'), ringTabs = $('#ringTabs'), ringCard = $('#ringCard');
  const cx = 180, cy = 180, r0 = 46, step = 26.8;
  const annulus = (ri, ro) => `M ${cx + ro} ${cy} A ${ro} ${ro} 0 1 0 ${cx - ro} ${cy} A ${ro} ${ro} 0 1 0 ${cx + ro} ${cy} Z M ${cx + ri} ${cy} A ${ri} ${ri} 0 1 1 ${cx - ri} ${cy} A ${ri} ${ri} 0 1 1 ${cx + ri} ${cy} Z`;
  const ringEls = [];
  const baseOp = [.5, .38, .28, .2, .12];
  for (let i = RINGS.length - 1; i >= 0; i--) {
    const ri = r0 + i * step, ro = r0 + (i + 1) * step;
    const g = svg('g', { class: 'ring', tabindex: '-1' }, ringsSvg);
    svg('path', { d: annulus(ri, ro), 'fill-rule': 'evenodd', class: 'ring__band', 'fill-opacity': baseOp[i] }, g);
    svg('circle', { cx, cy, r: ro - 1.5, class: 'ring__outline' }, g);
    svg('circle', { cx, cy, r: ri + 1.5, class: 'ring__outline' }, g);
    const a = -58 * Math.PI / 180, rm = (ri + ro) / 2;
    const tx = svg('text', { x: cx + rm * Math.cos(a), y: cy + rm * Math.sin(a) + 5, 'text-anchor': 'middle', class: 'ring__num' }, g);
    tx.textContent = i + 1;
    g.addEventListener('click', () => setRing(i));
    ringEls[i] = g;
  }
  svg('circle', { cx, cy, r: r0, fill: '#fff' }, ringsSvg);
  const c1 = svg('text', { x: cx, y: cy - 4, 'text-anchor': 'middle', fill: '#EF3124', 'font-weight': 700, 'font-size': 13 }, ringsSvg); c1.textContent = 'Деньги';
  const c2 = svg('text', { x: cx, y: cy + 12, 'text-anchor': 'middle', fill: '#EF3124', 'font-weight': 700, 'font-size': 13 }, ringsSvg); c2.textContent = 'на закупку';
  RINGS.forEach((r, i) => {
    const b = document.createElement('button');
    b.setAttribute('role', 'tab'); b.textContent = (i + 1) + ' ' + r.t;
    b.addEventListener('click', () => setRing(i));
    ringTabs.appendChild(b);
  });
  function setRing(i) {
    ringEls.forEach((g, j) => {
      g.classList.toggle('is-on', i === j);
      g.querySelector('.ring__band').setAttribute('fill-opacity', i === j ? .85 : baseOp[j]);
      g.querySelector('.ring__num').setAttribute('fill', i === j ? '#EF3124' : '#fff');
    });
    [...ringTabs.children].forEach((b, j) => b.setAttribute('aria-selected', i === j));
    const r = RINGS[i];
    ringCard.innerHTML = `${r.hot ? '<span class="tag">главный барьер</span>' : ''}<h3>${i + 1}. ${r.t}</h3><p class="who">${r.who}</p><p class="why">${r.why}</p>`;
    swap(ringCard);
  }
  setRing(3);

  /* стратегическая группа */
  const CRIT = ['ИП и малый бизнес', 'Всё онлайн', 'Для селлеров', 'Счёт, эквайринг, кредит', 'Дешёвый старт'];
  const GROUP = [['Т-Бизнес', '11112'], ['Точка', '11112'], ['СберБизнес', '11112'], ['Модульбанк', '11211'], ['ВТБ', '11211'], ['Озон Банк', '11122']];
  const matrix = $('#matrix'), mNote = $('#matrixNote');
  matrix.insertAdjacentHTML('beforeend', '<span></span>' + CRIT.map(c => `<span class="matrix__h">${c}</span>`).join(''));
  const rowsEls = GROUP.map(([b, m]) => {
    const row = document.createElement('div'); row.className = 'matrix__row';
    row.innerHTML = `<button class="matrix__bank">${b}</button>` + [...m].map(v => `<span class="matrix__cell"><i class="dot${v === '2' ? ' dot--half' : ''}" aria-label="${v === '1' ? 'есть' : 'частично'}"></i></span>`).join('');
    matrix.appendChild(row);
    row.querySelector('button').addEventListener('click', () => pickBank(b, m, row));
    return row;
  });
  function pickBank(b, m, row) {
    rowsEls.forEach(r => { r.classList.toggle('is-on', r === row); r.classList.toggle('is-dim', r !== row); });
    const full = [...m].filter(v => v === '1').length;
    const half = [...m].map((v, i) => v === '2' ? CRIT[i].toLowerCase() : null).filter(Boolean);
    mNote.textContent = `${b}: полностью ${full} ${plural(full, 'признак', 'признака', 'признаков')} из 5, частично ${half.join(' и ')}. Все пять полностью не закрывает ни один банк.`;
    swap(mNote);
  }
  mNote.textContent = 'Все пять признаков полностью не закрывает ни один банк из группы.';

  /* ---------- 2. калькулятор стартовых тарифов ---------- */
  const inFlow = $('#inFlow'), pays = $('#pays'), tCard = $('#tCard'), barsEl = $('#bars'), verdict = $('#alfaVerdict');
  const TARIFFS = [
    { id: 'alfa', name: 'Альфа, «Ноль за обслуживание»', calc: (f, n) => (f < 1e6 ? 0 : 990) + Math.max(0, n - 3) * 149, why: f => (f < 1e6 ? 'абонплата 0 ₽ до 1 млн поступлений' : 'от 1 млн поступлений абонплата 990 ₽') + ', 3 платежа бесплатно, дальше 149 ₽' },
    { id: 't', name: 'Т-Банк, «Простой»', calc: (f, n, c) => (c ? 0 : 490) + n * 49, why: (f, c) => (c ? 'абонплата 0 ₽ за траты по карте' : 'абонплата 490 ₽') + ', 49 ₽ за платёж в другой банк' },
    { id: 'tochka', name: 'Точка, «Начало»', calc: () => 950, why: () => 'абонплата 950 ₽, платежи бесплатно' },
    { id: 'modul', name: 'Модульбанк, «Стартовый»', calc: () => 0, why: () => '0 ₽ навсегда, платежи бесплатно' },
    { id: 'ozon', name: 'Озон Банк, «Основной»', calc: (f, n) => 490 + Math.max(0, n - 10) * 49, why: () => 'абонплата 490 ₽, 10 платежей бесплатно, дальше 49 ₽' }
  ];
  const barEls = {};
  TARIFFS.forEach(t => {
    const d = document.createElement('div');
    d.className = 'bar' + (t.id === 'alfa' ? ' bar--alfa' : '');
    d.innerHTML = `<div class="bar__top"><span class="bar__name">${t.name}</span><span class="bar__val"></span></div><div class="bar__track"><div class="bar__fill"></div></div><span class="bar__why"></span>`;
    barsEl.appendChild(d); barEls[t.id] = d;
  });
  function calcPrice() {
    const f = +inFlow.value, n = +pays.value, c = tCard.checked;
    $('#inOut').textContent = short(f);
    $('#payOut').textContent = n;
    const res = TARIFFS.map(t => ({ t, v: t.calc(f, n, c) })).sort((a, b) => a.v - b.v);
    const max = Math.max(1000, ...res.map(r => r.v));
    res.forEach((r, i) => {
      const el = barEls[r.t.id];
      el.style.order = i;
      el.querySelector('.bar__val').textContent = rub(r.v);
      el.querySelector('.bar__fill').style.transform = `scaleX(${Math.max(.015, r.v / max)})`;
      el.querySelector('.bar__why').textContent = r.t.why(f, c);
    });
    const place = res.findIndex(r => r.t.id === 'alfa') + 1, alfa = res[place - 1].v;
    const extra = Math.max(0, n - 3) * 149;
    let msg = `<h3>Альфа: ${rub(alfa)} в месяц, ${place}-е место из 5</h3>`;
    msg += `<p class="why">${f >= 1e6 ? 'Поступления перевалили за 1 млн, поэтому включилась абонплата 990 ₽. ' : 'Пока поступления меньше 1 млн, абонплата нулевая. '}${extra ? `Платежи сверх трёх бесплатных добавляют ${rub(extra)}. ` : ''}По цене Альфа не выигрывает, поэтому отстраивается сервисом и путём роста.</p>`;
    verdict.innerHTML = msg;
  }
  [inFlow, pays, tCard].forEach(el => el.addEventListener('input', calcPrice));
  calcPrice();

  /* ---------- кассовый разрыв ---------- */
  const buy = $('#buy'), own = $('#own'), days = $('#days'), limit = $('#limit'), gapSvg = $('#gapSvg');
  const W = 340, H = 200, X0 = 8, X1 = 332, Y0 = 18, Y1 = 170;
  const gArea = svg('path', { class: 'garea' }, gapSvg);
  const gLim = svg('path', { class: 'glimit', opacity: 0 }, gapSvg);
  const zero = svg('line', { x1: X0, x2: X1, stroke: '#fff', 'stroke-opacity': .5, 'stroke-dasharray': '4 5' }, gapSvg);
  const gLine = svg('path', { class: 'gline' }, gapSvg);
  const zLbl = svg('text', { x: X1, 'text-anchor': 'end', fill: '#fff', 'fill-opacity': .8, 'font-size': 11 }, gapSvg); zLbl.textContent = '0 ₽';
  const d0 = svg('text', { fill: '#fff', 'font-size': 11, 'font-weight': 700 }, gapSvg);
  const dD = svg('text', { fill: '#fff', 'font-size': 11, 'font-weight': 700, 'text-anchor': 'end' }, gapSvg);
  const mk0 = svg('line', { stroke: '#fff', 'stroke-opacity': .5 }, gapSvg), mkD = svg('line', { stroke: '#fff', 'stroke-opacity': .5 }, gapSvg);
  function calcGap() {
    const B = +buy.value, O = +own.value, D = +days.value, lim = limit.checked;
    $('#buyOut').textContent = short(B); $('#ownOut').textContent = short(O); $('#daysOut').textContent = D + ' ' + plural(D, 'день', 'дня', 'дней');
    const gap = Math.max(0, B - O), T0 = -6, T1 = D + 10;
    const lo = Math.min(O - B, 0), hi = Math.max(O, 1);
    const sx = t => X0 + (t - T0) / (T1 - T0) * (X1 - X0);
    const sy = v => Y0 + (hi - v) / (hi - lo || 1) * (Y1 - Y0);
    const yz = sy(0), after = O - B;
    const pts = [[T0, O], [0, O], [0, after], [D, after], [D, O], [T1, O]];
    const shown = lim ? pts.map(([t, v]) => [t, (t >= 0 && t <= D && v < 0) ? 0 : v]) : pts;
    gLine.setAttribute('d', 'M ' + shown.map(([t, v]) => `${sx(t).toFixed(1)} ${sy(v).toFixed(1)}`).join(' L '));
    const neg = Math.min(after, 0);
    gArea.setAttribute('d', `M ${sx(0)} ${yz} L ${sx(0)} ${sy(neg)} L ${sx(D)} ${sy(neg)} L ${sx(D)} ${yz} Z`);
    gArea.setAttribute('opacity', lim ? 0 : 1);
    gLim.setAttribute('d', `M ${sx(0)} ${yz} L ${sx(0)} ${sy(neg)} L ${sx(D)} ${sy(neg)} L ${sx(D)} ${yz} Z`);
    gLim.setAttribute('opacity', lim && gap ? .25 : 0);
    zero.setAttribute('y1', yz); zero.setAttribute('y2', yz); zLbl.setAttribute('y', yz - 5);
    mk0.setAttribute('x1', sx(0)); mk0.setAttribute('x2', sx(0)); mk0.setAttribute('y1', Y0 - 6); mk0.setAttribute('y2', Y1 + 6);
    mkD.setAttribute('x1', sx(D)); mkD.setAttribute('x2', sx(D)); mkD.setAttribute('y1', Y0 - 6); mkD.setAttribute('y2', Y1 + 6);
    d0.textContent = 'закупка'; d0.setAttribute('x', sx(0) + 4); d0.setAttribute('y', Y1 + 22);
    dD.textContent = 'выплата'; dD.setAttribute('x', sx(D) - 4); dD.setAttribute('y', Y1 + 22);
    $('#gapSum').textContent = lim && gap ? rub(0) : rub(gap);
    $('#gapDays').textContent = gap && !lim ? D + ' ' + plural(D, 'день', 'дня', 'дней') : '0 дней';
    $('#gapHint').textContent = !gap
      ? 'Своих денег хватает. Сдвиньте закупку вправо: перед сезоном она растёт быстрее, чем деньги на счёте.'
      : lim
        ? `Лимит закрывает ${rub(gap)} ещё до открытия счёта и гасится из выплаты площадки на ${D}-й день. Так работает обезболивающее из канвы.`
        : `Без лимита селлер ${D} ${plural(D, 'день', 'дня', 'дней')} живёт в минусе: урезает закупку или ищет деньги на стороне.`;
  }
  [buy, own, days, limit].forEach(el => el.addEventListener('input', calcGap));
  calcGap();

  /* ---------- CJM ---------- */
  const STAGES = [
    { n: 'Осознание потребности', e: 2, em: 'тревога', act: 'Готовится к сезону и видит кассовый разрыв: выплата площадки позже оплаты поставщику', bar: 'Не связывает проблему с банком. Инерция: «текущий пока работает»', sol: 'Калькулятор «сколько денег нужно на сезон». Предложение до пика', kpi: 'Охват, запуски калькулятора' },
    { n: 'Поиск информации', e: 3, em: 'интерес и недоверие', act: 'Спрашивает в чатах селлеров, ищет «кредит для селлеров», читает отзывы', bar: 'Рекламный шум. Условия спрятаны в тарифах', sol: 'Страница «Альфа для селлеров»: все комиссии в одной таблице', kpi: 'CTR, заявки из рекомендаций', p: 'Селлерские чаты: амбассадоры и рефералы' },
    { n: 'Сравнение и решение', e: 2, em: 'сомнение', pain: 1, act: 'Сравнивает 2–3 банка в своей таблице, прикидывает цену переезда', bar: 'Инерция. Реквизиты зашиты в кабинеты, договоры, автоплатежи', sol: 'Второй счёт под закупку без переезда. Лимит до открытия счёта', kpi: 'Конверсия в заявку' },
    { n: 'Открытие счёта', e: 4, em: 'облегчение', act: 'Подаёт заявку в приложении, получает реквизиты и бизнес-карту', bar: 'Лишние документы. Ожидание проверки без статуса', sol: 'Статус заявки онлайн. Онбординг-чек-лист для селлера', kpi: 'Время открытия, брошенные заявки' },
    { n: 'Подключение и переезд', e: 1, em: 'стресс', pain: 1, act: 'Меняет реквизиты в кабинетах WB и Ozon, переносит платежи, ждёт первую выплату', bar: 'Ручная смена реквизитов. Страх потерять выплату', sol: 'Инструкция по каждой площадке. Менеджер на время переезда', kpi: 'Доля клиентов с первой выплатой', p: 'WB, Ozon, Яндекс Маркет: данные о выплатах, и выплата при переезде не теряется' },
    { n: 'Первый опыт', e: 2, em: 'разочарование', pain: 1, act: 'Получает выплаты, платит картой, сверяет аналитику со своей таблицей', bar: 'Аналитика «считает неверно». Реклама в интерфейсе', sol: 'Аналитика реальной маржи. Режим «тишина» без рекламы', kpi: 'Активность в аналитике, CSAT', p: 'Независимая аналитика: реальная маржа в одном окне' },
    { n: 'Кредит под оборот', e: 4, em: 'уверенность', act: 'Видит лимит перед сезоном, берёт кредит, гасит из выплат площадки', bar: 'Непрозрачная стоимость. Лимит меньше нужного', sol: 'Лимит по оборотам на счёте. Погашение из выплат', kpi: 'Доля клиентов с кредитом', p: 'WB, Ozon, Яндекс Маркет: лимит по реальным оборотам' },
    { n: 'Лояльность или уход', e: 4, em: 'удовлетворение', act: 'Делает банк основным или запасным, советует или ругает его в чатах', bar: 'Лояльности почти нет. Один сбой поддержки – и клиент уходит', sol: 'Реферальная программа. Сопровождение роста: ООО, ВЭД', kpi: 'Удержание, NPS', p: 'Селлерские чаты: рефералы' }
  ];
  const cjm = $('#cjmSvg'), stageCard = $('#stageCard'), stageTitle = $('#stageTitle');
  const px = i => 22 + i * 42.3, py = v => 140 - v * 24;
  [1, 2, 3, 4, 5].forEach(v => svg('line', { x1: 10, x2: 330, y1: py(v), y2: py(v), stroke: '#E3DDD9', 'stroke-width': 1 }, cjm));
  const ptsStr = STAGES.map((s, i) => `${px(i)} ${py(s.e)}`).join(' L ');
  svg('path', { d: `M ${px(0)} 140 L ${ptsStr} L ${px(7)} 140 Z`, fill: '#EF3124', 'fill-opacity': .08 }, cjm);
  const curve = svg('path', { d: 'M ' + ptsStr, fill: 'none', stroke: '#EF3124', 'stroke-width': 3, 'stroke-linejoin': 'round' }, cjm);
  if (!reduce) { const L = curve.getTotalLength(); curve.style.strokeDasharray = L; curve.style.strokeDashoffset = L; curve.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(.2,.7,.2,1)'; }
  const guide = svg('line', { y1: 8, y2: 140, stroke: '#1C1C1C', 'stroke-opacity': .25, 'stroke-dasharray': '3 4' }, cjm);
  const ptEls = STAGES.map((s, i) => {
    const g = svg('g', { class: 'cjm__pt' }, cjm);
    svg('circle', { cx: px(i), cy: py(s.e), r: 18, fill: 'transparent' }, g);
    svg('circle', { cx: px(i), cy: py(s.e), r: s.pain ? 7 : 5, fill: s.pain ? '#EF3124' : '#fff', stroke: s.pain ? '#fff' : '#EF3124', 'stroke-width': 2.5, class: 'dotc' }, g);
    const t = svg('text', { x: px(i), y: 160, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#1C1C1C' }, g); t.textContent = i + 1;
    g.addEventListener('click', () => setStage(i));
    return g;
  });
  let cur = 0;
  function setStage(i) {
    cur = (i + STAGES.length) % STAGES.length;
    const s = STAGES[cur];
    guide.setAttribute('x1', px(cur)); guide.setAttribute('x2', px(cur));
    ptEls.forEach((g, j) => g.querySelector('.dotc').setAttribute('r', j === cur ? 10 : (STAGES[j].pain ? 7 : 5)));
    stageTitle.textContent = `${cur + 1}. ${s.n}`;
    stageCard.innerHTML =
      `<div class="stage__row${s.pain ? ' stage__row--pain' : ''}"><p class="stage__k">Эмоция ${s.e} из 5${s.pain ? ', точка боли' : ''}</p><p>${s.em[0].toUpperCase() + s.em.slice(1)}</p></div>` +
      `<div class="stage__row"><p class="stage__k">Что делает селлер</p><p>${s.act}</p></div>` +
      `<div class="stage__row"><p class="stage__k">Барьер</p><p>${s.bar}</p></div>` +
      `<div class="stage__row"><p class="stage__k">Решение банка</p><p>${s.sol}</p></div>` +
      (s.p ? `<div class="stage__row stage__row--partner"><p class="stage__k">Партнёр на этом этапе</p><p>${s.p}</p></div>` : '') +
      `<div class="stage__row"><p class="stage__k">KPI</p><p>${s.kpi}</p></div>`;
    swap(stageCard);
  }
  $('#prevStage').addEventListener('click', () => setStage(cur - 1));
  $('#nextStage').addEventListener('click', () => setStage(cur + 1));
  setStage(4);

  /* ---------- партнёры ---------- */
  const PARTNERS = [
    { s: 'Конкуренты', t: 'Конкуренты-партнёры', who: 'Т-Бизнес, Точка, СберБизнес, Модульбанк, ВТБ, Озон Банк', rel: 'Борьба за клиента, но стандарты общие: СБП, Open API, требования ЦБ. С маркетплейсами одновременно сотрудничество и конкуренция' },
    { s: 'Поставщики', t: 'Поставщики', who: 'ЦБ и НСПК (СБП, «Мир», цифровой рубль), удостоверяющие центры, ФНС, бюро кредитных историй', rel: 'Условия задаёт поставщик или регулятор. Долгие формализованные отношения' },
    { s: 'Посредники', t: 'Посредники', who: 'Пампаду, Сравни, Банки.ру, бухгалтеры на аутсорсе', rel: 'Дают доступ к клиенту в момент выбора банка, банк платит за приведённого клиента' },
    { s: 'Сервисные', t: 'Сервисные партнёры', who: '1С, Контур.Эльба, Моё дело, МойСклад, Яндекс Бизнес, Авито', rel: 'Интеграции по Alfa API и программа «Альфа-Выгодно для бизнеса»: польза для клиента без своей разработки' },
    { s: 'Группа Альфа', t: 'Партнёры внутри группы', who: 'АльфаСтрахование, Альфа-Лизинг, Альфа Капитал', rel: 'Кросс-продажи и общий клиент. Для селлеров: страхование товарных запасов после пожаров на складах' },
    { s: 'Поддержка', t: 'Институты поддержки', who: 'Корпорация МСП, региональные фонды МСП, ТПП', rel: 'Льготные программы, гарантии, совместные конференции для участников ВЭД' }
  ];
  const WHEN = {
    now: [['Учёт и бизнес', '1С, Моё дело, МойСклад, Эльба: платежи сами попадают в учёт через Alfa API'], ['«Альфа-Выгодно для бизнеса»', 'Яндекс Бизнес, Авито, билайн бизнес, Restik: скидки, кэшбэк, «Альфа-Пятницы»'], ['Посредники', 'Пампаду приводит клиентов на расчётный счёт'], ['Связь неглубокая', 'Эльба подключена и к Т-Банку, Модульбанку, Точке, так что отличием она не станет']],
    next: [['Консолидация', 'Независимые сервисы для селлеров: Точка купила Mpstats, Т-Технологии покупают Точку за 84,8 млрд ₽'], ['Цифровой рубль с 01.09.2026', 'ЦБ, производители касс, маркетплейсы: приём в один клик'], ['Embedded banking', 'ERP, CRM и складские системы: банк внутри программ клиента'], ['Рост регионов', 'Местные бухгалтеры, фулфилмент, владельцы ПВЗ'], ['Нестабильность SWIFT', 'Платёжные агенты в Китае, ОАЭ, Турции, таможенные брокеры'], ['Самозанятые → ИП', 'Платформы исполнителей у лимита НПД 2,4 млн ₽'], ['Эмоциональный банкинг', 'Бизнес-медиа, клубы, события']]
  };
  const orbit = $('#orbitSvg'), pCard = $('#partnerCard');
  const ocx = 180, ocy = 146, orx = 128, ory = 96;
  svg('ellipse', { cx: ocx, cy: ocy, rx: orx, ry: ory, fill: 'none', stroke: '#fff', 'stroke-opacity': .4, 'stroke-dasharray': '4 6', 'stroke-width': 1.5 }, orbit);
  const angs = [-90, -30, 30, 90, 150, 210];
  const onodes = PARTNERS.map((p, i) => {
    const a = angs[i] * Math.PI / 180, x = ocx + orx * Math.cos(a), y = ocy + ory * Math.sin(a);
    svg('line', { x1: ocx, y1: ocy, x2: x, y2: y, stroke: '#fff', 'stroke-opacity': .3 }, orbit);
    const g = svg('g', { class: 'onode' }, orbit);
    svg('circle', { cx: x, cy: y, r: 22, fill: 'transparent' }, g);
    svg('circle', { cx: x, cy: y, r: 8, fill: '#fff', class: 'odot' }, g);
    const above = Math.sin(a) < -.6;
    const t = svg('text', { x, y: y + (above ? -16 : 28), 'text-anchor': 'middle', fill: '#fff', 'font-size': 13, 'font-weight': 700 }, g);
    t.textContent = p.s;
    g.addEventListener('click', () => setPartner(i));
    return g;
  });
  svg('circle', { cx: ocx, cy: ocy, r: 40, fill: '#fff' }, orbit);
  const ot = svg('text', { x: ocx, y: ocy + 5, 'text-anchor': 'middle', fill: '#EF3124', 'font-size': 14, 'font-weight': 700 }, orbit); ot.textContent = 'Альфа';
  function setPartner(i) {
    onodes.forEach((g, j) => g.querySelector('.odot').setAttribute('r', i === j ? 13 : 8));
    const p = PARTNERS[i];
    pCard.innerHTML = `<h3>${p.t}</h3><p class="who">${p.who}</p><p class="why">${p.rel}</p>`;
    swap(pCard);
  }
  setPartner(3);
  const whenTabs = $('#whenTabs'), whenList = $('#whenList');
  const setWhen = k => {
    [...whenTabs.children].forEach(b => b.setAttribute('aria-selected', b.dataset.when === k));
    whenList.innerHTML = WHEN[k].map(([a, b]) => `<li><b>${a}</b>${b}</li>`).join('');
    swap(whenList);
  };
  whenTabs.addEventListener('click', e => { const b = e.target.closest('button'); if (b) setWhen(b.dataset.when); });
  setWhen('now');

  /* ---------- карта позиционирования ---------- */
  const MAP = [
    { n: 'Альфа-Бизнес', x: .537, y: .165, price: '0 ₽ до 1 млн поступлений, иначе 990 ₽', note: 'Самая широкая линейка для селлера плюс менеджер. Самым дешёвым счётом Альфа не будет', alfa: 1 },
    { n: 'Точка', x: .876, y: .275, price: '950 ₽', note: 'Самый дорогой старт и самая глубокая селлерская операционка, плюс купленный Mpstats' },
    { n: 'Т-Банк', x: .626, y: .414, price: '490 ₽', note: 'Выигрывает скоростью кредита: до 15 млн ₽ за 2 минуты' },
    { n: 'СберБизнес', x: .286, y: .582, price: 'от 0 ₽ по модулям', note: 'Опция «Селлер» в подписке Прайм за 2 590 ₽, кредит до 5 млн ₽. Сила в масштабе и привычке' },
    { n: 'Озон Банк', x: .715, y: .615, price: '490 ₽', note: 'Слабее по связке «счёт, эквайринг, кредит»' },
    { n: 'ВТБ', x: .161, y: .732, price: 'от 0 ₽ с процентом', note: 'Мягкий старт и ставка на кредитные лимиты, селлерам предложение частичное' },
    { n: 'Модульбанк', x: .054, y: .849, price: '0 ₽ навсегда', note: 'Самый мягкий старт, отдельное предложение для селлеров только частичное' }
  ];
  const map = $('#mapSvg'), mapCard = $('#mapCard');
  const MX0 = 20, MX1 = 330, MY0 = 26, MY1 = 262;
  svg('line', { x1: MX0, y1: MY1, x2: MX1, y2: MY1, stroke: '#fff', 'stroke-opacity': .7, 'stroke-width': 2 }, map);
  svg('line', { x1: MX0, y1: MY0, x2: MX0, y2: MY1, stroke: '#fff', 'stroke-opacity': .7, 'stroke-width': 2 }, map);
  svg('line', { x1: (MX0 + MX1) / 2, y1: MY0, x2: (MX0 + MX1) / 2, y2: MY1, stroke: '#fff', 'stroke-opacity': .3, 'stroke-dasharray': '5 5' }, map);
  svg('line', { x1: MX0, y1: (MY0 + MY1) / 2, x2: MX1, y2: (MY0 + MY1) / 2, stroke: '#fff', 'stroke-opacity': .3, 'stroke-dasharray': '5 5' }, map);
  [['Глубокое решение для селлера', MX0 + 6, MY0 - 8, 'start'], ['Базовый набор', MX1, MY1 - 8, 'end'], ['Дешёвый старт', MX0, MY1 + 18, 'start'], ['Платный старт', MX1, MY1 + 18, 'end']].forEach(([t, x, y, a]) => { const e = svg('text', { x, y, 'text-anchor': a, fill: '#fff', 'fill-opacity': .8, 'font-size': 11 }, map); e.textContent = t; });
  const mEls = MAP.map((m, i) => {
    const x = MX0 + m.x * (MX1 - MX0), y = MY0 + m.y * (MY1 - MY0);
    const g = svg('g', { class: 'mpt' }, map);
    svg('circle', { cx: x, cy: y, r: 20, fill: 'transparent' }, g);
    if (m.alfa) svg('circle', { cx: x, cy: y, r: 18, fill: '#fff', 'fill-opacity': .5, class: 'pulse' }, g);
    svg('circle', { cx: x, cy: y, r: m.alfa ? 12 : 7, fill: '#fff', class: 'mdot' }, g);
    if (m.alfa) svg('circle', { cx: x, cy: y, r: 5, fill: '#EF3124' }, g);
    const right = m.x < .8;
    const t = svg('text', { x: right ? x + (m.alfa ? 16 : 11) : x - 11, y: y + 4, 'text-anchor': right ? 'start' : 'end', fill: '#fff', 'font-size': m.alfa ? 13 : 11, 'font-weight': 700 }, g);
    t.textContent = m.n;
    g.addEventListener('click', () => setMap(i));
    return g;
  });
  function setMap(i) {
    mEls.forEach((g, j) => { const d = g.querySelector('.mdot'); d.setAttribute('r', MAP[j].alfa ? 12 : (i === j ? 10 : 7)); });
    const m = MAP[i];
    mapCard.innerHTML = `<h3>${m.n}</h3><p class="who">${m.price}</p><p class="why">${m.note}</p>`;
    swap(mapCard);
  }
  setMap(0);

  /* ---------- пирамида ---------- */
  const PYR = [
    { n: 'Суть', w: 40, bg: '#EF3124', fg: '#fff', t: '«Рост под контролем»', d: 'Ответ на инсайт: селлер хочет расти, а рост отнимает контроль. Бренд снимает противоречие: рост остаётся, контроль возвращается' },
    { n: 'Ценности и личность', w: 54, bg: '#F5776D', fg: '#1C1C1C', t: 'Прозрачность, рост, надёжность, человечность', d: 'Личность: Правитель (контроль, порядок, стабильность) плюс Славный малый (свой, говорит на равных). Одной фразой: уверенный партнёр, который наводит порядок в деньгах и говорит просто и честно' },
    { n: 'Выгоды и атрибуты', w: 68, bg: '#F9B3AC', fg: '#1C1C1C', t: 'Банк на вырост, решение для селлера, человек рядом, всё онлайн', d: 'Эмоции: контроль и уверенность, спокойствие перед сезоном, лёгкость, удовольствие от общения. Атрибуты: счёт «Ноль», эквайринг от 1%, кредитная линия от 14,5%, ВЭД, 800+ офисов, менеджер' },
    { n: 'Главный инсайт', w: 80, bg: '#FCE3E0', fg: '#1C1C1C', t: '«Чем быстрее растёт мой бизнес, тем меньше я его контролирую»', d: 'Путь: наблюдение (деньги в товаре, 4 окна) → мотив (контроль) → барьер (кассовые разрывы) → эмоции (тревога, стресс) → конфликт (рост отнимает контроль)' },
    { n: 'Ситуация потребления', w: 91, bg: '#EDE6E2', fg: '#1C1C1C', t: 'Закупка к сезону раньше выплаты, ежедневная сверка в 4 окнах', d: 'Острый момент: Новый год, 8 марта, распродажи. Ежедневный: кабинет площадки, банк, аналитика и своя таблица' },
    { n: 'Рынок и ЦА', w: 100, bg: '#E0D9D4', fg: '#1C1C1C', t: '6,6 млн МСП; селлеры WB и Ozon', d: 'Маркетплейсы: 6 трлн ₽, +36,4%. ЦА: ИП 25–45 лет, бизнес 1–4 года, 1–10 человек, оборот 15–80 млн ₽ в год, FBS' }
  ];
  const pyr = $('#pyr'), pyrCard = $('#pyrCard');
  const pBtns = PYR.map((p, i) => {
    const b = document.createElement('button');
    b.className = 'pyr__lvl'; b.style.width = p.w + '%'; b.style.background = p.bg; b.style.color = p.fg;
    b.textContent = p.n; b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => setPyr(i));
    pyr.appendChild(b); return b;
  });
  function setPyr(i) {
    pBtns.forEach((b, j) => b.setAttribute('aria-pressed', i === j));
    const p = PYR[i];
    pyrCard.innerHTML = `<span class="tag">${p.n}</span><h3>${p.t}</h3><p class="why">${p.d}</p>`;
    swap(pyrCard);
  }
  setPyr(0);

  /* ---------- айдентика ---------- */
  const RATIO = [
    { k: '60%', g: 60, bg: '#FFFFFF', fg: '#1C1C1C', note: '60% – белый и чёрный: фон страниц. На сайте чёрные первые экраны чередуются с белыми разделами' },
    { k: '30%', g: 30, bg: '#D9D4D0', fg: '#1C1C1C', note: '30% – светло- и тёмно-серый: карточки с преимуществами и форма заявки' },
    { k: '10%', g: 10, bg: '#EF3124', fg: '#FFFFFF', note: '10% – красный: логотип и кнопки «Открыть счёт», «Отправить заявку». Красный почти всегда значит действие' }
  ];
  const ratio = $('#ratio'), rNote = $('#ratioNote');
  const rBtns = RATIO.map((r, i) => {
    const b = document.createElement('button');
    b.style.flexGrow = r.g; b.style.flexBasis = '0'; b.style.background = r.bg; b.style.color = r.fg; b.textContent = r.k;
    b.setAttribute('aria-label', r.note);
    b.addEventListener('click', () => {
      rBtns.forEach((x, j) => x.style.flexGrow = j === i ? RATIO[j].g + 18 : RATIO[j].g);
      rNote.textContent = r.note; swap(rNote);
    });
    ratio.appendChild(b); return b;
  });
  rNote.textContent = 'Красный отделяет Альфу от зелёного СберБизнеса, синего ВТБ и жёлто-чёрного Т-Бизнеса.';
  const toneBtn = $('#toneBtn'), toneText = $('#toneText');
  const TONE = ['«Информируем вас о поступлении денежных средств»', '«Выплата придёт в четверг – на закупку хватит»'];
  toneBtn.addEventListener('click', () => {
    const on = toneBtn.getAttribute('aria-pressed') !== 'true';
    toneBtn.setAttribute('aria-pressed', on);
    toneText.textContent = TONE[on ? 1 : 0];
    toneText.classList.toggle('is-good', on);
    toneBtn.textContent = on ? 'Вернуть канцелярит' : 'Переписать по-человечески';
    swap(toneText);
  });

  /* ---------- метафора ---------- */
  const quiz = $('#quiz'), reveal = $('#reveal'), verdictEl = $('#verdict');
  quiz.addEventListener('click', e => {
    const b = e.target.closest('.quiz__opt'); if (!b) return;
    [...quiz.children].forEach(x => x.setAttribute('aria-pressed', x === b));
    const a = b.dataset.r === 'a';
    verdictEl.textContent = a
      ? 'Вы прочитали фразу так, как её задумали. Но слово «контроль» в банковской речи легко услышать как надзор, и тогда работает второе прочтение.'
      : 'Вы услышали опасное прочтение, и вы не одни: банк сам проводит проверки, поэтому «контроль» легко звучит как надзор.';
    reveal.hidden = false;
    $('#readA').classList.toggle('is-picked', a);
    $('#readB').classList.toggle('is-picked', !a);
    swap(reveal);
  });
  const WORDS = [
    { w: 'Рост', plus: 'Оборот, ассортимент, команда, география поставок', minus: 'Вместе с заказами растут закупки, логистика и реклама. Без пояснения звучит как рекламное обещание' },
    { w: 'под', plus: '', minus: 'Выражение «ситуация под контролем» описывает что-то опасное, что нужно удерживать' },
    { w: 'контролем', plus: 'Видеть деньги, план и факт, комиссии, реальную маржу', minus: 'Надзор, проверки, давление, необходимость отчитываться' }
  ];
  const words = $('#words'), wCard = $('#wordCard');
  const wBtns = WORDS.map((w, i) => {
    const b = document.createElement('button'); b.textContent = w.w; b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => {
      wBtns.forEach((x, j) => x.setAttribute('aria-pressed', i === j));
      wCard.innerHTML = (w.plus ? `<h3>+ ${w.plus}</h3>` : '') + `<p class="why">– ${w.minus}</p>`;
      swap(wCard);
    });
    words.appendChild(b); return b;
  });
  wBtns[2].click();

  /* ---------- навигация и появление ---------- */
  const chips = [...document.querySelectorAll('.nav__chip')];
  const secs = chips.map(c => document.querySelector(c.getAttribute('href')));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => {
      es.forEach(e => {
        if (!e.isIntersecting) return;
        const i = secs.indexOf(e.target);
        chips.forEach((c, j) => c.setAttribute('aria-current', i === j));
        chips[i].scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduce ? 'auto' : 'smooth' });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(s => s && io.observe(s));

    const rise = document.querySelectorAll('.sec h2, .panel, .chart, .rings, .orbit, .map, .pyr, .matrix, .bars, .ratio, .quiz');
    rise.forEach(el => el.classList.add('rise'));
    const io2 = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        if (e.target.contains(curve)) curve.style.strokeDashoffset = 0;
        io2.unobserve(e.target);
      }
    }), { threshold: .15 });
    rise.forEach(el => io2.observe(el));
  } else {
    curve.style.strokeDashoffset = 0;
  }
})();
