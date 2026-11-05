import * as THREE from "three";
import { buildUmbrella } from "@/lib/avatar/build-umbrella";

/**
 * Procedural stylised version of Jhonier (beige six-panel cap, dark curly hair,
 * black "NO DIFFICULTY 12N" tee), built from primitives so it needs no model file.
 * It is the fallback used by the hero avatar while no `/models/avatar.glb` exists.
 */

export type CharacterPose = {
  /** Pointer direction in [-1, 1] on both axes. */
  lookX: number;
  lookY: number;
  /** 0 = idle, 1 = arm fully raised waving. */
  wave: number;
  /** Seconds since the current wave started (drives the hand flap). */
  waveTime: number;
  /** 0 = eyes open, 1 = closed. */
  blink: number;
  /** Elapsed seconds, and seconds since the previous frame. */
  time: number;
  delta: number;
  /** 0 = no umbrella, 1 = umbrella fully open (it rains hard). */
  umbrella: number;
  /** 1 = full idle motion, lower values calm it down (reduced motion). */
  motion: number;
};

export type Character = {
  root: THREE.Group;
  /** Point the camera should orbit around. */
  focus: THREE.Vector3;
  /** Half height / half width of the framing box around `focus`. */
  frame: { halfHeight: number; halfWidth: number };
  /** Wider framing that keeps the open umbrella in view. */
  umbrellaFraming: { focus: THREE.Vector3; halfHeight: number; halfWidth: number };
  update: (pose: CharacterPose) => void;
};

type Vec3 = [number, number, number];

const TORSO_Z = 0.62;
const PROFILE: [number, number][] = [
  [0.5, -0.35], [0.505, 0], [0.525, 0.3], [0.555, 0.55], [0.58, 0.72],
  [0.595, 0.79], [0.57, 0.86], [0.47, 0.93], [0.33, 0.985], [0.2, 1.015], [0.001, 1.025],
];

function torsoRadiusAt(y: number) {
  for (let i = 0; i < PROFILE.length - 1; i++) {
    const [ra, ya] = PROFILE[i];
    const [rb, yb] = PROFILE[i + 1];
    if (y >= ya && y <= yb) return ra + ((rb - ra) * (y - ya)) / (yb - ya);
  }
  return PROFILE[0][0];
}

function material(hex: string, options: THREE.MeshStandardMaterialParameters = {}) {
  return new THREE.MeshStandardMaterial({ color: hex, roughness: 0.7, metalness: 0, ...options });
}

function addMesh(
  geometry: THREE.BufferGeometry,
  meshMaterial: THREE.Material,
  parent: THREE.Object3D,
  position?: Vec3 | null,
  scale?: Vec3 | null,
  rotation?: Vec3 | null,
) {
  const mesh = new THREE.Mesh(geometry, meshMaterial);
  if (position) mesh.position.set(...position);
  if (scale) mesh.scale.set(...scale);
  if (rotation) mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

const sphere = (radius: number, widthSegments = 32, heightSegments = 20) =>
  new THREE.SphereGeometry(radius, widthSegments, heightSegments);

function addCapsule(
  radius: number,
  length: number,
  capsuleMaterial: THREE.Material,
  parent: THREE.Object3D,
  position?: Vec3,
  rotation?: Vec3,
) {
  const group = new THREE.Group();
  addMesh(new THREE.CylinderGeometry(radius, radius, length, 24, 1, true), capsuleMaterial, group, [0, -length / 2, 0]);
  addMesh(sphere(radius, 24, 16), capsuleMaterial, group);
  addMesh(sphere(radius, 24, 16), capsuleMaterial, group, [0, -length, 0]);
  if (position) group.position.set(...position);
  if (rotation) group.rotation.set(...rotation);
  parent.add(group);
  return group;
}

/** Capsule whose radius tapers from `topRadius` to `bottomRadius`, hanging down from its origin. */
function addLimb(
  topRadius: number,
  bottomRadius: number,
  length: number,
  limbMaterial: THREE.Material,
  parent: THREE.Object3D,
  position?: Vec3,
) {
  const group = new THREE.Group();
  addMesh(new THREE.CylinderGeometry(topRadius, bottomRadius, length, 24, 1, true), limbMaterial, group, [0, -length / 2, 0]);
  addMesh(sphere(topRadius, 24, 16), limbMaterial, group);
  addMesh(sphere(bottomRadius, 24, 16), limbMaterial, group, [0, -length, 0]);
  if (position) group.position.set(...position);
  parent.add(group);
  return group;
}

/** Moves every vertex through `shape`; `seamWidth` heals the UV seam and poles of a sphere. */
function deform<T extends THREE.BufferGeometry>(geometry: T, shape: (v: THREE.Vector3) => void, seamWidth = 0) {
  const position = geometry.attributes.position;
  const vertex = new THREE.Vector3();
  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i);
    shape(vertex);
    position.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }
  geometry.computeVertexNormals();
  if (!seamWidth) return geometry;

  const normal = geometry.attributes.normal;
  const row = seamWidth + 1;
  const rows = position.count / row;
  const sum = new THREE.Vector3();
  for (let iy = 0; iy < rows; iy++) {
    const a = iy * row;
    const b = a + seamWidth;
    sum.set(normal.getX(a) + normal.getX(b), normal.getY(a) + normal.getY(b), normal.getZ(a) + normal.getZ(b)).normalize();
    normal.setXYZ(a, sum.x, sum.y, sum.z);
    normal.setXYZ(b, sum.x, sum.y, sum.z);
  }
  for (const iy of [0, rows - 1]) {
    sum.set(0, 0, 0);
    for (let ix = 0; ix < row; ix++) {
      const k = iy * row + ix;
      sum.x += normal.getX(k);
      sum.y += normal.getY(k);
      sum.z += normal.getZ(k);
    }
    sum.normalize();
    for (let ix = 0; ix < row; ix++) normal.setXYZ(iy * row + ix, sum.x, sum.y, sum.z);
  }
  return geometry;
}

/** Stylised head: soft oval face with full cheeks and a rounded chin. */
function headShape(v: THREE.Vector3, radius: number) {
  const ny = v.y / radius;
  const nx = Math.abs(v.x / radius);
  const jaw = ny < 0 ? Math.min(1, -ny) : 0;
  // Full, rounded cheeks that carry down toward a softer jaw.
  const cheeks = Math.exp(-(((ny + 0.3) / 0.32) ** 2));
  v.x *= 0.95 * (1 - 0.17 * jaw ** 2) * (1 + 0.06 * cheeks);
  if (v.z > 0) {
    const apple = Math.exp(-(((nx - 0.5) / 0.24) ** 2) - ((ny + 0.25) / 0.22) ** 2);
    v.z += 0.045 * radius * apple;
  }
  v.z *= 1 - 0.04 * jaw * jaw;
  // Chin pushed forward so it reads full and round instead of tucked in.
  if (ny < -0.35 && v.z > 0) v.z += 0.08 * Math.min(1, (-ny - 0.35) / 0.4) * (v.z / radius);
  if (ny > 0) v.x *= 1 - 0.05 * ny;
  v.y *= ny < 0 ? 1.13 : 1.1;
  v.z *= 0.95;
}

function shirtPrintTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 384;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = "#efeeea";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = '700 104px "Helvetica Neue", Helvetica, Arial, sans-serif';
    if ("letterSpacing" in context) context.letterSpacing = "4px";
    const width = context.measureText("NO DIFFICULTY").width;
    context.save();
    context.translate(512, 130);
    if (width > 980) context.scale(980 / width, 1);
    context.fillText("NO DIFFICULTY", 0, 0);
    context.restore();
    context.font = '700 84px "Helvetica Neue", Helvetica, Arial, sans-serif';
    if ("letterSpacing" in context) context.letterSpacing = "0px";
    ["1", "2", "N"].forEach((char, i) => context.fillText(char, 512 + (i - 1) * 130, 285));
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/** Tileable grey canvas used as a bump map: speckled knit for the tee, diagonal twill for the cap. */
function fabricBump(kind: "knit" | "twill", repeat: number) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = "#808080";
    context.fillRect(0, 0, size, size);
    if (kind === "twill") {
      context.lineWidth = 2;
      for (let i = -size; i < size * 2; i += 6) {
        context.strokeStyle = i % 12 === 0 ? "#9a9a9a" : "#666666";
        context.beginPath();
        context.moveTo(i, 0);
        context.lineTo(i + size, size);
        context.stroke();
      }
    }
    for (let i = 0; i < 9000; i++) {
      const shade = 100 + Math.floor(Math.random() * 56);
      context.fillStyle = `rgb(${shade},${shade},${shade})`;
      context.fillRect(Math.random() * size, Math.random() * size, 1.5, 1.5);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  return texture;
}

const lerp = THREE.MathUtils.lerp;

export function buildCharacter(): Character {
  const skin = new THREE.MeshPhysicalMaterial({
    color: "#e8a27c",
    roughness: 0.5,
    sheen: 0.2,
    sheenColor: "#ff9f80",
    sheenRoughness: 0.55,
    emissive: "#5a2a18",
    emissiveIntensity: 0.1,
  });
  const skinDouble = skin.clone();
  skinDouble.side = THREE.DoubleSide;
  const skinDeep = material("#d08c6a", { roughness: 0.6 });
  const shirt = material("#1c1b1e", { roughness: 0.95, side: THREE.DoubleSide, bumpMap: fabricBump("knit", 6), bumpScale: 1.2 });
  const cap = material("#c9ad84", { roughness: 0.9, side: THREE.DoubleSide, bumpMap: fabricBump("twill", 5), bumpScale: 1.5 });
  const capSeam = material("#ae9673", { roughness: 0.9 });
  const hair = new THREE.MeshPhysicalMaterial({ color: "#211612", roughness: 0.45, sheen: 0.6, sheenColor: "#6b4a3a", sheenRoughness: 0.35 });
  const hairDouble = hair.clone();
  hairDouble.side = THREE.DoubleSide;
  const eyeWhite = new THREE.MeshPhysicalMaterial({ color: "#fbfaf7", roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.04 });
  const iris = new THREE.MeshPhysicalMaterial({ color: "#4e2b15", roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.03 });
  const irisRing = material("#2a160b", { roughness: 0.4 });
  const pupil = material("#0c0806", { roughness: 0.2 });
  const lash = material("#1a110c", { roughness: 0.6 });
  const brow = material("#1d140f", { roughness: 0.8 });
  const lipLine = material("#93544b", { roughness: 0.5 });
  const lip = material("#d08e82", { roughness: 0.45 });
  const blush = new THREE.MeshStandardMaterial({ color: "#ef8f86", roughness: 0.8, transparent: true, opacity: 0.24, depthWrite: false });

  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  // ---------- torso ----------
  const torso = addMesh(
    new THREE.LatheGeometry(PROFILE.map(([r, y]) => new THREE.Vector2(r, y)), 72),
    shirt,
    body,
    null,
    [1, 1, TORSO_Z],
  );
  const printGeometry = deform(new THREE.PlaneGeometry(0.42, 0.1575, 32, 4), (v) => {
    const y = v.y + 0.56;
    const r = torsoRadiusAt(y);
    v.z = Math.sqrt(Math.max(r * r - v.x * v.x, 0)) + 0.014;
    v.y = y;
  });
  const print = addMesh(
    printGeometry,
    new THREE.MeshStandardMaterial({ map: shirtPrintTexture(), transparent: true, roughness: 0.85 }),
    torso,
  );
  print.castShadow = false;

  addMesh(new THREE.CylinderGeometry(0.115, 0.135, 0.46, 32), skin, body, [0, 1.15, 0]);
  addMesh(new THREE.TorusGeometry(0.17, 0.03, 12, 48), shirt, body, [0, 1.0, 0.01], [1, 0.8, 1], [Math.PI / 2 + 0.2, 0, 0]);

  // ---------- arms ----------
  const makeArm = (side: 1 | -1) => {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.59, 0.79, 0);
    body.add(shoulder);
    addMesh(sphere(0.15), shirt, shoulder, [0, -0.02, 0], [0.95, 0.72, 0.9]);
    addMesh(new THREE.CylinderGeometry(0.142, 0.156, 0.32, 32, 1, true), shirt, shoulder, [0, -0.17, 0]);
    addMesh(new THREE.TorusGeometry(0.154, 0.012, 8, 32), shirt, shoulder, [0, -0.33, 0], null, [Math.PI / 2, 0, 0]);
    addLimb(0.078, 0.062, 0.46, skin, shoulder, [0, -0.05, 0]);
    addMesh(sphere(1, 24, 16), skin, shoulder, [0, -0.27, 0.012], [0.079, 0.14, 0.077]);
    const elbow = new THREE.Group();
    elbow.position.set(0, -0.51, 0);
    shoulder.add(elbow);
    addLimb(0.064, 0.046, 0.42, skin, elbow);
    addMesh(sphere(1, 24, 16), skin, elbow, [0, -0.12, 0.004], [0.07, 0.14, 0.064]);
    const hand = new THREE.Group();
    hand.position.set(0, -0.44, 0);
    elbow.add(hand);
    addMesh(sphere(1, 24, 16), skin, hand, [0, -0.06, 0], [0.064, 0.08, 0.033]);
    [0.07, 0.081, 0.078, 0.064].forEach((length, i) =>
      addCapsule(0.0155, length, skin, hand, [-0.036 + i * 0.024, -0.122, 0.004], [-0.22, 0, (i - 1.5) * 0.04]),
    );
    addCapsule(0.018, 0.055, skin, hand, [side * 0.055, -0.04, 0.012], [-0.2, 0, side * 0.7]);
    return { side, shoulder, elbow, hand };
  };
  const arms = [makeArm(1), makeArm(-1)];
  const umbrellaRig = buildUmbrella();
  body.add(umbrellaRig.group);

  // ---------- head (built at the origin so its surface can be raycast) ----------
  const headPivot = new THREE.Group();
  headPivot.position.set(0, 1.23, 0);
  body.add(headPivot);
  const head = new THREE.Group();
  const headMesh = addMesh(deform(new THREE.SphereGeometry(0.5, 64, 48), (v) => headShape(v, 0.5), 64), skin, head);
  head.updateMatrixWorld(true);
  const raycaster = new THREE.Raycaster();
  const rayOrigin = new THREE.Vector3();
  const rayDirection = new THREE.Vector3(0, 0, -1);
  const surfaceZ = (x: number, y: number) => {
    raycaster.set(rayOrigin.set(x, y, 2), rayDirection);
    const hit = raycaster.intersectObject(headMesh)[0];
    return hit ? hit.point.z : 0.3;
  };

  // eyes
  const eyes = ([-1, 1] as const).map((side) => {
    const x = side * 0.175;
    const y = -0.02;
    const socket = new THREE.Group();
    socket.position.set(x, y, surfaceZ(x, y) - 0.072);
    socket.rotation.y = side * 0.08;
    // Narrow, tall eyes: a vertical oval instead of a circle (lids and iris follow the same squash).
    socket.scale.set(0.92, 1.05, 0.85);
    head.add(socket);
    const ball = new THREE.Group();
    socket.add(ball);
    addMesh(sphere(0.118, 48, 32), eyeWhite, ball);
    addMesh(sphere(0.068, 40, 24), iris, ball, [0, 0, 0.0964], [1, 1, 0.5]);
    addMesh(new THREE.TorusGeometry(0.0675, 0.0055, 8, 48), irisRing, ball, [0, 0, 0.096]);
    addMesh(sphere(0.032, 24, 16), pupil, ball, [0, 0, 0.122], [1, 1, 0.4]);
    const catchLight = new THREE.MeshBasicMaterial({ color: "#ffffff" });
    const highlight = new THREE.Mesh(sphere(0.014, 16, 10), catchLight);
    highlight.position.set(0.022, 0.026, 0.131);
    ball.add(highlight);
    const smallHighlight = new THREE.Mesh(sphere(0.007, 12, 8), catchLight);
    smallHighlight.position.set(-0.02, -0.022, 0.13);
    ball.add(smallHighlight);
    const upper = new THREE.Group();
    socket.add(upper);
    addMesh(new THREE.SphereGeometry(0.125, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), skinDouble, upper);
    addMesh(new THREE.TorusGeometry(0.125, 0.008, 8, 32, Math.PI), lash, upper, null, null, [Math.PI / 2, 0, 0]);
    const lower = new THREE.Group();
    socket.add(lower);
    addMesh(new THREE.SphereGeometry(0.122, 40, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), skinDouble, lower);
    return { ball, upper, lower };
  });

  // brows
  for (const side of [-1, 1]) {
    const points = ([[0.06, 0.14], [0.15, 0.16], [0.255, 0.146]] as const).map(
      ([x, y]) => new THREE.Vector3(side * x, y, surfaceZ(side * x, y) + 0.012),
    );
    addMesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 24, 0.024, 10, false), brow, head);
    addMesh(sphere(0.024, 12, 8), brow, head, points[0].toArray());
    addMesh(sphere(0.019, 12, 8), brow, head, points[2].toArray());
  }

  // nose
  addMesh(sphere(1, 24, 16), skin, head, [0, -0.09, surfaceZ(0, -0.09) - 0.03], [0.028, 0.065, 0.035]);
  addMesh(sphere(1), skin, head, [0, -0.162, surfaceZ(0, -0.162) + 0.006], [0.05, 0.042, 0.048]);
  for (const side of [-1, 1]) {
    addMesh(sphere(0.022, 20, 12), skin, head, [side * 0.035, -0.174, surfaceZ(side * 0.035, -0.174) - 0.008]);
  }

  // mouth: soft closed smile, one corner a touch higher
  const mouth = new THREE.Group();
  const mouthY = -0.315;
  const mouthZ = surfaceZ(0, mouthY);
  mouth.position.set(0, mouthY, mouthZ);
  head.add(mouth);
  const mouthPoints: THREE.Vector3[] = [];
  for (let i = 0; i <= 10; i++) {
    const x = -0.075 + i * 0.015;
    const k = x / 0.075;
    const y = 0.026 * k * k + 0.009 * k;
    mouthPoints.push(new THREE.Vector3(x, y, surfaceZ(x, mouthY + y) - mouthZ + 0.006));
  }
  addMesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(mouthPoints), 32, 0.0095, 8, false), lipLine, mouth);
  addMesh(sphere(0.0095, 10, 8), lipLine, mouth, mouthPoints[0].toArray());
  addMesh(sphere(0.0095, 10, 8), lipLine, mouth, mouthPoints[10].toArray());
  addMesh(sphere(1, 24, 12), lip, mouth, [0, -0.028, -0.006], [0.05, 0.02, 0.028]);

  // cheeks + ears
  for (const side of [-1, 1]) {
    const cheek = addMesh(sphere(1, 24, 12), blush, head, [side * 0.27, -0.17, surfaceZ(side * 0.27, -0.17) - 0.004], [0.07, 0.045, 0.02], [0, side * 0.5, 0]);
    cheek.castShadow = false;
    addMesh(sphere(1, 24, 16), skin, head, [side * 0.47, -0.06, -0.01], [0.075, 0.13, 0.085], [0, -side * 0.15, side * 0.08]);
    addMesh(sphere(1, 16, 12), skinDeep, head, [side * 0.53, -0.06, -0.005], [0.022, 0.085, 0.05]);
  }

  // hair: back shell, tufts above the ears, sideburns and nape curls
  const backHair = deform(
    new THREE.SphereGeometry(0.525, 48, 24, Math.PI + 0.28, Math.PI - 0.56, 0.18 * Math.PI, 0.55 * Math.PI),
    (v) => headShape(v, 0.525),
  );
  addMesh(backHair, hairDouble, head, [0, 0, -0.01]);
  const curls: [number, number, number, number][] = [
    [0.42, -0.2, -0.2, 0.085], [0.38, -0.3, -0.25, 0.085], [0.3, -0.37, -0.31, 0.08],
    [0.17, -0.41, -0.35, 0.08], [0.47, -0.12, -0.17, 0.07], [0.45, -0.3, -0.13, 0.065],
  ];
  for (const side of [-1, 1]) {
    addMesh(sphere(1, 24, 16), hair, head, [side * 0.45, 0.13, -0.09], [0.075, 0.12, 0.23], [0, 0, side * 0.12]);
    addMesh(sphere(1, 20, 14), hair, head, [side * 0.455, 0.04, -0.16], [0.06, 0.09, 0.13]);
    addMesh(sphere(1, 16, 12), hair, head, [side * 0.475, -0.01, 0.105], [0.03, 0.1, 0.055], [0, side * 0.35, 0]);
    for (const [x, y, z, r] of curls) addMesh(sphere(r, 20, 14), hair, head, [side * x * 0.9, y - 0.03, z - 0.08]);
    addMesh(new THREE.TorusGeometry(0.045, 0.022, 10, 24, Math.PI * 1.5), hair, head, [side * 0.42, -0.33, -0.24], null, [0, (side * Math.PI) / 2, side * 0.6]);
    addMesh(new THREE.TorusGeometry(0.04, 0.02, 10, 24, Math.PI * 1.5), hair, head, [side * 0.33, -0.43, -0.28], null, [0.4, side * 1.2, -side * 0.4]);
  }
  addMesh(sphere(0.085, 20, 14), hair, head, [0, -0.42, -0.37]);
  const lockPoint = (azimuth: number, radius: number, y: number) =>
    new THREE.Vector3(radius * 0.98 * Math.sin(azimuth), y, radius * Math.cos(azimuth) * 0.95);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 7; i++) {
      const azimuth = side * (0.68 + i * 0.05) * Math.PI;
      const drop = 0.03 * Math.sin(i * 2.3);
      const lock = new THREE.CatmullRomCurve3([
        lockPoint(azimuth, 0.5, 0.06),
        lockPoint(azimuth + side * 0.04, 0.53, -0.12),
        lockPoint(azimuth - side * 0.03, 0.55, -0.26 + drop),
        lockPoint(azimuth + side * 0.05, 0.6, -0.31 + drop),
      ]);
      addMesh(new THREE.TubeGeometry(lock, 20, 0.032, 8, false), hair, head);
      addMesh(sphere(0.032, 10, 8), hair, head, lock.getPoint(1).toArray());
    }
  }

  // cap: six-panel crown with seams, eyelets and button, curved brim
  const crown = new THREE.Group();
  head.add(crown);
  addMesh(new THREE.SphereGeometry(0.545, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2), cap, crown);
  const seamRadius = 0.549;
  const onCrown = (polar: number, azimuth: number) =>
    new THREE.Vector3(
      seamRadius * Math.sin(polar) * Math.sin(azimuth),
      seamRadius * Math.cos(polar),
      seamRadius * Math.sin(polar) * Math.cos(azimuth),
    );
  for (let k = 0; k < 6; k++) {
    const azimuth = (k * Math.PI) / 3;
    const points = Array.from({ length: 17 }, (_, i) => onCrown((i / 16) * (Math.PI / 2), azimuth));
    addMesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 24, 0.0045, 6, false), capSeam, crown);
    const eyeletPosition = onCrown(0.42, azimuth + Math.PI / 6);
    const eyelet = addMesh(new THREE.TorusGeometry(0.012, 0.0035, 8, 16), capSeam, crown);
    eyelet.position.copy(eyeletPosition);
    eyelet.lookAt(eyeletPosition.clone().multiplyScalar(2));
  }
  addMesh(sphere(0.034, 16, 10), cap, crown, [0, 0.545, 0], [1, 0.55, 1]);
  addMesh(new THREE.TorusGeometry(0.545, 0.007, 8, 96), capSeam, crown, [0, 0.004, 0], null, [Math.PI / 2, 0, 0]);
  crown.position.set(0, 0.11, -0.02);
  crown.scale.set(1, 0.95, 1.05);
  crown.rotation.x = -0.13;

  const brimPoint = (angle: number, reach: number) => {
    const x = 0.5 * reach * Math.sin(angle);
    const z = 0.02 + 0.85 * reach * Math.cos(angle);
    return new THREE.Vector3(x, -0.3 * x * x, z);
  };
  const brim = new THREE.Group();
  brim.position.set(0, 0.19, 0);
  brim.rotation.x = -0.1;
  head.add(brim);
  addMesh(deform(new THREE.PlaneGeometry(1, 1, 48, 16), (v) => v.copy(brimPoint(v.x * Math.PI, v.y + 0.5))), cap, brim);
  const brimEdge = Array.from({ length: 49 }, (_, i) => brimPoint(-Math.PI / 2 + (i / 48) * Math.PI, 1));
  addMesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(brimEdge), 96, 0.013, 8, false), cap, brim);

  head.position.set(0, 0.42, 0);
  headPivot.add(head);

  const update = ({ lookX, lookY, wave, waveTime, blink, time, delta, umbrella, motion }: CharacterPose) => {
    umbrellaRig.update(umbrella, delta);
    const breath = Math.sin(time * 1.6) * motion;
    body.rotation.y = lookX * 0.08;
    torso.scale.set(1 + 0.006 * breath, 1 + 0.008 * breath, TORSO_Z * (1 + 0.015 * breath));
    headPivot.position.y = 1.23 + 0.006 * breath;
    headPivot.rotation.set(
      -lookY * 0.18 + 0.02 * Math.sin(time * 0.9) * motion,
      lookX * 0.4,
      -0.07 * wave + 0.015 * Math.sin(time * 0.7) * motion,
    );

    for (const eye of eyes) {
      eye.ball.rotation.set(-lookY * 0.3, lookX * 0.35, 0);
      eye.upper.rotation.x = lerp(-0.7 - lookY * 0.12, 1.5, blink);
      eye.lower.rotation.x = lerp(lerp(0.95, 0.72, wave), 0.6, blink);
    }
    const smile = 0.35 + 0.65 * wave;
    mouth.scale.set(1 + 0.18 * smile, 1 + 0.25 * smile, 1);

    const flap = Math.sin(waveTime * 9) * 0.35;
    for (const arm of arms) {
      // The right arm waves; the left one holds the umbrella up.
      const raise = arm.side > 0 ? wave : 0;
      const hold = arm.side < 0 ? umbrella : 0;
      const rest = (1 - raise) * (1 - hold);
      const sway = Math.sin(time * 1.6 + arm.side) * 0.012 * motion;
      arm.shoulder.rotation.set(lerp(0, -0.3, raise) + hold * -1.0, 0, arm.side * (0.11 + sway) * rest + raise * 1.7);
      arm.elbow.rotation.set(lerp(-0.12, 0, raise) + hold * -1.08, 0, arm.side * 0.05 * rest + raise * (1.3 + flap));
      arm.hand.rotation.set(0, lerp((-arm.side * Math.PI) / 2, 0, raise), raise * flap * 0.4);
    }
  };

  // Framing is shifted toward the waving (screen-right) arm so the raised hand stays in view.
  return {
    root,
    focus: new THREE.Vector3(0.12, 1.3, 0),
    frame: { halfHeight: 1.1, halfWidth: 1.22 },
    umbrellaFraming: { focus: new THREE.Vector3(-0.15, 1.45, 0), halfHeight: 1.3, halfWidth: 1.6 },
    update,
  };
}
