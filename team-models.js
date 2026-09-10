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

  const UV = {
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

  const PARTS = [
    { key:'head', center:[0,-14,0], size:[8,8,8] },
    { key:'body', center:[0,-4,0], size:[8,12,4] },
    { key:'rightArm', center:[-6,-4,0], size:[4,12,4] },
    { key:'leftArm', center:[6,-4,0], size:[4,12,4] },
    { key:'rightLeg', center:[-2,8,0], size:[4,12,4] },
    { key:'leftLeg', center:[2,8,0], size:[4,12,4] }
  ];

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

  const rotateNormal = (normal, yaw, pitch) => rotatePoint(normal, yaw, pitch);

  const buildFaces = (part, layer, yaw, pitch) => {
    const expansion = layer === 'outer' ? (part.key === 'head' ? .34 : .24) : 0;
    const [width, height, depth] = part.size;
    const x = width / 2 + expansion;
    const y = height / 2 + expansion;
    const z = depth / 2 + expansion;
    const [cx, cy, cz] = part.center;
    const uv = UV[part.key]?.[layer];
    if (!uv) return [];

    return Object.entries(FACE_DEFS).flatMap(([name, def]) => {
      const normal = rotateNormal(def.normal, yaw, pitch);
      if (normal[2] >= -.001) return [];
      const texture = uv[name];
      if (!texture) return [];

      const points = def.corners(x, y, z).map(([px, py, pz]) =>
        rotatePoint([px + cx, py + cy, pz + cz], yaw, pitch)
      );
      const depthValue = points.reduce((sum, point) => sum + point[2], 0) / points.length;
      return [{ points, texture, depth: depthValue, layer }];
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
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);
    ctx.restore();
  };

  const createRenderer = viewer => {
    const player = String(viewer.dataset.player || '').trim();
    const canvas = viewer.querySelector('canvas');
    const status = viewer.querySelector('[data-skin-status]');
    if (!player || !canvas) return;

    const ctx = canvas.getContext('2d', { alpha:true });
    if (!ctx) return;

    let yaw = Number(viewer.dataset.yaw || -28) * DEG;
    let pitch = Number(viewer.dataset.pitch || -7) * DEG;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let skin = null;

    const render = () => {
      if (!skin) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = false;

      const scale = Math.min(canvas.width / 34, canvas.height / 39);
      const centerX = canvas.width / 2;
      const centerY = canvas.height * .52;
      const faces = [];

      PARTS.forEach(part => {
        faces.push(...buildFaces(part, 'base', yaw, pitch));
        if (skin.height >= 64) faces.push(...buildFaces(part, 'outer', yaw, pitch));
      });

      faces.sort((a, b) => b.depth - a.depth);
      faces.forEach(face => drawTexturedFace(ctx, skin, face, scale, centerX, centerY));
    };

    const setStatus = text => {
      if (status) status.textContent = text;
    };

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.decoding = 'async';
    image.onload = () => {
      skin = image;
      viewer.classList.add('is-ready');
      viewer.classList.remove('is-error');
      setStatus('Drag to rotate · live skin by username');
      render();
    };
    image.onerror = () => {
      viewer.classList.add('is-error');
      setStatus('Live skin unavailable · try again later');
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
        yaw = -28 * DEG;
        pitch = -7 * DEG;
      } else return;
      event.preventDefault();
      render();
    });
  };

  viewers.forEach(createRenderer);
})();