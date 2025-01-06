import { QuadTree } from './libs/data_structures/quadtree.js'

export class QuadTreeSpace extends QuadTree {
    addParticles = (...particles) => {
        for (const particle of particles) this.insert(particle.x, particle.y, particle)
    }

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
        if (params.capacity != this.root.capacity) this.changeCapacity(params.capacity)

        if (params.showBorders) this.renderBorders(ctx)
        if (params.showCounters) this.renderCounters(ctx)
        if (params.showPoints) this.renderPoints()
        if (params.showCrosspoints) this.renderCrosspoints()
    }

    renderBorders(ctx) {
        ctx.strokeStyle = window.colors().DD
        for (const node of this.getNodes()) ctx.strokeRect(...node.boundary)
    }

    renderCounters(ctx) {
        ctx.fillStyle = window.colors().WD
        ctx.font = '16px Arial'
        for (const node of this.getNodes()) {
            if (node.isLeaf()) {
                let [x, y, _, h] = [...node.boundary]
                ctx.fillText(`${node.data_stored.length}`, x + 2, y + h - 2)
            }
        }
    }

    renderPoints = () => this.getData().forEach((p) => p.data_stored.draw({ c: window.colors().PL }))

    renderCrosspoints = () => {
        for (const node of this.getNodes()) {
            let [x, y, w, h] = [...node.boundary]
            window.drawCircle(x, y, 2, window.colors().PD)
            window.drawCircle(x + w, y, 2, window.colors().PD)
            window.drawCircle(x, y + h, 2, window.colors().PD)
            window.drawCircle(x + w, y + h, 2, window.colors().PD)
        }
    }

    attachedClick = (e) => {
        const r = canvas.getBoundingClientRect()
        window.addParticle({ x: e.clientX - r.left, y: e.clientY - r.top })
        window.refresh()
    }

    attach = (canvas) => {
        canvas.addEventListener('mousedown', this.attachedClick)
    }

    detach = (canvas) => {
        canvas.removeEventListener('mousedown', this.attachedClick)
    }
}
