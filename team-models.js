(() => {
  const viewers = [...document.querySelectorAll('[data-skin-viewer]')];
  if (!viewers.length) return;

  const DEG = Math.PI / 180;
  const SKIN_BASE = 'https://api.mcheads.org/skin/';

  const FACE_DEFS = {
    front: {
      normal: [0, 0, -1],
      corners: (x, y, z) => [[-x, -y, -z], [x, -y, -z], [x, y, -z], [-x, y, -z]]
    },
    back: {
      normal: [0, 0, 1],
      corners: (x, y, z) => [[x, -y, z], [-x, -y, z], [-x, y, z], [x, y, z]]
    },
    left: {
      normal: [-1, 0, 0],
      corners: (x, y, z) => [[-x, -y, z], [-x, -y, -z], [-x, y, -z], [-x, y, z]]
    },
    right: {
      normal: [1, 0, 0],
      corners: (x, y, z) => [[x, -y, -z], [x, -y, z], [x, y, z], [x, y, -z]]
    },
    top: {
      normal: [0, -1, 0],
      corners: (x, y, z) => [[-x, -y, z], [x, -y, z], [x, -y, -z], [-x, -y, -z]]
    },
    bottom: {
      normal: [0, 1, 0],
      corners: (x, y, z) => [[-x, y, -z], [x, y, -z], [x, y, z], [-x, y, z]]
    }
  };

  const CLASSIC_UV = {
    head: {
      base: { top:[8,0,8,8], bottom:[16,0,8,8], right:[0,8,8,8], front:[8,8,8,8], left:[16,8,8,8], back:[24,8,8,8] },
      outer:{ top:[40,0,8,8], bottom:[48,0,8,8], right:[32,8,8,8], front:[40,8,8,8], left:[48,8,8,8], back:[56,8,8,8] }
    },
    body: {
      base: { top:[20,16,8,4], bottom:[28,16,8,4], right:[16,20,4,12], front:[20,20,8,12], left:[28,20,4,12], back:[32,20,8,12] },
      outer:{ top:[20,32,8,4], bottom:[28,32,8,4], right:[16,36,4,12], front:[20,36,8,12], left:[28,36,4,12], back:[32,36,8,12] }
    },
    rightArm: {
      base: { top:[44,16,4,4], bottom:[48,16,4,4], right:[40,20,4,12], front:[44,20,4,12], left:[48,20,4,12], back:[52,20,4,12] },
      outer:{ top:[44,32,4,4], bottom:[48,32,4,4], right:[40,36,4,12], front:[44,36,4,12], left:[48,36,4,12], back:[52,36,4,12] }
    },
    leftArm: {
      base: { top:[36,48,4,4], bottom:[40,48,4,4], right:[32,52,4,12], front:[36,52,4,12], left:[40,52,4,12], back:[44,52,4,12] },
      outer:{ top:[52,48,4,4], bottom:[56,48,4,4], right:[48,52,4,12], front:[52,52,4,12], left:[56,52,4,12], back:[60,52,4,12] }
    },
    rightLeg: {
      base: { top:[4,16,4,4], bottom:[8,16,4,4], right:[0,20,4,12], front:[4,20,4,12], left:[8,20,4,12], back:[12,20,4,12] },
      outer:{ top:[4,32,4,4], bottom:[8,32,4,4], right:[0,36,4,12], front:[4,36,4,12], left:[8,36,4,12], back:[12,36,4,12] }
    },
    leftLeg: {
      base: { top:[20,48,4,4], bottom:[24,48,4,4], right:[16,52,4,12], front:[20,52,4,12], left:[24,52,4,12], back:[28,52,4,12] },
      outer:{ top:[4,48,4,4], bottom:[8,48,4,4], right:[0,52,4,12], front:[4,52,4,12], left:[8,52,4,12], back:[12,52,4,12] }
    }
  };

  const SLIM_ARM_UV = {
    rightArm: {
      base: { top:[44,16,3,4], bottom:[47,16,3,4], right:[40,20,4,12], front:[44,20,3,12], left:[47,20,4,12], back:[51,20,3,12] },
      outer:{ top:[44,32,3,4], bottom:[47,32,3,4], right:[40,36,4,12], front:[44,36,3,12], left:[47,36,4,12], back:[51,36,3,12] }
    },
    leftArm: {
      base: { top:[36,48,3,4], bottom:[39,48,3,4], right:[32,52,4,12], front:[36,52,3,12], left:[39,52,4,12], back:[43,52,3,12] },
      outer:{ top:[52,48,3,4], bottom:[55,48,3,4], right:[48,52,4,12], front:[52,52,3,12], left:[55,52,4,12], back:[59,52,3,12] }
    }
  };

  const createUvMap = slim => slim
    ? { ...CLASSIC_UV, rightArm:SLIM_ARM_UV.rightArm, leftArm:SLIM_ARM_UV.leftArm }
    : CLASSIC_UV;

  const createParts = slim => [
    { key:'head', center:[0,-14,0], size:[8,8,8] },
    { key:'body', center:[0,-4,0], size:[8,12,4] },
    { key:'rightArm', center:[slim ? -5.5 : -6,-4,0], size:[slim ? 3 : 4,12,4] },
    { key:'leftArm', center:[slim ? 5.5 : 6,-4,0], size:[slim ? 3 : 4,12,4] },
    { key:'rightLeg', center:[-2,8,0], size:[4,12,4] },
    { key:'leftLeg', center:[2,8,0], size:[4,12,4] }
  ];

  const detectSlimSkin = image => {
    if ((image.naturalWidth || image.width) < 64 || (image.naturalHeight || image.height) < 64) return false;
    const probe = document.createElement('canvas');
    probe.width = 64;
    probe.height = 64;
    const probeCtx = probe.getContext('2d', { willReadFrequently:true });
    if (!probeCtx) return false;
    try {
      probeCtx.clearRect(0,0,64,64);
      probeCtx.drawImage(image,0,0,64,64);
      const unusedSlimStrips = [[54,20,2,12],[46,52,2,12]];
      return unusedSlimStrips.every(([x,y,w,h]) => {
        const pixels = probeCtx.getImageData(x,y,w,h).data;
        for (let i=3;i<pixels.length;i+=4) if (pixels[i] !== 0) return false;
        return true;
      });
    } catch {
      return false;
    }
  };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const rotatePoint = (point, yaw, pitch) => {
    const [x, y, z] = point;
    const cy = Math.cos(yaw);
    const sy = Math.sin(yaw);
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);
    const yawX = x * cy - z * sy;
    const yawZ = x * sy + z * cy;
    return [yawX, y * cp - yawZ * sp, y * sp + yawZ * cp];
  };

  const buildFaces = (part, layer, yaw, pitch, uvMap) => {
    const expansion = layer === 'outer' ? (part.key === 'head' ? .34 : .24) : 0;
    const [width, height, depth] = part.size;
    const x = width / 2 + expansion;
    const y = height / 2 + expansion;
    const z = depth / 2 + expansion;
    const [cx, cy, cz] = part.center;
    const uv = uvMap[part.key]?.[layer];
    if (!uv) return [];

    return Object.entries(FACE_DEFS).flatMap(([name, def]) => {
      const normal = rotatePoint(def.normal, yaw, pitch);
      if (normal[2] >= -.001) return [];
      const texture = uv[name];
      if (!texture) return [];

      const points = def.corners(x, y, z).map(([px, py, pz]) =>
        rotatePoint([px + cx, py + cy, pz + cz], yaw, pitch)
      );
      const depthValue = points.reduce((sum, point) => sum + point[2], 0) / points.length;
      const flipX = part.key === 'head' && layer === 'outer' && (name === 'left' || name === 'right');
      return [{ points, texture, depth:depthValue, flipX }];
    });
  };

  const drawTexturedFace = (ctx, image, face, scale, centerX, centerY) => {
    const projected = face.points.map(([x, y]) => ({ x:centerX + x * scale, y:centerY + y * scale }));
    const [p0, p1, , p3] = projected;
    const [sx, sy, sw, sh] = face.texture;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(projected[0].x, projected[0].y);
    projected.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
    ctx.closePath();
    ctx.clip();
    ctx.transform(
      (p1.x - p0.x) / sw,
      (p1.y - p0.y) / sw,
      (p3.x - p0.x) / sh,
      (p3.y - p0.y) / sh,
      p0.x,
      p0.y
    );
    if (face.flipX) {
      ctx.translate(sw, 0);
      ctx.scale(-1, 1);
    }
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);
    ctx.restore();
  };

  const createRenderer = viewer => {
    const player = String(viewer.dataset.player || '').trim();
    const canvas = viewer.querySelector('canvas');
    if (!player || !canvas) return;

    const ctx = canvas.getContext('2d', { alpha:true });
    if (!ctx) return;

    const initialYaw = Number(viewer.dataset.yaw || -28) * DEG;
    const initialPitch = Number(viewer.dataset.pitch || -7) * DEG;
    let yaw = initialYaw;
    let pitch = initialPitch;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let skin = null;
    let skinUv = CLASSIC_UV;
    let skinParts = createParts(false);

    const render = () => {
      if (!skin) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = false;

      const scale = Math.min(canvas.width / 34, canvas.height / 39);
      const centerX = canvas.width / 2;
      const centerY = canvas.height * .52;
      const faces = [];

      skinParts.forEach(part => {
        faces.push(...buildFaces(part, 'base', yaw, pitch, skinUv));
        if (skin.height >= 64) faces.push(...buildFaces(part, 'outer', yaw, pitch, skinUv));
      });

      faces.sort((a, b) => b.depth - a.depth);
      faces.forEach(face => drawTexturedFace(ctx, skin, face, scale, centerX, centerY));
    };

    const showFallbackRender = () => {
      const visual = viewer.closest('.mc-owner-visual') || viewer.parentElement;
      if (!visual) return;
      let fallback = visual.querySelector(':scope > .owner-skin-fallback');
      if (!fallback) {
        fallback = document.createElement('img');
        fallback.className = 'owner-skin-fallback';
        fallback.width = 320;
        fallback.height = 320;
        fallback.alt = `Current ${player} Minecraft skin render`;
        visual.appendChild(fallback);
      }
      viewer.hidden = true;
      fallback.src = `https://api.mcheads.org/player/${encodeURIComponent(player)}/320`;
    };

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.decoding = 'async';
    image.onload = () => {
      skin = image;
      const slim = detectSlimSkin(image);
      skinUv = createUvMap(slim);
      skinParts = createParts(slim);
      viewer.dataset.skinModel = slim ? 'slim' : 'classic';
      viewer.classList.add('is-ready');
      viewer.classList.remove('is-error');
      render();
    };
    image.onerror = () => {
      viewer.classList.add('is-error');
      viewer.classList.remove('is-ready');
      showFallbackRender();
    };
    image.src = `${SKIN_BASE}${encodeURIComponent(player)}`;

    const startDrag = event => {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      viewer.classList.add('is-dragging');
      viewer.setPointerCapture?.(event.pointerId);
    };

    const moveDrag = event => {
      if (!dragging) return;
      const deltaX = event.clientX - lastX;
      const deltaY = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      yaw += deltaX * .011;
      pitch = clamp(pitch + deltaY * .006, -24 * DEG, 18 * DEG);
      render();
    };

    const stopDrag = event => {
      if (!dragging) return;
      dragging = false;
      viewer.classList.remove('is-dragging');
      if (viewer.hasPointerCapture?.(event.pointerId)) viewer.releasePointerCapture(event.pointerId);
    };

    viewer.addEventListener('pointerdown', startDrag);
    viewer.addEventListener('pointermove', moveDrag);
    viewer.addEventListener('pointerup', stopDrag);
    viewer.addEventListener('pointercancel', stopDrag);

    viewer.addEventListener('keydown', event => {
      const yawStep = 15 * DEG;
      const pitchStep = 5 * DEG;
      if (event.key === 'ArrowLeft') yaw -= yawStep;
      else if (event.key === 'ArrowRight') yaw += yawStep;
      else if (event.key === 'ArrowUp') pitch = clamp(pitch - pitchStep, -24 * DEG, 18 * DEG);
      else if (event.key === 'ArrowDown') pitch = clamp(pitch + pitchStep, -24 * DEG, 18 * DEG);
      else if (event.key === 'Home') {
        yaw = initialYaw;
        pitch = initialPitch;
      } else return;
      event.preventDefault();
      render();
    });
  };

  viewers.forEach(createRenderer);
})();
