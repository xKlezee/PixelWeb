(() => {
  'use strict';

  const marketplace = window.PIXEL_MARKETPLACE;
  const root = document.querySelector('[data-marketplace-root]');
  if (!marketplace || !root) return;

  const collection = marketplace.acquisitionGroups?.[0]?.rotations?.[0]?.collections?.[0];
  const items = Array.isArray(collection?.items) ? collection.items : [];
  const stage = root.querySelector('[data-model-stage]');
  const mainCanvas = root.querySelector('[data-model-canvas]');
  const itemList = root.querySelector('[data-marketplace-items]');
  const activeNameNodes = root.querySelectorAll('[data-active-name]');
  const activeVariant = root.querySelector('[data-active-variant]');
  const activeSlot = root.querySelector('[data-active-slot]');
  const activeCollection = root.querySelector('[data-active-collection]');
  const activeRotation = root.querySelector('[data-active-rotation]');

  if (!stage || !(mainCanvas instanceof HTMLCanvasElement) || !itemList || !items.length) return;

  const DEG = Math.PI / 180;
  const TAU = Math.PI * 2;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CATALOG_ROTATION = Object.freeze([0, 90 * DEG, 0]);
  const PREVIEW_SPIN_SPEED = 0.48;
  const PREVIEW_TARGET_OCCUPANCY = 0.62;
  const INSPECT_TARGET_OCCUPANCY = 0.66;
  const VISUAL_SCALE_SAMPLES = 8;
  const previewSpinEpoch = performance.now();

  const FACE_NORMALS = Object.freeze({
    north: [0, 0, -1], south: [0, 0, 1], west: [-1, 0, 0],
    east: [1, 0, 0], up: [0, 1, 0], down: [0, -1, 0]
  });
  const FACE_CORNERS = Object.freeze({
    north: [2, 3, 0, 1], south: [7, 6, 5, 4], west: [3, 7, 4, 0],
    east: [6, 2, 1, 5], up: [3, 2, 6, 7], down: [4, 5, 1, 0]
  });

  const assetCache = new Map();
  const imageCache = new Map();
  const metadataCache = new Map();
  const visualScaleCache = new Map();
  const renderers = new Set();
  const previewRenderers = new Map();
  let lastFrameTime = 0;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const wrapAngle = value => {
    let angle = value % TAU;
    if (angle > Math.PI) angle -= TAU;
    if (angle < -Math.PI) angle += TAU;
    return angle;
  };
  const lerpAngle = (from, to, amount) => from + wrapAngle(to - from) * amount;

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
    if (!rotation?.axis || !Number.isFinite(Number(rotation.angle))) return [...point];
    const origin = Array.isArray(rotation.origin) && rotation.origin.length === 3
      ? rotation.origin.map(Number)
      : [8, 8, 8];
    return rotateAxis(point, rotation.axis, Number(rotation.angle) * DEG, origin);
  };

  const elementVertices = element => {
    const from = element.from.map(Number);
    const to = element.to.map(Number);
    return [
      [from[0], from[1], from[2]], [to[0], from[1], from[2]],
      [to[0], to[1], from[2]], [from[0], to[1], from[2]],
      [from[0], from[1], to[2]], [to[0], from[1], to[2]],
      [to[0], to[1], to[2]], [from[0], to[1], to[2]]
    ].map(point => applyElementRotation(point, element));
  };

  const elementNormal = (faceName, element) => {
    const normal = FACE_NORMALS[faceName] || [0, 0, 1];
    const rotation = element?.rotation;
    if (!rotation?.axis || !Number.isFinite(Number(rotation.angle))) return [...normal];
    return rotateVector(normal, rotation.axis, Number(rotation.angle) * DEG);
  };

  const loadJson = (src, cache) => {
    if (!src) return Promise.resolve(null);
    if (!cache.has(src)) {
      cache.set(src, fetch(src, { cache: 'force-cache' }).then(response => {
        if (!response.ok) throw new Error(`Request failed (${response.status}): ${src}`);
        return response.json();
      }));
    }
    return cache.get(src);
  };

  const loadImage = src => {
    if (!imageCache.has(src)) {
      imageCache.set(src, new Promise((resolve, reject) => {
        const image = new Image();
        image.decoding = 'async';
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`Texture unavailable: ${src}`));
        image.src = src;
      }));
    }
    return imageCache.get(src);
  };

  const loadTexture = async (src, metadataSrc = null) => {
    const [image, metadata] = await Promise.all([
      loadImage(src),
      metadataSrc ? loadJson(metadataSrc, metadataCache).catch(() => null) : Promise.resolve(null)
    ]);
    const frameTime = Number(metadata?.animation?.frametime);
    const animated = Number.isFinite(frameTime) && frameTime > 0;
    const verticalFrames = animated && image.width > 0 && image.height >= image.width && image.height % image.width === 0;
    return {
      image,
      frameHeight: verticalFrames ? image.width : image.height,
      frameCount: verticalFrames ? Math.max(1, image.height / image.width) : 1,
      frameTimeMs: animated ? frameTime * 50 : 0
    };
  };

  const loadItemAssets = item => {
    if (!assetCache.has(item.model)) {
      assetCache.set(item.model, (async () => {
        const model = await loadJson(item.model, new Map());
        const texturePairs = await Promise.all(Object.entries(item.textures || {}).map(async ([key, path]) => [
          path,
          await loadTexture(path, item.animationMetadata?.[key] || null)
        ]));
        return { model, textures: new Map(texturePairs) };
      })());
    }
    return assetCache.get(item.model);
  };

  class MinecraftModelRenderer {
    constructor(canvas, { preview = false } = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d', { alpha: true });
      this.preview = preview;
      this.item = null;
      this.model = null;
      this.textures = new Map();
      this.preparedElements = [];
      this.center = [0, 0, 0];
      this.extent = 16;
      this.visualScale = 1;
      this.baseRotation = [...CATALOG_ROTATION];
      this.currentYaw = 0;
      this.currentPitch = 0;
      this.targetYaw = 0;
      this.targetPitch = 0;
      this.anchorYaw = 0;
      this.anchorPitch = 0;
      this.zoom = preview ? 1.05 : 1;
      this.ready = false;
      this.dirty = true;
      this.dragging = false;
      renderers.add(this);
    }

    async setItem(item, pose = null) {
      this.item = item;
      this.ready = false;
      this.dirty = true;
      this.zoom = this.preview ? 1.05 : 1;
      this.visualScale = 1;
      this.canvas.closest('[data-model-stage], .marketplace-item-preview')?.classList.add('is-loading');
      try {
        const assets = await loadItemAssets(item);
        if (this.item !== item) return;
        this.model = assets.model;
        this.textures = assets.textures;
        this.baseRotation = [...CATALOG_ROTATION];
        this.prepareModel();

        const initialYaw = this.preview ? 0 : (Number.isFinite(pose?.yaw) ? pose.yaw : 0);
        const initialPitch = this.preview ? 0 : (Number.isFinite(pose?.pitch) ? pose.pitch : 0);
        this.currentYaw = initialYaw;
        this.targetYaw = initialYaw;
        this.anchorYaw = initialYaw;
        this.currentPitch = initialPitch;
        this.targetPitch = initialPitch;
        this.anchorPitch = initialPitch;

        this.ready = true;
        this.visualScale = this.resolveVisualScale();
        this.currentYaw = initialYaw;
        this.targetYaw = initialYaw;
        this.anchorYaw = initialYaw;
        this.currentPitch = initialPitch;
        this.targetPitch = initialPitch;
        this.anchorPitch = initialPitch;
        this.dirty = true;
        this.canvas.closest('[data-model-stage], .marketplace-item-preview')?.classList.remove('is-loading', 'is-error');
        this.render();
      } catch (error) {
        this.ready = false;
        this.canvas.closest('[data-model-stage], .marketplace-item-preview')?.classList.remove('is-loading');
        this.canvas.closest('[data-model-stage], .marketplace-item-preview')?.classList.add('is-error');
        this.clear();
        console.error(error);
      }
    }

    prepareModel() {
      const prepared = [];
      const all = [];
      const elements = Array.isArray(this.model?.elements) ? this.model.elements : [];
      elements.forEach(element => {
        if (!Array.isArray(element?.from) || !Array.isArray(element?.to)) return;
        const vertices = elementVertices(element);
        prepared.push({ element, vertices });
        vertices.forEach(point => all.push(point));
      });
      if (!all.length) {
        this.center = [8, 8, 8];
        this.extent = 16;
      } else {
        const mins = [Infinity, Infinity, Infinity];
        const maxs = [-Infinity, -Infinity, -Infinity];
        all.forEach(point => point.forEach((value, index) => {
          mins[index] = Math.min(mins[index], value);
          maxs[index] = Math.max(maxs[index], value);
        }));
        this.center = mins.map((value, index) => (value + maxs[index]) / 2);
        this.extent = Math.max(1, ...mins.map((value, index) => maxs[index] - value));
      }
      this.preparedElements = prepared;
    }

    resolveTexturePath(reference) {
      if (typeof reference !== 'string' || !reference.startsWith('#')) return null;
      return this.item?.textures?.[reference.slice(1)] || null;
    }

    applyGlobalRotation(point) {
      let next = [point[0] - this.center[0], point[1] - this.center[1], point[2] - this.center[2]];
      next = rotateAxis(next, 'x', this.baseRotation[0] + this.currentPitch);
      next = rotateAxis(next, 'y', this.baseRotation[1] + this.currentYaw);
      return rotateAxis(next, 'z', this.baseRotation[2]);
    }

    applyGlobalNormalRotation(normal) {
      let next = rotateVector(normal, 'x', this.baseRotation[0] + this.currentPitch);
      next = rotateVector(next, 'y', this.baseRotation[1] + this.currentYaw);
      return rotateVector(next, 'z', this.baseRotation[2]);
    }

    project(point) {
      const baseScale = Math.min(this.canvas.width, this.canvas.height)
        / (this.extent * (this.preview ? 1.35 : 1.48));
      const scale = baseScale * this.zoom * this.visualScale;
      return {
        x: this.canvas.width * 0.5 + point[0] * scale,
        y: this.canvas.height * (this.preview ? 0.51 : 0.5) - point[1] * scale,
        z: point[2]
      };
    }

    textureFrame(texture, now = performance.now()) {
      if (!texture || texture.frameCount <= 1 || !texture.frameTimeMs || reducedMotion) return 0;
      return Math.floor(now / texture.frameTimeMs) % texture.frameCount;
    }

    drawTexturedFace(face, texture, points, now) {
      if (!texture || !Array.isArray(face?.uv) || face.uv.length !== 4) return;
      const image = texture.image;
      const frameHeight = texture.frameHeight;
      const frameOffset = this.textureFrame(texture, now) * frameHeight;
      const [u1, v1, u2, v2] = face.uv.map(Number);
      const sx = (u1 / 16) * image.width;
      const ex = (u2 / 16) * image.width;
      const sy = frameOffset + (v1 / 16) * frameHeight;
      const ey = frameOffset + (v2 / 16) * frameHeight;
      const du = ex - sx;
      const dv = ey - sy;
      if (Math.abs(du) < 0.00001 || Math.abs(dv) < 0.00001) return;

      const [p0, p1, , p3] = points;
      const a = (p1.x - p0.x) / du;
      const b = (p1.y - p0.y) / du;
      const c = (p3.x - p0.x) / dv;
      const d = (p3.y - p0.y) / dv;
      const e = p0.x - a * sx - c * sy;
      const f = p0.y - b * sx - d * sy;

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.moveTo(points[0].x, points[0].y);
      points.slice(1).forEach(point => this.ctx.lineTo(point.x, point.y));
      this.ctx.closePath();
      this.ctx.clip();
      this.ctx.imageSmoothingEnabled = false;
      this.ctx.setTransform(a, b, c, d, e, f);
      this.ctx.drawImage(image, 0, 0);
      this.ctx.restore();
    }

    clear() {
      if (!this.ctx) return;
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    render(now = performance.now()) {
      if (!this.ctx) return;
      this.clear();
      if (!this.ready || !this.model || !this.item) return;

      const faces = [];
      this.preparedElements.forEach(({ element, vertices }) => {
        const transformed = vertices.map(point => this.applyGlobalRotation(point));
        Object.entries(element.faces || {}).forEach(([faceName, face]) => {
          const cornerIndices = FACE_CORNERS[faceName];
          if (!cornerIndices || !face?.texture) return;
          const normal = this.applyGlobalNormalRotation(elementNormal(faceName, element));
          if (normal[2] <= 0.001) return;
          const texturePath = this.resolveTexturePath(face.texture);
          const texture = texturePath ? this.textures.get(texturePath) : null;
          if (!texture) return;
          const points3d = cornerIndices.map(index => transformed[index]);
          faces.push({
            face,
            texture,
            points: points3d.map(point => this.project(point)),
            depth: points3d.reduce((sum, point) => sum + point[2], 0) / points3d.length
          });
        });
      });
      faces.sort((a, b) => a.depth - b.depth);
      faces.forEach(entry => this.drawTexturedFace(entry.face, entry.texture, entry.points, now));
      this.dirty = false;
    }

    measureVisibleSpan() {
      if (!this.ctx) return 0;
      const { width, height } = this.canvas;
      const pixels = this.ctx.getImageData(0, 0, width, height).data;
      let minX = width;
      let minY = height;
      let maxX = -1;
      let maxY = -1;
      for (let y = 0; y < height; y += 1) {
        const row = y * width * 4;
        for (let x = 0; x < width; x += 1) {
          if (pixels[row + x * 4 + 3] <= 8) continue;
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      }
      if (maxX < minX || maxY < minY) return 0;
      return Math.max(maxX - minX + 1, maxY - minY + 1);
    }

    resolveVisualScale() {
      const key = `${this.item?.id || this.item?.model}:${this.preview ? 'preview' : 'inspect'}`;
      const cached = visualScaleCache.get(key);
      if (Number.isFinite(cached)) return cached;

      const savedYaw = this.currentYaw;
      const savedPitch = this.currentPitch;
      const savedTargetYaw = this.targetYaw;
      const savedTargetPitch = this.targetPitch;
      const savedAnchorYaw = this.anchorYaw;
      const savedAnchorPitch = this.anchorPitch;
      const savedScale = this.visualScale;
      const now = performance.now();
      let maxVisibleSpan = 0;

      this.visualScale = 1;
      this.currentPitch = 0;
      for (let index = 0; index < VISUAL_SCALE_SAMPLES; index += 1) {
        this.currentYaw = (index / VISUAL_SCALE_SAMPLES) * TAU;
        this.render(now);
        maxVisibleSpan = Math.max(maxVisibleSpan, this.measureVisibleSpan());
      }

      const targetOccupancy = this.preview ? PREVIEW_TARGET_OCCUPANCY : INSPECT_TARGET_OCCUPANCY;
      const targetSpan = Math.min(this.canvas.width, this.canvas.height) * targetOccupancy;
      const resolved = maxVisibleSpan > 0
        ? clamp(targetSpan / maxVisibleSpan, 0.3, 3.2)
        : savedScale;

      visualScaleCache.set(key, resolved);
      this.currentYaw = savedYaw;
      this.currentPitch = savedPitch;
      this.targetYaw = savedTargetYaw;
      this.targetPitch = savedTargetPitch;
      this.anchorYaw = savedAnchorYaw;
      this.anchorPitch = savedAnchorPitch;
      this.visualScale = resolved;
      this.dirty = true;
      this.clear();
      return resolved;
    }

    hasAnimatedTexture() {
      return [...this.textures.values()].some(texture => texture.frameCount > 1 && texture.frameTimeMs > 0);
    }

    tick(deltaSeconds, now) {
      if (!this.ready) return;

      if (this.preview) {
        this.currentPitch = 0;
        this.targetPitch = 0;
        this.anchorPitch = 0;
        if (!reducedMotion) {
          const spinYaw = wrapAngle(((now - previewSpinEpoch) / 1000) * PREVIEW_SPIN_SPEED);
          this.currentYaw = spinYaw;
          this.targetYaw = spinYaw;
          this.anchorYaw = spinYaw;
          this.dirty = true;
        } else if (Math.abs(this.currentYaw) > 0.0001) {
          this.currentYaw = 0;
          this.targetYaw = 0;
          this.anchorYaw = 0;
          this.dirty = true;
        }
      } else {
        if (!this.dragging && !reducedMotion) {
          this.anchorYaw = wrapAngle(this.anchorYaw + PREVIEW_SPIN_SPEED * deltaSeconds);
          this.targetYaw = this.anchorYaw;
        }
        const easing = 1 - Math.pow(0.0008, Math.min(deltaSeconds, 0.05));
        const nextYaw = lerpAngle(this.currentYaw, this.targetYaw, easing);
        const nextPitch = this.currentPitch + (this.targetPitch - this.currentPitch) * easing;
        if (Math.abs(wrapAngle(nextYaw - this.currentYaw)) > 0.0001 || Math.abs(nextPitch - this.currentPitch) > 0.0001) {
          this.currentYaw = nextYaw;
          this.currentPitch = nextPitch;
          this.dirty = true;
        }
      }

      if (this.dirty || (!reducedMotion && this.hasAnimatedTexture())) this.render(now);
    }

    nudge(yawDelta, pitchDelta = 0) {
      if (this.preview) return;
      this.anchorYaw = wrapAngle(this.anchorYaw + yawDelta);
      this.anchorPitch = clamp(this.anchorPitch + pitchDelta, -0.62, 0.62);
      this.targetYaw = this.anchorYaw;
      this.targetPitch = this.anchorPitch;
    }

    getPose() {
      return { yaw: this.currentYaw, pitch: this.preview ? 0 : this.currentPitch };
    }
  }

  const bindDragRotation = (surface, renderer) => {
    let pointerId = null;
    let lastX = 0;
    let lastY = 0;

    surface.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      pointerId = event.pointerId;
      lastX = event.clientX;
      lastY = event.clientY;
      renderer.dragging = true;
      surface.classList.add('is-dragging');
      surface.setPointerCapture?.(event.pointerId);
    });

    surface.addEventListener('pointermove', event => {
      if (event.pointerId !== pointerId || !renderer.ready) return;
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      renderer.nudge(dx * 0.010, dy * 0.0065);
    });

    const endDrag = event => {
      if (event.pointerId !== pointerId) return;
      pointerId = null;
      renderer.dragging = false;
      surface.classList.remove('is-dragging');
      if (surface.hasPointerCapture?.(event.pointerId)) surface.releasePointerCapture(event.pointerId);
    };

    surface.addEventListener('pointerup', endDrag);
    surface.addEventListener('pointercancel', endDrag);
  };

  const mainRenderer = new MinecraftModelRenderer(mainCanvas);
  bindDragRotation(stage, mainRenderer);

  const selectItem = async (item, pose = null) => {
    activeNameNodes.forEach(node => { node.textContent = item.name; });
    if (activeVariant) activeVariant.textContent = item.variant;
    if (activeSlot) activeSlot.textContent = item.slot || 'Item';
    if (activeCollection) activeCollection.textContent = collection?.name || 'Luminite';
    if (activeRotation) activeRotation.textContent = marketplace.acquisitionGroups?.[0]?.rotations?.[0]?.name || 'Rotation 01';

    itemList.querySelectorAll('button[data-item-id]').forEach(button => {
      const selected = button.dataset.itemId === item.id;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });

    stage.classList.add('is-loading');
    await mainRenderer.setItem(item, pose);
    stage.classList.remove('is-loading');
  };

  const createItemButton = item => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'marketplace-item-card';
    button.dataset.itemId = item.id;
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-label', `Inspect ${item.name}`);

    const preview = document.createElement('span');
    preview.className = 'marketplace-item-preview is-loading';
    const previewCanvas = document.createElement('canvas');
    previewCanvas.width = 360;
    previewCanvas.height = 300;
    previewCanvas.setAttribute('aria-hidden', 'true');
    preview.appendChild(previewCanvas);

    const copy = document.createElement('span');
    copy.className = 'marketplace-item-copy';
    const eyebrow = document.createElement('small');
    eyebrow.textContent = `${item.slot || 'ITEM'} · ${item.variant}`;
    const name = document.createElement('strong');
    name.textContent = item.name;
    copy.append(eyebrow, name);
    button.append(preview, copy);

    const renderer = new MinecraftModelRenderer(previewCanvas, { preview: true });
    previewRenderers.set(item.id, renderer);
    renderer.setItem(item);

    button.addEventListener('click', () => {
      const pose = renderer.getPose();
      selectItem(item, { yaw: pose.yaw, pitch: 0 });
    });
    return button;
  };

  itemList.replaceChildren(...items.map(createItemButton));

  stage.addEventListener('wheel', event => {
    if (!mainRenderer.ready) return;
    event.preventDefault();
    mainRenderer.zoom = clamp(mainRenderer.zoom + (event.deltaY < 0 ? 0.07 : -0.07), 0.78, 1.55);
    mainRenderer.dirty = true;
  }, { passive: false });

  const frame = now => {
    const deltaSeconds = lastFrameTime ? Math.min((now - lastFrameTime) / 1000, 0.05) : 0;
    lastFrameTime = now;
    renderers.forEach(renderer => renderer.tick(deltaSeconds, now));
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

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

  const firstPreview = previewRenderers.get(items[0].id);
  selectItem(items[0], firstPreview?.getPose() || { yaw: 0, pitch: 0 });
})();
