/* Portafolio Sara Rocha - interacciones y animaciones (JS puro) */
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Page transition ---------- */
  const curtain = document.querySelector('.curtain');
  addEventListener('pageshow', e => { if (e.persisted && curtain) curtain.classList.remove('down'); });
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href$=".html"]');
    if (!a || !curtain || reduce || e.metaKey || e.ctrlKey || a.target === '_blank') return;
    e.preventDefault();
    curtain.className = 'curtain down';
    setTimeout(() => { location.href = a.href; }, 650);
  });

  /* ---------- Nav: mobile toggle ---------- */
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav__toggle');
  toggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); }
  });

  /* ---------- Split hero titles into animated letters ---------- */
  document.querySelectorAll('[data-split]').forEach(el => {
    let i = 0;
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(word => {
            if (!word) return;
            if (/^\s+$/.test(word)) { frag.append(word); return; }
            const wd = document.createElement('span');
            wd.className = 'wd';
            [...word].forEach(c => {
              const ch = document.createElement('span');
              ch.className = 'ch';
              ch.textContent = c;
              ch.style.setProperty('--d', `${0.25 + i++ * 0.035}s`);
              wd.append(ch);
            });
            frag.append(wd);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    walk(el);
    el.querySelectorAll('.wd').forEach(w => w.setAttribute('aria-hidden', 'true'));
    el.classList.add('split-chars');
  });

  /* ---------- Typewriter: el nombre se escribe solo ---------- */
  document.querySelectorAll('[data-type]').forEach(el => {
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    const chars = [];
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 1) return walk(n);
      const frag = document.createDocumentFragment();
      [...n.textContent].forEach(c => {
        const s = document.createElement('span');
        s.className = 'tc';
        s.textContent = c;
        s.setAttribute('aria-hidden', 'true');
        chars.push(s);
        frag.append(s);
      });
      n.replaceWith(frag);
    });
    walk(el);
    const caret = document.createElement('span');
    caret.className = 'caret';
    caret.setAttribute('aria-hidden', 'true');
    if (reduce) { chars.forEach(c => c.classList.add('on')); el.append(caret); return; }
    chars[0].before(caret);
    let i = 0;
    const type = () => {
      const c = chars[i++];
      c.classList.add('on');
      c.after(caret);
      if (i < chars.length) setTimeout(type, c.textContent === ' ' ? 220 : 90 + Math.random() * 90);
    };
    setTimeout(type, 900); // espera a que se levante la cortina
  });

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal, .timeline').forEach((el, i) => {
    if (el.dataset.delay) el.style.setProperty('--d', el.dataset.delay + 's');
    io.observe(el);
  });

  /* ---------- Word-by-word lighting text ---------- */
  const rt = document.querySelector('.reveal-text');
  if (rt) {
    const parts = rt.textContent.trim().split(/\s+/);
    rt.textContent = '';
    parts.forEach((w, i) => {
      const s = document.createElement('span');
      s.className = 'w';
      s.textContent = w;
      rt.append(s, i < parts.length - 1 ? ' ' : '');
    });
    const words = rt.querySelectorAll('.w');
    const light = () => {
      const r = rt.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35)));
      const n = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('on', i < n));
    };
    addEventListener('scroll', light, { passive: true });
    light();
  }

  /* ---------- Duplicate marquee rows for seamless loop ---------- */
  document.querySelectorAll('.marquee__row, .band__row').forEach(row => {
    [...row.children].forEach(c => { const k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); row.append(k); });
  });
  document.querySelectorAll('.pill--off[data-w]').forEach(p => p.style.setProperty('--w', p.dataset.w + 'px'));

  /* ---------- Liquid water: animate SVG turbulence + cursor glow ---------- */
  const turb = document.querySelector('#water feTurbulence');
  if (turb && !reduce) {
    let t = 0;
    const flow = () => {
      t += 0.004;
      const fx = 0.006 + Math.sin(t) * 0.0018;
      const fy = 0.010 + Math.cos(t * 0.8) * 0.0024;
      turb.setAttribute('baseFrequency', `${fx.toFixed(5)} ${fy.toFixed(5)}`);
      requestAnimationFrame(flow);
    };
    flow();
  }
  const dark = document.querySelector('.wave');
  if (dark && !reduce) {
    dark.addEventListener('pointermove', e => {
      const r = dark.getBoundingClientRect();
      dark.style.setProperty('--mx', `${e.clientX - r.left}px`);
      dark.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  }

  /* ---------- Tilt on glass photos ---------- */
  if (!reduce) {
    document.querySelectorAll('.hero__ph, .photos .ph').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg) scale(1.04)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- Card spotlight ---------- */
  document.querySelectorAll('.card').forEach(c => {
    c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--cx', `${e.clientX - r.left}px`);
      c.style.setProperty('--cy', `${e.clientY - r.top}px`);
    });
  });

  /* ---------- Carousel arrows ---------- */
  document.querySelectorAll('.carousel').forEach(c => {
    const track = c.querySelector('.carousel__track');
    c.querySelectorAll('[data-dir]').forEach(b => b.addEventListener('click', () => {
      track.scrollBy({ left: Number(b.dataset.dir) * track.clientWidth * 0.66, behavior: reduce ? 'auto' : 'smooth' });
    }));
  });

  /* ---------- Contact form: validate and open mail client (no backend) ---------- */
  const form = document.querySelector('#contact-form');
  if (form) {
    const status = form.querySelector('.form__status');
    const rules = {
      name: v => v.length >= 2 && v.length <= 80 || 'Please enter your name.',
      email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && v.length <= 120 || 'Please enter a valid email.',
      message: v => v.length >= 10 && v.length <= 2000 || 'Message must be 10 to 2000 characters.'
    };
    form.addEventListener('submit', e => {
      e.preventDefault();
      let ok = true;
      Object.entries(rules).forEach(([k, test]) => {
        const input = form.elements[k];
        const res = test(input.value.trim());
        const err = input.parentElement.querySelector('.err');
        const bad = res !== true;
        input.setAttribute('aria-invalid', bad);
        err.textContent = bad ? res : '';
        if (bad && ok) { input.focus(); ok = false; }
      });
      if (!ok) { status.textContent = 'Please check the highlighted fields.'; return; }
      const to = form.dataset.to;
      const subject = encodeURIComponent(`Portfolio contact from ${form.elements.name.value.trim()}`);
      const body = encodeURIComponent(`${form.elements.message.value.trim()}\n\n${form.elements.name.value.trim()} - ${form.elements.email.value.trim()}`);
      status.textContent = 'Opening your email app...';
      location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    });
  }

  /* ---------- Mar en tiempo real (WebGL, sin librerias) ----------
     Olas por suma de ondas con crestas afiladas, reflejo del cielo (Fresnel) y ondas que siguen al mouse.
     Si el navegador no tiene WebGL, la seccion usa img/mar.gif. */
  const oceanCanvas = document.querySelector('.ocean__canvas');
  if (oceanCanvas) {
    const section = oceanCanvas.parentElement;
    const gl = oceanCanvas.getContext('webgl', { antialias: true, alpha: false });
    if (!gl) section.classList.add('no-gl');
    else {
      const vert = `attribute vec2 aPos; varying vec2 vUv;
        void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;
      const frag = `precision highp float;
        uniform float uTime; uniform vec2 uMouse; uniform float uAspect; varying vec2 vUv;
        const vec3 SUN = vec3(0.18, 0.32, -0.93);
        const vec3 CAM = vec3(0.0, 4.0, 0.0);

        // cielo que se refleja en el agua (+ sol)
        vec3 sky(vec3 d) {
          float y = max(d.y, 0.0);
          vec3 c = mix(vec3(0.55, 0.70, 0.86), vec3(0.08, 0.26, 0.55), pow(y, 0.45));
          float s = max(dot(d, normalize(SUN)), 0.0);
          return c + vec3(1.0, 0.93, 0.8) * (pow(s, 900.0) * 30.0 + pow(s, 12.0) * 0.18);
        }
        // rayo de la camara inclinada hacia el mar
        vec3 ray(vec2 uv) {
          vec2 s = (uv - 0.5) * vec2(uAspect, 1.0);
          float pitch = 0.72;
          vec3 fwd = vec3(0.0, -sin(pitch), -cos(pitch));
          vec3 up = vec3(0.0, cos(pitch), -sin(pitch));
          return normalize(fwd + vec3(s.x * 0.85, 0.0, 0.0) + up * s.y * 0.85);
        }
        vec2 hitPlane(vec3 rd) { return CAM.xz + rd.xz * (CAM.y / -rd.y); }

        // suma de olas con crestas afiladas: devuelve (altura, pendiente x, pendiente z)
        vec3 waves(vec2 p) {
          float a = 1.0, w = 0.32, ang = 0.4, h = 0.0, total = 0.0;
          vec2 g = vec2(0.0);
          for (int i = 0; i < 24; i++) {
            vec2 d = vec2(cos(ang), sin(ang));
            float x = dot(d, p) * w + uTime * sqrt(w) * 1.35;
            float s = exp(sin(x) - 1.0);
            float ds = s * cos(x);
            h += a * s; g += a * ds * w * d; total += a;
            p -= d * ds * a * 0.32; // las olas grandes arrastran a las chicas
            ang += 2.39996; a *= 0.8; w *= 1.18;
          }
          return vec3(h, g) / total;
        }

        void main() {
          vec3 rd = ray(vUv);
          vec2 p = hitPlane(rd);
          float dist = length(p - CAM.xz);
          vec3 wv = waves(p * 2.2);
          vec2 g = wv.yz;

          // ondas del mouse sobre la superficie
          if (uMouse.x > -1.0) {
            vec2 m = hitPlane(ray(uMouse));
            vec2 dv = p - m; float d = length(dv) + 1e-4;
            float k = 6.0, ph = k * d - uTime * 5.0;
            float env = exp(-d * 0.9);
            g += (dv / d) * cos(ph) * k * env * 0.06;
          }

          float detailFade = 1.0 / (1.0 + dist * 0.035);
          vec3 n = normalize(vec3(-g.x * 4.2 * detailFade, 1.0, -g.y * 4.2 * detailFade));
          vec3 r = reflect(rd, n);
          r.y = abs(r.y);
          float fres = 0.02 + 0.98 * pow(1.0 - max(dot(n, -rd), 0.0), 5.0);

          vec3 deep = vec3(0.01, 0.07, 0.16);
          vec3 scatter = vec3(0.03, 0.26, 0.38) * pow(wv.x, 2.0) * 0.8;
          vec3 water = (deep + scatter) * (0.75 + 0.25 * max(dot(n, normalize(SUN)), 0.0));
          vec3 col = mix(water, sky(r), fres);

          // neblina hacia el fondo
          col = mix(col, vec3(0.32, 0.50, 0.68), 1.0 - exp(-dist * 0.02));
          col = 1.0 - exp(-col * 1.5);
          gl_FragColor = vec4(col, 1.0);
        }`;
      const compile = (type, src) => { const sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh); return sh; };
      const prog = gl.createProgram();
      gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert));
      gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) section.classList.add('no-gl');
      else {
        gl.useProgram(prog);
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        const aPos = gl.getAttribLocation(prog, 'aPos');
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
        const uTime = gl.getUniformLocation(prog, 'uTime');
        const uMouse = gl.getUniformLocation(prog, 'uMouse');
        const uAspect = gl.getUniformLocation(prog, 'uAspect');
        const mouse = { x: -10, y: -10 };

        const resize = () => {
          const dpr = Math.min(devicePixelRatio || 1, 1.5);
          oceanCanvas.width = Math.round(oceanCanvas.clientWidth * dpr);
          oceanCanvas.height = Math.round(oceanCanvas.clientHeight * dpr);
          gl.viewport(0, 0, oceanCanvas.width, oceanCanvas.height);
          gl.uniform1f(uAspect, oceanCanvas.width / oceanCanvas.height);
        };
        new ResizeObserver(resize).observe(oceanCanvas);
        resize();

        section.addEventListener('pointermove', e => {
          const r = oceanCanvas.getBoundingClientRect();
          mouse.x = (e.clientX - r.left) / r.width;
          mouse.y = 1 - (e.clientY - r.top) / r.height;
        });
        section.addEventListener('pointerleave', () => { mouse.x = mouse.y = -10; });

        let visible = false, start = performance.now();
        const draw = now => {
          gl.uniform1f(uTime, (now - start) / 1000);
          gl.uniform2f(uMouse, mouse.x, mouse.y);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
          if (visible && !reduce) requestAnimationFrame(draw);
        };
        // solo anima cuando la seccion esta en pantalla
        new IntersectionObserver(([en]) => {
          const was = visible;
          visible = en.isIntersecting;
          if (visible && !was) requestAnimationFrame(draw);
        }).observe(section);
        draw(performance.now());
      }
    }
  }

  /* ---------- Gatito: click = miau ---------- */
  document.querySelectorAll('.cat').forEach(cat => cat.addEventListener('click', () => {
    cat.classList.add('is-meowing');
    clearTimeout(cat._t);
    cat._t = setTimeout(() => cat.classList.remove('is-meowing'), 1400);
  }));

  /* ---------- Parallax suave en las formas de vidrio ---------- */
  const shapes = [...document.querySelectorAll('.gshape[data-speed]')];
  if (shapes.length && !reduce) {
    let ticking = false;
    const move = () => {
      shapes.forEach(el => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        el.style.transform = `translate3d(0, ${(r.top * -Number(el.dataset.speed)).toFixed(1)}px, 0)`;
      });
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(move); } }, { passive: true });
    move();
  }

  /* ---------- Year in footer ---------- */
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
