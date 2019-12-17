import sharp from 'sharp';
import path from "path";
import { shuffle } from "lodash";
import { projectPath, settings } from "./settings";
import { projects } from './loadData';

const tileWidth = 24
const tileHeight = 24

const svgToPng = async ({ svgPath, width, height = null }) => {
  const density = Math.max(Math.round(width / 2), 72)
  const buffer = await sharp(svgPath, { density }).resize({ width, height, fit: 'contain', background: '#ffffff'  })
                                                  .flatten({ background: '#ffffff' })
                                                  .toBuffer()
  return await sharp(buffer)
}

let logos = []
const loadLogos = async () => {
  const svgs = projects.map(({ image_data }) => path.resolve(projectPath, 'dist', 'logos', image_data.fileName))

  for (let i = 0; i < svgs.length; i++) {
    try {
      const png = await svgToPng({ svgPath: svgs[i], width: tileWidth, height: tileHeight })
      logos.push(new Tile(await png.raw().toBuffer()))
    } catch(e) {
      console.log(`Could not convert ${svgs[i]} to PNG: ${e.message}`)
    }
  }
}

class Region {
  constructor () {
    this._r = 0
    this._g = 0
    this._b = 0
    this._count = 0
  }

  addRGB (r, g, b) {
    this._r += r
    this._g += g
    this._b += b
    this._count += 1
  }

  rgb () {
    if (this._rgb) {
      return this._rgb
    }

    this._rgb = [Math.floor(this._r / this._count),
                 Math.floor(this._g / this._count),
                 Math.floor(this._b / this._count)]

    return this._rgb
  }

  lab () {
    if (this._lab) {
      return this._lab
    }
    let x, y, z
    let [r, g, b] = this.rgb()

    r /= 255
    g /= 255
    b /= 255

    r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
    y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
    z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

    x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
    y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
    z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;

    this._lab = [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]

    return this._lab
  }
}

class Tile extends Region {
  constructor (buffer) {
    super()
    this.buffer = buffer
    for (let i = 0; i < buffer.length / 3; i++) {
      const idx = 3 * i
      this.addRGB(buffer[idx], buffer[idx + 1], buffer[idx + 2])
    }
  }
}

const distance = (first, last) => {
  return Math.sqrt((first[0] - last[0]) ** 2 + (first[1] - last[1]) ** 2 + (first[2] - last[2]) ** 2)
}

async function generateMosaic(mosaic) {
  const mainLogo = `images/${mosaic}`
  const png = await svgToPng({ svgPath: path.resolve(projectPath, mainLogo), width: 2400 })
  const { width, height } = await png.metadata()

  const data = await png.raw().toBuffer()

  const vSize = Math.ceil(height / tileHeight);
  const hSize = Math.ceil(width / tileWidth);

  let regions = Array(vSize).fill(null).map(() => Array(hSize).fill(null).map(() => {
    return new Region()
  }))

  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const idx = (width * i + j) * 3 ;
      let region = regions[Math.floor(i * vSize / height)][Math.floor(j * hSize / width)]
      region.addRGB(data[idx], data[idx + 1], data[idx + 2])
    }
  }

  let tiles = []
  while (tiles.length < vSize * hSize) {
    tiles = [...tiles, ...logos]
  }

  let newPngData = new Array(width * height * 3).fill(255)
  let pairs = []
  for (let y = 0; y < vSize; y++) {
    for (let x = 0; x < hSize; x++) {
      pairs.push([x, y])
    }
  }

  shuffle(pairs).forEach(([x, y]) => {
    let region = regions[y][x]
    const lab = region.lab()
    let tileIdx = null, min = null;
    tiles.forEach((tile, idx) => {
      const _distance = distance(tile.lab(), lab)
      if (min === null || _distance < min) {
        min = _distance
        tileIdx = idx
      }
    })
    const tile = tiles[tileIdx]
    tiles = tiles.filter((_, idx) => idx !== tileIdx)
    for (let i = 0; i < tileHeight; i++) {
      for (let j = 0; j < tileWidth; j++) {
        const rightIdx = (tileWidth * i + j) * 3
        const leftIdx = (width * (y * tileHeight + i) + x * tileWidth + j) * 3 ;
        newPngData[leftIdx] = tile.buffer[rightIdx]
        newPngData[leftIdx + 1] = tile.buffer[rightIdx + 1]
        newPngData[leftIdx + 2] = tile.buffer[rightIdx + 2]
      }
    }
  })

  await sharp(Buffer.from(newPngData), { raw: { width, height, channels: 3 }})
          .toFile(path.resolve(projectPath, 'dist', `${mosaic.split('.')[0]}-mosaic.png`))
}

if (settings.mosaics) {
  loadLogos().then(() =>
    settings.mosaics.forEach((mosaic) => generateMosaic(mosaic))
  )
}
