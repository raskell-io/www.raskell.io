/* CRISPR in 3D: a stepped, animated explanation of how bacteria remember viruses and how Cas9 became a tool.
 *
 * Mounted by the `crispr_3d` shortcode: a <figure data-crispr3d> holding a [data-stage] canvas mount, a caption, the
 * step buttons, and a <script type="application/json" data-crispr-steps> with the text of each step (the same text
 * the shortcode prints as a plain list for readers without JavaScript). Uses three.js (static/js/vendor/three, MIT),
 * loaded through the import map the shortcode writes.
 *
 * Six stages, each built from scratch and animated once from t = 0 to 1:
 *   0 the array: repeats and spacers, with the cas genes beside them
 *   1 a phage lands and injects its DNA
 *   2 acquisition: a piece of viral DNA becomes a new spacer at the front of the array
 *   3 expression: the array is copied into RNA and cut into guides (crRNAs)
 *   4 interference: Cas9 with a guide finds the matching viral DNA beside a PAM and cuts both strands
 *   5 the tool: a designed guide sends Cas9 to any DNA; the cell repairs the cut
 * Lengths and the twist of the helix are not to scale: one repeat and one spacer make exactly one turn, so a new
 * unit can be inserted without breaking the helix.
 */
import * as THREE from "three";
import { OrbitControls } from "./vendor/three/OrbitControls.js";

const RISE = 0.34, RADIUS = 0.82, TWIST = (Math.PI * 2) / 13;
const REP = 6, SPC = 7;                       // repeat + spacer = 13 bases = one turn
const C = {
  backbone: 0xeef3fb, repeat: 0xffb627, leader: 0xa8b3c4, cas: 0x14d9b8,
  spacers: [0x3d9bff, 0x4ee36f, 0xc77dff, 0xff5d5d],
  virusBackbone: 0xb388ff, virus: 0x8f7fd6, target: 0xff2e93, pam: 0xffffff,
  rna: 0xff7a45, cas9: 0xa98bff, cas12: 0x35e0c4, human: 0x4aa8ff, edit: 0x39ff88, repair: 0xffd23f,
  phage: 0xe8ecf5, cell: 0x5fe0d0, ink: 0x0b1020,
};

// Cel shading: three hard bands of light instead of a smooth gradient, and an ink outline around every shape
// (the "inverted hull": a slightly larger copy drawn from the inside, in the outline colour).
const TONES = (() => {
  const tex = new THREE.DataTexture(new Uint8Array([70, 150, 255]), 3, 1, THREE.RedFormat);
  tex.minFilter = tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
})();
const ink = (opacity = 1) => new THREE.MeshBasicMaterial({ color: C.ink, side: THREE.BackSide, transparent: true, opacity });

const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
const lerp = (a, b, t) => a + (b - a) * t;

function mat(color, opts = {}) {
  return new THREE.MeshToonMaterial(Object.assign({ color, gradientMap: TONES }, opts));
}

/* A double helix along x, made of segments that can be moved, opened, faded and hidden on their own.
 * segs: [{len, color, key}]; start: the global base index of the first base (keeps the twist continuous). */
function dna(segs, { start = 0, backbone = C.backbone } = {}) {
  const group = new THREE.Group();
  const parts = [];
  let g = start;
  const rung = new THREE.CylinderGeometry(0.075, 0.075, RADIUS * 2, 8);
  const rungInk = new THREE.CylinderGeometry(0.11, 0.11, RADIUS * 2 - 0.1, 8);
  segs.forEach((s) => {
    const part = new THREE.Group();
    const strands = new THREE.Group();
    const rungMat = mat(s.color, { transparent: true, emissive: s.color, emissiveIntensity: 0.12 });
    const strandMat = mat(backbone, { transparent: true });
    for (const side of [0, Math.PI]) {
      const pts = [];
      for (let i = g; i <= g + s.len; i++) {
        const a = i * TWIST + side;
        pts.push(new THREE.Vector3(i * RISE, RADIUS * Math.cos(a), RADIUS * Math.sin(a)));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      strands.add(new THREE.Mesh(new THREE.TubeGeometry(curve, s.len * 8, 0.11, 8), strandMat));
      strands.add(new THREE.Mesh(new THREE.TubeGeometry(curve, s.len * 8, 0.155, 8), ink()));
    }
    const rungs = new THREE.InstancedMesh(rung, rungMat, s.len);
    const outline = new THREE.InstancedMesh(rungInk, ink(), s.len);
    const d = new THREE.Object3D();
    for (let i = 0; i < s.len; i++) {
      d.position.set((g + i + 0.5) * RISE, 0, 0);
      d.rotation.set((g + i + 0.5) * TWIST, 0, 0);
      d.updateMatrix();
      rungs.setMatrixAt(i, d.matrix);
      outline.setMatrixAt(i, d.matrix);
    }
    part.add(strands, rungs, outline);
    group.add(part);
    parts.push({ group: part, strands, rungs, rungMat, strandMat, key: s.key, start: g, len: s.len, centre: (g + s.len / 2) * RISE });
    g += s.len;
  });
  return { group, parts, end: g, find: (k) => parts.find((p) => p.key === k) };
}

/* A single RNA strand: a gently waving backbone with short stubs (the bases), one group per segment. */
function rna(segs, { start = 0 } = {}) {
  const group = new THREE.Group();
  const parts = [];
  let g = start;
  const stub = new THREE.CylinderGeometry(0.07, 0.07, 0.62, 8);
  segs.forEach((s) => {
    const part = new THREE.Group();
    const pts = [];
    for (let i = g; i <= g + s.len; i++) pts.push(new THREE.Vector3(i * RISE, 0.18 * Math.sin(i * 0.9), 0));
    const bm = mat(C.rna, { transparent: true });
    const curve = new THREE.CatmullRomCurve3(pts);
    part.add(new THREE.Mesh(new THREE.TubeGeometry(curve, s.len * 6, 0.1, 8), bm));
    part.add(new THREE.Mesh(new THREE.TubeGeometry(curve, s.len * 6, 0.145, 8), ink()));
    const sm = mat(s.color, { transparent: true, emissive: s.color, emissiveIntensity: 0.15 });
    const stubs = new THREE.InstancedMesh(stub, sm, s.len);
    const d = new THREE.Object3D();
    for (let i = 0; i < s.len; i++) {
      d.position.set((g + i + 0.5) * RISE, 0.18 * Math.sin((g + i + 0.5) * 0.9) - 0.32, 0);
      d.updateMatrix();
      stubs.setMatrixAt(i, d.matrix);
    }
    part.add(stubs);
    group.add(part);
    parts.push({ group: part, key: s.key, start: g, len: s.len, centre: (g + s.len / 2) * RISE, mats: [bm, sm] });
    g += s.len;
  });
  return { group, parts, end: g };
}

function phage() {
  const g = new THREE.Group();
  const m = mat(C.phage);
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.95, 0), m);
  head.position.y = 2.1;
  const headInk = new THREE.Mesh(new THREE.IcosahedronGeometry(1.03, 0), ink());
  headInk.position.y = 2.1;
  g.add(headInk);
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.2, 12), m);
  collar.position.y = 1.15;
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 1.6, 12), m);
  tail.position.y = 0.25;
  const tailInk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 1.65, 12), ink());
  tailInk.position.y = 0.25;
  g.add(tailInk);
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.12, 6), m);
  plate.position.y = -0.58;
  g.add(head, collar, tail, plate);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.1, 6), m);
    leg.position.set(Math.cos(a) * 0.62, -0.95, Math.sin(a) * 0.62);
    leg.rotation.set(Math.sin(a) * 0.7, 0, -Math.cos(a) * 0.7);
    g.add(leg);
  }
  return g;
}

function protein(color, scale = 1) {
  const g = new THREE.Group();
  const m = mat(color, { transparent: true, opacity: 0.82, emissive: color, emissiveIntensity: 0.15 });
  g.userData.body = m;
  for (const [r, x, y, z, sx] of [[1.15, -0.35, 0.5, 0, 1.15], [0.95, 0.55, -0.35, 0.2, 1]]) {
    const lobe = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 24), m);
    const edge = new THREE.Mesh(new THREE.SphereGeometry(r * 1.06, 32, 24), ink(0.9));
    for (const o of [lobe, edge]) { o.scale.set(sx, 1, 1); o.position.set(x, y, z); g.add(o); }
  }
  g.scale.setScalar(scale);
  g.userData.mat = m;
  return g;
}

function cell(length = 22, radius = 4.2) {
  const g = new THREE.Group();
  const m = new THREE.MeshToonMaterial({ color: C.cell, gradientMap: TONES, transparent: true, opacity: 0.13, side: THREE.DoubleSide, depthWrite: false });
  const c = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 8, 32), m);
  const edge = new THREE.Mesh(new THREE.CapsuleGeometry(radius * 1.02, length, 8, 32), new THREE.MeshBasicMaterial({ color: C.cell, side: THREE.BackSide, transparent: true, opacity: 0.35, depthWrite: false }));
  g.add(c, edge);
  g.rotation.z = Math.PI / 2;
  return g;
}

// Opacity relative to each material's own starting opacity; materials are shared between meshes, so the base is
// kept on the material, not the mesh.
function fade(obj, o) {
  obj.traverse((n) => {
    if (!n.material) return;
    const m = n.material;
    m.transparent = true;
    m.userData.base ??= m.opacity;
    m.opacity = m.userData.base * o;
  });
  obj.visible = o > 0.01;
}

function dispose(obj) {
  obj.traverse((n) => {
    if (n.geometry) n.geometry.dispose();
    if (n.material) (Array.isArray(n.material) ? n.material : [n.material]).forEach((m) => m.dispose());
  });
}

const arraySegs = (withNew) => {
  const s = [{ len: 10, color: C.cas, key: "cas" }, { len: 3, color: C.leader, key: "leader" }];
  if (withNew) s.push({ len: REP, color: C.repeat, key: "rN" }, { len: SPC, color: C.target, key: "sN" });
  C.spacers.forEach((col, i) => s.push({ len: REP, color: C.repeat, key: "r" + i }, { len: SPC, color: col, key: "s" + i }));
  s.push({ len: REP, color: C.repeat, key: "rEnd" });
  return s;
};

/* The stages. Each returns {objects, labels, camera, update(t)}; labels are [{text, at: () => Vector3}]. */
const STAGES = [
  // 0: the array
  (S) => {
    const a = dna(arraySegs(false));
    const w = a.end * RISE;
    a.group.position.x = -w / 2;
    const c = cell(w + 2);
    const reps = a.parts.filter((p) => p.key.startsWith("r"));
    return {
      objects: [c, a.group],
      camera: [0, 5, 23],
      labels: [
        { text: "cas genes", at: () => S.world(a.group, a.find("cas").centre, -1.6) },
        { text: "repeat", at: () => S.world(a.group, a.find("r1").centre, 1.7) },
        { text: "spacer", at: () => S.world(a.group, a.find("s1").centre, -1.7) },
        { text: "repeat", at: () => S.world(a.group, a.find("r2").centre, 1.7) },
      ],
      update(t) {
        a.parts.forEach((p, i) => {
          const k = ease(seg(t, i * 0.04, i * 0.04 + 0.25));
          p.group.scale.set(1, k, k);
          fade(p.group, k);
        });
        const pulse = t > 0.75 ? 0.12 + 0.5 * (0.5 + 0.5 * Math.sin(S.clock * 4)) : 0.12;
        reps.forEach((p) => (p.rungMat.emissiveIntensity = pulse));
      },
    };
  },
  // 1: a phage lands and injects its DNA
  (S) => {
    const a = dna(arraySegs(false));
    const w = a.end * RISE;
    a.group.position.x = -w / 2;
    const c = cell(w + 2);
    const ph = phage();
    const v = dna([{ len: 12, color: C.virus, key: "v1" }, { len: SPC, color: C.target, key: "vt" }, { len: 3, color: C.pam, key: "pam" }, { len: 12, color: C.virus, key: "v2" }], { backbone: C.virusBackbone });
    const vw = v.end * RISE;
    return {
      objects: [c, a.group, ph, v.group],
      camera: [2, 6, 24],
      labels: [
        { text: "phage", at: () => ph.position.clone().add(new THREE.Vector3(1.6, 2.2, 0)) },
        { text: "viral DNA", at: () => S.world(v.group, v.find("v1").centre, -1.6) },
      ],
      update(t) {
        const land = ease(seg(t, 0, 0.35));
        ph.position.set(3, lerp(13, 5.6, land), 0);
        const inj = ease(seg(t, 0.4, 0.95));
        v.group.scale.setScalar(Math.max(0.001, inj));
        v.group.position.set(lerp(3, 3 - vw / 2, inj), lerp(4.2, -2.6, inj), lerp(0, 1.2, inj));
        fade(v.group, inj);
      },
    };
  },
  // 2: acquisition, the mug shot
  (S) => {
    const final = dna(arraySegs(true));
    const w = final.end * RISE;
    final.group.position.x = -w / 2;
    const c = cell(w + 2);
    const v = dna([{ len: 12, color: C.virus, key: "v1" }, { len: SPC, color: C.target, key: "vt" }, { len: 3, color: C.pam, key: "pam" }, { len: 12, color: C.virus, key: "v2" }], { backbone: C.virusBackbone });
    const vw = v.end * RISE;
    v.group.position.set(3 - vw / 2, -2.6, 1.2);
    const cas12 = protein(C.cas12, 0.55);
    const newR = final.find("rN"), newS = final.find("sN");
    const after = final.parts.filter((p) => p.start >= newR.start && p !== newR && p !== newS);
    const shift = (REP + SPC) * RISE;
    const from = new THREE.Vector3();
    return {
      objects: [c, final.group, v.group, cas12],
      camera: [-4, 5, 22],
      labels: [
        { text: "Cas1 and Cas2", at: () => cas12.position.clone().add(new THREE.Vector3(0, 1.4, 0)) },
        { text: "new spacer", at: () => S.world(final.group, newS.centre, -1.9) },
      ],
      update(t) {
        const grab = ease(seg(t, 0, 0.25));
        const vt = v.find("vt");
        const target = S.world(v.group, vt.centre, 0);
        cas12.position.copy(target).add(new THREE.Vector3(0, lerp(4, 1.1, grab), 0));
        // the viral piece leaves, the array opens, the piece flies in, a new repeat appears
        const lift = ease(seg(t, 0.25, 0.4));
        vt.group.visible = lift < 0.05;
        const open = ease(seg(t, 0.3, 0.6));
        after.forEach((p) => (p.group.position.x = -shift * (1 - open)));
        const fly = ease(seg(t, 0.4, 0.8));
        from.copy(target).sub(S.world(final.group, newS.centre, 0));
        newS.group.position.set(from.x * (1 - fly), from.y * (1 - fly) + Math.sin(fly * Math.PI) * 2.5, from.z * (1 - fly));
        newS.group.visible = lift >= 0.05;
        cas12.position.lerp(S.world(final.group, newS.centre, 1.1), fly);
        const rep = ease(seg(t, 0.75, 1));
        newR.group.scale.set(1, Math.max(0.001, rep), Math.max(0.001, rep));
        fade(newR.group, rep);
        fade(cas12, 1 - seg(t, 0.85, 1));
        newS.rungMat.emissiveIntensity = 0.12 + (t > 0.85 ? 0.45 * (0.5 + 0.5 * Math.sin(S.clock * 4)) : 0);
      },
    };
  },
  // 3: expression, the archive is read
  (S) => {
    const a = dna(arraySegs(true));
    const w = a.end * RISE;
    a.group.position.x = -w / 2;
    const c = cell(w + 2);
    const arr = arraySegs(true).slice(2);
    const r = rna(arr, { start: 13 });
    r.group.position.set(-w / 2, 2.9, 0);
    const pairs = [];
    for (let i = 0; i < r.parts.length - 1; i += 2) pairs.push([r.parts[i], r.parts[i + 1]]);
    return {
      objects: [c, a.group, r.group],
      camera: [0, 6, 23],
      labels: [
        { text: "RNA copy", at: () => S.world(r.group, r.parts[0].centre, 1.2) },
        { text: "guides (crRNAs)", at: () => S.world(r.group, pairs[2][1].centre, 2.6) },
      ],
      update(t) {
        const copy = seg(t, 0, 0.5);
        r.parts.forEach((p, i) => {
          const k = ease(seg(copy, i / r.parts.length, (i + 1.5) / r.parts.length));
          fade(p.group, k);
        });
        const cut = ease(seg(t, 0.55, 1));
        pairs.forEach(([rp, sp], i) => {
          const dy = cut * (0.8 + (i % 2) * 1.2), dx = cut * (i - (pairs.length - 1) / 2) * 0.9;
          rp.group.position.set(dx, dy, 0);
          sp.group.position.set(dx, dy, 0);
        });
        const last = r.parts[r.parts.length - 1];
        fade(last.group, Math.min(ease(seg(copy, 0.9, 1)), 1 - cut));
      },
    };
  },
  // 4: interference, search and cut
  (S) => targetAndCut(S, { backbone: C.virusBackbone, other: C.virus, targetColor: C.target, repair: false }),
  // 5: the tool
  (S) => targetAndCut(S, { backbone: C.human, other: 0x8b97a8, targetColor: C.edit, repair: true }),
];

/* A cut: a ring that expands and fades, and sparks flying out from the cut point. */
function burst(color) {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.06, 8, 48), new THREE.MeshBasicMaterial({ color, transparent: true }));
  ring.rotation.y = Math.PI / 2;
  const n = 36, dirs = [];
  const sparks = new THREE.InstancedMesh(new THREE.SphereGeometry(0.09, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true }), n);
  for (let i = 0; i < n; i++) dirs.push(new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(1.5 + Math.random() * 2));
  g.add(ring, sparks);
  const d = new THREE.Object3D();
  g.userData.set = (k) => {
    g.visible = k > 0 && k < 1;
    ring.scale.setScalar(0.2 + k * 4.5);
    ring.material.opacity = 1 - k;
    sparks.material.opacity = 1 - k * k;
    dirs.forEach((v, i) => {
      d.position.copy(v).multiplyScalar(ease(k));
      d.scale.setScalar(1 - k);
      d.updateMatrix();
      sparks.setMatrixAt(i, d.matrix);
    });
    sparks.instanceMatrix.needsUpdate = true;
  };
  g.userData.set(0);
  return g;
}

function targetAndCut(S, o) {
  const d = dna([{ len: 14, color: o.other, key: "a" }, { len: SPC, color: o.targetColor, key: "t" }, { len: 3, color: C.pam, key: "pam" }, { len: 14, color: o.other, key: "b" }], { backbone: o.backbone });
  const w = d.end * RISE;
  d.group.position.x = -w / 2;
  const cas9 = protein(C.cas9, 1);
  const guide = rna([{ len: SPC, color: o.targetColor, key: "g" }]);
  guide.group.position.set(-SPC * RISE / 2, -1.25, 0.25);
  cas9.add(guide.group);
  if (o.repair) {
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.08, 8, 24), mat(C.rna));
    loop.position.set(SPC * RISE / 2 + 0.5, -1.0, 0.25);
    cas9.add(loop);
  }
  const t9 = d.find("t");
  const left = d.parts.filter((p) => p.start <= t9.start);
  const right = d.parts.filter((p) => p.start > t9.start);
  const fix = o.repair ? dna([{ len: 2, color: C.repair, key: "fix" }], { start: t9.start + SPC }) : null;
  const flash = burst(o.targetColor);
  flash.position.set(-w / 2 + (t9.start + SPC) * RISE, 0, 0);
  const objects = [d.group, cas9, flash];
  if (fix) { fix.group.position.x = -w / 2; objects.push(fix.group); }
  return {
    objects,
    camera: [0, 3.5, 17],
    labels: [
      { text: o.repair ? "Cas9 + designed guide" : "Cas9 + guide", at: () => cas9.position.clone().add(new THREE.Vector3(0, 2.2, 0)) },
      { text: "PAM", at: () => S.world(d.group, d.find("pam").centre, -1.6) },
      { text: o.repair ? "target gene" : "viral DNA", at: () => S.world(d.group, d.find("a").centre, -1.7) },
    ],
    update(t) {
      const scan = ease(seg(t, 0, 0.4));
      const tx = S.world(d.group, t9.centre, 0).x;
      cas9.position.set(lerp(-w / 2 - 1, tx, scan), 1.35, 0.3);
      const open = ease(seg(t, 0.42, 0.6));
      t9.group.scale.set(1, 1 + open * 0.75, 1 + open * 0.75);
      guide.group.position.y = lerp(-1.25, -0.55, open);
      const cut = ease(seg(t, 0.66, o.repair ? 0.8 : 1));
      flash.userData.set(seg(t, 0.64, 0.92));
      cas9.userData.body.emissiveIntensity = 0.15 + open * 0.7 * (1 - seg(t, 0.66, 0.85));
      left.forEach((p) => (p.group.position.x = -cut * 1.6));
      right.forEach((p) => (p.group.position.x = cut * 1.6));
      if (!o.repair) {
        left.forEach((p) => { p.group.position.y = -cut * 1.2; p.group.rotation.z = cut * 0.25; fade(p.group, 1 - cut * 0.5); });
        right.forEach((p) => { p.group.position.y = -cut * 0.8; p.group.rotation.z = -cut * 0.2; fade(p.group, 1 - cut * 0.5); });
        t9.rungMat.opacity = (1 - open * 0.85) * (1 - cut * 0.5);
        fade(cas9, 1 - seg(t, 0.75, 1) * 0.4);
      } else {
        fade(cas9, 1 - seg(t, 0.7, 0.85));
        const heal = ease(seg(t, 0.82, 1));
        left.forEach((p) => (p.group.position.x = -cut * 1.6 * (1 - heal)));
        right.forEach((p) => (p.group.position.x = cut * 1.6 * (1 - heal) + heal * 2 * RISE));
        fix.group.scale.set(1, Math.max(0.001, heal), Math.max(0.001, heal));
        fade(fix.group, heal);
        t9.group.scale.set(1, 1 + open * 0.75 * (1 - heal), 1 + open * 0.75 * (1 - heal));
        t9.rungMat.opacity = 1 - open * 0.85 * (1 - heal);
      }
    },
  };
}

function init(fig) {
  const mount = fig.querySelector("[data-stage]");
  const steps = JSON.parse(fig.querySelector("[data-crispr-steps]").textContent);
  const title = fig.querySelector("[data-step-title]");
  const text = fig.querySelector("[data-step-text]");
  const dots = [...fig.querySelectorAll("[data-step]")];
  const prev = fig.querySelector("[data-prev]"), next = fig.querySelector("[data-next]");
  const play = fig.querySelector("[data-play]"), replay = fig.querySelector("[data-replay]");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  fig.classList.add("is-live");
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  mount.appendChild(renderer.domElement);
  const labelLayer = document.createElement("div");
  labelLayer.className = "c3d-labels";
  mount.appendChild(labelLayer);

  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x6677aa, 1.9));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(6, 10, 8);
  scene.add(sun);
  // Drifting particles, the crowded inside of a cell, kept faint so the model stays the subject.
  const dust = (() => {
    const n = 260, p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { p[i * 3] = (Math.random() - 0.5) * 40; p[i * 3 + 1] = (Math.random() - 0.5) * 18; p[i * 3 + 2] = (Math.random() - 0.5) * 18; }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xbfe9ff, size: 0.07, transparent: true, opacity: 0.55, depthWrite: false }));
  })();
  scene.add(dust);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200);
  camera.position.set(0, 5, 23);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.autoRotate = !reduced;
  controls.autoRotateSpeed = 0.35;

  const S = {
    clock: 0,
    world(group, x, y) { return new THREE.Vector3(x, y, 0).applyMatrix4(group.matrixWorld); },
  };
  let stage = null, index = 0, started = 0, playing = false, holdUntil = 0, visible = true;
  let camFrom = new THREE.Vector3(), camTo = new THREE.Vector3(), camT = 1;
  const labelEls = [];

  function go(i) {
    index = (i + STAGES.length) % STAGES.length;
    if (stage) stage.objects.forEach((o) => { scene.remove(o); dispose(o); });
    stage = STAGES[index](S);
    stage.objects.forEach((o) => scene.add(o));
    scene.updateMatrixWorld(true);
    labelEls.forEach((e) => e.remove());
    labelEls.length = 0;
    stage.labels.forEach((l) => {
      const e = document.createElement("span");
      e.className = "c3d-label";
      e.textContent = l.text;
      labelLayer.appendChild(e);
      labelEls.push(e);
    });
    camFrom.copy(camera.position);
    camTo.set(...stage.camera);
    camT = 0;
    controls.target.set(0, 0, 0);
    started = performance.now();
    holdUntil = 0;
    title.textContent = (index + 1) + ". " + steps[index].title;
    text.textContent = steps[index].text;
    dots.forEach((d, k) => d.setAttribute("aria-current", k === index ? "step" : "false"));
  }

  function resize() {
    const w = mount.clientWidth, h = mount.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < 560 ? 55 : 40;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(mount);
  resize();
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(mount);

  const DURATION = 7000;
  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible) return;
    S.clock = now / 1000;
    const t = reduced ? 1 : Math.min(1, (now - started) / DURATION);
    if (camT < 1) {
      camT = reduced ? 1 : Math.min(1, camT + 0.02);
      camera.position.lerpVectors(camFrom, camTo, ease(camT));
    }
    if (!reduced) dust.rotation.y = S.clock * 0.02;
    stage.update(t);
    scene.updateMatrixWorld(true);
    controls.update();
    renderer.render(scene, camera);
    const w = mount.clientWidth, h = mount.clientHeight;
    stage.labels.forEach((l, k) => {
      const p = l.at().project(camera);
      const e = labelEls[k];
      e.style.transform = `translate(${((p.x + 1) / 2) * w}px, ${((1 - p.y) / 2) * h}px) translate(-50%, -50%)`;
      e.style.opacity = p.z < 1 && t > 0.15 ? "1" : "0";
    });
    if (playing && t >= 1) {
      if (!holdUntil) holdUntil = now + 2500;
      else if (now > holdUntil) go(index + 1);
    }
  }

  prev.addEventListener("click", () => go(index - 1));
  next.addEventListener("click", () => go(index + 1));
  replay.addEventListener("click", () => go(index));
  dots.forEach((d, k) => d.addEventListener("click", () => go(k)));
  play.addEventListener("click", () => {
    playing = !playing;
    play.setAttribute("aria-pressed", String(playing));
    play.textContent = playing ? play.dataset.pause : play.dataset.playLabel;
  });
  go(0);
  requestAnimationFrame(frame);
}

document.querySelectorAll("[data-crispr3d]").forEach((fig) => {
  try { init(fig); } catch (e) { fig.classList.remove("is-live"); console.error(e); }
});
