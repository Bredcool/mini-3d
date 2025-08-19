<template>
    <div>
        <canvas ref="canvas"></canvas>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import {
    Scene, PerspectiveCamera, WebGLRenderer, Mesh, MeshPhysicalMaterial, BoxGeometry,
    Points, PointsMaterial, BufferGeometry, Float32BufferAttribute, Clock, Vector2,
    HemisphereLight, DirectionalLight, SRGBColorSpace, ACESFilmicToneMapping
} from 'three'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'

import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

const canvas = ref<HTMLCanvasElement | null>(null)

let renderer: InstanceType<typeof WebGLRenderer>
let scene: InstanceType<typeof Scene>
let camera: InstanceType<typeof PerspectiveCamera>
let composer: InstanceType<typeof EffectComposer>
let animationId = 0

let torus: InstanceType<typeof Mesh>
let torusMaterial: InstanceType<typeof MeshPhysicalMaterial>
let particles: InstanceType<typeof Points>
const clock = new Clock()

const pointer = new Vector2(0, 0)

const init = () => {
    const w = window.innerWidth
    const h = window.innerHeight

    renderer = new WebGLRenderer({ canvas: canvas.value!, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(w, h)
    renderer.outputColorSpace = SRGBColorSpace
    renderer.toneMapping = ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2

    scene = new Scene()
    camera = new PerspectiveCamera(60, w / h, 0.1, 100)
    camera.position.set(0, 0.6, 3.2)
    scene.add(camera)

    const hemi = new HemisphereLight(0xffffff, 0x222244, 0.6)
    scene.add(hemi)
    const dir = new DirectionalLight(0xffffff, 1.0)
    dir.position.set(3, 5, 2)
    scene.add(dir)

    const geo = new BoxGeometry(1, 1, 1)
    torusMaterial = new MeshPhysicalMaterial({
        color: 0x4466ff, metalness: 0.5, roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.2
    })
    torus = new Mesh(geo, torusMaterial)
    scene.add(torus)

    const starCnt = 2000
    const pGeo = new BufferGeometry()
    const positions = new Float32Array(starCnt * 3)
    for (let i = 0; i < starCnt; i++) {
        const r = 8 * Math.cbrt(Math.random()) + 1.5
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta)
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
        positions[i * 3 + 2] = r * Math.cos(phi)
    }
    pGeo.setAttribute('position', new Float32BufferAttribute(positions, 3))
    const pMat = new PointsMaterial({ size: 0.01, transparent: true, opacity: 0.85 })
    particles = new Points(pGeo, pMat)
    scene.add(particles)

    composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    composer.addPass(new UnrealBloomPass(new Vector2(w, h), 1.2, 0.9, 0.25))

    gsap.to(camera.position, { scrollTrigger: { trigger: '#section2', start: 'top center', end: 'bottom center', scrub: true }, z: 1.5, y: 0.2 })
    gsap.to(camera.position, { scrollTrigger: { trigger: '#section3', start: 'top center', end: 'bottom center', scrub: true }, z: 4, y: 1 })

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
    const parallaxX = pointer.x * 0.4
    const parallaxY = pointer.y * 0.2
    camera.position.x += (parallaxX - camera.position.x) * 0.04
    camera.position.y += (parallaxY * 0.6 - camera.position.y) * 0.04
    camera.lookAt(0, 0, 0)

    if (t - lastBurst > nextBurst) {
        burst.x = (Math.random() - 0.5) * 2
        burst.y = (Math.random() - 0.5) * 2
        burst.z = (Math.random() - 0.5) * 1
        lastBurst = t
        nextBurst = 3 + Math.random() * 4
    }

    const baseX = Math.sin(t * 0.6) * 0.4
    const baseY = Math.cos(t * 0.4) * 0.6
    const baseZ = Math.sin(t * 0.3) * 0.2
    burst.x *= 0.95; burst.y *= 0.95; burst.z *= 0.95
    torus.rotation.x += ((baseX + burst.x) - torus.rotation.x) * 0.05
    torus.rotation.y += ((baseY + burst.y) - torus.rotation.y) * 0.05
    torus.rotation.z += ((baseZ + burst.z) - torus.rotation.z) * 0.05
    torus.position.y = Math.sin(t * 1.2) * 0.2
    const s = 1 + Math.sin(t * 1.6) * 0.03
    torus.scale.setScalar(s)

    torusMaterial.color.setHSL((t * 0.05) % 1, 0.7, 0.55)
    particles.rotation.y += 0.0008
    particles.rotation.x += 0.0002

    composer.render()
    animationId = requestAnimationFrame(animate)
}

onMounted(() => { init(); animate() })
onBeforeUnmount(() => {
    cancelAnimationFrame(animationId)
    window.removeEventListener('resize', onResize)
    window.removeEventListener('pointermove', onPointerMove)
    composer?.dispose()
    renderer?.dispose()
    torus?.geometry.dispose()
    particles?.geometry.dispose()
})
</script>

<style scoped>
canvas {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    z-index: -1;
}
</style>
