import { QuadTree } from './libs/data_structures/quadtree.js'

export class QuadTreeSpace extends QuadTree {
    addParticle = (particle) => this.insert(particle.x, particle.y, particle)

    update = () => {
        for (const point of this.getData()) {
            point.x = point.data_stored.x
            point.y = point.data_stored.y
            if (!point.owner.contains(point)) {
                point.owner.remove(point)
                this.root.insert(point)
            }
        }
    }

    render = (ctx, params) => {
        if (params.showBorders) this.renderBorders(ctx)
        if (params.showCounters) this.renderCounters(ctx)
        if (params.showPoints) this.renderPoints()
        if (params.showCrosspoints) this.renderCrosspoints()
    }

    renderBorders(ctx) {
        ctx.strokeStyle = window.colors().DD
        for (const c of this.getNodes()) ctx.strokeRect(...c.boundary)
    }

    renderCounters(ctx) {
        ctx.fillStyle = window.colors().WD
        ctx.font = '16px Arial'
        for (const c of this.getNodes()) {
            if (c.isLeaf()) {
                let [x, y, _, h] = [...c.boundary]
                ctx.fillText(`${c.data_stored.length}`, x + 2, y + h - 2)
            }
        }
    }

    renderPoints = () => this.getData().forEach((p) => window.drawCircle(p.x, p.y, 2, window.colors().PL))

    renderCrosspoints = () => {
        for (const c of this.getNodes()) {
            let [x, y, w, h] = [...c.boundary]
            window.drawCircle(x, y, 2, window.colors().PD)
            window.drawCircle(x + w, y, 2, window.colors().PD)
            window.drawCircle(x, y + h, 2, window.colors().PD)
            window.drawCircle(x + w, y + h, 2, window.colors().PD)
        }
    }

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
