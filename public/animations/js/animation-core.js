/**
 * animation-core.js — 机构动画共享渲染模块
 *
 * 为所有平面机构 Three.js 动画提供统一的高质量渲染基线：
 *   - PCFSoftShadowMap 阴影 + ACES 色调映射
 *   - 摄影棚三灯布光
 *   - 程序化 HDR 环境贴图（金属 PBR 反射）
 *   - SSAO（环境光遮蔽）+ 微弱 Bloom + FXAA 后处理管线
 *   - 机械工程 PBR 材质预设（抛光钢 / 铸铝 / 铸铁 / 橡胶 / 黄铜销）
 *   - 几何体辅助工具（圆角杆件 / 螺旋弹簧 / 管状缆绳）
 *
 * 依赖：Three.js r160+ (通过 importmap 加载)
 * 用法：import { createRenderer, createStandardLights, ... } from './js/animation-core.js';
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';

// ════════════════════════════════════════════════════════════════
// 1. 渲染器工厂
// ════════════════════════════════════════════════════════════════

/**
 * 创建预配置的 WebGLRenderer（阴影 + ACES 色调映射 + 像素比钳制）
 * @param {{ antialias?: boolean, alpha?: boolean, exposure?: number }} options
 * @returns {THREE.WebGLRenderer}
 */
export function createRenderer(options = {}) {
  const renderer = new THREE.WebGLRenderer({
    antialias: options.antialias ?? true,
    alpha: options.alpha ?? false,
    powerPreference: 'high-performance',
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // 阴影
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // 色调映射
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = options.exposure ?? 1.0;

  // 色彩空间（r152+ 默认 sRGB，显式声明）
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  document.body.appendChild(renderer.domElement);
  renderer.domElement.style.display = 'block';

  return renderer;
}

// ════════════════════════════════════════════════════════════════
// 2. 标准三灯布光
// ════════════════════════════════════════════════════════════════

/**
 * 向场景添加三灯布光（主光 + 冷色补光 + 暖色边缘光 + 环境光）
 * @param {THREE.Scene} scene
 * @param {{ shadowMapSize?: number }} options
 * @returns {{ keyLight: THREE.DirectionalLight, fillLight: THREE.DirectionalLight, rimLight: THREE.DirectionalLight, ambient: THREE.AmbientLight }}
 */
export function createStandardLights(scene, options = {}) {
  const shadowSize = options.shadowMapSize ?? 2048;

  // 主光 — 投阴影
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
  keyLight.position.set(5, 8, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = shadowSize;
  keyLight.shadow.mapSize.height = shadowSize;
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 80;
  keyLight.shadow.camera.left = -15;
  keyLight.shadow.camera.right = 15;
  keyLight.shadow.camera.top = 15;
  keyLight.shadow.camera.bottom = -15;
  keyLight.shadow.bias = -0.0001;
  keyLight.shadow.normalBias = 0.02;
  scene.add(keyLight);

  // 冷色补光 — 不投阴影
  const fillLight = new THREE.DirectionalLight(0x8899cc, 0.8);
  fillLight.position.set(-3, 2, -3);
  scene.add(fillLight);

  // 暖色边缘光 — 不投阴影
  const rimLight = new THREE.DirectionalLight(0xffccaa, 0.6);
  rimLight.position.set(0, -1, -5);
  scene.add(rimLight);

  // 环境光（压低强度，保留对比度）
  const ambient = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(ambient);

  return { keyLight, fillLight, rimLight, ambient };
}

// ════════════════════════════════════════════════════════════════
// 3. 程序化 HDR 环境贴图（金属 PBR 反射必需）
// ════════════════════════════════════════════════════════════════

/**
 * 生成程序化摄影棚环境贴图并设置为 scene.environment。
 * 用 Canvas 绘制 3 个柔光椭圆（模拟柔光箱），无需外部 HDR 文件。
 * @param {THREE.WebGLRenderer} renderer
 * @param {THREE.Scene} scene
 * @param {{ bgColor?: number }} options
 * @returns {THREE.PMREMGenerator} pmremGenerator（调用方应 pmremGenerator.dispose()）
 */
export function createEnvironmentMap(renderer, scene, options = {}) {
  const bgColor = options.bgColor ?? 0x0a0a14;

  // 绘制等距矩形贴图 (512×256)
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // 深色底
  ctx.fillStyle = '#0a0a14';
  ctx.fillRect(0, 0, 512, 256);

  /**
   * 绘制一个柔光椭圆
   */
  function drawSoftbox(cx, cy, rx, ry, colorStop1, colorStop2) {
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
    grad.addColorStop(0, colorStop1);
    grad.addColorStop(0.3, colorStop1);
    grad.addColorStop(1, colorStop2);
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  }

  // 三个柔光箱：主光(右上)、补光(左上)、底部补光
  drawSoftbox(380, 50, 120, 70, 'rgba(255,248,232,0.9)', 'rgba(10,10,20,0)');
  drawSoftbox(50, 60, 100, 60, 'rgba(180,200,240,0.5)', 'rgba(10,10,20,0)');
  drawSoftbox(250, 220, 130, 40, 'rgba(200,180,150,0.3)', 'rgba(10,10,20,0)');

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.mapping = THREE.EquirectangularReflectionMapping;

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const envMap = pmremGenerator.fromEquirectangular(texture).texture;

  scene.environment = envMap;
  scene.background = new THREE.Color(bgColor);
  scene.environmentIntensity = 1.0;

  texture.dispose();

  return pmremGenerator;
}

// ════════════════════════════════════════════════════════════════
// 4. 后处理管线（EffectComposer）
// ════════════════════════════════════════════════════════════════

/**
 * 创建标准后处理管线：RenderPass → SSAO → 微弱Bloom → FXAA → Output
 * @param {THREE.WebGLRenderer} renderer
 * @param {THREE.Scene} scene
 * @param {THREE.PerspectiveCamera} camera
 * @returns {{ composer: EffectComposer, ssaoPass: SSAOPass, bloomPass: UnrealBloomPass, fxaaPass: ShaderPass }}
 */
export function createComposer(renderer, scene, camera) {
  const composer = new EffectComposer(renderer);
  const w = renderer.domElement.width;
  const h = renderer.domElement.height;

  // 1. 渲染场景
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // 2. SSAO — 环境光遮蔽（提供接触阴影/深度感）
  const ssaoPass = new SSAOPass(scene, camera, w, h);
  ssaoPass.kernelRadius = 3;
  ssaoPass.minDistance = 0.001;
  ssaoPass.maxDistance = 0.1;
  ssaoPass.output = SSAOPass.OUTPUT.Default;
  composer.addPass(ssaoPass);

  // 3. 极微弱 Bloom — 仅金属高光边沿有辉光
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(w, h),
    0.2,   // strength（很低）
    0.5,   // radius
    0.6,   // threshold（只对高亮区域生效）
  );
  composer.addPass(bloomPass);

  // 4. FXAA — 后处理阶段抗锯齿
  const fxaaPass = new ShaderPass(FXAAShader);
  const pixelRatio = renderer.getPixelRatio();
  fxaaPass.material.uniforms['resolution'].value.set(
    1 / (w * pixelRatio),
    1 / (h * pixelRatio),
  );
  composer.addPass(fxaaPass);

  // 5. Output — 色彩空间输出
  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  return { composer, ssaoPass, bloomPass, fxaaPass };
}

// ════════════════════════════════════════════════════════════════
// 5. 机械工程 PBR 材质预设
// ════════════════════════════════════════════════════════════════

/**
 * 材质预设工厂函数 — 每次调用返回新的 MeshStandardMaterial 实例。
 * 所有金属预设（metalness > 0.2）依赖 scene.environment 提供反射。
 *
 * 用法：
 *   const mat = MaterialPresets.polishedSteel();
 *   const mat = MaterialPresets.anodizedAluminum(0xff6b35);
 */
export const MaterialPresets = {
  /** 抛光钢 — 铰链销、轴承 */
  polishedSteel: () => new THREE.MeshStandardMaterial({
    color: 0xe8e8f0, metalness: 0.95, roughness: 0.18,
    name: 'polishedSteel',
  }),

  /** 拉丝铝 — 连杆、曲柄 */
  brushedAluminum: () => new THREE.MeshStandardMaterial({
    color: 0xc8ccd4, metalness: 0.55, roughness: 0.40,
    name: 'brushedAluminum',
  }),

  /** 阳极氧化铝 — 可指定颜色 */
  anodizedAluminum: (color = 0xff6b35) => new THREE.MeshStandardMaterial({
    color, metalness: 0.45, roughness: 0.35,
    name: 'anodizedAluminum',
  }),

  /** 铸铁 — 机架、底座 */
  castIron: () => new THREE.MeshStandardMaterial({
    color: 0x6b7280, metalness: 0.35, roughness: 0.60,
    name: 'castIron',
  }),

  /** 碳钢 — 一般结构件 */
  carbonSteel: () => new THREE.MeshStandardMaterial({
    color: 0x8c8e91, metalness: 0.90, roughness: 0.40,
    name: 'carbonSteel',
  }),

  /** 黄铜销 — 带微弱暖色自发光 */
  brassPin: () => new THREE.MeshStandardMaterial({
    color: 0xf5e0dc, metalness: 0.80, roughness: 0.25,
    emissive: 0x331100, emissiveIntensity: 0.15,
    name: 'brassPin',
  }),

  /** 橡胶/塑料 — 滑块、垫圈 */
  rubber: (color = 0x2a2a30) => new THREE.MeshStandardMaterial({
    color, metalness: 0.0, roughness: 0.90,
    name: 'rubber',
  }),

  /** 尼龙 — 滑动轴承、导套 */
  nylon: () => new THREE.MeshStandardMaterial({
    color: 0xd4d4c8, metalness: 0.0, roughness: 0.60,
    name: 'nylon',
  }),
};

// ════════════════════════════════════════════════════════════════
// 6. 几何体辅助工具
// ════════════════════════════════════════════════════════════════

/**
 * 几何体辅助工具 — 替代基础 BoxGeometry/CylinderGeometry，
 * 提供倒角、圆角、管状等更精细的机械构件几何体。
 */
export const GeometryHelpers = {

  /**
   * 圆角杆件 — 用 ExtrudeGeometry（圆角矩形截面 + bevel）替代 BoxGeometry。
   * 所有 12 条边均有圆角，适合做连杆、曲柄、摇杆等。
   *
   * @param {number} length - X 方向长度
   * @param {number} width  - Y 方向宽度（截面）
   * @param {number} depth  - Z 方向深度（截面）
   * @param {number} radius - 圆角半径（默认取短边的 8%）
   * @param {number} bevelSegs - 倒角分段（2-4），越大越圆滑
   * @returns {THREE.ExtrudeGeometry}
   */
  createRoundedLink(length, width, depth, radius, bevelSegs = 3) {
    const r = radius ?? Math.min(width, depth) * 0.08;
    const hw = width / 2;
    const hd = depth / 2;

    // 在 YZ 平面绘制圆角矩形截面，然后沿 X 拉伸
    const shape = new THREE.Shape();
    shape.moveTo(-hd + r, -hw);
    shape.lineTo(hd - r, -hw);
    shape.quadraticCurveTo(hd, -hw, hd, -hw + r);
    shape.lineTo(hd, hw - r);
    shape.quadraticCurveTo(hd, hw, hd - r, hw);
    shape.lineTo(-hd + r, hw);
    shape.quadraticCurveTo(-hd, hw, -hd, hw - r);
    shape.lineTo(-hd, -hw + r);
    shape.quadraticCurveTo(-hd, -hw, -hd + r, -hw);

    const geo = new THREE.ExtrudeGeometry(shape, {
      steps: 1,
      depth: length,
      bevelEnabled: true,
      bevelThickness: r * 0.5,
      bevelSize: r * 0.5,
      bevelSegments: bevelSegs,
    });

    // ExtrudeGeometry 沿 Z 拉伸；杆件沿 X 放置，需旋转
    geo.rotateY(-Math.PI / 2);
    geo.translate(-length / 2, 0, 0);
    geo.computeVertexNormals();

    return geo;
  },

  /**
   * 3D 螺旋弹簧 — 用 TubeGeometry 沿螺旋曲线生成，替代 2D Line。
   *
   * @param {{ coils?: number, radius?: number, height?: number, tubeRadius?: number, tubularSegs?: number, radialSegs?: number }} params
   * @returns {THREE.TubeGeometry}
   */
  createSpring({
    coils = 8,
    radius = 0.5,
    height = 3,
    tubeRadius = 0.08,
    tubularSegs = 200,
    radialSegs = 16,
  } = {}) {
    // 螺旋曲线
    class HelixCurve extends THREE.Curve {
      getPoint(t) {
        const angle = 2 * Math.PI * coils * t;
        return new THREE.Vector3(
          Math.cos(angle) * radius,
          height * (t - 0.5),
          Math.sin(angle) * radius,
        );
      }
    }
    return new THREE.TubeGeometry(new HelixCurve(), tubularSegs, tubeRadius, radialSegs, false);
  },

  /**
   * 管状缆绳 — 用 TubeGeometry + CatmullRomCurve3 替代 1px Line。
   *
   * @param {THREE.Vector3[]} points - 路径点数组
   * @param {number} tubeRadius - 管半径（默认 0.3）
   * @param {number} radialSegs - 管截面分段（默认 12）
   * @param {number} tubularSegs - 路径分段（默认 64）
   * @returns {THREE.TubeGeometry}
   */
  createCable(points, tubeRadius = 0.3, radialSegs = 12, tubularSegs = 64) {
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, tubularSegs, tubeRadius, radialSegs, false);
  },

  /**
   * 高分段圆柱体 — 预设 64 径向段，适合可见的旋转件。
   *
   * @param {number} radiusTop
   * @param {number} radiusBottom
   * @param {number} height
   * @param {number} segments
   * @returns {THREE.CylinderGeometry}
   */
  createCylinder(radiusTop, radiusBottom, height, segments = 64) {
    return new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments, 1, false);
  },

  /**
   * 高分段球体 — 预设 64 段，适合可见的铰链销。
   *
   * @param {number} radius
   * @param {number} widthSegs
   * @param {number} heightSegs
   * @returns {THREE.SphereGeometry}
   */
  createPinSphere(radius, widthSegs = 48, heightSegs = 48) {
    return new THREE.SphereGeometry(radius, widthSegs, heightSegs);
  },
};

// ════════════════════════════════════════════════════════════════
// 7. 动画循环 & 窗口缩放
// ════════════════════════════════════════════════════════════════

/**
 * 标准动画循环 — 自动处理 delta 钳制、controls 更新、composer/renderer 渲染。
 *
 * @param {THREE.WebGLRenderer} renderer
 * @param {THREE.Scene} scene
 * @param {THREE.PerspectiveCamera} camera
 * @param {{ composer?: EffectComposer, controls?: OrbitControls }} options
 * @param {(delta: number, elapsed: number) => void} updateFn - 每帧回调
 * @returns {{ start: () => void, stop: () => void, clock: THREE.Clock }}
 */
export function createAnimationLoop(renderer, scene, camera, options = {}, updateFn) {
  const clock = new THREE.Clock();
  let running = false;
  let rafId = null;

  function animate() {
    if (!running) return;
    rafId = requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.05); // 钳制 delta 防止切标签页跳帧
    const elapsed = clock.getElapsedTime();

    if (options.controls) {
      options.controls.update();
    }

    if (updateFn) {
      updateFn(delta, elapsed);
    }

    if (options.composer) {
      options.composer.render();
    } else {
      renderer.render(scene, camera);
    }
  }

  return {
    start() {
      if (running) return;
      running = true;
      clock.start();
      animate();
    },
    stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
    },
    clock,
  };
}

/**
 * 窗口 resize 处理器 — 同时更新 camera、renderer、composer、FXAA uniform。
 *
 * @param {THREE.WebGLRenderer} renderer
 * @param {THREE.PerspectiveCamera} camera
 * @param {{ composer?: EffectComposer, fxaaPass?: ShaderPass }} options
 * @returns {() => void}
 */
export function makeResizeHandler(renderer, camera, options = {}) {
  return () => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    if (options.composer) {
      options.composer.setSize(w, h);
    }

    if (options.fxaaPass) {
      const pr = renderer.getPixelRatio();
      options.fxaaPass.material.uniforms['resolution'].value.set(
        1 / (w * pr),
        1 / (h * pr),
      );
    }
  };
}

// ════════════════════════════════════════════════════════════════
// 8. 快捷启动（一个函数调用完成所有基础设置）
// ════════════════════════════════════════════════════════════════

/**
 * 一键初始化场景、相机、渲染器、灯光、环境贴图、后处理、OrbitControls。
 * 返回所有对象供调用方按需调整。
 *
 * @returns {{
 *   scene: THREE.Scene,
 *   camera: THREE.PerspectiveCamera,
 *   renderer: THREE.WebGLRenderer,
 *   controls: OrbitControls,
 *   composer: EffectComposer,
 *   lights: { keyLight, fillLight, rimLight, ambient },
 *   pmremGen: THREE.PMREMGenerator,
 *   ssaoPass: SSAOPass,
 *   bloomPass: UnrealBloomPass,
 *   fxaaPass: ShaderPass,
 * }}
 */
export function quickSetup({
  bgColor = 0x0a0a14,
  cameraPos = [220, 180, 360],
  target = [0, 0, 0],
  fov = 45,
  near = 1,
  far = 5000,
  exposure = 1.0,
  shadowMapSize = 2048,
  bloomStrength = 0.2,
} = {}) {
  // 场景
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(bgColor, far * 0.5, far);

  // 相机
  const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, near, far);
  camera.position.set(...cameraPos);

  // 渲染器
  const renderer = createRenderer({ exposure });

  // OrbitControls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(...target);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.update();

  // 灯光
  const lights = createStandardLights(scene, { shadowMapSize });

  // 环境贴图
  const pmremGen = createEnvironmentMap(renderer, scene, { bgColor });

  // 后处理
  const { composer, ssaoPass, bloomPass, fxaaPass } = createComposer(renderer, scene, camera);

  // 微调 bloom
  bloomPass.strength = bloomStrength;

  // resize
  window.addEventListener('resize', makeResizeHandler(renderer, camera, { composer, fxaaPass }));

  return {
    scene,
    camera,
    renderer,
    controls,
    composer,
    lights,
    pmremGen,
    ssaoPass,
    bloomPass,
    fxaaPass,
  };
}
