import { Rectangle } from './src/libs/data_types/rectangle.js'
import { Particle } from './src/libs/data_types/particle.js'
import { lerp, prng } from './src/libs/utils.js'

import * as modes from './modes.js'

const PANEL = document.getElementById('panel_main')
const CANVAS = document.getElementById('canvas')
const CTX = CANVAS.getContext('2d')

window.getValue = (name) => {
    let v = document.getElementById(name).value
    if (!v) return document.getElementById(name).placeholder
    return v
}
window.getCheck = (name) => document.getElementById(name).checked

window.SEED = 0
window.reseed = () => {
    window.prng = prng('' + Date.now())
    window.random = window.prng.randDouble
    SEED = window.prng.randInt()
}
window.reseed()

let TYPE = 'simulation'
let types = {
    lines_type: 'bezier', // linear, bezier
    voronoi_type: 'fortune', // fortune, normal
    voronoi_distance: 'manhattan', // manhattan, euclidean, smooth
}
for (const type in types) document.getElementById(type).innerText = types[type]

// reseed()restart()switchMode()refresh()appendPoints() used in html

window.CURRENT = null
let POINTS = []

window.WIDTH = 0
window.HEIGHT = 0
window.recalculateBoundary = () => {
    const [w, h] = [CANVAS.parentElement.clientWidth, window.innerHeight - PANEL.clientHeight]
    if (w == window.WIDTH && h == window.HEIGHT) return

    CANVAS.width = window.WIDTH = w
    CANVAS.height = window.HEIGHT = h
    const rectangle = new Rectangle(0, 0, window.WIDTH, window.HEIGHT)
    if (window.boundary) {
        const [x_p, y_p, w_p, h_p] = [...window.boundary]
        const copy = [...POINTS]
        POINTS = []
        copy.forEach((p) => {
            p.x = lerp(p.x, 0, x_p + w_p, 0, window.WIDTH)
            p.y = lerp(p.y, 0, y_p + h_p, 0, window.HEIGHT)
            p.boundary = rectangle
            if (rectangle.contains(p)) POINTS.push(p)
        })
    }
    window.boundary = rectangle
}

window.drawCircle = (x, y, r, color) => {
    CTX.beginPath()
    CTX.arc(x, y, r, 0, 2 * Math.PI)
    CTX.fillStyle = color
    CTX.fill()
}

window.makeRandomParticle = (params = {}) => {
    const x = params.x ?? window.random() * window.WIDTH
    const y = params.y ?? window.random() * window.HEIGHT
    const v = params.v ?? {
        x: (window.random() - 0.5) * 2,
        y: (window.random() - 0.5) * 2,
    }
    const r = params.r ?? 1
    const particle = new Particle(x, y, v, r, window.boundary)
    particle.draw = function (changed = {}) {
        const r_i = changed.r ?? this.r
        const c_i = changed.c ?? window.colors().PL

        if (r_i == 1) {
            CTX.strokeStyle = c_i
            CTX.strokeRect(this.x, this.y, 1, 1)
            return
        }
        window.drawCircle(this.x, this.y, r_i, c_i)
    }
    return particle
}
window.makeRandomParticles = (n) => Array.from({ length: n }, () => window.makeRandomParticle())

window.addParticle = (params) => {
    const p = window.makeRandomParticle(params)
    window.CURRENT.space.addParticles(p)
    POINTS.push(p)
    return p
}
window.addParticles = (n) => {
    const ps = window.makeRandomParticles(n)
    window.CURRENT.space.addParticles(...ps)
    POINTS.push(...ps)
}

//

let ANIMATION_ID
let [lastCountTime, frameCount] = [performance.now(), 0]
window.animation_loop = (currentTime) => {
    CTX.reset()
    window.CURRENT.space.render(CTX, window.CURRENT.getParams())
    document.getElementById('points_current').innerText = POINTS.length

    if (getCheck('animate')) {
        for (const p of POINTS) p.update()
        window.CURRENT.space.update()

        frameCount++
        if (currentTime - lastCountTime >= 1000) {
            document.getElementById('fps').innerText = frameCount
            frameCount = 0
            lastCountTime = currentTime
        }
        ANIMATION_ID = requestAnimationFrame(window.animation_loop)
    } else document.getElementById('fps').innerText = '-'
}

window.refresh = (forceUpdate = false) => {
    if (forceUpdate) {
        for (const p of POINTS) p.update()
        window.CURRENT.space.update()
    }
    cancelAnimationFrame(ANIMATION_ID)
    ANIMATION_ID = requestAnimationFrame(window.animation_loop)
}

//

const init = (type) => {
    switch (type) {
        case 'simplex':
            return modes.initSimplex(window.WIDTH, window.HEIGHT)
        case 'quad':
            return modes.initQuadTree(window.WIDTH, window.HEIGHT)
        case 'combined':
            return modes.initCombined(window.WIDTH, window.HEIGHT)
        case 'lines':
            return modes.initLines(window.WIDTH, window.HEIGHT)
        case 'simulation':
            return modes.initParticleSimulation(window.WIDTH, window.HEIGHT)
        case 'voronoi':
        default:
            return modes.initVoronoi(window.WIDTH, window.HEIGHT)
    }
}

window.appendPoints = () => {
    window.addParticles(getValue('points_num'))
    window.refresh(true)
}

window.restart = () => {
    POINTS = []
    if (CURRENT) window.CURRENT.restart()
    window.switchMode(TYPE)
}

window.switchMode = (type) => {
    window.switchPanel(type)
    TYPE = type
    window.CURRENT = init(type)
    window.CURRENT.space.attach(CANVAS)
    if (POINTS.length > getValue('points_num')) POINTS = []
    window.CURRENT.space.addParticles(...POINTS)
    if (POINTS.length < getValue('points_num')) window.addParticles(getValue('points_num') - POINTS.length)
    window.refresh()
}

window.switchPanel = (type) => {
    window.hidePanel()

    if (window.CURRENT) window.CURRENT.space.detach(CANVAS)
    document.getElementById(TYPE).classList.remove('highlight')
    document.querySelectorAll('.' + TYPE).forEach((c) => c.classList.add('off'))

    document.getElementById(type).classList.add('highlight')
    document.querySelectorAll('.' + type).forEach((c) => c.classList.remove('off'))

    window.recalculateBoundary()
}

window.onresize = () => window.restart(true, true)
window.onload = () => window.restart(true, true)
