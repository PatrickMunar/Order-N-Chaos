import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Scrollbar from 'smooth-scrollbar'
import gsap from 'gsap'

// Clear Scroll Memory
window.history.scrollRestoration = 'manual'

// Scroll Triggers
gsap.registerPlugin(ScrollTrigger)

// 3rd party library setup:
const bodyScrollBar = Scrollbar.init(document.querySelector('#bodyScrollbar'), { damping: 0.1, delegateTo: document })

let scrollY = 0

// Tell ScrollTrigger to use these proxy getter/setter methods for the "body" element: 
ScrollTrigger.scrollerProxy('#bodyScrollbar', {
  scrollTop(value) {
    if (arguments.length) {
      bodyScrollBar.scrollTop = value; // setter
    }
    return bodyScrollBar.scrollTop    // getter
  },
  getBoundingClientRect() {
    return {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight}
  }
})

// when the smooth scroller updates, tell ScrollTrigger to update() too: 
bodyScrollBar.addListener(ScrollTrigger.update);

// -----------------------------------------------------------------
/**
 * Base
 */

// Canvas
const canvas = document.querySelector('.webgl')

// Fix Position
bodyScrollBar.addListener(({ offset }) => {  
    canvas.style.top = offset.y + 'px'
})

// Scene
const scene = new THREE.Scene()
// scene.background = new THREE.Color(0xF8F0E3)

// Loading Manager
const loadingBar = document.getElementById('loadingBar')
const loadingPage = document.getElementById('loadingPage')

const loadingManager = new THREE.LoadingManager(
    // Loaded
    () => {
       
    },
    // Progress
    (itemUrl, itemsLoaded, itemsTotal) => {

    }
)

// Texture loader
const textureLoader = new THREE.TextureLoader()
const images = []

// GLTF loader
const gltfLoader = new GLTFLoader(loadingManager)

// Lighting

const ambientLight = new THREE.AmbientLight(0xaa00ff, 0.1)
scene.add(ambientLight)

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {    
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // location.reload();
})

// Objects
// ------------------------------

// Particles
// Parameters
const parameters = {
    count: 5000,
    size: 0.025,
    aspect: window.innerWidth/window.innerHeight,
    radius: 0.1,
    groupDiameter: 3
}

// Initializations
const particleGroup = []
const originalPositions = []

// Make Particles
for (let i = 0; i < parameters.count; i++) {
    // Center Particles
    const vertices = []
    vertices.push(0,0,0)

    const particleG = new THREE.BufferGeometry()
    particleG.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))

    const particleM = new THREE.PointsMaterial({
        color: 0x000000,
        size: parameters.size,
        depthWrite: true,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        transparent: true
    })
    
    const particles = new THREE.Points(particleG, particleM)

    // Randomize Particle Position in a Circle
    const x = (Math.random() - 0.5) * parameters.groupDiameter
    const y = (Math.random() - 0.5) * 2 * ((parameters.groupDiameter/2)**2 - x**2)**0.5
    const z = 0

    // Save Original Positions
    originalPositions[i] = [x,y]

    particleGroup.push(particles)
    particleGroup[i].position.set(x,y,z)
    scene.add(particles)
}

// ------------------------------

// Mouse Events
// const mouse = {
//     x: 0,
//     y: 0,
//     vx: 0,
//     vy: 0,
//     prevX: 0,
//     prevY: 0
// }

// window.addEventListener('mousemove', (e) => {
//     mouse.x = e.clientX/window.innerWidth
//     mouse.y = e.clientY/window.innerHeight
    
//     mouse.vx = mouse.x - mouse.prevX
//     mouse.vy = mouse.y - mouse.prevY

//     mouse.prevX = mouse.x
//     mouse.prevY = mouse.y
// })

// Camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0,0,5)
scene.add(camera)

// Parallax Camera Group
const cameraGroup = new THREE.Group
cameraGroup.add(camera)
scene.add(cameraGroup)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enabled = false

controls.enableDamping = true
controls.maxPolarAngle = Math.PI/2
// controls.minAzimuthAngle = Math.PI*0/180
// controls.maxAzimuthAngle = Math.PI*90/180
controls.minDistance = 12  
controls.maxDistance = 80

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.CineonToneMapping

// Site Options
let isOrder = true

// Initializations
gsap.to('.sideBar', {duration: 0, opacity: 0})
gsap.to('.sideBar', {duration: 1, delay: 1.5, opacity: 1})
gsap.to('.C', {duration: 0, y: -23, rotationZ: -45, x: 60})

// Click Events
document.querySelector('.mainCircle').addEventListener('click', () => {
    // Press Animations
    gsap.to('.mainCircle', {duration: 0.125, scale: 0.9})
    gsap.to('.mainCircle', {duration: 0.125, delay: 0.125, scale: 1})
    // Case: C
    if (isOrder == true) {
        isOrder = false
        gsap.to('.C', {duration: 0.25, x: 15, ease: 'power1.easeIn'})
    }
    // Case: O
    else {
        isOrder = true
        gsap.to('.C', {duration: 0.25, x: 60, ease: 'power1.easeIn'})
    }
})

// Raycaster Events
const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector3()
const point = new THREE.Vector3()

window.addEventListener('pointermove', (e) => {
    // Update Pointer Coordinates
    pointer.set(
    ( e.clientX / window.innerWidth ) * 2 - 1,
    - ( e.clientY / window.innerHeight ) * 2 + 1,
    0.5
    )

    // Match Mouse and 3D Pointer Coordinates
    pointer.unproject(camera)
    pointer.sub(camera.position).normalize()
    let distance = -(camera.position.z) / pointer.z
    point.copy(camera.position).add((pointer.multiplyScalar(distance)))

    // Check for Affected Particles
    for (let i = 0; i < particleGroup.length; i++) {
        const distanceFromPointerSquared = (particleGroup[i].position.x - pointer.x)**2 + (particleGroup[i].position.y - pointer.y)**2
        const directionVector = new THREE.Vector2(particleGroup[i].position.x - pointer.x, particleGroup[i].position.y - pointer.y)

        // Case: Affected
        if (distanceFromPointerSquared < parameters.radius) {
            // Spread
            gsap.to(particleGroup[i].position, {duration: 0.1, x: particleGroup[i].position.x + directionVector.x * 0.5, y: particleGroup[i].position.y + directionVector.y * 0.5})

            // Size Change
            gsap.to(particleGroup[i].material, {duration: 0.1, size: 0.05})
            gsap.to(particleGroup[i].material, {duration: 1, delay: 0.1, size: parameters.size})


            if (isOrder == true) {
                gsap.to(particleGroup[i].position, {duration: 1, delay: 0.1, x: originalPositions[i][0], y: originalPositions[i][1]})
            }
        }
    } 

})

// Animate
const clock = new THREE.Clock()
let prevTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - prevTime
    prevTime = elapsedTime

    // Camera Rotation
    camera.rotation.z = elapsedTime * 0.05

    // Update controls
    if (controls.enabled == true) {
        controls.update()
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()