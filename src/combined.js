export class CombinedSpace {
    constructor(...sub_modules) {
        this.sub_modules = sub_modules
    }

    addParticles = (...particles) => this.sub_modules.forEach((module) => module.space.addParticles(...particles))

    update = () => this.sub_modules.forEach((module) => module.space.update())

    render = (ctx, params) => this.sub_modules.forEach((module, index) => module.space.render(ctx, { ...module.getParams(), showPoints: params.showPoints && index == this.sub_modules.length - 1 }))

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
