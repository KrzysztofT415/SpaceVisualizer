export class CombinedSpace {
    constructor(...sub_modules) {
        this.sub_modules = sub_modules
    }

    addParticle = (particle) => this.sub_modules.forEach((module) => module.space.addParticle(particle))

    update = () => this.sub_modules.forEach((module) => module.space.update())

    render = (ctx, params) => this.sub_modules.forEach((module) => module.space.render(ctx, module.getParams()))

    attachedClick = (e) => {
        window.stop()
        const r = canvas.getBoundingClientRect()
        window.addParticle(e.clientX - r.left, e.clientY - r.top)
        window.resume(false)
    }

    attach = (canvas) => {
        canvas.addEventListener('mousedown', this.attachedClick)
    }

    detach = (canvas) => {
        canvas.removeEventListener('mousedown', this.attachedClick)
    }
}
