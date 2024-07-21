import { Rectangle } from './src/libs/data_types/rectangle.js'
import { Particle } from './src/libs/data_types/particle.js'
import { prng } from './src/libs/utils.js'

import { VoronoiSpace } from './src/voronoi.js'
import { SimplexSpace } from './src/simplex.js'
import { QuadTreeSpace } from './src/quad.js'
import { LineSpace } from './src/lines.js'

const CANVAS = document.getElementById('canvas')
const CTX = CANVAS.getContext('2d')

let SEED
window.reseed = () => {
    window.prng = prng('' + Date.now())
    window.random = window.prng.randDouble
    SEED = window.prng.randInt()
}
window.reseed()

let TYPE = 'lines'
let VORONOI_TYPE = 'euclidean'
let ANIMATION, CURRENT
let WIDTH, HEIGHT
let POINTS = []

window.restart = (restartPoints = true, appendPoints = true) => {
    window.stop()
    ;[WIDTH, HEIGHT] = [CANVAS.parentElement.clientWidth, CANVAS.parentElement.clientHeight]
    CANVAS.width = WIDTH
    CANVAS.height = HEIGHT
    window.boundary = new Rectangle(0, 0, WIDTH, HEIGHT)
    if (restartPoints) POINTS = []
    if (appendPoints) for (let i = 0; i < getValue('points_num'); i++) POINTS.push(window.makeRandomParticle())
    const children = document.getElementById('panel').children
    for (let i = 0; i < children.length; i++) if (!children[i].classList.contains('stay')) children[i].classList.add('off')
    window.switchMode(TYPE)
}

window.animation_loop = (nextFrame = true) => {
    CTX.clearRect(0, 0, WIDTH, HEIGHT)
    CURRENT.space.render(CTX, CURRENT.getParams())
    if (nextFrame) CURRENT.space.update()
    if (getCheck('animate')) {
        cancelAnimationFrame(ANIMATION)
        ANIMATION = requestAnimationFrame(window.animation_loop)
    }
}
window.stop = () => cancelAnimationFrame(ANIMATION)
window.resume = (nextFrame = true) => window.stop() || window.animation_loop(nextFrame)
window.refresh = () => window.resume(false)

const init = (type) => {
    switch (type) {
        case 'simplex':
            return initSimplex()
        case 'quad':
            return initQuadTree()
        case 'lines':
            return initLines()
        case 'voronoi':
        default:
            return initVoronoi()
    }
}

window.switchMode = (type) => {
    document.getElementById('voronoi_smooth').style.display = 'none'
    if (CURRENT) CURRENT.space.detach(CANVAS)
    document.getElementById(TYPE).classList.remove('highlight')
    document.querySelectorAll('.' + TYPE).forEach((c) => c.classList.add('off'))

    TYPE = type
    CURRENT = init(type)

    CURRENT.space.attach(CANVAS)
    document.getElementById(TYPE).classList.add('highlight')
    document.querySelectorAll('.' + TYPE).forEach((c) => c.classList.remove('off'))
    if (TYPE == 'voronoi') window.selectVoronoiType(VORONOI_TYPE)
    for (const p of POINTS) CURRENT.space.addParticle(p)
    window.refresh()
}

window.selectVoronoiType = (type) => {
    // TODO: fix typing?
    VORONOI_TYPE = type
    window.stop()
    document.getElementById('voronoi_smooth').style.display = 'none'
    document.getElementById('voronoi_type').innerText = type
    if (type == 'smooth') document.getElementById('voronoi_smooth').style.display = 'flex'
    window.resume()
}

window.drawCircle = (x, y, r, color) => {
    CTX.beginPath()
    CTX.arc(x, y, r, 0, 2 * Math.PI)
    CTX.fillStyle = color
    CTX.fill()
}

window.makeRandomParticle = (
    x = window.random() * WIDTH,
    y = window.random() * HEIGHT,
    v = {
        x: (window.random() - 0.5) * 2,
        y: (window.random() - 0.5) * 2,
    }
) => new Particle(x, y, v, window.boundary)

window.onresize = window.restart
window.onload = window.restart
//

const getValue = (name) => {
    let v = document.getElementById(name).value
    if (!v) return document.getElementById(name).placeholder
    return v
}
const getCheck = (name) => document.getElementById(name).checked
//

const initVoronoi = () => {
    document.getElementById('animate').checked = true
    return {
        space: new VoronoiSpace(WIDTH, HEIGHT),
        getParams: () => {
            return {
                showPoints: getCheck('points_show'), //
                showBorders: getCheck('borders'),
                // biomes: getValue('voronoi_biomes'),
                visuals: getCheck('voronoi_visuals'),
                type: document.getElementById('voronoi_type').innerText,
                degree: getValue('voronoi_smooth_degree'),
            }
        },
    }
}

const initSimplex = () => {
    document.getElementById('animate').checked = false
    return {
        space: new SimplexSpace(WIDTH, HEIGHT, SEED),
        getParams: () => {
            return {
                scale: getValue('simplex_scale'), //
                factor: getValue('simplex_factor'),
                octaves: getValue('simplex_octaves'),
                persistance: getValue('simplex_persistance'),
                lacunarity: getValue('simplex_lacunarity'),
                makeBiomes: getCheck('simplex_make_biomes'),
            }
        },
    }
}

const initQuadTree = () => {
    document.getElementById('animate').checked = true
    return {
        space: new QuadTreeSpace(0, 0, WIDTH, HEIGHT, getValue('quad_capacity')),
        getParams: () => {
            return {
                showPoints: getCheck('points_show'), //
                showBorders: getCheck('borders'),
                showCounters: getCheck('quad_counters'),
            }
        },
    }
}

const initLines = () => {
    document.getElementById('animate').checked = false
    return {
        space: new LineSpace(WIDTH, HEIGHT),
        getParams: () => {
            return {
                type: document.getElementById('lines_type').innerText, //
            }
        },
    }
}
