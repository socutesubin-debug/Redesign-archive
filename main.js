/* ═══════════════════════════════════════════
   DOUZONE Hero — hero.js  (v2 · video bg)
═══════════════════════════════════════════ */

'use strict';

/* ── 1. Custom cursor ───────────────────── */
(function () {
  const dot  = Object.assign(document.createElement('div'), { className: 'cur-dot' });
  const ring = Object.assign(document.createElement('div'), { className: 'cur-ring' });
  document.body.append(dot, ring);

  let mx = -300, my = -300, rx = -300, ry = -300;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.cssText = `left:${mx}px;top:${my}px`;
  });

  (function raf() {
    rx += (mx - rx) * .12;
    ry += (my - ry) * .12;
    ring.style.cssText = `left:${rx}px;top:${ry}px`;
    requestAnimationFrame(raf);
  })();

  // 클릭 가능 요소 위 hover 상태
  document.addEventListener('mouseover', e => {
    if (e.target.closest('a, button')) document.body.classList.add('cur-hover');
    else document.body.classList.remove('cur-hover');
  });
})();


/* ── 2. Nav 스크롤 상태 ─────────────────── */
(function () {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const update = () => nav.classList.toggle('is-scrolled', scrollY > 30);
  window.addEventListener('scroll', update, { passive: true });
  update();
})();


/* ── 3. 햄버거 메뉴 토글 ───────────────── */
(function () {
  const btn = document.getElementById('menuBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    btn.classList.toggle('is-open', !expanded);
  });
})();


/* ── 4. 배경 비디오 ─────────────────────────
   · 로드 완료 시 fade-in (.is-loaded)
   · 재생/일시정지 토글 버튼
   · 모바일 절전 모드 대응: 자동재생 실패 시 조용히 처리
*/
(function () {
  const video = document.getElementById('bgVideo');
  const ctrl  = document.getElementById('videoCtrl');
  if (!video) return;

  /* 비디오 로드 완료 → fade-in */
  const onReady = () => video.classList.add('is-loaded');
  if (video.readyState >= 3) {           // HAVE_FUTURE_DATA
    onReady();
  } else {
    video.addEventListener('canplaythrough', onReady, { once: true });
    video.addEventListener('loadeddata',     onReady, { once: true });
  }

  /* 자동재생 실패 처리 (일부 브라우저 정책) */
  const playPromise = video.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      /* 자동재생 차단 → poster 이미지로 대체, 컨트롤 숨김 */
      if (ctrl) ctrl.style.display = 'none';
      onReady(); /* poster라도 fade-in */
    });
  }

  /* 재생 / 일시정지 토글 */
  if (ctrl) {
    ctrl.addEventListener('click', () => {
      if (video.paused) {
        video.play();
        ctrl.classList.remove('is-paused');
        ctrl.setAttribute('aria-label', '배경 영상 일시정지');
      } else {
        video.pause();
        ctrl.classList.add('is-paused');
        ctrl.setAttribute('aria-label', '배경 영상 재생');
      }
    });
  }

  /* Page Visibility API: 탭 비활성 시 비디오 일시정지 → 배터리/성능 절약 */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      video.pause();
    } else if (!ctrl?.classList.contains('is-paused')) {
      video.play().catch(() => {});
    }
  });
})();


/* ── 5. Canvas 퍼스펙티브 그리드 ───────── */
(function () {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    draw();
  }

  function draw() {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const vx = W * .5, vy = H * .44;   // 소실점

    /* 수평선 (하단으로 갈수록 넓어지는 원근감) */
    const rows = 16;
    for (let i = 0; i <= rows; i++) {
      const t    = i / rows;
      const y    = vy + (H - vy) * (t * t);
      const a    = .03 + (t * t) * .14;
      ctx.beginPath();
      ctx.moveTo(0, y); ctx.lineTo(W, y);
      ctx.strokeStyle = `rgba(100,175,255,${a})`;
      ctx.lineWidth = .7;
      ctx.stroke();
    }

    /* 수직선 (소실점으로 수렴) */
    const cols = 22;
    for (let i = 0; i <= cols; i++) {
      const x = (i / cols) * W;
      const a = .04 + Math.abs(i / cols - .5) * .12;
      ctx.beginPath();
      ctx.moveTo(vx, vy); ctx.lineTo(x, H);
      ctx.strokeStyle = `rgba(100,175,255,${a})`;
      ctx.lineWidth = .55;
      ctx.stroke();
    }

    /* 소실점 글로우 */
    const g = ctx.createRadialGradient(vx, vy, 0, vx, vy, 280);
    g.addColorStop(0, 'rgba(40,120,255,.1)');
    g.addColorStop(1, 'rgba(40,120,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 80);
  }, { passive: true });
  resize();
})();


/* ── 6. 히어로 타이틀 마이크로 인터랙션 ── */
(function () {

  /* hero__title 의 각 span 안에 .title-inner 래퍼 추가 */
  document.querySelectorAll('.hero__title .js-fade').forEach(function (span) {
    const text = span.innerHTML;
    span.innerHTML = '<span class="title-inner">' + text + '</span>';
  });

  /* 딜레이 후 is-visible 추가 → CSS가 위로 올라오는 애니메이션 실행 */
  document.querySelectorAll('.js-fade').forEach(function (el) {
    const delay = parseInt(el.dataset.delay, 10) || 0;
    setTimeout(function () {
      el.classList.add('is-visible');
    }, 300 + delay);
  });

})();


/* ── 7. 스크롤 패럴랙스 ─────────────────── */
(function () {
  const hero    = document.getElementById('hero');
  const content = document.querySelector('.hero__content');
  const canvas  = document.getElementById('heroCanvas');
  const lines   = document.querySelector('.hero__lines');

  if (!hero || !content) return;

  window.addEventListener('scroll', () => {
    const y = scrollY;
    const h = hero.offsetHeight;
    if (y > h) return;

    const p = y / h;  // 0 ~ 1

    /* 콘텐츠: 위로 올라가며 투명해짐 */
    content.style.transform = `translateY(${-p * 50}px)`;
    content.style.opacity   = String(1 - p * 1.8);

    /* 캔버스/라인: 살짝 느리게 */
    if (canvas) canvas.style.transform = `translateY(${-p * 30}px)`;
    if (lines)  lines.style.transform  = `translateY(${-p * 30}px)`;

    /* 비디오: 미세한 줌 아웃 효과 */
    const video = document.getElementById('bgVideo');
    if (video) video.style.transform = `scale(${1 + p * .06})`;

  }, { passive: true });
})();


/* ── 8. 통계 카운터 업 ──────────────────── */
(function () {
  const nums = document.querySelectorAll('.stat-num[data-to]');
  if (!nums.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      io.unobserve(entry.target);

      const el     = entry.target;
      const target = parseInt(el.dataset.to, 10);
      const suffix = el.dataset.suffix || '';
      const dur    = 1600;
      const t0     = performance.now();

      function tick(now) {
        const elapsed = now - t0;
        const t       = Math.min(elapsed / dur, 1);
        const ease    = 1 - Math.pow(1 - t, 3);   // ease-out-cubic
        const val     = Math.round(ease * target);

        el.textContent = val.toLocaleString('ko-KR') + suffix;
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: .7 });

  nums.forEach(n => io.observe(n));
})();


/* ── 9. 버튼 리플 효과 ─────────────────── */
(function () {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple {
      to { transform: scale(2.8); opacity: 0; }
    }
    .ripple-el {
      position: absolute;
      border-radius: 50%;
      background: rgba(255,255,255,.22);
      transform: scale(0);
      animation: ripple .6s ease-out forwards;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);

  document.querySelectorAll('.btn, .side-cta').forEach(btn => {
    btn.addEventListener('click', e => {
      const r  = btn.getBoundingClientRect();
      const sz = Math.max(r.width, r.height) * 2;
      const el = document.createElement('span');
      el.className  = 'ripple-el';
      el.style.cssText = `
        width:${sz}px; height:${sz}px;
        left:${e.clientX - r.left - sz / 2}px;
        top:${e.clientY - r.top  - sz / 2}px;
      `;
      btn.appendChild(el);
      setTimeout(() => el.remove(), 620);
    });
  });
})();


/* ── 10. 마우스 이동 → 씬 미세 틸트 ─────── */
(function () {
  const lines  = document.querySelector('.hero__lines');
  const canvas = document.getElementById('heroCanvas');
  let ticking  = false;

  document.addEventListener('mousemove', e => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const cx = innerWidth  / 2;
      const cy = innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;

      const t = `perspective(1200px) rotateX(${dy * -3}deg) rotateY(${dx * 3}deg)`;
      if (lines)  lines.style.transform  = t;
      if (canvas) canvas.style.transform = t;

      ticking = false;
    });
  });
})();

/* ══════════════════════════════════════════════════
   section2.js — 텍스트 스크롤 컬러 애니메이션

   📌 동작 원리 (왕초보용 설명)
   ───────────────────────────
   1. 텍스트를 단어 하나하나로 쪼갠다
   2. 사용자가 스크롤할 때마다 "지금 몇 번째 단어까지 지나쳤는지" 계산한다
   3. 지나친 단어는 회색 → 검정으로 색을 바꾼다
   4. 이 과정이 매우 빠르게 반복되면 → 부드러운 애니메이션처럼 보인다
══════════════════════════════════════════════════ */
/* ── STEP 1. 기존 span을 wordSpans 배열로 가져오기 ── */
const textEl   = document.getElementById('scrollText');
const wordSpans = Array.from(textEl.querySelectorAll('span'));

/* ── STEP 2. 스크롤 위치 계산 & 색상 업데이트 ── */
const aboutSection = document.querySelector('.section2');

function updateColors() {
  const rect = aboutSection.getBoundingClientRect();

  const progress = Math.max(0, Math.min(1,
    (-rect.top + window.innerHeight * 0.6) / (rect.height - window.innerHeight * 0.7)
  ));

  const totalWords  = wordSpans.length;
  const activeCount = progress * totalWords;

  wordSpans.forEach((span, index) => {
    const wordProgress = Math.max(0, Math.min(1, activeCount - index));
    const colorValue   = Math.round(210 - 200 * wordProgress);
    span.style.color   = `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
  });
}

/* ── STEP 3. 스크롤 이벤트 연결 ── */
window.addEventListener('scroll', updateColors, { passive: true });
updateColors();

/* =====================================================
   Section 3 — 카드 아래서 위로 진입 애니메이션
   ===================================================== */

(function () {
  const cards = document.querySelectorAll('.trust-card');
  if (!cards.length) return;

  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      /* 첫 번째 카드가 보이는 순간 전체를 순서대로 실행 */
      cards.forEach(function (card, index) {
        setTimeout(function () {
          card.classList.add('is-visible');
        }, index * 200);  /* 카드마다 150ms 간격 — 숫자 키울수록 느리게 */
      });

      io.unobserve(entry.target);
    });
  }, { threshold: 0.1 });

  /* 첫 번째 카드만 감시 */
  io.observe(cards[0]);
})();

/* =====================================================
   Section 4 — 진입 애니메이션
   ===================================================== */

(function () {
  const reveals = document.querySelectorAll('.client-section .js-reveal');
  if (!reveals.length) return;

  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      const el    = entry.target;
      const delay = parseInt(el.dataset.delay, 10) || 0;

      setTimeout(function () {
        el.classList.add('is-visible');
      }, delay);

      io.unobserve(el);
    });
  }, { threshold: 0.2 });

  reveals.forEach(function (el) {
    io.observe(el);
  });
})();





/* =====================================================
   Section 5 — 솔루션 카드 진입 애니메이션
   ===================================================== */

(function () {

  /* ── 헤더 진입 ── */
  const header = document.querySelector('.solution-section__header');
  if (header) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.3 });
    io.observe(header);
  }

  /* ── 카드 순차 진입 ── */
  const cards = document.querySelectorAll('.solution-card');
  if (!cards.length) return;

  const cardIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      const card  = entry.target;
      const index = parseInt(card.dataset.index, 10) || 0;

      /* 카드마다 120ms 간격으로 순차 등장 */
      setTimeout(function () {
        card.classList.add('is-visible');
      }, index * 120);

      cardIO.unobserve(card);
    });
  }, { threshold: 0.15 });

  cards.forEach(function (card) {
    cardIO.observe(card);
  });

})();

/* =====================================================
   Section 6 — 산업별 탭 전환 + 슬라이더
   ===================================================== */

// Section 6: 가로 스크롤 화살표 기능
const scrollArea = document.querySelector('.card-scroll-area');
const nextBtn = document.querySelector('.arrow-btn.next');
const prevBtn = document.querySelector('.arrow-btn.prev');

if (scrollArea && nextBtn && prevBtn) {
  // 오른쪽 화살표 클릭 (오른쪽으로 424px 만큼 이동)
  nextBtn.addEventListener('click', () => {
    scrollArea.scrollBy({ left: 424, behavior: 'smooth' });
  });

  // 왼쪽 화살표 클릭 (왼쪽으로 424px 만큼 이동)
  prevBtn.addEventListener('click', () => {
    scrollArea.scrollBy({ left: -424, behavior: 'smooth' });
  });
}

// 섹션이 화면에 보일 때 올라오는 효과
const observerOptions = {
  root: null,
  threshold: 0.1 // 섹션의 10%가 보일 때 실행
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
    }
  });
}, observerOptions);

// 감시 대상 설정
const section6 = document.querySelector('.section6');
if (section6) {
  observer.observe(section6);
}

/* =====================================================
   Section 7 — AX 플랫폼 스크롤리텔링 + 마우스 트래킹

   장면 구성:
   0~33%  → 장면1: 타이틀 + 구슬 중앙 크게
   33~66% → 장면2: 구슬 축소 + 말풍선
   66~100%→ 장면3: 구슬 확대 + 인용구
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const track = document.querySelector(".sec7-scroll-track");
  const stickyFrame = document.querySelector(".sec7-sticky-frame");
  
  if (!track || !stickyFrame) return;

  // ==========================================
  // 1. 스크롤 시네마틱 & 피날레 제어
  // ==========================================
  window.addEventListener("scroll", () => {
    const trackTop = track.getBoundingClientRect().top;
    const trackHeight = track.offsetHeight - window.innerHeight;
    
    let progress = -trackTop / trackHeight;
    progress = Math.max(0, Math.min(1, progress)); 

    // 1-1. 기본 요소 제어 (코어 크기, 회전, 인트로)
    const coreScale = 3.5 - (progress * 1.7); 
    const coreRotate = progress * 90; 
    const introOpacity = progress < 0.2 ? 1 - (progress * 5) : 0;
    const introScale = 1 + (progress * 0.5); 

    // 1-2. 배경 파장 (Rings) 제어
    let ringsOpacity = 0;
    let ringsScale = 0.8;
    if (progress > 0.1) {
      ringsOpacity = Math.min(1, (progress - 0.1) * 3); 
      ringsScale = 0.8 + (progress * 0.4); 
    }

    // 1-3. 프롬프트 버블 순차 등장 (0.3 ~ 0.6 구간)
    let p1Op = 0, p1Y = 100;
    let p2Op = 0, p2Y = 100;
    let p3Op = 0, p3Y = 100;

    if (progress > 0.3) {
      const b1 = Math.min(1, (progress - 0.3) / 0.2); 
      p1Op = b1; p1Y = 100 - (b1 * 100);
    }
    if (progress > 0.38) {
      const b2 = Math.min(1, (progress - 0.38) / 0.2);
      p2Op = b2; p2Y = 100 - (b2 * 100);
    }
    if (progress > 0.46) {
      const b3 = Math.min(1, (progress - 0.46) / 0.2);
      p3Op = b3; p3Y = 100 - (b3 * 100);
    }

    // 🌟 1-4. 기존 요소 전체 소멸 (0.6 구간부터 빠르게 소멸)
    let mainContentOpacity = 1;
    if (progress > 0.6) {
      mainContentOpacity = Math.max(0, 1 - (progress - 0.6) / 0.15);
    }

    // 🌟 1-5. 피날레 타이포 & CTA 버튼 등장 (여운 유지 로직)
    let finaleOpacity = 0;
    let finaleBlur = 10;
    let finalePointer = "none"; 

    // 0.7 지점부터 등장 시작 -> 0.85 지점에서 완성(1.0)
    // 0.85 ~ 1.0 구간(전체 트랙의 15%) 동안은 완성된 채로 화면이 정지된 듯한 효과를 줌
    if (progress > 0.7) {
      const fProg = Math.min(1, (progress - 0.7) / 0.15); 
      
      finaleOpacity = fProg;
      finaleBlur = 15 - (fProg * 15);
      
      if (fProg > 0.2) {
        finalePointer = "auto";
      }
    }

    // --- CSS 변수 업데이트 ---
    stickyFrame.style.setProperty("--core-scale", coreScale);
    stickyFrame.style.setProperty("--core-rotate", `${coreRotate}deg`);
    stickyFrame.style.setProperty("--intro-opacity", introOpacity);
    stickyFrame.style.setProperty("--intro-scale", introScale);
    stickyFrame.style.setProperty("--rings-opacity", ringsOpacity);
    stickyFrame.style.setProperty("--rings-scale", ringsScale);
    
    stickyFrame.style.setProperty("--p1-op", p1Op * mainContentOpacity);
    stickyFrame.style.setProperty("--p1-y", `${p1Y}px`);
    stickyFrame.style.setProperty("--p2-op", p2Op * mainContentOpacity);
    stickyFrame.style.setProperty("--p2-y", `${p2Y}px`);
    stickyFrame.style.setProperty("--p3-op", p3Op * mainContentOpacity);
    stickyFrame.style.setProperty("--p3-y", `${p3Y}px`);

    stickyFrame.style.setProperty("--main-content-opacity", mainContentOpacity);
    stickyFrame.style.setProperty("--finale-opacity", finaleOpacity);
    stickyFrame.style.setProperty("--finale-blur", `${finaleBlur}px`);
    stickyFrame.style.setProperty("--finale-pointer", finalePointer);
  });

  // ==========================================
  // 2. 살아있는 구슬 (마우스 트래킹)
  // ==========================================
  stickyFrame.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2; 
    const y = (e.clientY / window.innerHeight - 0.5) * 2; 
    
    stickyFrame.style.setProperty("--mouse-x", `${x * 130}px`);
    stickyFrame.style.setProperty("--mouse-y", `${y * 130}px`);
    stickyFrame.style.setProperty("--mouse-x-ring", `${x * 30}px`);
    stickyFrame.style.setProperty("--mouse-y-ring", `${y * 30}px`);
  });
  
  stickyFrame.addEventListener("mouseleave", () => {
    ["--mouse-x", "--mouse-y", "--mouse-x-ring", "--mouse-y-ring"].forEach(prop => {
      stickyFrame.style.setProperty(prop, "0px");
    });
  });

  // ==========================================
  // 3. Section 8 (미디어룸) Reveal 효과
  // ==========================================
  const revealElements = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (entry.target.classList.contains('news-item')) {
          const index = Array.from(entry.target.parentNode.children).indexOf(entry.target);
          setTimeout(() => {
            entry.target.classList.add("active");
          }, index * 150);
        } else {
          entry.target.classList.add("active");
        }
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach((el) => revealObserver.observe(el));
});


// ==========================================
// BACK TO TOP 기능
// ==========================================
(function () {
  const backToTopBtn = document.getElementById('backToTop');
  if (!backToTopBtn) return;

  // 🌟 1. 버튼 클릭 시 최상단(Hero)으로 부드럽게 이동
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // 👈 부드러운 스크롤 핵심 속성
    });
  });

  // 🌟 2. 스크롤 위치 감지 → 버튼 표시/숨김 제어
  const toggleBackToTop = () => {
    // 현재 스크롤 위치가 브라우저 높이(1svh)보다 많이 내려왔을 때만 표시
    if (window.scrollY > window.innerHeight * 0.8) {
      backToTopBtn.classList.add('is-visible');
    } else {
      backToTopBtn.classList.remove('is-visible');
    }
  };

  // 스크롤 이벤트에 최적화(쓰로틀링)를 적용하여 성능 저하 방지
  let isScrolling;
  window.addEventListener('scroll', () => {
    window.clearTimeout(isScrolling);
    isScrolling = setTimeout(toggleBackToTop, 50); // 50ms마다 체크
  }, { passive: true });

  // 페이지 로드 시 초기 상태 체크
  toggleBackToTop();
})();
