import VoronoiFortune from './libs/algorithms/voronoi_fortune.js'
import VoronoiClassic from './libs/algorithms/voronoi.js'
import { xyToRgb } from './libs/utils.js'

export class VoronoiSpace {
    constructor(width, height, type = 'fortune') {
        this.width = width
        this.height = height
        this.colors = []
        switch (type) {
            case 'normal':
                this.diagram = new VoronoiClassic(width, height)
                break
            default:
            case 'fortune':
                this.diagram = new VoronoiFortune(width, height)
                break
        }
    }

    addParticle = (p) => this.diagram.sites.push(p)

    runVoronoi = () => {
        if (this.colors.length != this.diagram.sites.length) {
            this.colors = this.diagram.sites.map((p) => xyToRgb(p.x, p.y, this.width, this.height))
            this.diagram.colors = this.colors
        }
        this.diagram.calculateVoronoi(this.getNeighbours)
    }
    update = () => this.runVoronoi()

    render = (ctx, params) => {
        if (this.diagram.sites.length == 0) return
        if (this.diagram.voronoi.length == 0) this.runVoronoi()

        if (this.diagram.rendersImage) {
            this.diagram.distance_type = params.distance
            this.diagram.degree = params.degree
            this.renderWholeImage(ctx)
            if (params.showPoints) this.renderPoints()
            return
        }

        if (params.visuals) this.renderCells(ctx, params.radius)
        if (params.showBorders) this.renderBorders(ctx)
        if (params.showPoints) this.renderPoints()
        if (params.showCrosspoints) this.renderCrosspoints()

        // let tmp = this.diagram.voronoi.sort((a, b) => (a.center.y < b.center.y ? -1 : a.center.y > b.center.y ? 1 : a.center.x < b.center.x ? -1 : a.center.x > b.center.x ? 1 : 0))
        // console.log(tmp[0])
        // this.highlightCell(ctx, tmp[0], 'yellow')
    }

    renderWholeImage = (ctx) => {
        if (this.diagram.voronoi.length == 0) this.runVoronoi()
        const imageData = ctx.createImageData(this.width, this.height)
        imageData.data.set(this.diagram.voronoi)
        ctx.putImageData(imageData, 0, 0)
    }

    renderCells = (ctx, radius) => {
        ctx.strokeStyle = 'black'
        this.diagram.voronoi.forEach((cell) => {
            const gradient = ctx.createRadialGradient(cell.center.x, cell.center.y, 0, cell.center.x, cell.center.y, radius)
            gradient.addColorStop(0, window.colors().WD)
            gradient.addColorStop(1, window.colors().DD)
            ctx.fillStyle = gradient
            ctx.beginPath()
            cell.borders.forEach((point, index) => {
                if (index === 0) ctx.moveTo(point[0], point[1])
                else ctx.lineTo(point[0], point[1])
            })
            ctx.closePath()
            ctx.fill()
        })
    }

    highlightCell = (ctx, cell, c) => {
        ctx.strokeStyle = c
        ctx.beginPath()
        cell.borders.forEach((point, index) => {
            if (index === 0) ctx.moveTo(point[0], point[1])
            else ctx.lineTo(point[0], point[1])
        })
        ctx.closePath()
        ctx.stroke()
    }

    renderBorders = (ctx) => {
        ctx.strokeStyle = window.colors().DD
        this.diagram.voronoi.forEach((cell) => {
            ctx.beginPath()
            cell.borders.forEach((point, index) => {
                if (index === 0) ctx.moveTo(point[0], point[1])
                else ctx.lineTo(point[0], point[1])
            })
            ctx.closePath()
            ctx.stroke()
        })
    }

    renderPoints = () => this.diagram.sites.forEach((p) => window.drawCircle(p.x, p.y, 2, window.colors().PL))

    renderCrosspoints = () => this.diagram.voronoi.forEach((cell) => cell.borders.forEach((point) => window.drawCircle(point[0], point[1], 2, window.colors().PD)))

    attachedClick = (e) => {
        const r = canvas.getBoundingClientRect()
        window.addParticle(e.clientX - r.left, e.clientY - r.top)
        window.refresh()
    }

    attach = (canvas) => {
        canvas.addEventListener('mousedown', this.attachedClick)
    }

    detach = (canvas) => {
        canvas.removeEventListener('mousedown', this.attachedClick)
    }
}
