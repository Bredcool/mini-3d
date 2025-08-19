<template>
    <div class="scene3d">
        <canvas ref="canvas"></canvas>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const canvas = ref<HTMLCanvasElement | null>(null)

let renderer: THREE.WebGLRenderer
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let composer: EffectComposer
let animationId = 0

// Objects
let torus: THREE.Mesh
let torusMaterial: THREE.MeshPhysicalMaterial
let particles: THREE.Points
let clock = new THREE.Clock()

// Interaction state
const pointer = new THREE.Vector2(0, 0)

const init = () => {
    const w = window.innerWidth
    const h = window.innerHeight

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvas.value!, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(w, h)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2

    // Scene
    scene = new THREE.Scene()

    // Camera
    camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100)
    camera.position.set(0, 0.6, 3.2)
    scene.add(camera)

    // Lighting
    const hemi = new THREE.HemisphereLight(0xffffff, 0x222244, 0.6)
    scene.add(hemi)

    const dir = new THREE.DirectionalLight(0xffffff, 1.0)
    dir.position.set(3, 5, 2)
    scene.add(dir)

    // Hero object (Box floating dengan material neon)
    const geo = new THREE.BoxGeometry(1, 1, 1)
    torusMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x4466ff,
        metalness: 0.5,
        roughness: 0.3,
        clearcoat: 0.8,
        clearcoatRoughness: 0.2
    })
    torus = new THREE.Mesh(geo, torusMaterial)
    scene.add(torus)

    // Starfield
    const starCnt = 2000
    const pGeo = new THREE.BufferGeometry()
    const positions = new Float32Array(starCnt * 3)
    for (let i = 0; i < starCnt; i++) {
        const r = 8 * Math.cbrt(Math.random()) + 1.5
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta)
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
        positions[i * 3 + 2] = r * Math.cos(phi)
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const pMat = new THREE.PointsMaterial({ size: 0.01, transparent: true, opacity: 0.85 })
    particles = new THREE.Points(pGeo, pMat)
    scene.add(particles)

    // Postprocessing (Bloom biar neon)
    composer = new EffectComposer(renderer)
    const renderPass = new RenderPass(scene, camera)
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 1.2, 0.9, 0.25)
    composer.addPass(renderPass)
    composer.addPass(bloomPass)

    // ScrollTrigger animations
    gsap.to(camera.position, {
        scrollTrigger: {
            trigger: '#section2',
            start: 'top center',
            end: 'bottom center',
            scrub: true,
        },
        z: 1.5,
        y: 0.2,
    })

    gsap.to(camera.position, {
        scrollTrigger: {
            trigger: '#section3',
            start: 'top center',
            end: 'bottom center',
            scrub: true,
        },
        z: 4,
        y: 1,
    })

    window.addEventListener('resize', onResize)
    window.addEventListener('pointermove', onPointerMove)
}

const onResize = () => {
    const w = window.innerWidth
    const h = window.innerHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
    composer.setSize(w, h)
}

const onPointerMove = (e: PointerEvent) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1
}

let burst = { x: 0, y: 0, z: 0 }
let lastBurst = 0
let nextBurst = 3 + Math.random() * 4

const animate = () => {
    const t = clock.getElapsedTime()

    // Parallax
    const parallaxX = pointer.x * 0.4
    const parallaxY = pointer.y * 0.2
    camera.position.x += (parallaxX - camera.position.x) * 0.04
    camera.position.y += (parallaxY * 0.6 - camera.position.y) * 0.04
    camera.lookAt(0, 0, 0)

    // Burst trigger
    if (t - lastBurst > nextBurst) {
        burst.x = (Math.random() - 0.5) * 2
        burst.y = (Math.random() - 0.5) * 2
        burst.z = (Math.random() - 0.5) * 1
        lastBurst = t
        nextBurst = 3 + Math.random() * 4
    }

    // Rotation base
    const baseX = Math.sin(t * 0.6) * 0.4
    const baseY = Math.cos(t * 0.4) * 0.6
    const baseZ = Math.sin(t * 0.3) * 0.2

    burst.x *= 0.95
    burst.y *= 0.95
    burst.z *= 0.95

    torus.rotation.x += ((baseX + burst.x) - torus.rotation.x) * 0.05
    torus.rotation.y += ((baseY + burst.y) - torus.rotation.y) * 0.05
    torus.rotation.z += ((baseZ + burst.z) - torus.rotation.z) * 0.05

    // Floating
    torus.position.y = Math.sin(t * 1.2) * 0.2

    // Breathing scale
    const s = 1 + Math.sin(t * 1.6) * 0.03
    torus.scale.setScalar(s)

    // 🌈 Warna cycle HSL
    const hue = (t * 0.05) % 1
    torusMaterial.color.setHSL(hue, 0.7, 0.55)

    // Stars drift
    particles.rotation.y += 0.0008
    particles.rotation.x += 0.0002

    composer.render()
    animationId = requestAnimationFrame(animate)
}

onMounted(() => {
    init()
    animate()
})

onBeforeUnmount(() => {
    cancelAnimationFrame(animationId)
    window.removeEventListener('resize', onResize)
    window.removeEventListener('pointermove', onPointerMove)
    composer?.dispose()
    renderer?.dispose()
        ; (torus?.geometry as THREE.BufferGeometry)?.dispose()
        ; (particles?.geometry as THREE.BufferGeometry)?.dispose()
})
</script>

<style scoped>
.scene3d {
    position: relative;
    width: 100vw;
    height: auto;
    overflow-x: hidden;
    background: linear-gradient(160deg, #0b0f1a, #06080f 60%, #04050a 100%);
}

canvas {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    z-index: -1;
}
</style>
