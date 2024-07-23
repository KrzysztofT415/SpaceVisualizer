const RADIUS = 10

class Line {
    constructor(start, end) {
        this.start = start
        this.end = end
        this.anchorStart = null
        this.anchorEnd = null
    }

    renderLine = (ctx, a, b, c) => {
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.strokeStyle = c
        ctx.lineWidth = 3
        ctx.stroke()
    }

    renderLinear = (ctx) => {
        this.renderLine(ctx, this.start, this.end, window.colors().WL)
    }

    renderBezier = (ctx) => {
        if (this.anchorStart == null) this.anchorStart = window.addParticle()
        if (this.anchorEnd == null) this.anchorEnd = window.addParticle()

        this.renderLine(ctx, this.start, this.anchorStart, window.colors().BROWN)
        this.renderLine(ctx, this.end, this.anchorEnd, window.colors().BROWN)
        ctx.beginPath()
        ctx.moveTo(this.start.x, this.start.y)
        ctx.bezierCurveTo(this.anchorStart.x, this.anchorStart.y, this.anchorEnd.x, this.anchorEnd.y, this.end.x, this.end.y)
        ctx.strokeStyle = window.colors().WL
        ctx.lineWidth = 3
        ctx.stroke()
        window.drawCircle(this.anchorStart.x, this.anchorStart.y, RADIUS, window.colors().DL)
        window.drawCircle(this.anchorEnd.x, this.anchorEnd.y, RADIUS, window.colors().DL)
    }

    render = (ctx, type) => {
        if (type == 'linear') this.renderLinear(ctx)
        else this.renderBezier(ctx)
        window.drawCircle(this.start.x, this.start.y, RADIUS, window.colors().RED)
        window.drawCircle(this.end.x, this.end.y, RADIUS, window.colors().RED)
    }
}

export class LineSpace {
    constructor(width, height) {
        this.width = width
        this.height = height

        let a = window.makeRandomParticle()
        let b = window.makeRandomParticle()
        let c = window.makeRandomParticle()
        this.points = [a, b, c]
        this.lines = [new Line(a, b), new Line(b, c)]
        this.tmp = []
        this.mirrorMode = false
    }

    addParticle = (p) => this.points.push(p)

    update = () => {
        for (const p of [...this.points]) p.update()
    }

    render = (ctx, params) => {
        for (const point of this.points) window.drawCircle(point.x, point.y, RADIUS, window.colors().DL)
        for (const line of this.lines) line.render(ctx, params.type)
        for (const render of this.tmp) render(ctx)
    }

    isInsideCircle = (p, x, y, r = RADIUS) => {
        const dx = p.x - x
        const dy = p.y - y
        return dx * dx + dy * dy <= r * r
    }

    findLine = (start, end) => this.lines.findIndex((line) => (line.start == start && line.end == end) || (line.start == end && line.end == start))
    findLineOfPoint = (point) => this.lines.findIndex((line) => line.start == point || line.end == point || line.anchorStart == point || line.anchorEnd == point)
    findPoint = (x, y) => this.points.findIndex((point) => this.isInsideCircle(point, x, y))
    findPointExcept = (x, y, i) => this.points.findIndex((point, index) => this.isInsideCircle(point, x, y) && index != i)

    movePoint = (mouseX, mouseY) => {
        const start_id = this.findPoint(mouseX, mouseY)
        if (start_id !== -1) {
            const start = this.points[start_id]
            const ox = mouseX - start.x
            const oy = mouseY - start.y
            let ax, ay, a1x, a1y, a2x, a2y
            // if (start.attached) {
            //     ax = mouseX - start.attached.x
            //     ay = mouseY - start.attached.y
            // }
            // if (start.attachedOne) {
            //     a1x = start.attachedOne.x
            //     a1y = start.attachedOne.y
            // }
            // if (start.attachedTwo) {
            //     a2x = start.attachedTwo.x
            //     a2y = start.attachedTwo.y
            // }
            const drag = (e) => {
                start.x = e.offsetX - ox
                start.y = e.offsetY - oy

                // if (start.attached) {
                //     start.attached.x = -e.offsetX + ax
                //     start.attached.y = -e.offsetY + ay
                // }
                // if (start.attachedOne) {
                //     start.attachedOne.x = e.offsetX - a1x
                //     start.attachedOne.y = e.offsetY - a1y
                // }
                // if (start.attachedTwo) {
                //     start.attachedTwo.x = e.offsetX - a2x
                //     start.attachedTwo.y = e.offsetY - a2y
                // }

                window.refresh()
            }
            canvas.addEventListener('pointermove', drag)
            canvas.addEventListener(
                'pointerup',
                () => {
                    const end_id = this.findPointExcept(start.x, start.y, start_id)
                    if (end_id != -1) {
                        const end = this.points[end_id]
                        if (this.mirrorMode) {
                            const id_tmp_1 = this.lines.findIndex((line) => line.anchorStart == start)
                            const id_tmp_2 = this.lines.findIndex((line) => line.anchorStart == end)
                            const id_tmp_3 = this.lines.findIndex((line) => line.anchorEnd == start)
                            const id_tmp_4 = this.lines.findIndex((line) => line.anchorEnd == end)
                            let [middle, other] = [null, null]
                            if (id_tmp_1 != -1) [middle, other] = [this.lines[id_tmp_1].start, start]
                            else if (id_tmp_2 != -1) [middle, other] = [this.lines[id_tmp_2].start, end]
                            else if (id_tmp_3 != -1) [middle, other] = [this.lines[id_tmp_3].end, start]
                            else if (id_tmp_4 != -1) [middle, other] = [this.lines[id_tmp_4].end, end]

                            if (middle != null) {
                                end.attached = start
                                start.attached = end
                                middle.attachedOne = start
                                middle.attachedTwo = end
                                start.x = 2 * middle.x - other.x
                                start.y = 2 * middle.y - other.y

                                start.x = Math.max(0, Math.min(this.width, start.x))
                                start.y = Math.max(0, Math.min(this.height, start.y))
                            }
                        } else {
                            for (const line of this.lines) {
                                if (line.start == end) line.start = start
                                if (line.end == end) line.end = start
                                if (line.anchorStart == end) line.anchorStart = start
                                if (line.anchorEnd == end) line.anchorEnd = start
                            }
                            this.points.splice(end_id, 1)
                        }
                    }
                    canvas.removeEventListener('pointermove', drag)
                    window.refresh()
                },
                { once: true }
            )
        }
    }

    addConnection = (mouseX, mouseY) => {
        const start_id = this.findPoint(mouseX, mouseY)
        if (start_id !== -1) {
            const start = this.points[start_id]
            const ox = mouseX - start.x
            const oy = mouseY - start.y
            const tmp_id = this.tmp.length
            const connect = (e) => {
                this.tmp[tmp_id] = (ctx) => {
                    ctx.beginPath()
                    ctx.moveTo(start.x, start.y)
                    ctx.lineTo(e.offsetX - ox, e.offsetY - oy)
                    ctx.strokeStyle = window.colors().GREEN
                    ctx.lineWidth = 3
                    ctx.stroke()
                }
                window.refresh()
            }
            canvas.addEventListener('pointermove', connect)
            canvas.addEventListener(
                'pointerup',
                (e) => {
                    const [endX, endY] = [e.offsetX, e.offsetY]
                    const end_id = this.findPointExcept(endX, endY, start_id)
                    if (end_id != -1) {
                        const end = this.points[end_id]
                        const id_tmp = this.findLine(start, end)
                        if (id_tmp != -1) this.lines.splice(id_tmp, 1)
                        else this.lines.push(new Line(start, this.points[end_id]))
                    }
                    this.tmp.splice(tmp_id, 1)
                    canvas.removeEventListener('pointermove', connect)
                    window.refresh()
                },
                { once: true }
            )
        }
    }

    addPoint = (mouseX, mouseY) => {
        const id = this.findPoint(mouseX, mouseY)
        if (id != -1 && this.findLineOfPoint(this.points[id]) == -1) this.points.splice(id, 1)
        else window.addParticle(mouseX, mouseY)
        window.refresh()
    }

    attachedClick = (e) => {
        const [x, y] = [e.offsetX, e.offsetY]
        e.preventDefault()
        if (e.button == 0) this.movePoint(x, y)
        else if (e.button == 1) this.addPoint(x, y)
        else this.addConnection(x, y)
    }

    attachedKey = (e) => {
        if (e.key == 'Shift') {
            this.mirrorMode = true
            document.addEventListener('keyup', () => (this.mirrorMode = false), { once: true })
        }
    }

    attach = (canvas) => {
        canvas.addEventListener('pointerdown', this.attachedClick)
        document.addEventListener('keydown', this.attachedKey)
    }

    detach = (canvas) => {
        canvas.removeEventListener('pointerdown', this.attachedClick)
        document.removeEventListener('keydown', this.attachedKey)
    }
}
