(() => {
  'use strict';

  const marketplace = window.PIXEL_MARKETPLACE;
  const root = document.querySelector('[data-marketplace-root]');
  if (!marketplace || !root) return;

  const collection = marketplace.acquisitionGroups?.[0]?.rotations?.[0]?.collections?.[0];
  const items = Array.isArray(collection?.items) ? collection.items : [];
  const canvas = root.querySelector('[data-model-canvas]');
  const stage = root.querySelector('[data-model-stage]');
  const status = root.querySelector('[data-model-status]');
  const itemList = root.querySelector('[data-marketplace-items]');
  const activeName = root.querySelector('[data-active-name]');
  const activeVariant = root.querySelector('[data-active-variant]');
  const activeSlot = root.querySelector('[data-active-slot]');
  const activeMaterial = root.querySelector('[data-active-material]');
  const activeGeometry = root.querySelector('[data-active-geometry]');
  const activeSet = root.querySelector('[data-active-set]');

  if (!(canvas instanceof HTMLCanvasElement) || !stage || !itemList || !items.length) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const DEG = Math.PI / 180;
  const FACE_NORMALS = Object.freeze({
    north: [0, 0, -1],
    south: [0, 0, 1],
    west: [-1, 0, 0],
    east: [1, 0, 0],
    up: [0, 1, 0],
    down: [0, -1, 0]
  });
  const FACE_CORNERS = Object.freeze({
    north: [2, 3, 0, 1],
    south: [7, 6, 5, 4],
    west: [3, 7, 4, 0],
    east: [6, 2, 1, 5],
    up: [3, 2, 6, 7],
    down: [4, 5, 1, 0]
  });

  const state = {
    item: null,
    model: null,
    textures: new Map(),
    preparedElements: [],
    center: [0, 0, 0],
    extent: 16,
    baseRotation: [30 * DEG, 135 * DEG, 0],
    yawOffset: 0,
    pitchOffset: 0,
    zoom: 1,
    dragging: false,
    pointerId: null,
    lastX: 0,
    lastY: 0,
    requestToken: 0,
    animationFrame: 0,
    animationActive: false,
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches
  };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const setStatus = text => { if (status) status.textContent = text; };

  const rotateAxis = (point, axis, angle, origin = [0, 0, 0]) => {
    if (!angle) return [...point];
    const x = point[0] - origin[0];
    const y = point[1] - origin[1];
    const z = point[2] - origin[2];
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    if (axis === 'x') return [x + origin[0], (y * c - z * s) + origin[1], (y * s + z * c) + origin[2]];
    if (axis === 'y') return [(x * c + z * s) + origin[0], y + origin[1], (-x * s + z * c) + origin[2]];
    if (axis === 'z') return [(x * c - y * s) + origin[0], (x * s + y * c) + origin[1], z + origin[2]];
    return [...point];
  };

  const rotateVector = (vector, axis, angle) => rotateAxis(vector, axis, angle, [0, 0, 0]);

  const applyElementRotation = (point, element) => {
    const rotation = element?.rotation;
    if (!rotation || !rotation.axis || !Number.isFinite(Number(rotation.angle))) return [...point];
    const origin = Array.isArray(rotation.origin) && rotation.origin.length === 3 ? rotation.origin.map(Number) : [8, 8, 8];
    return rotateAxis(point, rotation.axis, Number(rotation.angle) * DEG, origin);
  };

  const applyGlobalRotation = point => {
    let next = [point[0] - state.center[0], point[1] - state.center[1], point[2] - state.center[2]];
    next = rotateAxis(next, 'x', state.baseRotation[0] + state.pitchOffset);
    next = rotateAxis(next, 'y', state.baseRotation[1] + state.yawOffset);
    next = rotateAxis(next, 'z', state.baseRotation[2]);
    return next;
  };

  const applyGlobalNormalRotation = normal => {
    let next = rotateVector(normal, 'x', state.baseRotation[0] + state.pitchOffset);
    next = rotateVector(next, 'y', state.baseRotation[1] + state.yawOffset);
    return rotateVector(next, 'z', state.baseRotation[2]);
  };

  const elementVertices = element => {
    const from = element.from.map(Number);
    const to = element.to.map(Number);
    const vertices = [
      [from[0], from[1], from[2]], [to[0], from[1], from[2]],
      [to[0], to[1], from[2]], [from[0], to[1], from[2]],
      [from[0], from[1], to[2]], [to[0], from[1], to[2]],
      [to[0], to[1], to[2]], [from[0], to[1], to[2]]
    ];
    return vertices.map(point => applyElementRotation(point, element));
  };

  const elementNormal = (faceName, element) => {
    const normal = FACE_NORMALS[faceName] || [0, 0, 1];
    const rotation = element?.rotation;
    if (!rotation || !rotation.axis || !Number.isFinite(Number(rotation.angle))) return [...normal];
    return rotateVector(normal, rotation.axis, Number(rotation.angle) * DEG);
  };

  const prepareModel = model => {
    const prepared = [];
    const all = [];
    const elements = Array.isArray(model?.elements) ? model.elements : [];
    elements.forEach(element => {
      if (!Array.isArray(element?.from) || !Array.isArray(element?.to)) return;
      const vertices = elementVertices(element);
      prepared.push({ element, vertices });
      vertices.forEach(point => all.push(point));
    });

    if (!all.length) {
      state.center = [8, 8, 8];
      state.extent = 16;
    } else {
      const mins = [Infinity, Infinity, Infinity];
      const maxs = [-Infinity, -Infinity, -Infinity];
      all.forEach(point => point.forEach((value, index) => {
        mins[index] = Math.min(mins[index], value);
        maxs[index] = Math.max(maxs[index], value);
      }));
      state.center = mins.map((value, index) => (value + maxs[index]) / 2);
      const spans = mins.map((value, index) => maxs[index] - value);
      state.extent = Math.max(1, ...spans);
    }
    state.preparedElements = prepared;
  };

  const resolveTexturePath = (reference, item) => {
    if (typeof reference !== 'string' || !reference.startsWith('#')) return null;
    const key = reference.slice(1);
    return item?.textures?.[key] || null;
  };

  const loadImage = src => new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load texture: ${src}`));
    image.src = src;
  });

  const loadAnimationMetadata = async src => {
    try {
      const response = await fetch(`${src}.mcmeta`, { cache: 'force-cache' });
      if (!response.ok) return null;
      const metadata = await response.json();
      const frameTime = Number(metadata?.animation?.frametime);
      return Number.isFinite(frameTime) && frameTime > 0 ? { frameTime } : null;
    } catch {
      return null;
    }
  };

  const loadTexture = async src => {
    const image = await loadImage(src);
    const animation = await loadAnimationMetadata(src);
    const squareFrames = animation && image.width > 0 && image.height >= image.width && image.height % image.width === 0;
    const frameHeight = squareFrames ? image.width : image.height;
    const frameCount = squareFrames ? Math.max(1, image.height / image.width) : 1;
    return {
      image,
      frameHeight,
      frameCount,
      frameTimeMs: animation ? animation.frameTime * 50 : 0
    };
  };

  const textureFrame = texture => {
    if (!texture || texture.frameCount <= 1 || !texture.frameTimeMs || state.reducedMotion) return 0;
    return Math.floor(performance.now() / texture.frameTimeMs) % texture.frameCount;
  };

  const project = point => {
    const scale = Math.min(canvas.width, canvas.height) / (state.extent * 1.55) * state.zoom;
    return {
      x: canvas.width * 0.5 + point[0] * scale,
      y: canvas.height * 0.53 - point[1] * scale,
      z: point[2]
    };
  };

  const drawTexturedFace = (face, texture, points, shade) => {
    if (!texture || !Array.isArray(face?.uv) || face.uv.length !== 4) return;
    const image = texture.image;
    const frameHeight = texture.frameHeight;
    const frameIndex = textureFrame(texture);
    const frameOffset = frameIndex * frameHeight;
    const [u1, v1, u2, v2] = face.uv.map(Number);
    const sx = (u1 / 16) * image.width;
    const ex = (u2 / 16) * image.width;
    const sy = frameOffset + (v1 / 16) * frameHeight;
    const ey = frameOffset + (v2 / 16) * frameHeight;
    const du = ex - sx;
    const dv = ey - sy;
    if (Math.abs(du) < 0.00001 || Math.abs(dv) < 0.00001) return;

    const p0 = points[0];
    const p1 = points[1];
    const p3 = points[3];
    const a = (p1.x - p0.x) / du;
    const b = (p1.y - p0.y) / du;
    const c = (p3.x - p0.x) / dv;
    const d = (p3.y - p0.y) / dv;
    const e = p0.x - a * sx - c * sy;
    const f = p0.y - b * sx - d * sy;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let index = 1; index < points.length; index += 1) ctx.lineTo(points[index].x, points[index].y);
    ctx.closePath();
    ctx.clip();
    ctx.imageSmoothingEnabled = false;
    ctx.setTransform(a, b, c, d, e, f);
    ctx.drawImage(image, 0, 0);
    ctx.restore();

    if (shade > 0.015) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let index = 1; index < points.length; index += 1) ctx.lineTo(points[index].x, points[index].y);
      ctx.closePath();
      ctx.fillStyle = `rgba(0,0,0,${shade})`;
      ctx.fill();
      ctx.restore();
    }
  };

  const render = () => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!state.model || !state.item) return;

    const faces = [];
    state.preparedElements.forEach(({ element, vertices }) => {
      const transformed = vertices.map(applyGlobalRotation);
      const facesObject = element.faces || {};
      Object.entries(facesObject).forEach(([faceName, face]) => {
        const cornerIndices = FACE_CORNERS[faceName];
        if (!cornerIndices || !face || !face.texture) return;
        const normal = applyGlobalNormalRotation(elementNormal(faceName, element));
        if (normal[2] <= 0.001) return;
        const points3d = cornerIndices.map(index => transformed[index]);
        const points = points3d.map(project);
        const depth = points3d.reduce((sum, point) => sum + point[2], 0) / points3d.length;
        const texturePath = resolveTexturePath(face.texture, state.item);
        if (!texturePath) return;
        const light = clamp(0.56 + Math.max(0, normal[1]) * 0.16 + Math.max(0, normal[2]) * 0.28, 0.56, 1);
        faces.push({ face, points, depth, texturePath, shade: 1 - light });
      });
    });

    faces.sort((a, b) => a.depth - b.depth);
    faces.forEach(face => drawTexturedFace(face.face, state.textures.get(face.texturePath), face.points, face.shade));
  };

  const animationLoop = () => {
    if (!state.animationActive) return;
    render();
    state.animationFrame = requestAnimationFrame(animationLoop);
  };

  const updateAnimationState = () => {
    const shouldAnimate = !state.reducedMotion && [...state.textures.values()].some(texture => texture.frameCount > 1);
    if (shouldAnimate === state.animationActive) return;
    state.animationActive = shouldAnimate;
    cancelAnimationFrame(state.animationFrame);
    if (shouldAnimate) state.animationFrame = requestAnimationFrame(animationLoop);
  };

  const loadItem = async item => {
    const requestToken = ++state.requestToken;
    state.item = item;
    state.model = null;
    state.textures = new Map();
    state.yawOffset = 0;
    state.pitchOffset = 0;
    state.zoom = 1;
    stage.classList.add('is-loading');
    stage.classList.remove('is-error');
    setStatus('Loading Nexo model…');

    root.querySelectorAll('[data-active-name]').forEach(node => { node.textContent = item.name; });
    if (activeVariant) activeVariant.textContent = item.variant;
    if (activeSlot) activeSlot.textContent = item.slot || '—';
    if (activeMaterial) activeMaterial.textContent = item.material || '—';
    if (activeGeometry) activeGeometry.textContent = `${item.elementCount} cuboids`;
    if (activeSet) activeSet.textContent = item.assetId ? 'Luminite armor set' : 'Individual model';

    itemList.querySelectorAll('button[data-item-id]').forEach(button => {
      const selected = button.dataset.itemId === item.id;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });

    try {
      const response = await fetch(item.model, { cache: 'force-cache' });
      if (!response.ok) throw new Error(`Model request failed (${response.status})`);
      const model = await response.json();
      if (requestToken !== state.requestToken) return;

      const texturePaths = [...new Set(Object.values(item.textures || {}))];
      const loaded = await Promise.all(texturePaths.map(async path => [path, await loadTexture(path)]));
      if (requestToken !== state.requestToken) return;

      state.model = model;
      state.textures = new Map(loaded);
      const guiRotation = Array.isArray(item.guiRotation) ? item.guiRotation : [30, 135, 0];
      state.baseRotation = guiRotation.map(value => Number(value || 0) * DEG);
      prepareModel(model);
      stage.classList.remove('is-loading');
      stage.classList.add('is-ready');
      setStatus([...state.textures.values()].some(texture => texture.frameCount > 1)
        ? 'Live model · animated resource-pack texture'
        : 'Live model · drag to rotate');
      render();
      updateAnimationState();
    } catch (error) {
      if (requestToken !== state.requestToken) return;
      stage.classList.remove('is-loading', 'is-ready');
      stage.classList.add('is-error');
      state.animationActive = false;
      cancelAnimationFrame(state.animationFrame);
      setStatus('Model unavailable');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      console.error(error);
    }
  };

  const createItemButton = item => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'marketplace-item-card';
    button.dataset.itemId = item.id;
    button.setAttribute('aria-pressed', 'false');

    const preview = document.createElement('span');
    preview.className = 'marketplace-item-preview';
    const image = document.createElement('img');
    image.src = item.primaryTexture;
    image.alt = '';
    image.loading = 'lazy';
    image.decoding = 'async';
    preview.appendChild(image);

    const copy = document.createElement('span');
    copy.className = 'marketplace-item-copy';
    const eyebrow = document.createElement('small');
    eyebrow.textContent = `${item.slot || 'ITEM'} · ${item.variant}`;
    const name = document.createElement('strong');
    name.textContent = item.name;
    const geometry = document.createElement('span');
    geometry.textContent = `${item.elementCount} cuboids`;
    copy.append(eyebrow, name, geometry);
    button.append(preview, copy);
    button.addEventListener('click', () => loadItem(item));
    return button;
  };

  itemList.replaceChildren(...items.map(createItemButton));

  const rotateBy = (yawDelta, pitchDelta = 0) => {
    state.yawOffset += yawDelta;
    state.pitchOffset = clamp(state.pitchOffset + pitchDelta, -65 * DEG, 65 * DEG);
    render();
  };

  root.querySelectorAll('[data-viewer-control]').forEach(button => {
    button.addEventListener('click', () => {
      const action = button.dataset.viewerControl;
      if (action === 'left') rotateBy(-15 * DEG);
      else if (action === 'right') rotateBy(15 * DEG);
      else if (action === 'up') rotateBy(0, -8 * DEG);
      else if (action === 'down') rotateBy(0, 8 * DEG);
      else if (action === 'zoom-in') { state.zoom = clamp(state.zoom + 0.1, 0.7, 1.8); render(); }
      else if (action === 'zoom-out') { state.zoom = clamp(state.zoom - 0.1, 0.7, 1.8); render(); }
      else if (action === 'reset') { state.yawOffset = 0; state.pitchOffset = 0; state.zoom = 1; render(); }
    });
  });

  stage.addEventListener('pointerdown', event => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    state.dragging = true;
    state.pointerId = event.pointerId;
    state.lastX = event.clientX;
    state.lastY = event.clientY;
    stage.classList.add('is-dragging');
    stage.setPointerCapture?.(event.pointerId);
  });

  stage.addEventListener('pointermove', event => {
    if (!state.dragging || state.pointerId !== event.pointerId) return;
    const dx = event.clientX - state.lastX;
    const dy = event.clientY - state.lastY;
    state.lastX = event.clientX;
    state.lastY = event.clientY;
    rotateBy(dx * 0.011, dy * 0.007);
  });

  const endDrag = event => {
    if (!state.dragging || state.pointerId !== event.pointerId) return;
    state.dragging = false;
    state.pointerId = null;
    stage.classList.remove('is-dragging');
    if (stage.hasPointerCapture?.(event.pointerId)) stage.releasePointerCapture(event.pointerId);
  };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  stage.addEventListener('wheel', event => {
    if (!state.model) return;
    event.preventDefault();
    state.zoom = clamp(state.zoom + (event.deltaY < 0 ? 0.08 : -0.08), 0.7, 1.8);
    render();
  }, { passive: false });

  stage.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') rotateBy(-15 * DEG);
    else if (event.key === 'ArrowRight') rotateBy(15 * DEG);
    else if (event.key === 'ArrowUp') rotateBy(0, -8 * DEG);
    else if (event.key === 'ArrowDown') rotateBy(0, 8 * DEG);
    else if (event.key === '+' || event.key === '=') { state.zoom = clamp(state.zoom + 0.1, 0.7, 1.8); render(); }
    else if (event.key === '-' || event.key === '_') { state.zoom = clamp(state.zoom - 0.1, 0.7, 1.8); render(); }
    else if (event.key === 'Home') { state.yawOffset = 0; state.pitchOffset = 0; state.zoom = 1; render(); }
    else return;
    event.preventDefault();
  });

  const subnav = document.querySelector('[data-marketplace-subnav]');
  const updateSubnav = () => {
    if (!subnav) return;
    const target = location.hash || '#overview';
    subnav.querySelectorAll('a[href^="#"]').forEach(link => {
      const active = link.getAttribute('href') === target;
      link.classList.toggle('is-current', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  addEventListener('hashchange', updateSubnav);
  updateSubnav();

  loadItem(items[0]);
})();
