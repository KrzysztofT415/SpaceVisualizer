import { Rectangle } from './src/libs/data_types/rectangle.js'
import { Particle } from './src/libs/data_types/particle.js'
import { prng } from './src/libs/utils.js'

import { SimplexSpace } from './src/simplex.js'
import { VoronoiSpace } from './src/voronoi.js'
import { QuadTreeSpace } from './src/quad.js'
import { CombinedSpace } from './src/combined.js'
import { LineSpace } from './src/lines.js'

window.colors = () => ({
    SLE: getComputedStyle(document.documentElement).getPropertyValue('--secondaryLE'),
    SL: getComputedStyle(document.documentElement).getPropertyValue('--secondaryL'),
    SM: getComputedStyle(document.documentElement).getPropertyValue('--secondaryM'),
    SD: getComputedStyle(document.documentElement).getPropertyValue('--secondaryD'),
    PL: getComputedStyle(document.documentElement).getPropertyValue('--primaryL'),
    PM: getComputedStyle(document.documentElement).getPropertyValue('--primaryM'),
    PD: getComputedStyle(document.documentElement).getPropertyValue('--primaryD'),
    WL: getComputedStyle(document.documentElement).getPropertyValue('--whiteL'),
    WD: getComputedStyle(document.documentElement).getPropertyValue('--whiteD'),
    DL: getComputedStyle(document.documentElement).getPropertyValue('--darkL'),
    DM: getComputedStyle(document.documentElement).getPropertyValue('--darkM'),
    DD: getComputedStyle(document.documentElement).getPropertyValue('--darkD'),
    GREEN: getComputedStyle(document.documentElement).getPropertyValue('--green'),
    RED: getComputedStyle(document.documentElement).getPropertyValue('--red'),
    BROWN: getComputedStyle(document.documentElement).getPropertyValue('--brown'),
})

const CANVAS = document.getElementById('canvas')
const CTX = CANVAS.getContext('2d')

let SEED
window.reseed = () => {
    window.prng = prng('' + Date.now())
    window.random = window.prng.randDouble
    SEED = window.prng.randInt()
}
window.reseed()

let TYPE = 'simplex'
let VORONOI_TYPE = 'manhattan'
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
    window.hidePanel()
    window.switchMode(TYPE)
}

window.animation_loop = (nextFrame = true) => {
    CTX.reset()
    CURRENT.space.render(CTX, CURRENT.getParams())
    if (nextFrame) {
        for (const p of POINTS) p.update()
        CURRENT.space.update()
    }
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
        case 'combined':
            return initCombined()
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
    document.getElementById('voronoi_distance').innerText = type
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

window.addParticle = (...args) => {
    const p = window.makeRandomParticle(...args)
    CURRENT.space.addParticle(p)
    POINTS.push(p)
}

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

const initVoronoi = () => {
    const is_normal = document.getElementById('voronoi_type').innerText == 'normal'
    document.getElementById('animate').checked = !is_normal
    document.getElementById('animate').disabled = is_normal
    return {
        space: new VoronoiSpace(WIDTH, HEIGHT, document.getElementById('voronoi_type').innerText),
        getParams: () => {
            return {
                distance: document.getElementById('voronoi_distance').innerText,
                showPoints: getCheck('points_show'), //
                showCrosspoints: getCheck('voronoi_crosspoints'), //
                showBorders: getCheck('voronoi_borders'),
                radius: parseInt(getValue('voronoi_radius')),
                adaptive: getCheck('voronoi_adaptive'),
                visuals: getCheck('voronoi_visuals'),
                degree: getValue('voronoi_smooth_degree'),
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
                showCrosspoints: getCheck('quad_crosspoints'), //
                showBorders: getCheck('quad_borders'),
                showCounters: getCheck('quad_counters'),
            }
        },
    }
}

const initCombined = () => {
    const qt = initQuadTree()
    const voronoi = initVoronoi()
    voronoi.space.getNeighbours = (x, y) => {
        const cell = qt.space.find(x, y)
        const [xb, yb, w, h] = [...cell.boundary]
        const search_area = new Rectangle(Math.max(0, xb - w), Math.max(0, yb - h), Math.min(WIDTH, xb + 2 * w), Math.min(HEIGHT, yb + 2 * h))
        return qt.space.query(search_area)
    }
    const space = new CombinedSpace(voronoi, qt)
    return {
        space,
        getParams: () => {
            return space.sub_modules.map((module) => module.getParams()).reduce((a, b) => ({ ...a, ...b }), {})
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
