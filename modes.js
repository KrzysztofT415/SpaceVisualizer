import { Rectangle } from './src/libs/data_types/rectangle.js'
import { SimplexSpace } from './src/simplex.js'
import { VoronoiSpace } from './src/voronoi.js'
import { QuadTreeSpace } from './src/quad.js'
import { CombinedSpace } from './src/combined.js'
import { LineSpace } from './src/lines.js'
import { ParticleSpace } from './src/simulation.js'

export const initSimplex = (width, height) => {
    document.getElementById('animate').checked = false
    return {
        space: new SimplexSpace(width, height, window.SEED),
        getParams: () => {
            return {
                scale: window.getValue('simplex_scale'),
                factor: window.getValue('simplex_factor'),
                octaves: window.getValue('simplex_octaves'),
                persistance: window.getValue('simplex_persistance'),
                lacunarity: window.getValue('simplex_lacunarity'),
                makeBiomes: window.getCheck('simplex_make_biomes'),
            }
        },
        restart: () => {},
    }
}

export const initVoronoi = (width, height) => {
    if (document.getElementById('points_current').value == 0) document.getElementById('points_num').value = 100
    const is_normal = document.getElementById('voronoi_type').innerText == 'normal'
    document.getElementById('animate').checked = !is_normal
    document.getElementById('animate').disabled = is_normal
    return {
        space: new VoronoiSpace(width, height, document.getElementById('voronoi_type').innerText),
        getParams: () => {
            return {
                distance: document.getElementById('voronoi_distance').innerText,
                showPoints: window.getCheck('points_show'),
                showCrosspoints: window.getCheck('voronoi_crosspoints'),
                showBorders: window.getCheck('voronoi_borders'),
                radius: parseInt(window.getValue('voronoi_radius')),
                colored: window.getCheck('voronoi_colored'),
                adaptive: window.getCheck('voronoi_adaptive'),
                visuals: window.getCheck('voronoi_visuals'),
                degree: window.getValue('voronoi_smooth_degree'),
            }
        },
        restart: () => {},
    }
}

export const initQuadTree = (width, height) => {
    if (document.getElementById('points_current').value == 0) document.getElementById('points_num').value = 100
    document.getElementById('animate').checked = true
    return {
        space: new QuadTreeSpace(0, 0, width, height, window.getValue('quad_capacity')),
        getParams: () => {
            return {
                showPoints: window.getCheck('points_show'),
                showCrosspoints: window.getCheck('quad_crosspoints'),
                showBorders: window.getCheck('quad_borders'),
                showCounters: window.getCheck('quad_counters'),
                capacity: window.getValue('quad_capacity'),
            }
        },
        restart: () => {},
    }
}

export const initCombined = (width, height) => {
    const qt = initQuadTree(width, height)
    const voronoi = initVoronoi(width, height)
    voronoi.space.getNeighbours = (x, y) => {
        const cell = qt.space.find(x, y)
        const [xb, yb, w, h] = [...cell.boundary]
        const search_area = new Rectangle(Math.max(0, xb - w), Math.max(0, yb - h), Math.min(width, xb + 2 * w), Math.min(height, yb + 2 * h))
        return qt.space.query(search_area)
    }
    const space = new CombinedSpace(voronoi, qt)
    return {
        space,
        getParams: () => {
            return {
                showPoints: window.getCheck('points_show'),
                qt: qt.getParams(),
                voronoi: voronoi.getParams(),
            }
        },
        restart: () => {},
    }
}

export const initLines = (width, height) => {
    document.getElementById('points_num').value = 0
    document.getElementById('points_current').value = 0
    document.getElementById('animate').checked = false
    if (!window.lineSpace) window.lineSpace = new LineSpace(width, height)
    return {
        space: window.lineSpace,
        getParams: () => {
            return {
                type: document.getElementById('lines_type').innerText,
            }
        },
        restart: () => (window.lineSpace = new LineSpace(width, height)),
    }
}

export const initParticleSimulation = (width, height) => {
    const qt = initQuadTree(width, height)
    if (document.getElementById('points_current').value == 0) document.getElementById('points_num').value = 100
    document.getElementById('animate').checked = true
    return {
        space: new ParticleSpace(width, height, qt),
        getParams: () => {
            return {
                showPoints: window.getCheck('points_show'),
            }
        },
        restart: () => {},
    }
}
