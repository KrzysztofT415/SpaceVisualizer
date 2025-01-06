export class ParticleSpace {
    constructor(width, height, qt) {
        this.width = width
        this.height = height
        this.qt = qt
        this.points = []
    }

    addParticles = (...particles) => {
        this.points.push(...particles)
        for (const particle of particles) this.qt.space.insert(particle.x, particle.y, particle)
    }

    update = () => {
        this.qt.space.update()
    }

    render = (ctx, params) => {
        this.qt.space.render(ctx, { ...this.qt.getParams(), showPoints: false })

        if (params.showPoints) this.renderPoints()
    }

    renderPoints = () => this.points.forEach((p) => p.draw({ c: window.colors().PL }))

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
