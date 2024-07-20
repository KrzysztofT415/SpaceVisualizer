import { VoronoiDiagram } from './libs/voronoi_fortune.js'

export class VoronoiSpace extends VoronoiDiagram {
    addParticle = (p) => this.sites.push(p)

    renderBorders = (ctx) => {
        ctx.strokeStyle = 'black'
        this.voronoi.forEach((cell) => {
            ctx.beginPath()
            cell.forEach((point, index) => {
                if (index === 0) ctx.moveTo(point[0], point[1])
                else ctx.lineTo(point[0], point[1])
            })
            ctx.closePath()
            ctx.stroke()
        })
    }

    renderCells = (ctx) => {
        ctx.strokeStyle = 'black'
        this.voronoi.forEach((cell, index) => {
            const center = this.sites[index]
            const gradient = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, 70)
            gradient.addColorStop(0, 'black')
            gradient.addColorStop(1, '#373b42')
            ctx.fillStyle = gradient
            ctx.beginPath()
            cell.forEach((point, index) => {
                if (index === 0) ctx.moveTo(point[0], point[1])
                else ctx.lineTo(point[0], point[1])
            })
            ctx.closePath()
            ctx.fill()
        })
    }

    renderArea = (ctx) => {
        if (!this.imageData) return
        const imageData = ctx.createImageData(this.width, this.height)
        imageData.data.set(this.imageData)
        ctx.putImageData(imageData, 0, 0)
    }

    renderPoints = () => this.sites.forEach((p) => window.drawCircle(p.x, p.y, 2, 'red'))
    renderCrossroads = () => this.voronoi.forEach((cell) => cell.forEach((point) => window.drawCircle(point[0], point[1], 2, 'blue')))

    highlight = (ctx, n, c) => {
        ctx.strokeStyle = c
        ctx.beginPath()
        this.voronoi[n].forEach((point, index) => {
            if (index === 0) ctx.moveTo(point[0], point[1])
            else ctx.lineTo(point[0], point[1])
        })
        ctx.closePath()
        ctx.stroke()
    }

    update = () => {
        for (const p of [...this.sites]) p.update()
        this.calculateVoronoi()
    }

    render = (ctx, params) => {
        this.params = params
        if (this.voronoi.length == 0) this.calculateVoronoi()

        if (this.isPlane) this.renderArea(ctx)
        else if (this.params.visuals) this.renderCells(ctx)
        if (params.showBorders) this.renderBorders(ctx)
        if (params.showPoints) this.renderPoints() || this.renderCrossroads()
    }

    attach(canvas) {
        canvas.addEventListener('mousedown', (e) => {
            window.stop()
            const r = canvas.getBoundingClientRect()
            const p = window.makeRandomParticle(e.clientX - r.left, e.clientY - r.top)
            this.sites.push(p)
            window.resume(false)
        })
    }
}
