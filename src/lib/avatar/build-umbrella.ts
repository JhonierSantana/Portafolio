import * as THREE from "three";

/** Where the left hand holds the shaft and where the canopy tip ends up (character space). */
const GRIP = new THREE.Vector3(-0.59, 0.7, 0.79);
const TIP = new THREE.Vector3(-0.2, 2.5, 0.35);
const CANOPY_RADIUS = 1.15;
const CANOPY_ANGLE = Math.asin(1 / CANOPY_RADIUS);
const DROP_COUNT = 40;
const DROP_SPEED = 3.6;
const RAIN_TOP = 2.9;
const RAIN_BOTTOM = 0.1;

export type Umbrella = {
  group: THREE.Group;
  /** `amount`: 0 = closed and hidden, 1 = fully open over the head. */
  update: (amount: number, delta: number) => void;
};

/**
 * Blue umbrella the avatar opens when it rains hard in Socorro, with drops that stop on the canopy.
 * Built along +Y and then tilted from the grip toward the tip.
 */
export function buildUmbrella(): Umbrella {
  const group = new THREE.Group();
  const axis = TIP.clone().sub(GRIP);
  const length = axis.length();

  const holder = new THREE.Group();
  holder.position.copy(GRIP);
  holder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis.clone().normalize());
  group.add(holder);

  const fabric = new THREE.MeshStandardMaterial({ color: "#2f6fd6", roughness: 0.6, side: THREE.DoubleSide });
  const trim = new THREE.MeshStandardMaterial({ color: "#8db8ff", roughness: 0.5 });
  const metal = new THREE.MeshStandardMaterial({ color: "#2a2a2e", roughness: 0.35, metalness: 0.6 });

  const canopy = new THREE.Group();
  canopy.position.y = length;
  holder.add(canopy);
  const canopyMesh = new THREE.Mesh(new THREE.SphereGeometry(CANOPY_RADIUS, 32, 12, 0, Math.PI * 2, 0, CANOPY_ANGLE), fabric);
  canopyMesh.position.y = -CANOPY_RADIUS;
  canopyMesh.castShadow = true;
  canopy.add(canopyMesh);
  const rimHeight = -CANOPY_RADIUS * (1 - Math.cos(CANOPY_ANGLE));
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1, 0.012, 6, 64), trim);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = rimHeight;
  canopy.add(rim);
  const finial = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 8), metal);
  finial.position.y = 0.02;
  canopy.add(finial);

  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, length + 0.12, 8), metal);
  shaft.position.y = (length - 0.12) / 2;
  holder.add(shaft);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.016, 8, 16, Math.PI), metal);
  handle.position.set(0.06, -0.12, 0);
  handle.rotation.z = Math.PI;
  holder.add(handle);

  // Drops: those above the canopy stop on its surface, the rest fall past the avatar.
  const drops = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.005, 0.005, 0.12, 4),
    new THREE.MeshBasicMaterial({ color: "#8db8ff", transparent: true, opacity: 0, depthWrite: false }),
    DROP_COUNT,
  );
  drops.frustumCulled = false;
  group.add(drops);
  const dropMaterial = drops.material as THREE.MeshBasicMaterial;
  const positions = Array.from({ length: DROP_COUNT }, () => new THREE.Vector3());
  const respawn = (drop: THREE.Vector3, anywhere: boolean) =>
    drop.set(
      THREE.MathUtils.randFloat(-1.6, 1.4),
      anywhere ? THREE.MathUtils.randFloat(RAIN_BOTTOM, RAIN_TOP) : RAIN_TOP,
      THREE.MathUtils.randFloat(-0.2, 0.9),
    );
  positions.forEach((drop) => respawn(drop, true));
  const tipXZ = new THREE.Vector2(TIP.x, TIP.z);
  const floorUnder = (x: number, z: number) => {
    const distance = tipXZ.distanceTo(new THREE.Vector2(x, z));
    if (distance > 1) return RAIN_BOTTOM;
    return TIP.y - (CANOPY_RADIUS - Math.sqrt(CANOPY_RADIUS ** 2 - distance ** 2));
  };
  const matrix = new THREE.Matrix4();

  return {
    group,
    update: (amount, delta) => {
      group.visible = amount > 0.01;
      if (!group.visible) return;
      holder.scale.setScalar(amount);
      canopy.scale.set(THREE.MathUtils.lerp(0.15, 1, amount), 1, THREE.MathUtils.lerp(0.15, 1, amount));
      dropMaterial.opacity = 0.55 * amount;
      for (let index = 0; index < DROP_COUNT; index++) {
        const drop = positions[index];
        drop.y -= DROP_SPEED * delta;
        if (drop.y < floorUnder(drop.x, drop.z)) respawn(drop, false);
        drops.setMatrixAt(index, matrix.makeTranslation(drop.x, drop.y, drop.z));
      }
      drops.instanceMatrix.needsUpdate = true;
    },
  };
}
