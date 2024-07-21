import { OpenSimplexNoise } from './libs/algorithms/opensimplexnoise.js'

export class SimplexSpace extends OpenSimplexNoise {
    constructor(width, height, seed) {
        super(seed)
        this.width = width
        this.height = height
        this.data = []
        this.callback = (n) => [n * 255, n * 255, n * 255]
    }

    makeMap() {
        const map = Array.from(Array(this.width), () => new Array(this.height))
        let [maxNoiseHeight, minNoiseHeight] = [0, 0]
        for (let x = 0; x < this.width; ++x) {
            for (let y = 0; y < this.height; ++y) {
                let amplitude = 1
                let frequency = 1
                let noiseHeight = 0

                for (let i = 0; i < this.params.octaves; ++i) {
                    let sampleX = ((x - this.width / 2) / this.params.scale) * frequency
                    let sampleY = ((y - this.height / 2) / this.params.scale) * frequency

                    noiseHeight += this.eval2d(sampleX, sampleY) * amplitude
                    amplitude *= this.params.persistance
                    frequency *= this.params.lacunarity
                }

                if (noiseHeight > maxNoiseHeight) maxNoiseHeight = noiseHeight
                else if (noiseHeight < minNoiseHeight) minNoiseHeight = noiseHeight

                map[x][y] = noiseHeight
            }
        }
        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {
                map[x][y] = (map[x][y] - minNoiseHeight) / (maxNoiseHeight - minNoiseHeight)
            }
        }
        return map
    }

    makeImageData() {
        const [width, height] = [~~(this.width / this.params.factor), ~~(this.height / this.params.factor)]
        const map = new Array(width * height)
        let [maxNoiseHeight, minNoiseHeight] = [0, 0]
        for (let x = 0; x < width; ++x) {
            for (let y = 0; y < height; ++y) {
                let amplitude = 1
                let frequency = 1
                let noiseHeight = 0

                for (let i = 0; i < this.params.octaves; ++i) {
                    let sampleX = ((x - width / 2) / this.params.scale) * frequency
                    let sampleY = ((y - height / 2) / this.params.scale) * frequency

                    noiseHeight += this.eval2d(sampleX, sampleY) * amplitude
                    amplitude *= this.params.persistance
                    frequency *= this.params.lacunarity
                }

                if (noiseHeight > maxNoiseHeight) maxNoiseHeight = noiseHeight
                else if (noiseHeight < minNoiseHeight) minNoiseHeight = noiseHeight

                map[y * width + x] = noiseHeight
            }
        }

        const data = []
        for (let i = 0; i < width * height; i++) {
            const n = (map[i] - minNoiseHeight) / (maxNoiseHeight - minNoiseHeight)
            const [r, g, b] = this.callback(n)
            data[i * 4] = r
            data[i * 4 + 1] = g
            data[i * 4 + 2] = b
            data[i * 4 + 3] = 255
        }
        return { array: data, width, height }
    }

    addParticle = () => {}

    update = () => {
        this.data = this.makeImageData()
    }

    worldMapCallback = () => {
        let deepWater = [0, 51, 102]
        let shallowWater = [51, 153, 255]

        let river = [51, 153, 255]
        let lake = [51, 102, 204]

        let grasslands = [102, 204, 102]
        let fertilePlains = [153, 255, 153]

        let deciduousForest = [34, 139, 34]
        let coniferousForest = [0, 100, 0]

        let lowMountains = [169, 169, 169]
        let highMountains = [105, 105, 105]
        let mountainPeaks = [255, 255, 255]

        let sandDunes = [237, 201, 175]
        let rockyDeserts = [194, 178, 128]

        let tundra = [211, 211, 211]
        let iceSnow = [255, 255, 255]

        let swamps = [85, 107, 47]
        let marshes = [143, 188, 143]

        let smallTowns = [128, 128, 128]
        let largeCities = [64, 64, 64]

        let volcanicRock = [75, 0, 130]
        let lava = [255, 69, 0]

        let sandyBeaches = [255, 215, 0]
        let rockyShores = [184, 134, 11]

        return (n) => {
            if (n < 0.2) return deepWater
            if (n < 0.35) return shallowWater
            if (n < 0.37) return sandyBeaches
            if (n < 0.4) return rockyShores
            if (n < 0.5) return grasslands
            if (n < 0.6) return fertilePlains
            if (n < 0.63) return grasslands
            if (n < 0.8) return deciduousForest
            if (n < 0.87) return coniferousForest
            if (n < 0.9) return lowMountains
            if (n < 0.98) return highMountains
            return mountainPeaks
        }
    }

    renderNoise = (ctx) => {
        ctx.putImageData(this.imageData, (this.width - this.imageData.width) / 2, (this.height - this.imageData.height) / 2)
    }

    renderNoiseScaled = async (ctx) => {
        const bitmap = await createImageBitmap(this.imageData)
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(bitmap, 0, 0, this.width, this.height)
    }

    render = (ctx, params) => {
        this.params = params
        if (this.params.makeBiomes) this.callback = this.worldMapCallback()
        else this.callback = (n) => [n * 255, n * 255, n * 255]

        if (this.data.length == 0) this.data = this.makeImageData()

        this.imageData = ctx.createImageData(this.data.width, this.data.height)
        this.imageData.data.set(this.data.array)
        if (this.params.factor > 1) this.renderNoiseScaled(ctx)
        else this.renderNoise(ctx)
    }

    attach = () => {}
    detach = () => {}
}

// import { prngd } from './utils.js'

// export class PerlinNoise {
//     constructor(width, height, params) {
//         this.width = width
//         this.height = height
//         this.params = params
//         this.gradients = {}

//         this.random = prngd(this.params.seed)
//         // let seed = BigInt(this.params.seed)
//         // for (let i = 0; i < 256; i++) this.source[i] = i
//         // seed = seed * 6364136223846793005n + 1442695040888963407n
//         // seed = seed * 6364136223846793005n + 1442695040888963407n
//         // seed = seed * 6364136223846793005n + 1442695040888963407n
//         // for (let i = 255n; i >= 0n; i--) {
//         //     seed = seed * 6364136223846793005n + 1442695040888963407n
//         //     let r = (seed + 31n) % (i + 1n)
//         //     if (r < 0) r += i + 1
//         //     this.perm[i] = this.source[r]
//         //     this.permGradIndex3D[i] = (this.perm[i] % (gradients3D.length / 3)) * 3
//         //     this.source[r] = this.source[i]
//         // }
//     }

//     rand_vector() {
//         let theta = this.random() * 2 * Math.PI
//         return { x: Math.cos(theta), y: Math.sin(theta) }
//     }

//     dot(x, y, vx, vy) {
//         let g_vector
//         let d_vector = { x: x - vx, y: y - vy }
//         if (this.gradients[[vx, vy]]) {
//             g_vector = this.gradients[[vx, vy]]
//         } else {
//             g_vector = this.rand_vector()
//             this.gradients[[vx, vy]] = g_vector
//         }
//         return d_vector.x * g_vector.x + d_vector.y * g_vector.y
//     }

//     smoother_step(x) {
//         return 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3
//     }

//     interpolate(x, a, b) {
//         return a + this.smoother_step(x) * (b - a)
//     }

//     get(x, y) {
//         let xf = Math.floor(x)
//         let yf = Math.floor(y)
//         let tl = this.dot(x, y, xf, yf)
//         let tr = this.dot(x, y, xf + 1, yf)
//         let bl = this.dot(x, y, xf, yf + 1)
//         let br = this.dot(x, y, xf + 1, yf + 1)
//         let xt = this.interpolate(x - xf, tl, tr)
//         let xb = this.interpolate(x - xf, bl, br)
//         let v = this.interpolate(y - yf, xt, xb)
//         return v
//     }

//     makeMap() {
//         const map = Array.from(Array(this.width), () => new Array(this.height))
//         let [maxNoiseHeight, minNoiseHeight] = [0, 0]
//         for (let x = 0; x < this.width; ++x) {
//             for (let y = 0; y < this.height; ++y) {
//                 let amplitude = 1
//                 let frequency = 1
//                 let noiseHeight = 0

//                 for (let i = 0; i < this.params.octaves; ++i) {
//                     let sampleX = ((x - this.width / 2) / this.params.scale) * frequency
//                     let sampleY = ((y - this.height / 2) / this.params.scale) * frequency

//                     noiseHeight += this.get(sampleX, sampleY) * amplitude
//                     amplitude *= this.params.persistance
//                     frequency *= this.params.lacunarity
//                 }

//                 if (noiseHeight > maxNoiseHeight) maxNoiseHeight = noiseHeight
//                 else if (noiseHeight < minNoiseHeight) minNoiseHeight = noiseHeight

//                 map[x][y] = noiseHeight
//             }
//         }
//         for (let y = 0; y < this.height; ++y) {
//             for (let x = 0; x < this.width; ++x) {
//                 map[x][y] = (map[x][y] - minNoiseHeight) / (maxNoiseHeight - minNoiseHeight)
//             }
//         }
//         return map
//     }
// }
