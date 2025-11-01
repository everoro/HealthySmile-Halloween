//0. MÒDUL UI (controls DOM + preferències)// 

const UI = (function () {
  const LS_KEY = 'hs-ui-v2';
  const state = {
    threshold: 0.4,
    theme: 'purple',
    handlers: {},
    built: false
  };

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function save() {
    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({
          threshold: state.threshold,
          theme: state.theme
        })
      );
    } catch {}
  }

  function load() {
    try {
      const obj = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
      if (typeof obj.threshold === 'number') state.threshold = obj.threshold;
      if (typeof obj.theme === 'string') state.theme = obj.theme;
    } catch {}
  }

  function setBodyTheme(theme) {
    const body = document.body;
    body.classList.remove('theme-purple', 'theme-dark', 'theme-halloween');
    if (theme === 'dark') body.classList.add('theme-dark');
    else if (theme === 'halloween') body.classList.add('theme-purple', 'theme-halloween');
    else body.classList.add('theme-purple');
  }

  // fa sonar una vegada l’àudio perquè el navegador el “desbloquegi”
  function primeSfx() {
    const sfx = document.getElementById('brush-sfx');
    if (!sfx) return;
    sfx.volume = 0.65;
    if (sfx.paused) {
      sfx
        .play()
        .then(() => {
          sfx.pause();
          sfx.currentTime = 0;
        })
        .catch(() => {});
    }
  }

  function buildPanel() {
    if (state.built) return;

    let panelDom = document.querySelector('.controls');
    if (!panelDom) {
      panelDom = document.createElement('aside');
      panelDom.className = 'controls';
      panelDom.setAttribute('aria-label', 'Controls de l’aplicació');
      (document.getElementById('app-root') || document.body).appendChild(panelDom);
    }

    const panel = new p5.Element(panelDom);

    // botó principal: inicia càmera i efectes
    const btnStart = createButton('Començar');
    btnStart.parent(panel);
    btnStart.addClass('btn start');
    btnStart.id('btnStart');
    btnStart.attribute('type', 'button');
    btnStart.attribute('aria-label', 'Començar experiència amb la càmera');
    btnStart.mousePressed(() => {
      primeSfx();
      const music = document.getElementById('bg-music');
      if (music) {
        music.volume = 0.12;
        music.loop = true;
        music.play().catch(() => {});
      }
      state.handlers.start && state.handlers.start();
      save();
    });

    // reinicia l’experiència (neteja capes)
    const btnReset = createButton('Reiniciar');
    btnReset.parent(panel);
    btnReset.addClass('btn');
    btnReset.id('btnReset');
    btnReset.mousePressed(() => {
      state.handlers.reset && state.handlers.reset();
    });

    // foto del canvas
    const btnPhoto = createButton('Foto 📸');
    btnPhoto.parent(panel);
    btnPhoto.addClass('btn');
    btnPhoto.id('btnPhoto');
    btnPhoto.mousePressed(() => {
      state.handlers.photo && state.handlers.photo();
    });

    // llindar d’obertura
    const thrGroup = createElement('div');
    thrGroup.parent(panel);
    thrGroup.addClass('control-group');

    const thrLabel = createElement('label', 'Llindar obertura');
    thrLabel.parent(thrGroup);
    thrLabel.attribute('for', 'rng-threshold');

    const thrSlider = createSlider(0.1, 0.8, state.threshold, 0.01);
    thrSlider.parent(thrGroup);
    thrSlider.id('rng-threshold');
    thrSlider.attribute('aria-label', 'Llindar obertura');

    const thrValue = createElement('span', state.threshold.toFixed(2));
    thrValue.parent(thrGroup);
    thrValue.addClass('value');
    thrValue.id('rng-threshold-val');
    thrValue.attribute('aria-live', 'polite');

    thrSlider.input(() => {
      const v = clamp(thrSlider.value(), 0.1, 0.8);
      state.threshold = v;
      thrValue.html(v.toFixed(2));
      save();
    });

    // selector de tema
    const themeGroup = createElement('div');
    themeGroup.parent(panel);
    themeGroup.addClass('control-group');
    themeGroup.addClass('row');

    const themeLabel = createElement('label', 'Tema');
    themeLabel.parent(themeGroup);
    themeLabel.attribute('for', 'sel-theme');

    const sel = document.createElement('select');
    sel.id = 'sel-theme';
    sel.setAttribute('aria-label', 'Canvia el tema');

    [
      ['purple', 'Lila'],
      ['dark', 'Verd'],
      ['halloween', 'Halloween']
    ].forEach(([val, txt]) => {
      const opt = document.createElement('option');
      opt.value = val;
      opt.textContent = txt;
      if (val === state.theme) opt.selected = true;
      sel.appendChild(opt);
    });
    themeGroup.elt.appendChild(sel);

    sel.addEventListener('change', () => {
      state.theme = sel.value;
      setBodyTheme(state.theme);
      state.handlers.setTheme && state.handlers.setTheme(state.theme);
      save();
    });

    // activar/desactivar marc Halloween
    const frameGroup = createElement('div');
    frameGroup.parent(panel);
    frameGroup.addClass('control-group');
    frameGroup.addClass('row');

    const frameLabel = createElement('label', 'Marc Halloween');
    frameLabel.parent(frameGroup);
    frameLabel.attribute('for', 'chk-frame');

    const frameInput = document.createElement('input');
    frameInput.type = 'checkbox';
    frameInput.id = 'chk-frame';
    frameInput.checked = false;
    frameInput.addEventListener('change', () => {
      state.handlers.setWebFrame && state.handlers.setWebFrame(frameInput.checked);
    });
    frameGroup.elt.appendChild(frameInput);

    // música de fons
    const musicGroup = createElement('div');
    musicGroup.parent(panel);
    musicGroup.addClass('control-group');
    musicGroup.addClass('row');

    const musicLabel = createElement('label', 'Música ambient');
    musicLabel.parent(musicGroup);
    musicLabel.attribute('for', 'chk-music');

    const musicInput = document.createElement('input');
    musicInput.type = 'checkbox';
    musicInput.id = 'chk-music';
    musicInput.checked = true;
    musicInput.addEventListener('change', () => {
      const m = document.getElementById('bg-music');
      if (!m) return;
      if (musicInput.checked) m.play().catch(() => {});
      else m.pause();
    });
    musicGroup.elt.appendChild(musicInput);

    // aplicar tema guardat
    setBodyTheme(state.theme);
    state.handlers.setTheme && state.handlers.setTheme(state.theme);
    save();

    state.built = true;

    // accessibilitat: Enter també fa començar
    document.addEventListener('keydown', (ev) => {
      const ae = document.activeElement;
      if (ev.key === 'Enter' && (ae === document.body || ae === btnStart.elt)) {
        btnStart.elt.click();
      }
    });
  }

  return {
    init() {
      load();
      buildPanel();
    },
    bind(h) {
      state.handlers = { ...state.handlers, ...h };
    },
    setLoading(on) {
      const lo = document.getElementById('loading-overlay');
      if (!lo) return;
      lo.classList.toggle('hidden', !on);
      lo.setAttribute('aria-busy', String(on));
      lo.setAttribute('aria-hidden', String(!on));
    },
    getState() {
      return {
        threshold: state.threshold,
        theme: state.theme
      };
    },
    update(patch = {}) {
      if (typeof patch.threshold === 'number')
        state.threshold = clamp(patch.threshold, 0.1, 0.8);
      if (typeof patch.theme === 'string') {
        state.theme = patch.theme;
        setBodyTheme(state.theme);
      }
      save();
    }
  };
})();

// -----------------------------------------------------
// 1. VARIABLES GLOBALS
// -----------------------------------------------------
let cnv, video;
let CANVAS_W = 1920,
  CANVAS_H = 1080;

let brushP5 = null;           // so p5
let sfx = null;               // fallback <audio>

let showP5Frame = true;       // marc decoratiu

let faceMesh;
let faces = [];

let mouthOpenRatio = 0;
let mouthOpenSmooth = 0;
let mouthPoly = [];
let mouthGeom = null;

let grimeLayer, frameGrime, cleanMask;
let brushSize = 38;
let specksLarge = null;
let specksFine = null;
let canSeed = true;

let pointerX = 0,
  pointerY = 0,
  pointerDown = false;

let ghostParticles = [];
let spawnLocked = false;
let mouthOpenTime = 0;
let lastFrameTime = 0;

let prevMouthPoly = null;
let prevMouthGeom = null;
let scarPos = null;
let hatPos = null;
let wasCleaning = false; // controla si ja estàvem netejant

// -----------------------------------------------------
// 2. FUNCIONS GLOBALS QUE USA LA UI
// -----------------------------------------------------
window.resetExperience = function () {
  mouthOpenRatio = 0;
  mouthOpenSmooth = 0;
  grimeLayer?.clear();
  frameGrime?.clear();
  cleanMask?.clear();
  ghostParticles = [];
  spawnLocked = false;
  mouthOpenTime = 0;
  canSeed = true;
  if (sfx) {
    sfx.pause();
    sfx.currentTime = 0;
  }
  if (brushP5 && brushP5.isPlaying()) {
    brushP5.stop();
  }
};

window.takePhoto = function () {
  const th = (UI.getState?.().threshold ?? 0.4).toFixed(2);
  saveCanvas(`healthysmile-${Date.now()}-thr${th}.png`);
};

window.toggleWebFrame = function (on) {
  showP5Frame = on;
};

// -----------------------------------------------------
// 3. HELPERS
// -----------------------------------------------------
function computeResponsiveSize() {
  const holder = document.getElementById('canvas-holder');
  if (!holder) return { w: 1280, h: 720 };
  const rect = holder.getBoundingClientRect();
  const ratio = 16 / 9;
  let w = rect.width || window.innerWidth;
  let h = rect.height || w / ratio;
  if (w / h > ratio) w = h * ratio;
  else h = w / ratio;
  return { w: Math.max(360, w), h: Math.max(200, h) };
}

function updatePointer(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  const sx = CANVAS_W / rect.width;
  const sy = CANVAS_H / rect.height;
  pointerX = (e.clientX - rect.left) * sx;
  pointerY = (e.clientY - rect.top) * sy;
}

function smoothAlpha(base, mouthOpenRatio) {
  return constrain(base + 0.15 * mouthOpenRatio, 0.08, 0.5);
}
function lerpPoint(a, b, t) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}
function smoothPoly(newPoly, oldPoly, alpha) {
  if (!oldPoly || oldPoly.length !== newPoly.length) return newPoly.slice();
  const out = new Array(newPoly.length);
  for (let i = 0; i < newPoly.length; i++) out[i] = lerpPoint(oldPoly[i], newPoly[i], alpha);
  return out;
}
function smoothGeom(g, pg, alpha) {
  if (!pg) return g;
  return {
    cx: lerp(pg.cx, g.cx, alpha),
    cy: lerp(pg.cy, g.cy, alpha),
    w: lerp(pg.w, g.w, alpha),
    h: lerp(pg.h, g.h, alpha),
    angle: lerp(pg.angle, g.angle, alpha)
  };
}
function safeClone(obj) {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return obj;
  }
}

// -----------------------------------------------------
// 4. SETUP
// -----------------------------------------------------
async function setup() {
  const { w, h } = computeResponsiveSize();
  CANVAS_W = w;
  CANVAS_H = h;

  cnv = createCanvas(CANVAS_W, CANVAS_H);
  cnv.id('smile-canvas');
  cnv.parent('canvas-holder');
  pixelDensity(1);
  frameRate(60);
  colorMode(RGB, 255);
  cnv.style('position', 'relative');
  cnv.style('z-index', '20');

  // capes de brutícia i màscara
  grimeLayer = createGraphics(CANVAS_W, CANVAS_H);
  frameGrime = createGraphics(CANVAS_W, CANVAS_H);
  cleanMask = createGraphics(CANVAS_W, CANVAS_H);

  // so principal p5
  if (typeof loadSound === 'function') {
    try {
      brushP5 = await loadSound('assets/brush.mp3');
      brushP5.setVolume(0.65);
    } catch (e) {
      console.warn('No s’ha pogut carregar brush.mp3 amb p5.sound', e);
    }
  }

  // fallback HTML
  sfx = document.getElementById('brush-sfx');
  if (sfx) sfx.volume = 0.65;

  // preparar UI i vincular callbacks
  UI.init();
  UI.bind({
    start: startCamera,
    reset: window.resetExperience,
    photo: window.takePhoto,
    setTheme: (t) => UI.update({ theme: t }),
    setWebFrame: window.toggleWebFrame
  });

  // events de punter
  const canvasEl = document.getElementById('smile-canvas');
  if (canvasEl) {
    canvasEl.addEventListener('pointerdown', (e) => {
      pointerDown = true;
      updatePointer(e);
    });
    canvasEl.addEventListener('pointermove', updatePointer);
    window.addEventListener('pointerup', () => {
      pointerDown = false;
    });
    canvasEl.addEventListener('contextmenu', (e) => e.preventDefault());
  }
}

// -----------------------------------------------------
// 5. RESIZE
// -----------------------------------------------------
function windowResized() {
  const { w, h } = computeResponsiveSize();
  CANVAS_W = w;
  CANVAS_H = h;
  resizeCanvas(CANVAS_W, CANVAS_H);
  grimeLayer?.resizeCanvas(CANVAS_W, CANVAS_H);
  frameGrime?.resizeCanvas(CANVAS_W, CANVAS_H);
  cleanMask?.resizeCanvas(CANVAS_W, CANVAS_H);
  if (video) {
    video.size(CANVAS_W, CANVAS_H);
    if (video.elt) {
      video.elt.width = CANVAS_W;
      video.elt.height = CANVAS_H;
    }
  }
}

// -----------------------------------------------------
// 6. CÀMERA + FACEMESH
// -----------------------------------------------------
async function startCamera() {
  UI.setLoading(true);

  try {
    video = createCapture(
      {
        video: {
          facingMode: 'user',
          width: CANVAS_W,
          height: CANVAS_H
        },
        audio: false
      },
      () => {
        console.log('Càmera llesta');
      }
    );

    video.size(CANVAS_W, CANVAS_H);
    video.hide();
    if (video.elt) {
      video.elt.style.position = 'absolute';
      video.elt.style.top = '-9999px';
      video.elt.style.left = '-9999px';
      video.elt.style.zIndex = '-1';
      video.elt.setAttribute('aria-hidden', 'true');
    }

    faceMesh = await ml5.faceMesh({
      maxFaces: 1,
      refineLandmarks: false,
      flipHorizontal: false
    });

    faceMesh.detectStart(video, gotFaces);
  } catch (err) {
    console.error('Error iniciant càmera/facemesh:', err);
  } finally {
    UI.setLoading(false);
  }
}

function gotFaces(results) {
  faces = results;
}

// -----------------------------------------------------
// 7. DRAW
// -----------------------------------------------------
function draw() {
  background(10, 6, 18);

  // vídeo en mirall
  if (video && video.loadedmetadata !== false) {
    push();
    translate(width, 0);
    scale(-1, 1);
    image(video, 0, 0, width, height);
    pop();
  }

  // cara detectada (normalitzada per tenir sempre mateix format)
  const rawFace = faces.length > 0 ? faces[0] : null;
  const face = rawFace ? normalizeFace(rawFace) : null;

  // decoracions de Halloween enganxades a la cara
  if (face) {
    drawZombieDecor(face);
    drawWitchHat(face);
  }

  // obtenir contorn de la boca i obertura
  mouthPoly = face ? getInnerMouthPolygon(face) : [];
  mouthOpenRatio = face ? estimateMouthOpen(face) : 0;

  // suavitzem la lectura de la boca
  mouthOpenSmooth = lerp(mouthOpenSmooth, mouthOpenRatio, 0.25);

  // si no hi ha prou punts, generem una el·lipse
  if (mouthPoly.length < 6 && face) {
    mouthPoly = synthMouthEllipse(face, 44);
  }

  mouthGeom = computeMouthGeom(mouthPoly);

  // suavitzar forma de boca i geometria
  if (mouthGeom && mouthPoly.length >= 6) {
    const aPoly = 0.12;
    const aGeom = smoothAlpha(0.18, mouthOpenSmooth);
    if (prevMouthPoly && prevMouthPoly.length !== mouthPoly.length) {
      prevMouthPoly = null;
    }
    mouthPoly = smoothPoly(mouthPoly, prevMouthPoly, aPoly);
    mouthGeom = smoothGeom(mouthGeom, prevMouthGeom, aGeom);
  }
  prevMouthPoly = mouthPoly ? mouthPoly.slice() : null;
  prevMouthGeom = mouthGeom ? { ...mouthGeom } : null;

  // decisió de boca oberta
  const threshold = UI.getState ? UI.getState().threshold : 0.4;
  const mouthIsOpen = mouthOpenSmooth > threshold;

  // temps amb la boca oberta (per donar més efecte com més temps està oberta)
  const now = millis();
  const dt = lastFrameTime ? (now - lastFrameTime) / 1000 : 0;
  lastFrameTime = now;
  if (mouthIsOpen) mouthOpenTime += dt;
  else mouthOpenTime = max(0, mouthOpenTime - dt * 0.5);
  const openNorm = constrain(mouthOpenTime / 10.0, 0, 1);

  // -------------------------------------------------
  // brutícia a la boca
  // -------------------------------------------------
  frameGrime.clear();
  if (mouthGeom) {
    // sembrar brutícia només quan es torna a obrir
    if (mouthOpenSmooth > 0.35 && canSeed) {
      specksLarge = makeLocalPoints(72, 0.65, 131);
      specksFine = makeLocalPoints(1200, 0.95, 917);
      cleanMask.clear();
      canSeed = false;
    }
    if (mouthOpenSmooth < 0.15) canSeed = true;

    clipToMouth(frameGrime, mouthPoly, () => {
      for (const p of specksLarge || []) {
        const P = localToWorld(p, mouthGeom);
        frameGrime.noStroke();
        frameGrime.fill(88, random(120, 205), 90, 150);
        frameGrime.ellipse(P.x, P.y, 10 + 18 * p.r, 8 + 14 * p.r);
      }
      for (const p of specksFine || []) {
        const P = localToWorld(p, mouthGeom);
        frameGrime.noStroke();
        frameGrime.fill(118 + 16 * (p.r - 0.5), 95 + 10 * (p.r - 0.5), 70 + 10 * (p.r - 0.5), 120);
        frameGrime.circle(P.x, P.y, 1 + 1.6 * p.r);
      }
    });
  }

 // raspallada amb el punter
if (pointerDown && mouthGeom) {
  // només netegem si és dins la boca
  if (pointInPoly(pointerX, pointerY, mouthPoly)) {
    cleanMask.push();
    cleanMask.noStroke();
    cleanMask.fill(255);
    cleanMask.ellipse(pointerX, pointerY, brushSize, brushSize);
    cleanMask.pop();
  }

  // SO: només el disparo quan COMENÇO a netejar
  if (!wasCleaning) {
    if (brushP5) {
      brushP5.play();
    } else if (sfx) {
      sfx.currentTime = 0;
      sfx.play().catch(() => {});
    }
  }

  wasCleaning = true;
} else {
  // he deixat de netejar → paro el so
  if (brushP5 && brushP5.isPlaying()) {
    brushP5.stop();
  }
  if (sfx && !sfx.paused) {
    sfx.pause();
    sfx.currentTime = 0;
  }
  wasCleaning = false;
}


  // aplicar màscara de neteja
  grimeLayer.clear();
  grimeLayer.image(frameGrime, 0, 0);
  grimeLayer.erase(255, 255);
  grimeLayer.image(cleanMask, 0, 0);
  grimeLayer.noErase();

  blendMode(MULTIPLY);
  image(grimeLayer, 0, 0);
  blendMode(BLEND);

  // -------------------------------------------------
  // partícules Halloween
  // -------------------------------------------------
  const tGlobal = millis() / 1000;

  if (mouthGeom && openNorm > 0.25) {
    if (!spawnLocked) {
      const p = new GhostParticle(
        mouthGeom.cx + random(-mouthGeom.w * 0.15, mouthGeom.w * 0.15),
        mouthGeom.cy + random(-mouthGeom.h * 0.15, mouthGeom.h * 0.15),
        tGlobal,
        openNorm
      );
      ghostParticles.push(p);
      if (ghostParticles.length > 200) {
        ghostParticles.splice(0, ghostParticles.length - 200);
      }
      spawnLocked = true;
      setTimeout(() => (spawnLocked = false), 80);
    }
  } else {
    for (const gp of ghostParticles) gp.fadeOut = true;
  }

  if (openNorm > 0.7) blendMode(ADD);
  else if (openNorm > 0.4) blendMode(SCREEN);
  else blendMode(LIGHTEST);

  ghostParticles = ghostParticles.filter((p) => {
    p.step(1 / 60, mouthGeom, openNorm);
    p.draw(tGlobal, openNorm);
    return p.alive(tGlobal);
  });

  blendMode(BLEND);

  // marc decoratiu
  if (showP5Frame) {
    drawHalloweenFrame();
  }

  // vareta/cursor
  drawMagicWand(pointerX || mouseX, pointerY || mouseY);
}

// -----------------------------------------------------
// 8. NORMALITZAR FORMAT DE CARA
// -----------------------------------------------------
function normalizeFace(f) {
  const W = width || CANVAS_W || 1920;
  const base = safeClone(f);

  // format nou de ml5 (amb lipsUpperInner, etc.)
  if (
    base.lipsUpperInner?.keypoints ||
    base.faceOval?.keypoints ||
    Array.isArray(base.keypoints) ||
    base.lips
  ) {
    const out = base;
    const mirrorArr = (arr) => arr.map((pt) => ({ x: W - pt.x, y: pt.y, z: pt.z }));

    if (out.lipsUpperInner?.keypoints)
      out.lipsUpperInner.keypoints = mirrorArr(out.lipsUpperInner.keypoints);
    if (out.lipsLowerInner?.keypoints)
      out.lipsLowerInner.keypoints = mirrorArr(out.lipsLowerInner.keypoints);
    if (out.faceOval?.keypoints) out.faceOval.keypoints = mirrorArr(out.faceOval.keypoints);
    if (out.leftEye?.keypoints) out.leftEye.keypoints = mirrorArr(out.leftEye.keypoints);
    if (out.rightEye?.keypoints) out.rightEye.keypoints = mirrorArr(out.rightEye.keypoints);
    if (Array.isArray(out.keypoints)) out.keypoints = mirrorArr(out.keypoints);
    if (out.lips?.keypoints) out.lips.keypoints = mirrorArr(out.lips.keypoints);

    if (!out.lipsUpperInner && Array.isArray(out.keypoints) && out.keypoints[13]) {
      out.lipsUpperInner = { keypoints: [out.keypoints[13]] };
    }
    if (!out.lipsLowerInner && Array.isArray(out.keypoints) && out.keypoints[14]) {
      out.lipsLowerInner = { keypoints: [out.keypoints[14]] };
    }

    return out;
  }

  // format antic amb annotations
  if (base.annotations) {
    const lipsUp = (base.annotations.lipsUpperInner || []).map(([x, y, z = 0]) => ({
      x: W - x,
      y,
      z
    }));
    const lipsLo = (base.annotations.lipsLowerInner || []).map(([x, y, z = 0]) => ({
      x: W - x,
      y,
      z
    }));
    const oval = (base.annotations.faceOval || []).map(([x, y, z = 0]) => ({
      x: W - x,
      y,
      z
    }));
    return {
      ...base,
      lipsUpperInner: {
        keypoints: lipsUp.length
          ? lipsUp
          : (base.annotations.lipsUpperOuter || []).map(([x, y, z = 0]) => ({
              x: W - x,
              y,
              z
            }))
      },
      lipsLowerInner: {
        keypoints: lipsLo.length
          ? lipsLo
          : (base.annotations.lipsLowerOuter || []).map(([x, y, z = 0]) => ({
              x: W - x,
              y,
              z
            }))
      },
      faceOval: { keypoints: oval }
    };
  }

  // format mínim amb només keypoints
  if (Array.isArray(base.keypoints) && base.keypoints.length > 0) {
    const kps = base.keypoints.map((pt) => ({ x: W - pt.x, y: pt.y, z: pt.z }));
    return {
      ...base,
      keypoints: kps,
      lipsUpperInner: { keypoints: kps[13] ? [kps[13]] : [] },
      lipsLowerInner: { keypoints: kps[14] ? [kps[14]] : [] },
      mouthLeft: kps[61],
      mouthRight: kps[291]
    };
  }

  return base;
}

// -----------------------------------------------------
// 9. HELPERS DE FACEMESH / BOCA
// -----------------------------------------------------
function getInnerMouthPolygon(face) {
  const upK = face?.lipsUpperInner?.keypoints || face?.lipsUpperInner;
  const loK = face?.lipsLowerInner?.keypoints || face?.lipsLowerInner;
  if (Array.isArray(upK) && Array.isArray(loK) && upK.length && loK.length) {
    const up = upK.map((pt) => ({ x: pt.x, y: pt.y }));
    const lo = loK.map((pt) => ({ x: pt.x, y: pt.y }));
    return [...up, ...lo.slice().reverse()];
  }
  if (face?.lips?.keypoints && Array.isArray(face.lips.keypoints)) {
    return face.lips.keypoints.map((pt) => ({ x: pt.x, y: pt.y }));
  }
  if (face?.lips && typeof face.lips.x === 'number') {
    const { x, y, width, height } = face.lips;
    const cx = x + width * 0.5;
    const cy = y + height * 0.5;
    const n = 36;
    const poly = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TWO_PI;
      const px = cx + width * 0.52 * Math.cos(a);
      const py = cy + height * 0.52 * Math.sin(a);
      poly.push({ x: px, y: py });
    }
    return poly;
  }
  return [];
}

function synthMouthEllipse(face, nPts = 40) {
  const kps = face?.keypoints || [];
  if (!kps.length) return [];
  const lc = face.mouthLeft || kps[61];
  const rc = face.mouthRight || kps[291];
  const up = face.lipsUpperInner?.keypoints?.[0] || kps[13];
  const lo = face.lipsLowerInner?.keypoints?.[0] || kps[14];
  if (!(lc && rc && up && lo)) return [];
  const cx = (lc.x + rc.x) * 0.5;
  const cy = (up.y + lo.y) * 0.5;
  const w = dist(lc.x, lc.y, rc.x, rc.y);
  const h = max(10, dist(up.x, up.y, lo.x, lo.y) * 1.2);
  const angle = Math.atan2(rc.y - lc.y, rc.x - lc.x);
  const pts = [];
  for (let i = 0; i < nPts; i++) {
    const a = (i / nPts) * TWO_PI;
    const ex = w * 0.52 * Math.cos(a);
    const ey = h * 0.52 * Math.sin(a) * 0.9;
    const ca = Math.cos(angle),
      sa = Math.sin(angle);
    const x = cx + ca * ex - sa * ey;
    const y = cy + sa * ex + ca * ey;
    pts.push({ x, y });
  }
  return pts;
}

function estimateMouthOpen(face) {
  const upper = face?.lipsUpperInner?.keypoints?.[0];
  const lower = face?.lipsLowerInner?.keypoints?.[0];
  const lc = face?.mouthLeft || face?.keypoints?.[61];
  const rc = face?.mouthRight || face?.keypoints?.[291];
  if (!(upper && lower && lc && rc)) return 0;
  const open = dist(upper.x, upper.y, lower.x, lower.y);
  const widthM = dist(lc.x, lc.y, rc.x, rc.y) + 1e-6;
  const baseGap = widthM * 0.04;
  const corr = max(0, open - baseGap);
  return constrain((corr / widthM) * 3.2, 0, 1);
}

function computeMouthGeom(poly) {
  if (!poly || poly.length < 6) return null;
  let sx = 0,
    sy = 0,
    minX = +Infinity,
    maxX = -Infinity,
    leftP = null,
    rightP = null;
  for (const p of poly) {
    sx += p.x;
    sy += p.y;
    if (p.x < minX) {
      minX = p.x;
      leftP = p;
    }
    if (p.x > maxX) {
      maxX = p.x;
      rightP = p;
    }
  }
  const cx = sx / poly.length;
  const cy = sy / poly.length;
  const dx = rightP.x - leftP.x;
  const dy = rightP.y - leftP.y;
  const w = Math.hypot(dx, dy);

  let minY = +Infinity,
    maxY = -Infinity;
  for (const p of poly) {
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  const h = Math.max(10, maxY - minY);
  const angle = Math.atan2(dy, dx);
  return { cx, cy, w, h, angle };
}

function makeLocalPoints(n = 100, r = 1.0, seed = 12345) {
  const pts = [];
  let s = seed >>> 0;
  const rand = () => ((s = (1664525 * s + 1013904223) >>> 0), (s & 0xffffffff) / 0x100000000);
  for (let i = 0; i < n; i++) {
    const a = rand() * TWO_PI;
    const d = r * Math.sqrt(rand());
    const u = d * Math.cos(a);
    const v = d * Math.sin(a);
    pts.push({ u, v, r: rand() });
  }
  return pts;
}

function localToWorld(p, g) {
  const ex = g.w * 0.5 * p.u;
  const ey = g.h * 0.5 * p.v;
  const ca = Math.cos(g.angle);
  const sa = Math.sin(g.angle);
  return { x: g.cx + ca * ex - sa * ey, y: g.cy + sa * ex + ca * ey };
}

function clipToMouth(g, poly, drawFn) {
  const ctx = g.drawingContext;
  ctx.save();
  ctx.beginPath();
  poly.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.closePath();
  ctx.clip();
  drawFn();
  ctx.restore();
}

function pointInPoly(x, y, poly) {
  if (!poly || poly.length < 3) return false;
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x,
      yi = poly[i].y,
      xj = poly[j].x,
      yj = poly[j].y;
    const intersect =
      (yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / ((yj - yi) || 1e-9) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// -----------------------------------------------------
// 10. DECORACIÓ HALLOWEEN 
// -----------------------------------------------------
function drawHalloweenFrame() {
  push();
  stroke(255, 255, 255, 65);
  strokeWeight(1.5);
  noFill();

  // sup. esquerra
  line(12, 12, 260, 12);
  line(12, 12, 12, 260);
  line(12, 12, 210, 48);
  line(12, 12, 48, 210);
  for (let r = 40; r <= 240; r += 32) ellipse(12, 12, r * 2, r * 2);

  // sup. dreta
  const tx = width - 12;
  const ty = 12;
  line(tx, ty, tx - 260, ty);
  line(tx, ty, tx, ty + 260);
  line(tx, ty, tx - 210, ty + 48);
  line(tx, ty, tx - 48, ty + 210);
  for (let r = 40; r <= 240; r += 32) ellipse(tx, ty, r * 2, r * 2);

  // inf. esquerra
  const bx = 12;
  const by = height - 12;
  line(bx, by, bx + 260, by);
  line(bx, by, bx, by - 260);
  line(bx, by, bx + 210, by - 48);
  line(bx, by, bx + 48, by - 210);
  for (let r = 40; r <= 240; r += 32) ellipse(bx, by, r * 2, r * 2);

  // inf. dreta
  const btx = width - 12;
  const bty = height - 12;
  line(btx, bty, btx - 260, bty);
  line(btx, bty, btx, bty - 260);
  line(btx, bty, btx - 210, bty - 48);
  line(btx, bty, btx - 48, bty - 210);
  for (let r = 40; r <= 240; r += 32) ellipse(btx, bty, r * 2, r * 2);

  // aranya animada
  const maxVisibleX = 1180;
  const baseX = Math.min(width - 70, maxVisibleX);
  const baseY = 0;
  const t = millis() * 0.003;
  const bob = Math.sin(t * TWO_PI) * 10;

  stroke(255, 255, 255, 140);
  strokeWeight(2);
  line(baseX, baseY, baseX, baseY + 140 + bob);

  const spiderY = baseY + 140 + bob;
  noStroke();
  fill(5, 5, 5, 240);
  ellipse(baseX, spiderY, 40, 32);
  ellipse(baseX, spiderY - 16, 22, 20);

  fill(255, 140, 80, 255);
  circle(baseX - 5, spiderY - 18, 4);
  circle(baseX + 5, spiderY - 18, 4);

  stroke(5, 5, 5, 240);
  strokeWeight(3);
  const legLen = 26;
  const legDrop = 10;

  // esquerra
  line(baseX - 6, spiderY - 6, baseX - 6 - legLen, spiderY - legDrop);
  line(baseX - 6, spiderY, baseX - 6 - (legLen + 4), spiderY + (legDrop - 2));
  line(baseX - 6, spiderY + 6, baseX - 6 - (legLen - 4), spiderY + (legDrop + 6));
  line(baseX - 6, spiderY + 12, baseX - 6 - (legLen - 8), spiderY + (legDrop + 12));
  // dreta
  line(baseX + 6, spiderY - 6, baseX + 6 + legLen, spiderY - legDrop);
  line(baseX + 6, spiderY, baseX + 6 + (legLen + 4), spiderY + (legDrop - 2));
  line(baseX + 6, spiderY + 6, baseX + 6 + (legLen - 4), spiderY + (legDrop + 6));
  line(baseX + 6, spiderY + 12, baseX + 6 + (legLen - 8), spiderY + (legDrop + 12));

  pop();
}

// -----------------------------------------------------
// 11. PARTÍCULES (fantasmes/estrelles)
// -----------------------------------------------------
class GhostParticle {
  constructor(x, y, t0, openNorm = 0) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-0.3, 0.3), random(-0.4, -0.1));
    this.acc = createVector(0, 0);

    this.birth = t0;
    this.maxLife = random(2.4, 5.2);
    this.sizeBase = random(5, 11);
    this.theta = random(TWO_PI);
    this.spin = random(-1.5, 1.5);

    this.noiseSeedX = random(1000);
    this.noiseSeedY = random(2000);

    this.colA = color('#6e31ff');
    this.colB = color('#ff7a18');
    this.colC = color('#7fff8a');

    this.openAtBirth = openNorm;
    this.fadeOut = false;
  }

  step(dt, mouthGeom, openNorm = 0) {
    // atracció suau cap al centre de la boca
    if (mouthGeom) {
      const target = createVector(mouthGeom.cx, mouthGeom.cy);
      const dir = p5.Vector.sub(target, this.pos);
      const k = 0.11 / max(mouthGeom.w, 1);
      dir.mult(k);
      this.acc.add(dir);
    }

    const tNoise = millis() * 0.0006;
    const nx = noise(this.noiseSeedX, tNoise) - 0.5;
    const ny = noise(this.noiseSeedY, tNoise + 100) - 0.5;
    this.acc.x += nx * 0.18;
    this.acc.y += ny * 0.18;

    this.acc.y -= 0.02;

    if (openNorm > 0.7) this.acc.mult(1.4);

    this.vel.add(p5.Vector.mult(this.acc, dt * 60));
    this.vel.limit(4.2);
    this.pos.add(this.vel);
    this.acc.mult(0);

    if (this.fadeOut) {
      this.maxLife = max(this.maxLife - dt * 1.5, 0.25);
      this.pos.y += 0.6;
    }

    this.theta += this.spin * dt;
  }

  draw(tGlobal, openNorm = 0) {
    const life = tGlobal - this.birth;
    const lifeNorm = constrain(life / this.maxLife, 0, 1);
    const baseAlpha = 255 * (1 - lifeNorm);
    const alpha = this.fadeOut ? baseAlpha * 0.6 : baseAlpha;

    // color segons obertura
    let c;
    if (openNorm < 0.5) {
      const k = map(openNorm, 0, 0.5, 0, 1);
      c = lerpColor(this.colA, this.colB, k);
    } else {
      const k = map(openNorm, 0.5, 1, 0, 1);
      c = lerpColor(this.colB, this.colC, k);
    }

    const pulse = 1 + 0.3 * sin(tGlobal * 6 + this.theta);
    const r = this.sizeBase * (1 - lifeNorm * 0.3) * pulse;

    push();
    noStroke();
    fill(red(c), green(c), blue(c), alpha);

    // quan està molt oberta, algunes partícules són estrelles
    if (openNorm > 0.55 && !this.fadeOut) {
      push();
      translate(this.pos.x, this.pos.y);
      rotate(this.theta * 0.3);
      star(0, 0, r * 0.45, r * 1.05, 5);
      pop();
    } else {
      circle(this.pos.x, this.pos.y, r * 2);
    }
    pop();
  }

  alive(tGlobal) {
    return tGlobal - this.birth < this.maxLife;
  }
}

function star(x, y, r1, r2, n) {
  beginShape();
  for (let i = 0; i < n * 2; i++) {
    const a = (i * PI) / n;
    const r = i % 2 ? r1 : r2;
    vertex(x + cos(a) * r, y + sin(a) * r);
  }
  endShape(CLOSE);
}

// -----------------------------------------------------
// 12. VARETA/CURSOR
// -----------------------------------------------------
function drawMagicWand(x, y) {
  if (mouseX >= 0 && mouseY >= 0 && mouseX <= width && mouseY <= height) noCursor();
  else cursor('default');

  push();
  stroke(80, 60, 40);
  strokeWeight(5);
  line(x - 24, y + 24, x + 6, y - 6);

  noStroke();
  fill(255, 230, 140, 230);
  star(x, y, 6, 12, 5);

  // petits brillants al voltant
  for (let i = 0; i < 8; i++) {
    const a = random(TWO_PI);
    const d = random(4, 18);
    circle(x + cos(a) * d, y + sin(a) * d, random(2, 4));
  }
  pop();
}

// -----------------------------------------------------
// 13. DECORACIÓ ZOMBIE (ulls, cicatriu, mosques)
// -----------------------------------------------------
function drawZombieDecor(face) {
  push();
  const oval = face.faceOval?.keypoints || [];
  if (!oval.length) {
    pop();
    return;
  }

  const minX = Math.min(...oval.map((p) => p.x));
  const maxX = Math.max(...oval.map((p) => p.x));
  const faceW = maxX - minX;
  const s = constrain(faceW / 400, 0.6, 1.3);

  const lEye = face.leftEye?.keypoints || [];
  const rEye = face.rightEye?.keypoints || [];

  function eyeGeom(pts) {
    if (!pts.length) return null;
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    return {
      cx: xs.reduce((a, b) => a + b) / xs.length,
      cy: ys.reduce((a, b) => a + b) / ys.length,
      w: Math.max(...xs) - Math.min(...xs),
      h: Math.max(...ys) - Math.min(...ys)
    };
  }

  const lG = eyeGeom(lEye);
  const rG = eyeGeom(rEye);

  function drawZombieEye(g) {
    if (!g) return;
    push();
    translate(g.cx, g.cy);

    const eyeScale = map(s, 0.6, 1.3, 0.75, 1.2);
    const scleraR = Math.max(g.w, g.h) * 0.95 * eyeScale;

    noStroke();
    fill(248, 242, 220);
    circle(0, 0, scleraR * 2);

    fill(97, 140, 78);
    arc(0, -scleraR * 0.28, scleraR * 2.08, scleraR * 1.45, PI, 0, CHORD);

    const irisR = scleraR * 0.45;
    fill(125, 86, 185);
    circle(0, scleraR * 0.12, irisR * 2);

    const pupR = irisR * 0.5;
    fill(0);
    circle(0, scleraR * 0.12, pupR * 2);

    fill(255, 255, 255, 230);
    circle(-pupR * 0.3, scleraR * 0.02, pupR * 0.55);

    noFill();
    stroke(0, 0, 0, 210);
    strokeWeight(2 * eyeScale);
    circle(0, 0, scleraR * 2);

    pop();
  }

  drawZombieEye(lG);
  drawZombieEye(rG);

  // cicatriu al front (es suavitza la posició)
  if (lEye.length && rEye.length) {
    const l = lEye.reduce((s, p) => ({ x: s.x + p.x, y: s.y + p.y }), { x: 0, y: 0 });
    const r = rEye.reduce((s, p) => ({ x: s.x + p.x, y: s.y + p.y }), { x: 0, y: 0 });
    const lC = { x: l.x / lEye.length, y: l.y / lEye.length };
    const rC = { x: r.x / rEye.length, y: r.y / rEye.length };
    const midX = (lC.x + rC.x) / 2;
    const midY = (lC.y + rC.y) / 2;

    const scarScale = map(s, 0.6, 1.3, 0.65, 1.2);
    const len = 90 * scarScale;
    const offsetY = 55 * s * scarScale;

    const target = { x: midX, y: midY - offsetY };
    if (!scarPos) scarPos = { ...target };
    scarPos.x += (target.x - scarPos.x) * 0.15;
    scarPos.y += (target.y - scarPos.y) * 0.15;

    push();
    const baseX = scarPos.x;
    const baseY = scarPos.y;
    const ang = radians(-15);
    const x1 = baseX - (len / 2) * cos(ang);
    const y1 = baseY - (len / 2) * sin(ang);
    const x2 = baseX + (len / 2) * cos(ang);
    const y2 = baseY + (len / 2) * sin(ang);

    noStroke();
    fill(140, 240, 110, 70);
    ellipse(baseX, baseY, len * 0.45, 14 * scarScale);
    stroke(150, 18, 32);
    strokeWeight(2.5 * scarScale);
    line(x1, y1, x2, y2);
    stroke(25, 0, 0);
    strokeWeight(2.2 * scarScale);

    const nStitches = 4;
    for (let i = 0; i < nStitches; i++) {
      const t = (i + 1) / (nStitches + 1);
      const sx = lerp(x1, x2, t);
      const sy = lerp(y1, y2, t);
      const perpx = cos(ang + HALF_PI);
      const perpy = sin(ang + HALF_PI);
      const halfW = 6 * scarScale;
      line(sx - perpx * halfW, sy - perpy * halfW, sx + perpx * halfW, sy + perpy * halfW);
    }
    pop();
  }

  // mosques voltant la cara
  const cx = oval.reduce((sum, p) => sum + p.x, 0) / oval.length;
  const cy = oval.reduce((sum, p) => sum + p.y, 0) / oval.length;
  const t = millis() * 0.002;
  for (let i = 0; i < 4; i++) {
    const ox = cos(t + i * 1.3) * 70 * s;
    const oy = sin(t * 1.2 + i * 0.9) * 60 * s;
    const x = cx + ox;
    const y = cy + oy;
    noStroke();
    fill(30, 30, 30, 230);
    ellipse(x, y, 14 * s * 1.7, 10 * s * 1.7);
    fill(40, 40, 40, 230);
    ellipse(x + 5 * s * 1.7, y - 2 * s * 1.7, 6 * s * 1.7, 6 * s * 1.7);
    fill(150, 255, 110, 60);
    ellipse(x, y, 20 * s * 1.7, 14 * s * 1.7);
  }

  pop();
}

// -----------------------------------------------------
// 14. BARRET DE BRUIXA
// -----------------------------------------------------
function drawWitchHat(face) {
  const oval = face.faceOval?.keypoints || [];
  if (!oval.length) return;

  const minX = Math.min(...oval.map((p) => p.x));
  const maxX = Math.max(...oval.map((p) => p.x));
  const faceW = maxX - minX;
  let s = constrain(faceW / 400, 0.6, 1.4);

  // punt més alt de la cara
  let top = oval[0];
  for (const p of oval) if (p.y < top.y) top = p;

  // angle segons ulls
  const lEye = face.leftEye?.keypoints || [];
  const rEye = face.rightEye?.keypoints || [];
  let ang = 0;
  if (lEye.length && rEye.length) {
    const l = lEye.reduce((s, p) => ({ x: s.x + p.x, y: s.y + p.y }), { x: 0, y: 0 });
    const r = rEye.reduce((s, p) => ({ x: s.x + p.x, y: s.y + p.y }), { x: 0, y: 0 });
    const lC = { x: l.x / lEye.length, y: l.y / lEye.length };
    const rC = { x: r.x / rEye.length, y: r.y / rEye.length };
    ang = Math.atan2(rC.y - lC.y, rC.x - lC.x);
  }

  const target = { x: top.x, y: top.y - 75 * s, angle: ang };
  if (!hatPos) hatPos = { ...target };
  hatPos.x += (target.x - hatPos.x) * 0.15;
  hatPos.y += (target.y - hatPos.y) * 0.15;
  hatPos.angle += (target.angle - hatPos.angle) * 0.15;

  const base = faceW * 1.05;

  push();
  translate(hatPos.x, hatPos.y);
  rotate(hatPos.angle);
  rotate(radians(-5));

  noStroke();
  fill(20, 10, 30);
  ellipse(0, 0, base * s, base * 0.25 * s);

  fill(35, 20, 50);
  beginShape();
  vertex(-base * 0.22 * s, 0);
  vertex(0, -base * 1.1 * s);
  vertex(base * 0.22 * s, 0);
  endShape(CLOSE);

  fill(140, 40, 160);
  rectMode(CENTER);
  rect(0, -base * 0.08 * s, base * 0.35 * s, base * 0.08 * s, 6);

  fill(230, 180, 40);
  rect(0, -base * 0.08 * s, base * 0.12 * s, base * 0.06 * s, 3);

  pop();
}
