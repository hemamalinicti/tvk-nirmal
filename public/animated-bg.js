/**
 * TVK Animated Background System — 6-Layer Premium Visual Engine
 * Layer 1: Animated gradient (CSS-driven, in style.css)
 * Layer 2: Glowing blobs
 * Layer 3: Canvas particles with connections
 * Layer 4: Animated grid / dot pattern
 * Layer 5: Mouse-parallax floating orbs
 * Layer 6: Main site content (untouched)
 */

(function () {
  'use strict';

  function initAnimatedBg() {
    if (document.getElementById('tvk-animated-bg')) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;

    /* ── Background Container ── */
    const root = document.createElement('div');
    root.id = 'tvk-animated-bg';
    root.setAttribute('aria-hidden', 'true');
    root.style.cssText = [
      'position:fixed',
      'inset:0',
      'z-index:-1',
      'pointer-events:none',
      'overflow:hidden',
    ].join(';');
    document.body.prepend(root);

  /* ─────────────────────────────────────────────
     LAYER 2 — Glowing Blobs
  ───────────────────────────────────────────── */
  const blobsConfig = [
    { x:'10%',  y:'15%', size:'55vw', color:'rgba(198,21,27,0.22)',  dur:28, delay:0   },
    { x:'75%',  y:'60%', size:'45vw', color:'rgba(254,206,8,0.10)',  dur:35, delay:-8  },
    { x:'40%',  y:'80%', size:'40vw', color:'rgba(120,10,18,0.28)',  dur:22, delay:-4  },
    { x:'85%',  y:'10%', size:'35vw', color:'rgba(198,21,27,0.15)',  dur:40, delay:-15 },
    { x:'20%',  y:'50%', size:'30vw', color:'rgba(254,206,8,0.07)',  dur:32, delay:-20 },
  ];

  const blobLayer = document.createElement('div');
  blobLayer.style.cssText = 'position:absolute;inset:0;';

  blobsConfig.forEach((b, i) => {
    const an = 'tvkBlob' + i;
    const dx1 = ((Math.random()-0.5)*30).toFixed(1);
    const dy1 = ((Math.random()-0.5)*25).toFixed(1);
    const dx2 = ((Math.random()-0.5)*20).toFixed(1);
    const dy2 = ((Math.random()-0.5)*30).toFixed(1);
    const kf = document.createElement('style');
    kf.textContent = '@keyframes '+an+'{0%{transform:translate(0,0) scale(1)}33%{transform:translate('+dx1+'px,'+dy1+'px) scale(1.08)}66%{transform:translate('+dx2+'px,'+dy2+'px) scale(0.94)}100%{transform:translate(0,0) scale(1)}}';
    document.head.appendChild(kf);

    const blob = document.createElement('div');
    blob.style.cssText = [
      'position:absolute',
      'left:'+b.x,
      'top:'+b.y,
      'width:'+b.size,
      'height:'+b.size,
      'background:radial-gradient(circle at 40% 40%,'+b.color+',transparent 65%)',
      'border-radius:50%',
      'filter:blur('+(isMobile?60:90)+'px)',
      'animation:'+(prefersReduced?'none':an+' '+b.dur+'s '+b.delay+'s ease-in-out infinite'),
      'will-change:transform',
    ].join(';');
    blobLayer.appendChild(blob);
  });
  root.appendChild(blobLayer);

  /* ─────────────────────────────────────────────
     LAYER 3 — Canvas Particles
  ───────────────────────────────────────────── */
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
  root.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const COUNT = prefersReduced ? 0 : isMobile ? 15 : 30;
  let particles = [];
  let W, H;

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  const COLS = ['rgba(254,206,8,VAL)','rgba(255,255,255,VAL)','rgba(220,60,60,VAL)','rgba(255,180,50,VAL)'];

  function mkP() {
    return {
      x: Math.random()*W, y: Math.random()*H,
      r: Math.random()*1.8+0.4,
      vx: (Math.random()-0.5)*0.25, vy: -(Math.random()*0.35+0.08),
      alpha: Math.random()*0.55+0.15, fadeDir: Math.random()>0.5?1:-1,
      fadeSpeed: Math.random()*0.003+0.001,
      color: COLS[Math.floor(Math.random()*COLS.length)],
      phase: Math.random()*Math.PI*2,
    };
  }
  for (let i = 0; i < COUNT; i++) particles.push(mkP());

  let rafId, lastTime = 0;

  function animate(ts) {
    rafId = requestAnimationFrame(animate);
    if (prefersReduced || document.hidden) return;
    const dt = Math.min(ts - lastTime, 50); lastTime = ts;
    ctx.clearRect(0,0,W,H);

    // Connections
    const maxD = isMobile ? 80 : 130;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i+1; j < particles.length; j++) {
        const dx = particles[i].x-particles[j].x, dy = particles[i].y-particles[j].y;
        const d = Math.sqrt(dx*dx+dy*dy);
        if (d < maxD) {
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(254,206,8,'+(((1-d/maxD)*0.08).toFixed(3))+')';
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x,particles[i].y);
          ctx.lineTo(particles[j].x,particles[j].y);
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => {
      p.phase += 0.02;
      const tw = Math.sin(p.phase)*0.12;
      p.x += p.vx*(dt/16); p.y += p.vy*(dt/16);
      p.alpha += p.fadeDir*p.fadeSpeed;
      if (p.alpha > 0.7 || p.alpha < 0.05) p.fadeDir *= -1;
      if (p.y < -10) { p.y = H+10; p.x = Math.random()*W; }
      if (p.x < -10) p.x = W+10;
      if (p.x > W+10) p.x = -10;

      const a = Math.max(0, Math.min(1, p.alpha+tw));
      const col = p.color.replace('VAL', a.toFixed(3));
      ctx.shadowBlur = p.r*6; ctx.shadowColor = col;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = col; ctx.fill();
    });
    ctx.shadowBlur = 0;
  }
  requestAnimationFrame(animate);

  /* ─────────────────────────────────────────────
     LAYER 4 — Animated Grid
  ───────────────────────────────────────────── */
  const gridWrap = document.createElement('div');
  gridWrap.style.cssText = 'position:absolute;inset:0;animation:tvkGridPan 120s linear infinite;';
  gridWrap.innerHTML = '<svg style="position:absolute;inset:0;width:100%;height:100%;opacity:0.035;" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="tvkg" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0L0 0 0 60" fill="none" stroke="rgba(254,206,8,1)" stroke-width="0.5"/></pattern><pattern id="tvkd" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse"><circle cx="0" cy="0" r="1" fill="rgba(254,206,8,0.7)"/><circle cx="60" cy="0" r="1" fill="rgba(254,206,8,0.7)"/><circle cx="0" cy="60" r="1" fill="rgba(254,206,8,0.7)"/><circle cx="60" cy="60" r="1" fill="rgba(254,206,8,0.7)"/></pattern></defs><rect width="100%" height="100%" fill="url(#tvkg)"/><rect width="100%" height="100%" fill="url(#tvkd)"/></svg>';
  root.appendChild(gridWrap);

  const sysKf = document.createElement('style');
  sysKf.textContent = `
    @keyframes tvkGridPan{0%{transform:translate(0,0)}100%{transform:translate(60px,60px)}}

    /* ── Glassmorphism Cards ── */
    .news-card,.service-card,.ideology-card,.hero-stat{
      backdrop-filter:blur(12px) saturate(1.4);
      -webkit-backdrop-filter:blur(12px) saturate(1.4);
      background:rgba(255,255,255,0.04)!important;
      border:1px solid rgba(255,255,255,0.08)!important;
      transition:transform .35s cubic-bezier(.34,1.56,.64,1),box-shadow .35s ease,border-color .35s ease!important;
    }
    .news-card:hover,.service-card:hover,.ideology-card:hover{
      transform:translateY(-8px) scale(1.012);
      box-shadow:0 20px 60px rgba(198,21,27,.25),0 0 0 1px rgba(254,206,8,.18)!important;
      border-color:rgba(254,206,8,.22)!important;
    }

    /* ── Button Hover Glow ── */
    .btn-primary,.btn-cta,.news-read-more,button[class*=btn]{
      position:relative;overflow:hidden;
      transition:transform .25s cubic-bezier(.34,1.56,.64,1),box-shadow .25s ease!important;
    }
    .btn-primary:hover,.btn-cta:hover,.news-read-more:hover{
      transform:translateY(-2px) scale(1.04);
      box-shadow:0 8px 30px rgba(198,21,27,.4)!important;
    }
    .btn-primary:active,.btn-cta:active,.news-read-more:active{transform:scale(.97)}

    /* ── Image Hover ── */
    .news-image-wrapper img,.mla-portrait-img,.hero-party-img{
      transition:transform .45s cubic-bezier(.34,1.56,.64,1),filter .45s ease!important;
    }
    .news-card:hover .news-image-wrapper img{transform:scale(1.06);filter:brightness(1.08) saturate(1.1)}
    .mla-portrait-wrap:hover .mla-portrait-img{transform:scale(1.03);filter:brightness(1.05)}

    /* ── Nav link animated underline ── */
    .nav-link{position:relative}
    .nav-link::after{content:'';position:absolute;bottom:-3px;left:0;width:0;height:2px;
      background:var(--gold,#FECE08);border-radius:99px;
      transition:width .3s cubic-bezier(.34,1.56,.64,1)}
    .nav-link:hover::after,.nav-link.active::after{width:100%}

    /* ── Section entrance ── */
    [data-reveal]{opacity:0;transform:translateY(16px);
      transition:opacity .2s ease-out,transform .2s ease-out}
    [data-reveal].active,.hero [data-reveal],.hero-content,.hero-visual{opacity:1!important;transform:none!important}

    /* ── Shimmer stat numbers ── */
    .hero-stat-num,.stat-number{
      background:linear-gradient(90deg,#fff 0%,#FECE08 40%,#fff 80%);
      background-size:200% 100%;
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
      animation:tvkShimmer 4s linear infinite;
    }
    @keyframes tvkShimmer{0%{background-position:100% 50%}100%{background-position:-100% 50%}}

    /* ── Portrait glow ring ── */
    .mla-portrait-frame{position:relative}
    .mla-portrait-frame::before{
      content:'';position:absolute;inset:-4px;border-radius:inherit;
      background:conic-gradient(from 0deg,transparent 60%,rgba(254,206,8,.55),transparent 80%);
      animation:tvkSpinGlow 6s linear infinite;z-index:-1;
    }
    @keyframes tvkSpinGlow{to{transform:rotate(360deg)}}

    /* ── Float badges ── */
    .hero-stat,[class*=badge]{animation:tvkFloat 4s ease-in-out infinite}
    @keyframes tvkFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}

    /* ── Mobile reductions ── */
    @media(max-width:768px){
      .news-card:hover,.service-card:hover{transform:translateY(-4px) scale(1.005)}
      .mla-portrait-frame::before{display:none}
      @keyframes tvkFloat{0%,100%{transform:none}}
    }
    /* ── Reduced motion ── */
    @media(prefers-reduced-motion:reduce){
      *,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}
      #tvk-animated-bg{display:none}
    }
  `;
  document.head.appendChild(sysKf);

  /* ─────────────────────────────────────────────
     LAYER 5 — Mouse Parallax Orbs (desktop only)
  ───────────────────────────────────────────── */
  if (!isMobile && !prefersReduced) {
    const pLayer = document.createElement('div');
    pLayer.style.cssText = 'position:absolute;inset:0;';

    const orbsCfg = [
      {size:180,x:20, y:30, depth:.04, color:'rgba(198,21,27,.18)'},
      {size:120,x:75, y:20, depth:.07, color:'rgba(254,206,8,.13)'},
      {size:90, x:55, y:70, depth:.10, color:'rgba(255,120,40,.10)'},
      {size:60, x:85, y:80, depth:.14, color:'rgba(254,206,8,.18)'},
      {size:140,x:5,  y:65, depth:.05, color:'rgba(120,8,20,.20)' },
    ];

    const orbs = orbsCfg.map(od => {
      const el = document.createElement('div');
      el.style.cssText = [
        'position:absolute', 'left:'+od.x+'%', 'top:'+od.y+'%',
        'width:'+od.size+'px', 'height:'+od.size+'px',
        'background:radial-gradient(circle at 40% 35%,'+od.color+',transparent 70%)',
        'border-radius:50%', 'filter:blur(40px)', 'will-change:transform',
        'transition:transform .15s cubic-bezier(.25,.46,.45,.94)',
      ].join(';');
      pLayer.appendChild(el);
      return {el, depth: od.depth};
    });
    root.appendChild(pLayer);

    let mx = W/2, my = H/2, cx = mx, cy = my;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    function pTick() {
      cx += (mx-cx)*.06; cy += (my-cy)*.06;
      const ox = cx - window.innerWidth/2, oy = cy - window.innerHeight/2;
      orbs.forEach(({el,depth}) => { el.style.transform = 'translate('+ox*depth+'px,'+oy*depth+'px)'; });
      requestAnimationFrame(pTick);
    }
    pTick();
  }

  /* ─────────────────────────────────────────────
     Scroll-reveal observer
  ───────────────────────────────────────────── */
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('active');
        obs.unobserve(e.target);
      }
    });
  }, {threshold:.05, rootMargin:'0px 0px -20px 0px'});
  document.querySelectorAll('[data-reveal]').forEach(el => obs.observe(el));

  /* ─────────────────────────────────────────────
     Pause canvas when tab hidden
  ───────────────────────────────────────────── */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(rafId); }
    else { lastTime = performance.now(); rafId = requestAnimationFrame(animate); }
  });

  /* ─────────────────────────────────────────────
     Button glow mouse tracking (Optimized)
  ───────────────────────────────────────────── */
  let moveScheduled = false;
  let cachedBtns = null;

  document.addEventListener('mousemove', e => {
    if (moveScheduled) return;
    moveScheduled = true;
    requestAnimationFrame(() => {
      moveScheduled = false;
      if (!cachedBtns || cachedBtns.length === 0) {
        cachedBtns = document.querySelectorAll('.btn-primary,.btn-cta,.news-read-more');
      }
      cachedBtns.forEach(btn => {
        const r = btn.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return;
        btn.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        btn.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
    });
  }, { passive: true });

  window.addEventListener('popstate', () => { cachedBtns = null; });
  window.refreshTvkGlowButtons = () => { cachedBtns = null; };

  console.log('%c✦ TVK AnimatedBG v1.0 (Optimized)', 'color:#FECE08;font-weight:bold;font-size:14px;');
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    requestAnimationFrame(initAnimatedBg);
  } else {
    window.addEventListener('DOMContentLoaded', () => requestAnimationFrame(initAnimatedBg), { once: true });
  }
})();
