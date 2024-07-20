import { QuadTree } from './libs/quadtree.js'

export class QuadTreeSpace extends QuadTree {
    addParticle = (particle) => this.insert(particle.x, particle.y, particle)

    renderPoints = () => this.getData().forEach((p) => window.drawCircle(p.x, p.y, 2, 'red'))

    renderBorders(ctx) {
        ctx.strokeStyle = 'black'
        for (const c of this.getNodes()) {
            let [x, y, w, h] = [...c.boundary]
            ctx.strokeRect(x, y, w, h)
            window.drawCircle(x, y, 2, 'blue')
            window.drawCircle(x + w, y, 2, 'blue')
            window.drawCircle(x, y + h, 2, 'blue')
            window.drawCircle(x + w, y + h, 2, 'blue')
        }
    }

    renderCounters(ctx) {
        ctx.fillStyle = 'white'
        ctx.font = '16px Arial'
        for (const c of this.getNodes()) {
            if (c.isLeaf()) {
                let [x, y, _, h] = [...c.boundary]
                ctx.fillText(`${c.data_stored.length}`, x + 2, y + h - 2)
            }
        }
    }

    update = () => {
        for (const point of this.getData()) {
            point.data_stored.update()
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
    }

    attach(canvas) {
        canvas.addEventListener('mousedown', (e) => {
            window.stop()
            const r = canvas.getBoundingClientRect()
            this.addParticle(window.makeRandomParticle(e.clientX - r.left, e.clientY - r.top))
            window.resume(false)
        })
    }
}
