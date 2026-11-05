import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { buildCharacter } from "@/lib/avatar/build-character";

export type AvatarScene = {
  wave: () => void;
  dispose: () => void;
};

type Options = {
  /** Optional .glb (e.g. exported from Meshy/Tripo). When missing or broken, the procedural character is used. */
  modelUrl?: string;
  reducedMotion: boolean;
};

type Framing = { focus: THREE.Vector3; halfHeight: number; halfWidth: number };

type Rig = {
  framing: Framing;
  update: (state: FrameState) => void;
  wave?: (time: number) => void;
};

type FrameState = {
  time: number;
  delta: number;
  lookX: number;
  lookY: number;
  wave: number;
  waveTime: number;
  blink: number;
  motion: number;
};

const WAVE_SECONDS = 2.8;
const FOV = 30;

async function loadModelRig(url: string, scene: THREE.Scene): Promise<Rig | null> {
  const head = await fetch(url, { method: "HEAD" }).catch(() => null);
  if (!head?.ok) return null;

  const gltf = await new GLTFLoader().loadAsync(url);
  const model = gltf.scene;
  model.traverse((object) => {
    if ((object as THREE.Mesh).isMesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });

  const pivot = new THREE.Group();
  pivot.add(model);
  scene.add(pivot);

  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(new THREE.Vector3(center.x, box.min.y, center.z));

  const mixer = gltf.animations.length ? new THREE.AnimationMixer(model) : null;
  const findClip = (pattern: RegExp) => gltf.animations.find((clip) => pattern.test(clip.name));
  const idleClip = findClip(/idle|breath|stand/i) ?? gltf.animations[0];
  const waveClip = findClip(/wave|hello|greet/i);
  if (mixer && idleClip) mixer.clipAction(idleClip).play();

  let hopStart = -10;
  return {
    framing: {
      focus: new THREE.Vector3(0, size.y / 2, 0),
      halfHeight: (size.y / 2) * 1.05,
      halfWidth: (size.x / 2) * 1.15,
    },
    update: ({ time, delta, lookX, lookY, motion }) => {
      mixer?.update(delta);
      pivot.rotation.y = THREE.MathUtils.lerp(pivot.rotation.y, lookX * 0.45, 0.08);
      pivot.rotation.x = THREE.MathUtils.lerp(pivot.rotation.x, -lookY * 0.06, 0.08);
      const hop = time - hopStart;
      const bounce = hop >= 0 && hop < 0.6 ? Math.sin((hop / 0.6) * Math.PI) * 0.06 * size.y : 0;
      pivot.position.y = bounce + Math.sin(time * 1.6) * 0.004 * size.y * motion;
    },
    wave: (time) => {
      if (mixer && waveClip) {
        const action = mixer.clipAction(waveClip);
        action.reset().setLoop(THREE.LoopOnce, 1).fadeIn(0.2).play();
        action.clampWhenFinished = false;
      } else {
        hopStart = time;
      }
    },
  };
}

export async function createAvatarScene(container: HTMLElement, { modelUrl, reducedMotion }: Options): Promise<AvatarScene> {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.05, 100);
  // Soft image-based light gives skin, eyes and fabric believable reflections.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = environment;
  scene.environmentIntensity = 0.18;

  // Soft studio light; intensities are scaled by PI for three's physical lighting model.
  scene.add(new THREE.HemisphereLight("#ffffff", "#d8c6b0", 0.45 * Math.PI));
  scene.add(new THREE.AmbientLight("#ffffff", 0.12 * Math.PI));
  const key = new THREE.DirectionalLight("#fff2e4", 1.25 * Math.PI);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.015;
  key.shadow.radius = 7;
  const fill = new THREE.DirectionalLight("#e6eeff", 0.35 * Math.PI);
  const rim = new THREE.DirectionalLight("#cfe0ff", 0.9 * Math.PI);
  scene.add(key, key.target, fill, rim);

  let rig: Rig | null = null;
  if (modelUrl) rig = await loadModelRig(modelUrl, scene).catch(() => null);
  if (!rig) {
    const character = buildCharacter();
    scene.add(character.root);
    rig = {
      framing: { focus: character.focus, ...character.frame },
      update: (state) => character.update(state),
    };
  }
  const { focus, halfHeight, halfWidth } = rig.framing;

  // Lights and shadow camera follow the framing so any model size works.
  const span = Math.max(halfHeight, halfWidth);
  key.position.copy(focus).add(new THREE.Vector3(-1.2, 3.4, 5).multiplyScalar(span));
  key.target.position.copy(focus);
  Object.assign(key.shadow.camera, { left: -span * 1.5, right: span * 1.5, top: span * 1.5, bottom: -span * 1.5, near: 0.1, far: span * 20 });
  key.shadow.camera.updateProjectionMatrix();
  fill.position.copy(focus).add(new THREE.Vector3(3, 0.2, 3).multiplyScalar(span));
  rim.position.copy(focus).add(new THREE.Vector3(1.6, 1.7, -4).multiplyScalar(span));

  container.appendChild(renderer.domElement);

  const fit = () => {
    const width = container.clientWidth || 1;
    const height = container.clientHeight || 1;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const tan = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const distance = Math.max(halfHeight / tan, halfWidth / (tan * camera.aspect));
    camera.position.set(focus.x, focus.y + 0.08 * span, focus.z + distance);
    camera.lookAt(focus);
  };
  const resizeObserver = new ResizeObserver(fit);
  resizeObserver.observe(container);
  fit();

  // ---------- state ----------
  const clock = new THREE.Clock();
  const look = new THREE.Vector2();
  const lookTarget = new THREE.Vector2();
  let lastPointer = -10;
  let waveStart = -10;
  let nextBlink = 1.6;
  let blinkStart = -1;

  const handlePointerMove = (event: PointerEvent) => {
    const bounds = container.getBoundingClientRect();
    const x = (event.clientX - (bounds.left + bounds.width / 2)) / (window.innerWidth / 2);
    const y = -(event.clientY - (bounds.top + bounds.height * 0.3)) / (window.innerHeight / 2);
    lookTarget.set(THREE.MathUtils.clamp(x, -1, 1), THREE.MathUtils.clamp(y, -1, 1));
    lastPointer = clock.elapsedTime;
  };
  window.addEventListener("pointermove", handlePointerMove, { passive: true });

  const blinkAmount = (time: number) => {
    if (blinkStart < 0 && time > nextBlink) blinkStart = time;
    if (blinkStart < 0) return 0;
    const progress = (time - blinkStart) / 0.17;
    if (progress >= 1) {
      blinkStart = -1;
      nextBlink = time + (Math.random() < 0.15 ? 0.22 : 2 + Math.random() * 3.5);
      return 0;
    }
    return Math.sin(progress * Math.PI);
  };
  const waveAmount = (time: number) => {
    const elapsed = time - waveStart;
    if (elapsed < 0 || elapsed > WAVE_SECONDS) return 0;
    const x = Math.min(1, elapsed / 0.45, (WAVE_SECONDS - elapsed) / 0.5);
    return x * x * (3 - 2 * x);
  };

  // Render only while visible on screen and the tab is active.
  let visible = true;
  let frame = 0;
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    schedule();
  });
  intersectionObserver.observe(container);
  const handleVisibility = () => schedule();
  document.addEventListener("visibilitychange", handleVisibility);

  const motion = reducedMotion ? 0.3 : 1;
  const render = () => {
    frame = 0;
    const delta = clock.getDelta();
    const time = clock.elapsedTime;
    if (time - lastPointer > 3) lookTarget.set(Math.sin(time * 0.37) * 0.35 * motion, Math.sin(time * 0.23) * 0.15 * motion);
    look.lerp(lookTarget, 0.06);
    rig.update({
      time,
      delta,
      lookX: look.x,
      lookY: look.y,
      wave: waveAmount(time),
      waveTime: time - waveStart,
      blink: blinkAmount(time),
      motion,
    });
    renderer.render(scene, camera);
    schedule();
  };
  function schedule() {
    if (frame || !visible || document.hidden) return;
    frame = requestAnimationFrame(render);
  }
  schedule();

  const wave = () => {
    const time = clock.elapsedTime;
    if (time - waveStart > WAVE_SECONDS) waveStart = time;
    rig.wave?.(time);
  };

  return {
    wave,
    dispose: () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      visible = false;
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("visibilitychange", handleVisibility);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const meshMaterial of materials) {
          (meshMaterial as THREE.MeshStandardMaterial).map?.dispose();
          meshMaterial.dispose();
        }
      });
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
