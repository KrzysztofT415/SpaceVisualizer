export class LineSpace {
    constructor() {
        this.points = []
        for (let i = 0; i < 4; i++) this.points.push(window.makeRandomParticle())
        this.start = this.points[0]
        this.anchor1 = this.points[1]
        this.anchor2 = this.points[2]
        this.end = this.points[3]

        this.radius = 10
    }

    addParticle = () => {}

    renderLine = (ctx, a, b, c) => {
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.strokeStyle = c
        ctx.lineWidth = 3
        ctx.stroke()
    }

    renderLinear = (ctx) => {
        this.renderLine(ctx, this.start, this.end, 'white')
    }

    renderBezier = (ctx) => {
        this.renderLine(ctx, this.start, this.anchor1, 'rgba(0, 255, 0, 0.5)')
        this.renderLine(ctx, this.end, this.anchor2, 'rgba(255, 0, 0, 0.5)')
        ctx.beginPath()
        ctx.moveTo(this.start.x, this.start.y)
        ctx.bezierCurveTo(this.anchor1.x, this.anchor1.y, this.anchor2.x, this.anchor2.y, this.end.x, this.end.y)
        ctx.strokeStyle = 'white'
        ctx.lineWidth = 3
        ctx.stroke()
        window.drawCircle(this.anchor1.x, this.anchor1.y, this.radius, 'grey')
        window.drawCircle(this.anchor2.x, this.anchor2.y, this.radius, 'grey')
    }

    update = () => {
        for (const p of [...this.points]) p.update()
    }

    render = (ctx, params) => {
        this.params = params

        if (this.params.type == 'linear') this.renderLinear(ctx)
        else this.renderBezier(ctx)

        window.drawCircle(this.start.x, this.start.y, this.radius, 'red')
        window.drawCircle(this.end.x, this.end.y, this.radius, 'red')
    }

    attachedClick = (e) => {
        const isInsideCircle = (p, x, y) => {
            const dx = p.x - x
            const dy = p.y - y
            return dx * dx + dy * dy <= this.radius * this.radius
        }

        const [mouseX, mouseY] = [e.offsetX, e.offsetY]
        const id = this.points.findIndex((point) => isInsideCircle(point, mouseX, mouseY))
        if (id !== -1) {
            const point = this.points[id]
            const ox = mouseX - point.x
            const oy = mouseY - point.y
            const dr = (e) => {
                point.x = e.offsetX - ox
                point.y = e.offsetY - oy
                window.refresh()
            }
            canvas.addEventListener('mousemove', dr)
            canvas.addEventListener('mouseup', () => {
                canvas.removeEventListener('mousemove', dr)
            }, { once: true }) // prettier-ignore
        }
    }

    attach = (canvas) => {
        canvas.addEventListener('mousedown', this.attachedClick)
    }

    detach = (canvas) => {
        canvas.removeEventListener('mousedown', this.attachedClick)
    }
}
