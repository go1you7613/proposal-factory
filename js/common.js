// 공통 스크립트: 안내 바, 앱 머리글, 사업 바, 화면 상태 전환, 기능설명 팝업
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const scr = id => SCREENS.find(s => s.id === id);
  const qs = new URLSearchParams(location.search);
  window.PF = { esc, scr };

  // 상태 배지 (명도 계단 + 글자)
  // 진행 상태는 배지 3개 (진행 전, 진행 중, 완료) + 세부 상태 글자 (UX원칙 5.1)
  const PROG = { '시작 전': ['진행 전', ''], '빈 페이지': ['진행 전', '빈 페이지'], '미확보': ['진행 전', '미확보'], '미질의': ['진행 전', '미질의'],
    '진행 중': ['진행 중', ''], '초안': ['진행 중', '초안'], '수정 중': ['진행 중', '수정 중'], '요청함': ['진행 중', '요청함'], '확보': ['진행 중', '확보'], '질의함': ['진행 중', '질의함'],
    '완료': ['완료', ''], '반영': ['완료', '반영'], '보류': ['완료', '보류'], '회신 받음': ['완료', '회신 받음'], '회신 없음': ['완료', '회신 없음 (작성 가정)'] };
  const PCLS = { '진행 전': 'badge--weak', '진행 중': 'badge--strong', '완료': 'badge--solid' };
  PF.st = v => {
    if (PROG[v]) { const [b, sub] = PROG[v]; return `<span class="badge ${PCLS[b]}">${b}</span>${sub ? `<span class="bsub">${esc(sub)}</span>` : ''}`; }
    const c = {
      '완료': 'badge--solid', '확정': 'badge--solid', '충족': 'badge--solid', '반영': 'badge--solid', '수주': 'badge--solid', '연결됨': 'badge--solid',
      '진행 중': 'badge--strong', '수정 중': 'badge--strong', '초안': 'badge--strong', '답변': 'badge--strong', '경고': 'badge--strong', '후보': 'badge--strong', '탈락': 'badge--strong',
      '시작 전': 'badge--weak', '빈 페이지': 'badge--weak', '보관': 'badge--weak', '참고': 'badge--weak', '참고(타사)': 'badge--mid', '제출 완료': 'badge--mid', '중단': 'badge--weak',
      '확인 필요': 'badge--check', '미충족': 'badge--check', '미답변': 'badge--check', '오류': 'badge--check', '보류': 'badge--check', '권한 필요': 'badge--check', '미연결': 'badge--check',
      '미확보': 'badge--check', '요청함': 'badge--weak', '확보': 'badge--strong', '미질의': 'badge--check', '질의함': 'badge--weak', '회신 받음': 'badge--solid', '회신 없음': 'badge--mid'
    }[v] || 'badge--weak';
    return `<span class="badge ${c}">${esc(v)}</span>`;
  };

  // ① 기능설명 팝업
  PF.openFeature = function (id) {
    const s = scr(id); if (!s) return;
    const sys = SYSTEMS[s.sys];
    const feats = (window.FEATURES || []).filter(f => f.screen === id);
    const data = (window.SCREEN_DATA || {})[id] || [];
    const li = a => a && a.length ? '<ul>' + a.map(x => `<li>${esc(x)}</li>`).join('') + '</ul>' : '<span class="muted">-</span>';
    const rows = feats.map(f => `<tr>
      <td class="nowrap"><b>${esc(f.id)}</b></td><td>${esc(f.name)}</td><td>${li(f.desc)}</td>
      <td>${li(f.proc)}</td><td>${li(f.exc)}${f.decision ? `<div class="muted">관련 결정: ${esc(f.decision)}</div>` : ''}</td>
      <td>${li(data)}</td><td>${esc(f.role)}</td></tr>`).join('');
    const states = s.states.map(([k, l]) => `<a class="btn btn--sm" href="${s.file}?state=${k}">${esc(l)}</a>`).join(' ');
    let bg = $('#fx-modal');
    if (!bg) { bg = document.createElement('div'); bg.id = 'fx-modal'; bg.className = 'modal-bg'; document.body.appendChild(bg); }
    bg.innerHTML = `<div class="modal" role="dialog" aria-modal="true">
      <button class="x" aria-label="닫기" onclick="PF.closeFeature()"><i data-lucide="x"></i></button>
      <h3>${esc(s.id)} ${esc(s.name)} <span class="muted" style="font-size:14px;font-weight:400">${esc(sys.tab)} ${esc(sys.name)}</span></h3>
      <p style="margin:0 0 14px">${esc(s.desc)}</p>
      <h2 style="margin-top:0">주요 기능 (${feats.length}개)</h2>
      <div class="tw"><table><tr><th>기능 ID</th><th>기능명</th><th>설명</th><th>표시와 입력, 처리 규칙</th><th>예외</th><th>관련 데이터</th><th>권한</th></tr>${rows || '<tr><td colspan="7" class="muted">기능 없음</td></tr>'}</table></div>
      <h2>화면 상태 보기</h2><div class="chips">${states}</div>
      <h2>기준 문서</h2>
      <p style="margin:0">${esc(DOC_REF.title)} <span class="muted">(${esc(DOC_REF.path)})</span></p>
      <p class="muted" style="margin:4px 0 0;font-size:13px">${esc(DOC_REF.note)}</p></div>`;
    bg.classList.add('show');
    PF.icons();
    bg.onclick = e => { if (e.target === bg) PF.closeFeature(); };
  };
  PF.closeFeature = () => { const bg = $('#fx-modal'); if (bg) bg.classList.remove('show'); };
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { PF.closeFeature(); document.querySelectorAll('.modal-bg.show').forEach(m => m.classList.remove('show')); } });

  PF.icons = () => { if (window.lucide) lucide.createIcons(); };
  // 간격 보정: 같은 줄에 붙은 버튼은 8px, 라벨(칩, 배지)은 6px 이상 띄운다. 보이는 요소만 재고, 화면이 바뀌면 다시 잰다
  const GAPSEL = '.btn,.chip,.badge,.kw,.dday';
  PF.gaps = () => {
    document.querySelectorAll(GAPSEL).forEach(e => {
      const n = e.nextElementSibling; if (!n || !n.matches(GAPSEL)) return;
      const a = e.getBoundingClientRect(), c = n.getBoundingClientRect();
      if (!a.width || !c.width || Math.abs(a.top - c.top) > 4) return;
      const want = e.matches('.btn') && n.matches('.btn') ? 8 : 6, g = c.left - a.right;
      if (g >= want - 0.5 || g < -1) return;
      n.style.marginLeft = ((parseFloat(n.style.marginLeft) || 0) + want - g).toFixed(1) + 'px';
    });
  };
  let gapT; const gapRun = () => { clearTimeout(gapT); gapT = setTimeout(PF.gaps, 60); };
  window.addEventListener('load', gapRun); window.addEventListener('resize', gapRun);
  new MutationObserver(gapRun).observe(document.documentElement, {subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'hidden']});
  window.addEventListener('load', PF.icons);
  PF.modal = (id, on = true) => { const m = document.getElementById(id); if (m) m.classList.toggle('show', on); };
  // 패널 탭 전환 (편집기 등)
  PF.tab = (group, key) => {
    document.querySelectorAll(`[data-tg="${group}"]`).forEach(b => b.classList.toggle('on', b.dataset.tk === key));
    document.querySelectorAll(`[data-tp="${group}"]`).forEach(p => p.hidden = p.dataset.tk !== key);
  };

  // 자료 창: 오른쪽에서 밀려 나오는 넓은 창 (제안서 작성 화면). key = PANELS 의 state 이름, 'out' = PDF 출력
  PF.drawer = (key, big = false, state = '') => {
    let bg = $('#drw-bg'), d = $('#drw');
    if (!d) {
      bg = document.createElement('div'); bg.id = 'drw-bg'; bg.className = 'drw-bg'; bg.onclick = () => PF.drawer(null);
      d = document.createElement('aside'); d.id = 'drw'; d.className = 'drw'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
      document.body.append(bg, d);
    }
    document.querySelectorAll('.vrail button, .rail button').forEach(b => b.classList.toggle('on', b.dataset.k === key));
    if (!key) { d.classList.remove('show', 'big'); bg.classList.remove('show'); return; }
    const p = key === 'out' ? ['out', 'UW11', 'PDF 출력', 'file-output'] : (window.PANELS || []).find(x => x[0] === key);
    if (!p) return;
    const pr = state ? '&state=' + encodeURIComponent(state) : '';  // 자료 창을 특정 상태로 열기 (예: 목차 파일 올리기)
    const body = p[1] ? `<iframe title="${esc(p[2])}" src="${p[1]}.html?embed=1${pr}"></iframe>` : `<div class="drw-in">${($('#info-tpl') || {}).innerHTML || ''}</div>`;
    d.innerHTML = `<div class="drw-h"><i data-lucide="${p[3]}"></i><b>${esc(p[2])}</b><span class="grow"></span>
      <button class="btn btn--sm" id="drw-size" onclick="PF.drawerBig()"></button>
      <button class="btn btn--sm btn--ghost" aria-label="닫기" onclick="PF.drawer(null)"><i data-lucide="x"></i></button></div>${body}`;
    d.classList.toggle('big', big); sizeBtn();
    d.classList.add('show'); bg.classList.add('show'); PF.icons();
  };
  // 크기 버튼: 보통 창이면 「크게 보기」, 크게 보기 상태면 「작게 보기」
  const sizeBtn = () => { const d = $('#drw'), b = $('#drw-size'); if (!d || !b) return; const big = d.classList.contains('big');
    b.innerHTML = big ? '<i data-lucide="minimize-2"></i>' : '<i data-lucide="maximize-2"></i>'; b.setAttribute('aria-label', big ? '작게 보기' : '크게 보기'); b.title = big ? '작게 보기' : '크게 보기'; b.setAttribute('aria-pressed', big); };   // 2026-11-16 디자인: 글자 없이 아이콘만
  PF.drawerBig = () => { const d = $('#drw'); if (d) { d.classList.toggle('big'); sizeBtn(); PF.icons(); } };
  // 맨 위 프로토타입 창 (자료 창 iframe 안에서 불러도 화면 전체에 띄우기 위해). claude.ai 바깥 창은 접근하지 않는다
  const topWin = () => { let w = window, best = window; try { while (w.parent && w.parent !== w) { w = w.parent; if (w.PF && w.document.body && w.document.body.dataset.screen) best = w; } } catch (e) {} return best; };
  PF.toast = (msg) => { const T = topWin(); if (T !== window) return T.PF.toast(msg);
    let t = $('#pf-toast'); if (!t) { t = document.createElement('div'); t.id = 'pf-toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.innerHTML = '<i data-lucide="check"></i><span>' + esc(msg) + '</span>'; t.hidden = false; t.classList.remove('out'); PF.icons();
    clearTimeout(t._h); t._h = setTimeout(() => { t.classList.add('out'); setTimeout(() => { t.hidden = true; }, 600); }, 4000); };
  // 알림 팝업 (2026-11-15): 작업 중 생긴 실패, 막힘, 한 번만 보이는 결과는 화면 위가 아니라 화면 가운데 모달로 띄운다
  //   ① PF.pop(html, 너비) 열기 / PF.pop(null) 닫기  ② PF.popT('템플릿 id') = 그 <template> 내용으로 열기
  //   ③ <template data-pop="상태이름" data-w="520"> 는 ?state= 가 맞으면 화면을 열 때 자동으로 띄운다
  //   [퍼블리싱] 자료 창 iframe 안에서 불러도 맨 위 창 가운데에 뜬다. Esc, 바깥 클릭, 닫기로 닫는다
  PF.pop = (html, w) => { const T = topWin(); if (T !== window) return T.PF.pop(html, w);
    let bg = $('#pf-pop');
    if (!bg) { bg = document.createElement('div'); bg.id = 'pf-pop'; bg.className = 'modal-bg'; bg.style.zIndex = 125; bg.onclick = e => { if (e.target === bg) PF.pop(null); }; document.body.appendChild(bg);
      document.addEventListener('keydown', e => { if (e.key === 'Escape') PF.pop(null); }); }
    if (!html) { bg.classList.remove('show'); return; }
    bg.innerHTML = `<div class="modal app-modal" role="dialog" aria-modal="true" style="max-width:${w || 520}px"><button class="x" aria-label="닫기" onclick="PF.pop(null)"><i data-lucide="x"></i></button>${html}</div>`;
    bg.classList.add('show'); PF.icons(); PF.gaps && PF.gaps(bg); };
  PF.popT = (tid) => { const t = document.getElementById(tid); if (t) PF.pop(t.innerHTML, t.dataset.w); };

  // 목차 파일 올리기 모달 (2026-11-15): 고르기 → 읽는 중 → 미리보기 | 찾지 못함 → 이대로 바꾸기. 화면 전체 가운데에 띄운다
  //   [퍼블리싱] 고르기 단계의 끌어 놓기 영역 = 숨긴 input[type=file] accept=".xlsx,.csv,.pdf,.hwpx,.docx" 와 연결. 원본은 사업 폴더 00. 자료실/ 에 저장
  const TOCUP = {
    pick: `<h3 id="tut">목차 파일 올리기</h3><p class="muted" style="margin:0 0 12px">가지고 있는 목차 파일을 올리면 AI 가 장, 절을 읽어 지금 목차와 비교해 보여 줘요. 바꾸기 전까지 지금 목차는 그대로예요.</p>
      <div class="drop--lg"><i data-lucide="file-up"></i><b>파일을 끌어 놓거나 눌러서 고르세요</b><span class="muted" style="font-size:13px">엑셀(xlsx, csv), PDF, HWPX, 워드(docx)</span></div>
      <div class="acts" style="margin-top:14px;justify-content:flex-end"><button class="btn" onclick="PF.tocUp(null)">닫기</button></div>
      <p class="muted" style="font-size:13px;margin:10px 0 0">(프로토타입) <a href="#" onclick="PF.tocUp('read');return false">목차_최종.xlsx 고르기</a></p>`,
    read: `<h3 id="tut">목차를 읽고 있어요</h3><p class="muted" style="margin:0 0 12px">목차_최종.xlsx</p>
      <div class="bar"><i style="width:60%"></i></div><p class="now" style="margin:10px 0 0"><i data-lucide="loader"></i>장, 절 번호와 이름, 페이지 수 칸을 찾고 있어요</p>
      <p class="muted" style="font-size:13px;margin:12px 0 0">(프로토타입) <a href="#" onclick="PF.tocUp('preview');return false">읽기 끝 (미리보기)</a> · <a href="#" onclick="PF.tocUp('fail');return false">목차를 찾지 못함</a></p>`,
    fail: `<h3 id="tut">목차를 찾지 못했어요</h3><p style="margin:0 0 6px">목차_최종.xlsx 에서 장, 절 번호가 있는 표나 목록을 찾지 못했어요.</p>
      <p class="muted" style="margin:0 0 14px;font-size:14px">장, 절 번호(예: Ⅰ, 1.1)와 이름이 한 줄씩 있는 파일인지 확인해 주세요. 지금 목차는 바뀌지 않았어요.</p>
      <div class="acts" style="justify-content:flex-end"><button class="btn" onclick="PF.tocUp(null)">닫기</button><button class="btn btn--primary" onclick="PF.tocUp('pick')"><i data-lucide="file-up"></i>다른 파일 고르기</button></div>`,
    preview: `<h3 id="tut">이 목차로 바꿀까요?</h3><p class="muted" style="margin:0 0 12px">목차_최종.xlsx 에서 읽은 목차예요.</p>
      <div class="alert alert--strong" style="margin:0 0 12px"><i data-lucide="alert-triangle"></i> 대목차(장)가 RFP 지정 목차와 달라요 (5장 → 4장). 이대로 바꾸면 RFP 가 정한 목차 순서와 달라져요.</div>
      <div class="sum" style="display:flex;gap:6px;flex-wrap:wrap;margin:0 0 12px"><span class="chip">장 5 → 4</span><span class="chip">절 13 → 15</span><span class="chip">요구사항 다시 배정 44 / 47건</span><span class="chip">미배정 3건</span><span class="chip">쓴 절 1개 보관/ 으로</span></div>
      <div class="grid g2">
        <div><b style="font-size:14px">지금 목차</b><ul class="steps" style="margin-top:6px">
          <li><b style="min-width:28px">I</b><span>일반부문</span><span class="muted" style="margin-left:auto">2절</span></li><li><b style="min-width:28px">II</b><span>사업관리부문</span><span class="muted" style="margin-left:auto">2절</span></li>
          <li><b style="min-width:28px">III</b><span>사업수행부문</span><span class="muted" style="margin-left:auto">4절</span></li><li><b style="min-width:28px">IV</b><span>기술부문</span><span class="muted" style="margin-left:auto">2절</span></li>
          <li><b style="min-width:28px">V</b><span>지원부문</span><span class="muted" style="margin-left:auto">3절</span></li></ul></div>
        <div><b style="font-size:14px">올린 목차</b><ul class="steps" style="margin-top:6px">
          <li><b style="min-width:28px">I</b><span>사업 개요</span><span class="badge badge--strong" style="margin-left:auto">이름 바뀜</span><span class="muted">3절</span></li>
          <li><b style="min-width:28px">II</b><span>수행 전략</span><span class="badge badge--strong" style="margin-left:auto">합쳐짐</span><span class="muted">4절</span></li>
          <li><b style="min-width:28px">III</b><span>운영 방안</span><span class="badge badge--strong" style="margin-left:auto">이름 바뀜</span><span class="muted">5절</span></li>
          <li><b style="min-width:28px">IV</b><span>지원 방안</span><span class="muted" style="margin-left:auto">3절</span></li></ul></div></div>
      <p class="muted" style="font-size:13px;margin:10px 0 14px">바꾸면 요구사항을 새 절에 다시 배정하고, 페이지 수를 배점 비례로 다시 제안해요. 배정하지 못한 요구사항은 「미배정」으로 남아요. 이미 쓴 절(3.3 장애 대응)은 지우지 않고 PC 보관/ 폴더로 옮겨요.</p>
      <div class="acts" style="justify-content:flex-end"><button class="btn" onclick="PF.tocUp(null)">취소</button><button class="btn btn--primary" onclick="PF.tocApply()"><i data-lucide="replace"></i>이대로 바꾸기</button></div>`
  };
  PF.tocUp = (step) => {
    const T = topWin(); if (T !== window) return T.PF.tocUp(step);
    let bg = $('#tocup');
    if (!bg) { bg = document.createElement('div'); bg.id = 'tocup'; bg.className = 'modal-bg'; bg.style.zIndex = 120; bg.onclick = e => { if (e.target === bg) PF.tocUp(null); }; document.body.appendChild(bg); }
    if (!step || !TOCUP[step]) { bg.classList.remove('show'); return; }
    bg.innerHTML = `<div class="modal app-modal" role="dialog" aria-modal="true" aria-labelledby="tut" style="max-width:${step === 'preview' ? 760 : 540}px"><button class="x" aria-label="닫기" onclick="PF.tocUp(null)"><i data-lucide="x"></i></button>${TOCUP[step]}</div>`;
    bg.classList.add('show'); PF.icons();
  };
  // 이대로 바꾸기: 모달 닫기 → 목차 화면(자료 창 또는 단독)에 반영 + 알림
  // 문서 서식 (2026-11-15): 글꼴, 글자 크기, 두께를 역할별로 정하고 전체 페이지에 적용. 작업창에서 적용하면 바로 검사해 문제를 알려 준다
  //   [퍼블리싱] 값은 사업마다 서버에 둔다 (원고가 아닌 설정). 적용 = 모든 페이지 HTML 다시 생성 → 넘침, 분량, RFP 글자 기준 검사
  // 테마 서식 규칙 (2026-11-15, B안): 테마마다 규칙 파일(theme.json)을 두고, 문서 서식 창은 이 규칙 안에서만 고르게 한다
  //   [퍼블리싱] 아래 THEME 는 「기본 v2」 테마 규칙의 더미. 실제로는 테마 폴더의 theme.json 을 읽는다
  //   roles: 역할별 기본값(font, size pt, w), 허용 범위(min, max), 고를 수 있는 글꼴 / weights: 글꼴마다 실제로 있는 두께 / locked: 서식이 손대지 않는 곳
  const THEME = {
    name: '기본 v2',
    weights: { 'Paperlogy': [400, 500, 700], 'Pretendard': [400, 500, 700], '본고딕 (Noto Sans KR)': [400, 500, 700], '나눔고딕': [400, 700] },
    roles: [
      { k: 'title', l: '페이지 제목', font: 'Paperlogy', size: 22, w: 700, min: 18, max: 24, fonts: ['Paperlogy', 'Pretendard', '본고딕 (Noto Sans KR)'] },
      { k: 'sub', l: '소제목', font: 'Paperlogy', size: 12, w: 700, min: 11, max: 14, fonts: ['Paperlogy', 'Pretendard', '본고딕 (Noto Sans KR)'] },
      { k: 'body', l: '본문', font: 'Pretendard', size: 11, w: 400, min: 10, max: 12, fonts: ['Pretendard', '본고딕 (Noto Sans KR)', '나눔고딕'] },
      { k: 'table', l: '표 글자', font: 'Pretendard', size: 9.5, w: 400, min: 8.5, max: 11, fonts: ['Pretendard', '본고딕 (Noto Sans KR)', '나눔고딕'] },
      { k: 'band', l: '결론 바', font: 'Paperlogy', size: 12, w: 700, min: 11, max: 13, fonts: ['Paperlogy', 'Pretendard', '본고딕 (Noto Sans KR)'] }],
    locked: ['표지', '장 간지', '핵심 숫자(KPI)', '머리 띠 장식 글자']
  };
  const FMT_W = { 400: '보통', 500: '중간', 700: '굵게' };
  const famOf = f => f === 'Paperlogy' ? 'Paperlogy, Noto Sans KR, sans-serif' : f === 'Pretendard' ? 'Pretendard, Noto Sans KR, sans-serif' : f.startsWith('본고딕') ? 'Noto Sans KR, sans-serif' : f + ', Noto Sans KR, sans-serif';
  PF.fmtCtx = 'editor';
  PF.fmt = (step, ctx) => {
    const T = topWin(); if (T !== window) return T.PF.fmt(step, ctx);
    if (ctx) PF.fmtCtx = ctx;
    let bg = $('#fmtm');
    if (!bg) { bg = document.createElement('div'); bg.id = 'fmtm'; bg.className = 'modal-bg'; bg.style.zIndex = 121; bg.onclick = e => { if (e.target === bg) PF.fmt(null); }; document.body.appendChild(bg); }
    if (!step) { bg.classList.remove('show'); return; }
    const pre = PF.fmtCtx === 'pre';
    let body = '';
    if (step === 'edit') {
      const opt = (arr, v) => arr.map(([val, lab]) => `<option value="${val}"${val == v ? ' selected' : ''}>${lab}</option>`).join('');
      const steps = (r) => { const a = []; for (let x = r.min; x <= r.max + 1e-9; x += 0.5) a.push([x, x + 'pt']); return a; };
      const rows = THEME.roles.map(r => `<tr><td><b>${r.l}</b><div class="muted" style="font-size:12px">${r.min} ~ ${r.max}pt</div></td>
        <td><select data-k="${r.k}" data-p="font" aria-label="${r.l} 글꼴">${opt(r.fonts.map(f => [f, f]), r.font)}</select></td>
        <td><select data-k="${r.k}" data-p="size" aria-label="${r.l} 크기">${opt(steps(r), r.size)}</select></td>
        <td><select data-k="${r.k}" data-p="w" aria-label="${r.l} 두께">${opt(THEME.weights[r.font].map(w => [w, FMT_W[w]]), r.w)}</select></td></tr>`).join('');
      body = `<h3 id="fmt-t">문서 서식</h3><p class="muted" style="margin:0 0 12px">${pre ? '초안을 쓰기 전에 기본 서식을 확인해 주세요. 작업 중에도 바꿀 수 있어요.' : '바꾸면 모든 페이지에 적용되고, 적용한 뒤 바로 검사해서 문제가 되는 곳을 알려 드려요.'}</p>
        <div class="fmt-th"><span class="chip"><i data-lucide="palette"></i>테마: ${THEME.name}</span><span class="muted">테마가 정한 글꼴과 크기 범위 안에서 바꿀 수 있어요</span></div>
        <div class="alert alert--note" style="margin:0 0 12px"><i data-lucide="file-search"></i> RFP 작성 지침: 본문 11pt 이상, A4 세로</div>
        <div class="tw"><table class="fmt-t"><tr><th>역할</th><th>글꼴</th><th>크기</th><th>두께</th></tr>${rows}</table></div>
        <p class="fmt-warn" id="fmt-warn" hidden>본문이 RFP 작성 지침(11pt 이상)보다 작아요. 적용은 되지만 검사에서 오류로 나와요.</p>
        <div class="fmt-pv" id="fmt-pv" aria-label="미리보기"><div data-r="title">장애 등급별 신속 복구 체계</div><div data-r="band">장애를 4등급으로 나누고 등급마다 복구 시간을 약속합니다.</div><div data-r="sub">3.3.1 장애 등급과 복구 시간</div><div data-r="body">감시 도구로 24시간 장애를 감지하고, 1등급 장애는 2시간 안에 복구합니다.</div><div data-r="table">1등급 · 서비스 전체 중단 · 2시간 이내</div></div>
        <p class="muted" style="font-size:13px;margin:8px 0 0"><i data-lucide="lock" style="width:12px;height:12px;vertical-align:-1px"></i> 테마 디자인으로 고정: ${THEME.locked.join(', ')}</p>
        <div class="acts" style="display:flex;align-items:center;gap:8px;justify-content:space-between;margin-top:14px"><button class="btn btn--ghost" onclick="PF.fmt('edit')">테마 기본값으로</button>
          <span style="display:flex;gap:8px"><button class="btn" onclick="PF.fmt(null)">닫기</button><button class="btn btn--primary" onclick="PF.fmtApply()"><i data-lucide="check"></i>${pre ? '이 서식으로 정하기' : '전체 페이지에 적용'}</button></span></div>`;
    } else if (step === 'result') {
      const rfp = (PF.fmtBody || 11) < 11;  // 본문이 RFP 기준보다 작으면 오류 한 줄 추가
      body = `<h3 id="fmt-t">서식을 적용했어요</h3><p class="muted" style="margin:0 0 12px">44페이지 모두 다시 그렸어요. 확인할 곳이 ${rfp ? 5 : 4}곳 있어요.</p>
        <div class="sum" style="display:flex;gap:6px;flex-wrap:wrap;margin:0 0 10px"><span class="badge badge--err">오류 ${rfp ? 2 : 1}</span><span class="badge badge--check">경고 3</span></div>
        <div class="tw"><table><tr><th>수준</th><th>위치</th><th>내용</th><th></th></tr>${rfp ? `<tr><td><span class="badge badge--err">오류</span></td><td class="nowrap">전체</td><td>본문 ${PF.fmtBody}pt: RFP 작성 지침(본문 11pt 이상)보다 작아요</td><td class="nowrap"><button class="btn btn--sm" onclick="PF.fmt('edit')">서식 고치기</button></td></tr>` : ''}
          <tr><td><span class="badge badge--err">오류</span></td><td class="nowrap">3.3 2페이지</td><td>페이지 넘침: 아래로 6줄 넘쳤어요</td><td class="nowrap"><button class="btn btn--sm" onclick="PF.fmt(null)">그 자리로</button></td></tr>
          <tr><td><span class="badge badge--check">경고</span></td><td class="nowrap">전체</td><td>분량: 46페이지가 되어 계획 44페이지보다 늘었어요 (한도 50페이지 안)</td><td class="nowrap"><button class="btn btn--sm" onclick="PF.fmt(null);PF.modal('listmodal')">작업 현황</button></td></tr>
          <tr><td><span class="badge badge--check">경고</span></td><td class="nowrap">2.2 1페이지</td><td>표 글자가 줄바꿈되어 칸 높이가 커졌어요</td><td class="nowrap"><button class="btn btn--sm" onclick="PF.fmt(null)">그 자리로</button></td></tr>
          <tr><td><span class="badge badge--check">경고</span></td><td class="nowrap">5.1 2페이지</td><td>소제목이 두 줄이 되었어요</td><td class="nowrap"><button class="btn btn--sm" onclick="PF.fmt(null)">그 자리로</button></td></tr></table></div>
        <p class="muted" style="font-size:13px;margin:8px 0 0">이 결과는 알림 탭과 검사 결과에도 남아요.</p>
        <div class="acts" style="display:flex;align-items:center;gap:8px;justify-content:space-between;margin-top:14px"><button class="btn btn--ghost" onclick="PF.fmt(null);PF.toast('적용 전 서식으로 되돌렸어요.')"><i data-lucide="undo-2"></i>적용 전으로 되돌리기</button><button class="btn btn--primary" onclick="PF.fmt(null)">확인</button></div>`;
    } else if (step === 'running') {
      body = `<h3 id="fmt-t">서식을 적용하고 있어요</h3><p class="muted" style="margin:0 0 12px">모든 페이지를 다시 그리고 넘침과 분량을 검사해요.</p><div class="bar"><i style="width:65%"></i></div><p class="now" style="margin:10px 0 0"><i data-lucide="loader"></i>29 / 44페이지를 다시 그리고 있어요</p>
        <p class="muted" style="font-size:13px;margin:12px 0 0">(프로토타입) <a href="#" onclick="PF.fmt('result');return false">적용 끝 (검사 결과)</a></p>`;
    }
    bg.innerHTML = `<div class="modal app-modal" role="dialog" aria-modal="true" aria-labelledby="fmt-t" style="max-width:${step === 'edit' ? 680 : 620}px"><button class="x" aria-label="닫기" onclick="PF.fmt(null)"><i data-lucide="x"></i></button>${body}</div>`;
    bg.classList.add('show'); PF.icons();
    if (step === 'edit') {
      const pv = $('#fmt-pv'), warn = $('#fmt-warn');
      const upd = (ev) => {
        // 글꼴을 바꾸면 그 글꼴에 있는 두께만 남긴다 (없는 두께는 가짜 굵기로 그려져 PDF 와 달라짐)
        if (ev && ev.target.dataset.p === 'font') {
          const k = ev.target.dataset.k, ws = THEME.weights[ev.target.value] || [400, 700], wsel = bg.querySelector(`select[data-k="${k}"][data-p="w"]`);
          const cur = parseInt(wsel.value); wsel.innerHTML = ws.map(w => `<option value="${w}"${w === cur ? ' selected' : ''}>${FMT_W[w]}</option>`).join('');
          if (!ws.includes(cur)) wsel.value = ws.reduce((a, b) => Math.abs(b - cur) < Math.abs(a - cur) ? b : a);
        }
        bg.querySelectorAll('select[data-k]').forEach(sel => {
          const el = pv.querySelector(`[data-r="${sel.dataset.k}"]`); if (!el) return;
          if (sel.dataset.p === 'font') el.style.fontFamily = famOf(sel.value);
          if (sel.dataset.p === 'size') el.style.fontSize = (parseFloat(sel.value) * 1.333) + 'px';
          if (sel.dataset.p === 'w') el.style.fontWeight = sel.value;
        });
        warn.hidden = parseFloat(bg.querySelector('select[data-k="body"][data-p="size"]').value) >= 11;
      };
      bg.querySelectorAll('select[data-k]').forEach(sel => sel.onchange = upd); upd();
    }
  };
  // 적용: 준비 단계(초안 전)는 값만 정하고 닫음. 작업창은 전체 페이지 다시 그리기 → 검사 결과
  PF.fmtApply = () => {
    const b = document.querySelector('#fmtm select[data-k="body"][data-p="size"]'); PF.fmtBody = b ? parseFloat(b.value) : 11;
    if (PF.fmtCtx === 'pre') { PF.fmt(null); PF.toast('서식을 정했어요. 초안을 이 서식으로 써요.'); return; }
    PF.fmt('running');
  };
  PF.tocApply = () => {
    PF.tocUp(null);
    const f = document.querySelector('#drw iframe');
    if (f && /UW06/.test(f.getAttribute('src'))) f.setAttribute('src', 'UW06.html?embed=1&state=applied');
    else if (document.body.dataset.screen === 'UW06') { location.href = 'UW06.html?state=applied'; return; }
    PF.toast('목차를 바꿨어요. 미배정 요구사항 3건이 있어요.');
  };
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && window.PF.drawer) PF.drawer(null); });

  // 편집기 머리(왼쪽 위 사업명 ▾)와 아래 바(단계, 검사, PDF 출력) (2026-11-15)
  PF.editorBars = (P, stage) => {
    const qs2 = new URLSearchParams(location.search), st2 = qs2.get('state') || 'default', ed = document.body.dataset.screen === 'UW08';
    const hd = $('#projhd');
    if (hd) {
      // 사업명 한 줄 (넘치면 말줄임, 전체 이름은 title 로). 발주처, D-day, 업체는 사업 정보에서 본다 (2026-11-15)
      hd.innerHTML = `<button class="pj" type="button" aria-haspopup="menu" aria-expanded="false" onclick="PF.pjm()" title="${esc(P.name || '')}"><b>${esc(P.name || '')}</b><i data-lucide="chevron-down"></i></button>
        <div class="pjmenu" role="menu">
          <a href="UW01.html" role="menuitem"><i data-lucide="arrow-left"></i>작업 목록으로</a>
          <button type="button" role="menuitem" onclick="PF.pjm(false);PF.drawer('info')"><i data-lucide="info"></i>사업 정보</button>
          <button type="button" role="menuitem" onclick="PF.pjm(false);PF.modal('listmodal')"><i data-lucide="list-checks"></i>작업 현황 보기</button>
          <button type="button" role="menuitem" onclick="PF.pjm(false);PF.fmt('edit','editor')"><i data-lucide="type"></i>문서 서식</button><hr>
          <button type="button" role="menuitem"><i data-lucide="pencil"></i>정보 수정</button>
          <button type="button" role="menuitem"><i data-lucide="send"></i>제출 완료로 바꾸기</button>
          <button type="button" role="menuitem"><i data-lucide="circle-slash"></i>중단</button></div>`;
      PF.pjm = (on) => { const v = on === undefined ? !hd.classList.contains('open') : on; hd.classList.toggle('open', v); $('.pj', hd).setAttribute('aria-expanded', v); };
      document.addEventListener('click', e => { if (!e.target.closest('#projhd')) PF.pjm(false); });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') PF.pjm(false); });
      if (st2 === 'pjmenu') PF.pjm(true);
    }
    const dk = $('#dock');
    if (dk) {
      // 아래 바 (2026-11-15): 페이지 작업 4개. 단계 표시는 없앰. 검사는 세로 유틸바 「검사 결과」 안의 「전체 검사」로, PDF 출력은 도구줄 오른쪽으로
      // 작업 알림 (2026-11-15): 아래 바 안 칩이 아니라 아래 바 바로 위 가운데에 뜨는 알림창. 오른쪽 위 닫기(X)
      //   [퍼블리싱] 긴 작업(초안 작성, 검사 등)의 진행, 끝남을 알린다. 진행 중은 닫아도 작업은 계속되고, 끝나면 다시 뜬다. 끝남 알림은 닫을 때까지 남는다
      const JOB = {
        drafting: ['<span class="badge badge--strong">진행 중</span>', '초안을 쓰고 있어요', '5 / 13절 · 약 11분 남음. 다 쓴 절부터 고칠 수 있어요.', '<div class="bar"><i style="width:38%"></i></div>', '<a class="btn btn--sm" href="UW03.html?state=draft">진행 보기</a>'],
        draftdone: ['<span class="badge badge--solid">완료</span>', '초안을 다 썼어요', '13절 모두 썼어요. 자료가 없는 3곳은 「보류」로 두고 업체 확인사항에 올렸어요.', '', '<button class="btn btn--sm btn--primary" onclick="PF.drawer(\'ask\');PF.jobX()">업체 확인사항 보기</button>'],
        jobdone: ['<span class="badge badge--solid">완료</span>', '검사가 끝났어요', '오류 4건, 경고 21건이 있어요.', '', '<button class="btn btn--sm btn--primary" onclick="PF.drawer(\'check\');PF.jobX()">결과 보기</button>']
      }[ed ? st2 : ''];
      if (JOB) { const cv = dk.parentElement, n = document.createElement('div'); n.className = 'jobnote'; n.id = 'jobnote'; n.setAttribute('role', 'status');
        n.innerHTML = `<button class="x" aria-label="알림 닫기" onclick="PF.jobX()"><i data-lucide="x"></i></button><div class="jt">${JOB[0]}<b>${JOB[1]}</b></div><p>${JOB[2]}</p>${JOB[3]}<div class="ja">${JOB[4]}</div>`;
        cv.appendChild(n); }
      PF.jobX = () => { const n = $('#jobnote'); if (n) n.remove(); };
      const chip = '';
      const dis = ed ? '' : ' disabled';
      dk.innerHTML = `${chip ? chip + '<span class="vsep"></span>' : ''}<button class="btn btn--sm btn--ghost"${dis}><i data-lucide="copy-plus"></i>페이지 추가</button><button class="btn btn--sm btn--ghost"${dis}><i data-lucide="scissors"></i>페이지 나누기</button><button class="btn btn--sm btn--ghost" onclick="PF.tab('L','tp')"${dis}><i data-lucide="layout-template"></i>템플릿 바꾸기</button><span class="vsep"></span><button class="btn btn--sm btn--primary" onclick="PF.tab('R','ai')"${dis}><i data-lucide="sparkles"></i>AI</button>`;
    }
  };

  const id = document.body.dataset.screen;
  if (!id) return; // 화면 목록(index)은 여기서 끝
  const s = scr(id); if (!s) return; // 백업 화면(_backup) 등 목록에 없는 화면
  const sys = SYSTEMS[s.sys];
  const st = qs.get('state') || 'default';
  const proxy = false;  // 대리 작업 기능 삭제 (2026-11-13)
  // 자료 창 안(iframe)에서 열린 화면: 안내 바, 머리글, 사업 바 없이 본문만
  const embed = qs.get('embed') === '1';
  if (embed) document.body.classList.add('embed');

  // ② 상단 안내 바 (프로토타입 전용)
  const g = document.createElement('div');
  g.className = 'guide';
  g.innerHTML = `<span class="gid">${esc(s.id)}</span><span class="gname">${esc(s.name)}</span>
    <span class="gsys">${esc(sys.tab)} ${esc(sys.name)}</span><span class="gtip"><button type="button" class="ginfo" aria-label="화면 설명 보기" aria-expanded="false"><i data-lucide="info"></i></button><span class="gdesc" role="tooltip">${esc(s.desc)}</span></span><span class="grow"></span>
    <span class="gbtn"><a class="btn btn--sm" href="index.html?tab=${sys.tab}"><i data-lucide="layout-list"></i>화면 목록</a>
    <button class="btn btn--sm btn--primary" onclick="PF.openFeature('${s.id}')"><i data-lucide="info"></i>기능설명</button></span>`;
  if (!embed) document.body.prepend(g);
  // 화면 설명 말풍선 (2026-11-16 디자인): i 아이콘을 누르면 열고, 다시 누르거나 바깥을 누르면 닫음
  const tip = g.querySelector('.gtip'), tipBtn = g.querySelector('.ginfo');
  if (tip && tipBtn) {
    tipBtn.addEventListener('click', e => { e.stopPropagation(); const o = tip.classList.toggle('open'); tipBtn.setAttribute('aria-expanded', o); });
    document.addEventListener('click', e => { if (!tip.contains(e.target)) { tip.classList.remove('open'); tipBtn.setAttribute('aria-expanded', 'false'); } });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { tip.classList.remove('open'); tipBtn.setAttribute('aria-expanded', 'false'); } });
  }

  // ③ 앱 머리글 (로그인 화면 제외)
  //   사업 밖 사용자 화면(s.side) = 좌측 영역 (D-086), 사업 안 화면과 관리자 = 상단 머리글
  const head = $('#apphead');
  if (embed && head) head.remove();
  // 작업창(UW08)과 그 위 준비 모달(UW03)은 전체 화면 편집기: 앱 머리글, 사업 바 없음 (2026-11-15)
  const editor = id === 'UW08' || id === 'UW03';
  if (editor && head) head.remove();
  const folder = { nofolder: '미연결', none: '미연결', perm: '권한 필요', unsupported: '지원 안 됨' }[st] || '연결됨';
  const q2 = new URLSearchParams(location.search);
  if (head && s.side && !embed) {
    const isList = id === 'UW01';
    const cur = isList ? (st === 'archive' ? 'archive' : st === 'folder' ? 'f1' : 'all') : '';
    const fl = (window.FOLDERS || []).map(f => {
      const n = PROJECTS.filter(p => p.f === f.id && !p.arc && p.st !== '중단').length;
      return `<a href="UW01.html?state=folder" class="${cur === f.id ? 'on' : ''}"><i data-lucide="folder"></i><span>${esc(f.name)}</span><small>${n}</small></a>`;
    }).join('');
    const nAll = PROJECTS.filter(p => !p.arc && p.st !== '중단').length, nArc = PROJECTS.length - nAll;
    head.outerHTML = `<aside class="side" aria-label="작업 목록 메뉴">
      <div class="acct-wrap"><button class="acct" type="button" aria-haspopup="menu" aria-expanded="false" onclick="PF.acct()">
        <span class="av">김</span><span class="who"><b>김○○ (더미)</b><small>sample01 · 업체 3곳</small></span><i data-lucide="chevron-down"></i></button>
        <div class="acct-menu" role="menu">
          ${proxy ? '<a href="AC01.html" role="menuitem"><i data-lucide="arrow-left"></i>관리자 화면으로</a><hr>' : ''}
          <a href="UC03.html" role="menuitem"><i data-lucide="building-2"></i>내 업체 정보</a>
          <a href="UC04.html" role="menuitem"><i data-lucide="settings"></i>설정 (내 계정)</a>
          <a href="#" role="menuitem" onclick="return false"><i data-lucide="life-buoy"></i>도움말</a><hr>
          <a href="UC01.html" role="menuitem"><i data-lucide="log-out"></i>로그아웃</a></div></div>
      <a class="fold-st" href="UC04.html">${PF.st(folder === '지원 안 됨' ? '확인 필요' : folder)}<span>작업 폴더</span></a>
      <label class="sch"><i data-lucide="search"></i><input placeholder="사업명, 발주처 검색" aria-label="작업 검색" value="${st === 'nosearch' ? '위성 관제' : ''}"></label>
      <div class="snav"><h4>작업 목록</h4>
        <a href="UW01.html" class="${cur === 'all' ? 'on' : ''}"><i data-lucide="layout-grid"></i><span>전체</span><small>${nAll}</small></a>
        <a href="UW01.html?state=archive" class="${cur === 'archive' ? 'on' : ''}"><i data-lucide="archive"></i><span>보관함</span><small>${nArc}</small></a>
        ${fl}
        <a href="UW01.html?state=newfolder" class="add"><i data-lucide="plus"></i><span>새 폴더</span></a></div>
      <div class="brand"><i data-lucide="factory"></i>제안공방 <small>BETA</small></div></aside>`;
    const main = $('main');
    main.classList.add('main--side');
    const shell = document.createElement('div'); shell.className = 'shell';
    main.parentNode.insertBefore(shell, main);
    shell.appendChild($('.side')); shell.appendChild(main);
    PF.acct = (on) => { const w = $('.acct-wrap'); const v = on === undefined ? !w.classList.contains('open') : on; w.classList.toggle('open', v); $('.acct').setAttribute('aria-expanded', v); };
    document.addEventListener('click', e => { if (!e.target.closest('.acct-wrap')) PF.acct(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') PF.acct(false); });
    if (st === 'acctmenu') PF.acct(true);
  } else if (head && !embed) {
    const nav = sys.key === 'U'
      ? [['UW01', '작업 목록', 'layout-grid'], ['UC03', '내 업체 정보', 'building-2'], ['UC04', '내 계정', 'user']]
      : [['AC01', '업체 관리', 'building-2'], ['AC02', '계정 관리', 'key-round'], ['AW01', '사업 현황', 'gauge'], ['AL01', '자료실', 'library'], ['AK01', '지식 카드', 'book-marked']];
    const me = sys.key === 'U'
      ? `<a class="fold" href="UC04.html" title="PC 작업 폴더">${PF.st(folder === '지원 안 됨' ? '확인 필요' : folder)}<i data-lucide="folder"></i>작업 폴더</a>
         <span><i data-lucide="user"></i>김○○ (더미)</span> <a href="UC01.html"><i data-lucide="log-out"></i>로그아웃</a>`
      : `<a class="btn btn--sm" href="UW01.html" title="관리자 본인의 사용자 계정으로 사용자 웹을 엽니다"><i data-lucide="pen-line"></i>내 제안 작업</a> <span><i data-lucide="shield"></i>관리자 (마스터)</span> <a href="UC01.html"><i data-lucide="log-out"></i>로그아웃</a>`;
    head.outerHTML = `<header class="app-h"><span class="logo"><i data-lucide="factory"></i>제안공방<small>${sys.key === 'A' ? '관리자' : 'BETA'}</small></span>
      <nav>${nav.map(([k, l, ic]) => `<a href="${scr(k).file}" class="${s.menu === scr(k).menu ? 'on' : ''}"><i data-lucide="${ic}"></i>${l}</a>`).join('')}</nav>
      <span class="me">${me}</span></header>`;
  }


  // [정본 제작 시 제거] 자료 창 화면(UW04~07, UW09~11)을 단독으로 열 때 붙는 머리글, 사업 바, 「제안서 작성으로 돌아가기」는
  //   프로토타입 검토용이다. 실제 서비스에서는 자료 창(embed)으로만 열린다. 정본에서는 이 틀을 만들지 않는다 (2026-11-14)
  // 사업 안 화면: 위쪽 사업 바 (왼쪽 단계 목록 없음). 큰 단계 한 줄 + 제안서 작성 화면에서만 검사, PDF 출력
  if (s.proj && !embed) {
    const P = window.PROJ || {};
    const stage0 = id === 'UW03' ? (st === 'draft' ? 1 : 0) : (id === 'UW09' || id === 'UW11') ? 2 : 1;
    if (editor) { PF.editorBars(P, stage0); if (s.wide) $('main').classList.add('main--wide'); }
  }
  if (s.proj && !embed && !editor) {
    const P = window.PROJ || {};
    const stage = id === 'UW03' ? (st === 'draft' ? 1 : 0) : (id === 'UW09' || id === 'UW11') ? 2 : 1;
    const steps = STAGES.map((l, i) => `<span class="${i < stage ? 'done' : i === stage ? 'on' : ''}">${i < stage ? '<i data-lucide="check"></i>' : ''}${esc(l)}</span>`).join('<i data-lucide="chevron-right" class="sep"></i>');
    const act = id === 'UW08'
      ? `<button class="btn btn--sm" onclick="PF.drawer('check')"><i data-lucide="shield-check"></i>검사</button><button class="btn btn--sm btn--primary" onclick="PF.drawer('out')"><i data-lucide="file-output"></i>PDF 출력</button>`
      : id === 'UW03' ? '' : `<a class="btn btn--sm btn--primary" href="UW08.html${proxy ? '?proxy=1' : ''}"><i data-lucide="pen-line"></i>제안서 작성으로 돌아가기</a>`;
    const bar = document.createElement('div');
    bar.className = 'pbar';
    bar.innerHTML = `<a class="btn btn--sm btn--ghost" href="UW01.html${proxy ? '?proxy=1' : ''}" aria-label="작업 목록"><i data-lucide="arrow-left"></i></a>
      <b class="pn">${esc(P.name || '')}</b><span class="muted">${esc(P.org || '')}</span><span class="dday">${esc(P.dday || '')}</span>
      <span class="chip" title="이 사업의 작성 업체"><i data-lucide="building-2"></i>${esc(P.co || '샘플정보(주) (더미)')}</span>
      <span class="pstep" aria-label="진행 단계">${steps}</span><span class="grow"></span>${id === 'UW08' && st === 'drafting' ? `<a class="btn btn--sm jobdone" href="UW03.html?state=draft"><span class="badge badge--strong">진행 중</span>초안 작성 5 / 13절 · 약 11분 남음</a>` : ''}${id === 'UW08' && st === 'draftdone' ? `<span class="btn btn--sm jobdone"><span class="badge badge--solid">완료</span>초안을 다 썼어요 · 보류 3건</span>` : ''}${id === 'UW08' && st === 'jobdone' ? `<button class="btn btn--sm jobdone" onclick="PF.drawer('check')"><span class="badge badge--solid">완료</span>검사가 끝났어요 · 결과 보기</button>` : ''}${act}`;
    const main = $('main');
    main.prepend(bar);
    if (s.wide) main.classList.add('main--wide');
  }
  // 자료 창 안: 다른 자료 창 링크는 창 안에서, 그 밖의 화면 링크는 창 밖(전체)으로
  if (embed) {
    const pan = (window.PANELS || []).map(p => p[1]).concat('UW11');
    document.querySelectorAll('a[href]').forEach(a => {
      const h = a.getAttribute('href'); const m = h.match(/^(U[CWK]\d\d)\.html/); if (!m) return;
      if (pan.includes(m[1])) a.setAttribute('href', h + (h.includes('?') ? '&' : '?') + 'embed=1');
      else a.setAttribute('target', '_top');
    });
  }

  // ④ 화면 상태 전환: ?state=값 → data-state 가 그 값을 가진 블록만 보인다
  const blocks = document.querySelectorAll('[data-state]');
  let hit = false;
  blocks.forEach(b => { const on = b.dataset.state.split(' ').includes(st); b.classList.toggle('show', on); hit = hit || on; });
  if (!hit) blocks.forEach(b => b.classList.toggle('show', b.dataset.state.split(' ').includes('default')));
  const pt = [...document.querySelectorAll('template[data-pop]')].find(t => t.dataset.pop.split(' ').includes(st));
  if (pt) setTimeout(() => PF.pop(pt.innerHTML, pt.dataset.w), 0);
  if (qs.get('fx') === '1') PF.openFeature(id);
})();

// [퍼블리싱] 스크롤 막대 표시 (디자인 시안 2026-11-16): 마우스가 올라간 스크롤 영역에만 sb-on 을 붙여 가는 막대를 보인다
(() => {
  const on = new Set();
  const scrollable = el => el === document.documentElement ? el.scrollHeight > el.clientHeight + 1
    : el.scrollHeight > el.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(el).overflowY)
      || el.scrollWidth > el.clientWidth + 1 && /(auto|scroll)/.test(getComputedStyle(el).overflowX);
  const mark = t => {
    const now = new Set();
    for (let el = t; el && el.nodeType === 1; el = el.parentElement) if (scrollable(el)) now.add(el);
    on.forEach(el => { if (!now.has(el)) { el.classList.remove('sb-on'); on.delete(el); } });
    now.forEach(el => { if (!on.has(el)) { el.classList.add('sb-on'); on.add(el); } });
  };
  document.addEventListener('mouseover', e => mark(e.target), { passive: true });
  document.addEventListener('scroll', e => mark(e.target === document ? document.documentElement : e.target), { capture: true, passive: true });
  document.documentElement.addEventListener('mouseleave', () => { on.forEach(el => el.classList.remove('sb-on')); on.clear(); });
})();
