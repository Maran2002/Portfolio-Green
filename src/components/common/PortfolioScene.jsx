"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { markPortfolioBootTask } from "../../utils/portfolioBoot";

const vertexShader = `
  attribute float aSize;
  attribute float aAlpha;
  attribute float aPhase;
  attribute float aDrift;
  attribute vec3 aTint;
  uniform float uTime;
  uniform float uPixelRatio;
  varying vec3 vTint;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.x += sin(uTime * 0.12 + aPhase) * aDrift;
    p.y += cos(uTime * 0.10 + aPhase * 1.7) * aDrift * 0.62;
    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = clamp(aSize * uPixelRatio * (34.0 / -mvPosition.z), 0.7, 7.5);
    vTint = aTint;
    vAlpha = aAlpha;
  }
`;

const fragmentShader = `
  varying vec3 vTint;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    float core = 1.0 - smoothstep(0.08, 0.5, d);
    float halo = 1.0 - smoothstep(0.12, 0.5, d);
    gl_FragColor = vec4(vTint, vAlpha * core * (0.55 + halo * 0.45));
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function gaussian(random) {
  return Math.sqrt(-2 * Math.log(Math.max(random(), 0.0001))) * Math.cos(2 * Math.PI * random());
}

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function makeParticleLayer(scene, { count, seed, range, size, alpha, drift, tintSet }) {
  const random = seededRandom(seed);
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const alphas = new Float32Array(count);
  const phases = new Float32Array(count);
  const drifts = new Float32Array(count);
  const tints = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    // Most particles follow a few broad, bent current lines. A smaller amount
    // of dust hangs away from them to give the field scale without reading as
    // an evenly sprinkled starfield.
    let x;
    let y;
    if (random() < 0.92) {
      x = (random() * 2 - 1) * range.x;
      const current = Math.sin(x * 0.44 + seed) * 0.36 + Math.cos(x * 0.18 - seed) * 0.22;
      y = current + gaussian(random) * range.y * 0.17;
    } else {
      x = gaussian(random) * range.x * 0.42;
      y = gaussian(random) * range.y * 0.54;
    }
    const z = -range.zNear - random() * range.zFar;
    positions.set([x, y, z], i * 3);
    sizes[i] = size[0] + random() * (size[1] - size[0]);
    alphas[i] = alpha[0] + random() * (alpha[1] - alpha[0]);
    phases[i] = random() * Math.PI * 2;
    drifts[i] = drift[0] + random() * (drift[1] - drift[0]);
    const color = new THREE.Color(tintSet[Math.floor(random() * tintSet.length)]);
    tints.set([color.r, color.g, color.b], i * 3);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("aAlpha", new THREE.BufferAttribute(alphas, 1));
  geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute("aDrift", new THREE.BufferAttribute(drifts, 1));
  geometry.setAttribute("aTint", new THREE.BufferAttribute(tints, 3));

  const material = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 } },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);
  return points;
}

function makeParticleWaves(scene, { smallScreen, pixelRatio, aspect }) {
  const columns = smallScreen ? 76 : 132;
  const rows = smallScreen ? 13 : 20;
  const layerDepths = [[7.2, 10.5], [4, 7.4], [0.8, 4.5]];
  const count = columns * rows * layerDepths.length;
  const random = seededRandom(90421);
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const alphas = new Float32Array(count);
  const phases = new Float32Array(count);
  const layers = new Float32Array(count);
  const tints = new Float32Array(count * 3);
  const palette = [0x087346, 0x13b86a, 0x68f5a9].map((color) => new THREE.Color(color));
  const layerAlpha = [[0.24, 0.39], [0.28, 0.45], [0.32, 0.5]];
  const layerSize = [[0.8, 1.35], [0.9, 1.55], [1, 1.7]];

  let index = 0;
  layerDepths.forEach(([near, far], layer) => {
    for (let row = 0; row < rows; row += 1) {
      const rowProgress = row / Math.max(rows - 1, 1);
      const depth = near + (far - near) * rowProgress;
      for (let column = 0; column < columns; column += 1) {
        const x = (column / Math.max(columns - 1, 1)) * 2 - 1;
        positions.set([x, 0, -depth], index * 3);
        sizes[index] = layerSize[layer][0] + random() * (layerSize[layer][1] - layerSize[layer][0]);
        alphas[index] = layerAlpha[layer][0] + random() * (layerAlpha[layer][1] - layerAlpha[layer][0]);
        phases[index] = random() * Math.PI * 2;
        layers[index] = layer;
        const tint = palette[layer].clone().lerp(palette[Math.min(layer + 1, palette.length - 1)], random() * 0.28);
        tints.set([tint.r, tint.g, tint.b], index * 3);
        index += 1;
      }
    }
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("aAlpha", new THREE.BufferAttribute(alphas, 1));
  geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute("aLayer", new THREE.BufferAttribute(layers, 1));
  geometry.setAttribute("aTint", new THREE.BufferAttribute(tints, 3));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: pixelRatio },
      uAspect: { value: aspect },
      uCameraZ: { value: 10.4 },
      uFovTangent: { value: Math.tan((35 * Math.PI) / 360) },
      uParallax: { value: new THREE.Vector2(0, 0) },
    },
    vertexShader: `
      attribute float aSize;
      attribute float aAlpha;
      attribute float aPhase;
      attribute float aLayer;
      attribute vec3 aTint;
      uniform float uTime;
      uniform float uPixelRatio;
      uniform float uAspect;
      uniform float uCameraZ;
      uniform float uFovTangent;
      uniform vec2 uParallax;
      varying vec3 vTint;
      varying float vAlpha;
      void main() {
        float depth = -position.z;
        float row = depth / 10.5;
        float layer = aLayer;
        float x = position.x;
        float phase = aPhase;
        float primary = sin(x * (5.2 + layer * 0.65) + depth * 0.34 + uTime * (0.38 + layer * 0.08) + layer * 0.12);
        float secondary = sin(x * (10.7 + layer * 1.2) - depth * 0.58 - uTime * 0.27 + layer * 0.5) * 0.2;
        float tertiary = cos(depth * 0.7 + x * 2.6 + uTime * 0.2 + layer * 0.8) * 0.14;
        float wave = primary * (0.28 + layer * 0.075) + secondary + tertiary;
        vec3 p = position;
        p.x = x * (uCameraZ + depth) * uFovTangent * uAspect * 1.12;
        p.x += uParallax.x * (0.11 + row * 0.08);
        p.y = -2.55 - depth * 0.2 - layer * 0.045 + wave - uParallax.y * 0.07;
        p.z += sin(x * 3.2 + depth * 0.35 + uTime * 0.22 + phase) * 0.12;

        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        gl_PointSize = clamp(aSize * uPixelRatio * (35.0 / -mvPosition.z), 0.65, 6.2);

        float crest = smoothstep(0.16, 0.5, wave);
        float depthFade = 1.0 - smoothstep(4.5, 10.5, depth) * 0.32;
        float highlight = 0.72 + 0.28 * sin(x * 7.4 - uTime * 0.62 + depth * 0.8 + phase);
        vTint = mix(aTint, vec3(0.35, 1.0, 0.68), crest * 0.78);
        vAlpha = aAlpha * depthFade * (0.64 + crest * 1.18) * highlight;
      }
    `,
    fragmentShader: `
      varying vec3 vTint;
      varying float vAlpha;
      void main() {
        float distanceFromCenter = length(gl_PointCoord - vec2(0.5));
        float core = 1.0 - smoothstep(0.04, 0.24, distanceFromCenter);
        float halo = 1.0 - smoothstep(0.08, 0.5, distanceFromCenter);
        gl_FragColor = vec4(vTint, vAlpha * (core * 0.78 + halo * 0.35));
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);
  return { points, geometry, material };
}

function makeWaveHighlights(scene) {
  const segments = 144;
  const specs = [
    { depth: 3.2, phase: 0.4, layer: 0, color: 0x70ffc0, opacity: 0.22, width: 0.045 },
    { depth: 6.2, phase: 2.1, layer: 1, color: 0x35e58a, opacity: 0.145, width: 0.038 },
    { depth: 9.1, phase: 4.3, layer: 2, color: 0x15945d, opacity: 0.095, width: 0.03 },
  ];
  const highlights = specs.map((spec) => {
    const positions = new Float32Array((segments + 1) * 2 * 3);
    const indices = [];
    for (let i = 0; i < segments; i += 1) {
      const a = i * 2;
      const b = a + 1;
      const c = a + 2;
      const d = a + 3;
      indices.push(a, b, c, c, b, d);
    }
    const geometry = new THREE.BufferGeometry();
    const positionAttribute = new THREE.BufferAttribute(positions, 3);
    positionAttribute.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute("position", positionAttribute);
    geometry.setIndex(indices);
    const material = new THREE.MeshBasicMaterial({
      color: spec.color,
      transparent: true,
      opacity: spec.opacity,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
      toneMapped: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    scene.add(mesh);
    return { ...spec, mesh, positions, segments };
  });

  return highlights;
}

function updateWaveHighlights(highlights, time, aspect) {
  const fovTangent = Math.tan((35 * Math.PI) / 360);
  highlights.forEach(({ depth, phase, layer, width, opacity, mesh, positions, segments }) => {
    const halfWidth = (10.4 + depth) * fovTangent * aspect * 1.12;
    const baseY = -2.55 - depth * 0.2 - layer * 0.045;
    for (let i = 0; i <= segments; i += 1) {
      const normalizedX = (i / segments) * 2 - 1;
      const primary = Math.sin(normalizedX * (5.2 + layer * 0.65) + depth * 0.34 + time * (0.38 + layer * 0.08) + layer * 0.12) * (0.28 + layer * 0.075);
      const secondary = Math.sin(normalizedX * (10.7 + layer * 1.2) - depth * 0.58 - time * 0.27 + layer * 0.5) * 0.2;
      const tertiary = Math.cos(depth * 0.7 + normalizedX * 2.6 + time * 0.2 + layer * 0.8) * 0.14;
      const y = baseY + primary + secondary + tertiary;
      const x = normalizedX * halfWidth;
      const offset = i * 6;
      positions[offset] = x;
      positions[offset + 1] = y + width * 0.5;
      positions[offset + 2] = -depth + 0.035;
      positions[offset + 3] = x;
      positions[offset + 4] = y - width * 0.5;
      positions[offset + 5] = -depth + 0.035;
    }
    mesh.geometry.attributes.position.needsUpdate = true;
    mesh.material.opacity = opacity * (0.72 + Math.sin(time * 0.84 + phase) * 0.28);
  });
}

function makeEngine() {
  const engine = new THREE.Group();
  engine.rotation.set(0.12, -0.24, -0.08);

  const makeRoundedShape = (width, height, radius) => {
    const halfW = width / 2;
    const halfH = height / 2;
    const shape = new THREE.Shape();
    shape.moveTo(-halfW + radius, -halfH);
    shape.lineTo(halfW - radius, -halfH);
    shape.quadraticCurveTo(halfW, -halfH, halfW, -halfH + radius);
    shape.lineTo(halfW, halfH - radius);
    shape.quadraticCurveTo(halfW, halfH, halfW - radius, halfH);
    shape.lineTo(-halfW + radius, halfH);
    shape.quadraticCurveTo(-halfW, halfH, -halfW, halfH - radius);
    shape.lineTo(-halfW, -halfH + radius);
    shape.quadraticCurveTo(-halfW, -halfH, -halfW + radius, -halfH);
    return shape;
  };

  const tileShape = makeRoundedShape(2.42, 2.26, 0.26);
  const tileGeometry = new THREE.ExtrudeGeometry(tileShape, {
    depth: 0.22,
    bevelEnabled: true,
    bevelSegments: 5,
    bevelSize: 0.07,
    bevelThickness: 0.065,
    steps: 1,
  });
  tileGeometry.center();

  const shadowTile = new THREE.Mesh(
    new THREE.ExtrudeGeometry(makeRoundedShape(2.52, 2.36, 0.28), { depth: 0.12, bevelEnabled: true, bevelSegments: 4, bevelSize: 0.055, bevelThickness: 0.05, steps: 1 }),
    new THREE.MeshBasicMaterial({ color: 0x062a1a, transparent: true, opacity: 0.82, side: THREE.DoubleSide }),
  );
  shadowTile.position.set(-0.08, -0.08, -0.16);
  shadowTile.rotation.z = -0.055;
  engine.add(shadowTile);

  const tile = new THREE.Mesh(
    tileGeometry,
    new THREE.MeshPhysicalMaterial({
      color: 0x168b55,
      metalness: 0.2,
      roughness: 0.18,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      emissive: 0x087a43,
      emissiveIntensity: 0.78,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
    }),
  );
  tile.rotation.z = 0.045;
  engine.add(tile);

  const inset = new THREE.Mesh(
    new THREE.ExtrudeGeometry(makeRoundedShape(1.95, 1.78, 0.18), { depth: 0.045, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.025, bevelThickness: 0.025, steps: 1 }),
    new THREE.MeshPhysicalMaterial({ color: 0x092b1c, metalness: 0.42, roughness: 0.2, emissive: 0x075934, emissiveIntensity: 0.55, transparent: true, opacity: 0.84, side: THREE.DoubleSide }),
  );
  inset.position.set(0, 0, 0.145);
  engine.add(inset);

  const perimeterCurve = new THREE.CatmullRomCurve3(
    tileShape.getPoints(12).map(({ x, y }) => new THREE.Vector3(x, y, 0.205)),
    true,
  );
  engine.add(new THREE.Mesh(
    new THREE.TubeGeometry(perimeterCurve, 160, 0.018, 8, true),
    new THREE.MeshBasicMaterial({ color: 0x9dffca, transparent: true, opacity: 0.9, toneMapped: false }),
  ));

  const glyphMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xc9ffdd,
    metalness: 0.26,
    roughness: 0.18,
    clearcoat: 1,
    emissive: 0x0bde78,
    emissiveIntensity: 1.45,
  });
  const glyphPaths = [
    [[-0.43, 0.42], [-0.78, 0.0], [-0.43, -0.42]],
    [[-0.08, -0.48], [0.12, 0.48]],
    [[0.47, 0.42], [0.82, 0.0], [0.47, -0.42]],
  ];
  glyphPaths.forEach((path) => {
    const curve = new THREE.CatmullRomCurve3(
      path.map(([x, y]) => new THREE.Vector3(x, y, 0.25)),
      false,
      "centripetal",
      0.12,
    );
    engine.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 36, 0.066, 12, false), glyphMaterial));
  });

  const portMaterial = new THREE.MeshBasicMaterial({ color: 0x88ffc0, toneMapped: false });
  const portGeometry = new THREE.SphereGeometry(0.035, 12, 8);
  [[-0.98, 0.84], [0.98, 0.84], [-0.98, -0.84], [0.98, -0.84]].forEach(([x, y]) => {
    const port = new THREE.Mesh(portGeometry, portMaterial);
    port.position.set(x, y, 0.19);
    engine.add(port);
  });

  const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x1dbb75, transparent: true, opacity: 0.36, toneMapped: false });
  const ringA = new THREE.Mesh(new THREE.TorusGeometry(1.78, 0.012, 8, 144), ringMaterial);
  ringA.rotation.set(0.8, 0.18, -0.2);
  ringA.scale.set(1.22, 0.82, 1);
  engine.add(ringA);
  const ringB = new THREE.Mesh(
    new THREE.TorusGeometry(1.52, 0.008, 8, 144),
    new THREE.MeshBasicMaterial({ color: 0xa6f5c7, transparent: true, opacity: 0.34, toneMapped: false }),
  );
  ringB.rotation.set(-0.58, 0.78, 0.58);
  ringB.scale.set(1.14, 0.88, 1);
  engine.add(ringB);

  const keyGlow = new THREE.PointLight(0x55f7a0, 52, 8, 2);
  keyGlow.position.set(0.1, 1.65, 2.25);
  engine.add(keyGlow);
  const lowerGlow = new THREE.PointLight(0x14c978, 34, 6, 2);
  lowerGlow.position.set(-1.1, -1.3, 1.15);
  engine.add(lowerGlow);

  return engine;
}

export default function PortfolioScene({ showEngine = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let renderer;
    let frame = 0;
    let disposed = false;
    try {
      let smallScreen = window.matchMedia("(max-width: 700px)").matches;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !smallScreen, powerPreference: "low-power", stencil: false, depth: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, smallScreen ? 1.15 : 1.5));
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.12;

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x080d0a, 0.012);
      const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 90);
      camera.position.set(0, 0, 10.4);

      scene.add(new THREE.HemisphereLight(0x9bf4c1, 0x07140d, 0.58));
      const keyLight = new THREE.PointLight(0x35e58a, 22, 15, 2);
      keyLight.position.set(3.8, 3.2, 5.2);
      scene.add(keyLight);
      const fillLight = new THREE.PointLight(0xa6f5c7, 11, 12, 2);
      fillLight.position.set(-3.2, -1.8, 3.4);
      scene.add(fillLight);
      const rimLight = new THREE.PointLight(0x10b981, 20, 11, 2);
      rimLight.position.set(0.4, 2.4, -3.4);
      scene.add(rimLight);

      const far = makeParticleLayer(scene, {
        count: smallScreen ? 180 : 480,
        seed: 411,
        range: { x: 7.2, y: 4.2, zNear: 11, zFar: 35 },
        size: [0.55, 1.25], alpha: [0.12, 0.38], drift: [0.01, 0.06],
        tintSet: [0x35e58a, 0x8bdcb0, 0x456c55],
      });
      const mid = makeParticleLayer(scene, {
        count: smallScreen ? 100 : 220,
        seed: 2917,
        range: { x: 5.8, y: 3.8, zNear: 4, zFar: 8 },
        size: [0.85, 1.85], alpha: [0.24, 0.72], drift: [0.025, 0.11],
        tintSet: [0x35e58a, 0xa6f5c7, 0x168b58],
      });
      const near = makeParticleLayer(scene, {
        count: smallScreen ? 8 : 18,
        seed: 8701,
        range: { x: 5.4, y: 3.4, zNear: 1.1, zFar: 2.7 },
        size: [1.4, 2.8], alpha: [0.24, 0.72], drift: [0.04, 0.16],
        tintSet: [0xa6f5c7, 0x35e58a, 0x1ab877],
      });
      const particleLayers = [far, mid, near];
      let waveField = makeParticleWaves(scene, {
        smallScreen,
        pixelRatio: renderer.getPixelRatio(),
        aspect: camera.aspect,
      });
      const waveHighlights = makeWaveHighlights(scene);
      updateWaveHighlights(waveHighlights, 0, camera.aspect);
      particleLayers.forEach(({ material }) => {
        material.uniforms.uPixelRatio.value = renderer.getPixelRatio();
      });

      const engine = showEngine ? makeEngine() : null;
      const fadeMaterials = [];
      if (engine) {
        engine.position.set(smallScreen ? 0 : 3.12, smallScreen ? -2.48 : 0.03, 0);
        engine.scale.setScalar(smallScreen ? 0.6 : 1.04);
        engine.traverse((object) => {
          if (!object.material) return;
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => {
            material.userData.baseOpacity = material.opacity ?? 1;
            fadeMaterials.push(material);
          });
        });
        scene.add(engine);
      }

      const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
      let scrollAmount = window.scrollY / Math.max(window.innerHeight, 1);
      let lastFrame = 0;
      const onPointerMove = (event) => {
        if (event.pointerType === "touch" || reducedMotion) return;
        pointer.tx = (event.clientX / window.innerWidth - 0.5) * 2;
        pointer.ty = (event.clientY / window.innerHeight - 0.5) * 2;
      };
      const onScroll = () => {
        scrollAmount = window.scrollY / Math.max(window.innerHeight, 1);
        const atmosphere = 1 - Math.min(scrollAmount, 1) * 0.7;
        fadeMaterials.forEach((material) => {
          material.transparent = true;
          material.opacity = material.userData.baseOpacity * atmosphere * (smallScreen ? 0.62 : 1);
        });
        if (engine) engine.visible = true;
        canvas.style.opacity = "1";
      };
      const onResize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const wasSmallScreen = smallScreen;
        smallScreen = width <= 700;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, smallScreen ? 1.15 : 1.5));
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        if (wasSmallScreen !== smallScreen) {
          scene.remove(waveField.points);
          waveField.geometry.dispose();
          waveField.material.dispose();
          waveField = makeParticleWaves(scene, {
            smallScreen,
            pixelRatio: renderer.getPixelRatio(),
            aspect: camera.aspect,
          });
        }
        waveField.material.uniforms.uPixelRatio.value = renderer.getPixelRatio();
        waveField.material.uniforms.uAspect.value = camera.aspect;
        updateWaveHighlights(waveHighlights, reducedMotion ? 0 : performance.now() * 0.001, camera.aspect);
        if (engine) {
          engine.position.x = smallScreen ? 0 : 3.12;
          engine.position.y = smallScreen ? -2.48 : 0.03;
          engine.scale.setScalar(smallScreen ? 0.6 : 1.04);
        }
        onScroll();
        particleLayers.forEach(({ material }) => {
          material.uniforms.uPixelRatio.value = renderer.getPixelRatio();
        });
      };
      const onVisibilityChange = () => {
        if (document.visibilityState === "hidden") {
          window.cancelAnimationFrame(frame);
          frame = 0;
          return;
        }
        if (!reducedMotion && !frame) frame = window.requestAnimationFrame(renderFrame);
        if (reducedMotion) renderer.render(scene, camera);
      };
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize, { passive: true });
      document.addEventListener("visibilitychange", onVisibilityChange);
      onScroll();

      const renderFrame = (now) => {
        if (disposed || document.visibilityState !== "visible") return;
        const frameInterval = smallScreen ? 1000 / 32 : 1000 / 60;
        if (now - lastFrame < frameInterval) {
          frame = window.requestAnimationFrame(renderFrame);
          return;
        }
        lastFrame = now;
        const time = now * 0.001;
        pointer.x += (pointer.tx - pointer.x) * 0.035;
        pointer.y += (pointer.ty - pointer.y) * 0.035;
        particleLayers.forEach(({ material }) => {
          material.uniforms.uTime.value = reducedMotion ? 0 : time;
        });
        waveField.material.uniforms.uTime.value = reducedMotion ? 0 : time;
        waveField.material.uniforms.uParallax.value.set(pointer.x, pointer.y);
        updateWaveHighlights(waveHighlights, reducedMotion ? 0 : time, camera.aspect);

        if (engine) {
          engine.rotation.y = 0.18 + (reducedMotion ? 0 : Math.sin(time * 0.22) * 0.12) + pointer.x * 0.055;
          engine.rotation.x = 0.18 + pointer.y * 0.035 + Math.sin(time * 0.17) * (reducedMotion ? 0 : 0.035);
          engine.position.x = smallScreen ? 0 : 3.12;
          engine.position.y = smallScreen ? -2.48 : 0.03;
          engine.scale.setScalar(smallScreen ? 0.6 : 1.04);
          engine.visible = true;
        }
        const atmosphere = 1 - Math.min(scrollAmount, 1) * 0.7;
        const fade = atmosphere * (smallScreen ? 0.62 : 1);
        fadeMaterials.forEach((material) => {
          material.transparent = true;
          material.opacity = material.userData.baseOpacity * fade;
        });
        renderer.render(scene, camera);
        frame = window.requestAnimationFrame(renderFrame);
      };

      renderer.render(scene, camera);
      canvas.dataset.ready = "true";
      markPortfolioBootTask("scene");
      if (!reducedMotion) frame = window.requestAnimationFrame(renderFrame);

      return () => {
        disposed = true;
        window.cancelAnimationFrame(frame);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
        document.removeEventListener("visibilitychange", onVisibilityChange);
        scene.traverse((object) => {
          object.geometry?.dispose?.();
          if (object.material) {
            (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) => material.dispose());
          }
        });
        renderer.dispose();
      };
    } catch {
      canvas.dataset.failed = "true";
      markPortfolioBootTask("scene", "failed");
      renderer?.dispose();
    }

    return undefined;
  }, [showEngine]);

  return <canvas ref={canvasRef} className="portfolio-scene-canvas" aria-hidden="true" />;
}
