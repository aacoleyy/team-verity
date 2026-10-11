// Small hand-drawn-looking textures for the grass, drawn on a canvas so no
// image files are needed. The map asks for them by name ('grass-tex',
// 'lawn-tex') through MapLibre's styleimagemissing event.

const SIZE = 96

// Seeded random numbers, so the texture looks the same on every load.
function rng(seed) {
  let t = seed
  return () => {
    t = (t + 0x6d2b79f5) | 0
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function grassTexture(base, tuft, speck, seed) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, SIZE, SIZE)
  const rand = rng(seed)

  // Light specks, like paper grain.
  ctx.fillStyle = speck
  for (let i = 0; i < 40; i++) {
    ctx.globalAlpha = 0.35 + rand() * 0.3
    ctx.beginPath()
    ctx.arc(rand() * SIZE, rand() * SIZE, 0.8 + rand() * 1.4, 0, Math.PI * 2)
    ctx.fill()
  }

  // Little "v" grass tufts. Each is drawn at x and x ± SIZE so the tile
  // repeats without seams.
  ctx.globalAlpha = 0.55
  ctx.strokeStyle = tuft
  ctx.lineWidth = 1.6
  ctx.lineCap = 'round'
  for (let i = 0; i < 9; i++) {
    const x = rand() * SIZE
    const y = rand() * SIZE
    const w = 3 + rand() * 2
    for (const dx of [-SIZE, 0, SIZE]) {
      for (const dy of [-SIZE, 0, SIZE]) {
        ctx.beginPath()
        ctx.moveTo(x + dx - w, y + dy - w * 1.3)
        ctx.lineTo(x + dx - w * 0.2, y + dy)
        ctx.lineTo(x + dx + w * 0.3, y + dy - w * 1.6)
        ctx.moveTo(x + dx - w * 0.2, y + dy)
        ctx.lineTo(x + dx + w, y + dy - w)
        ctx.stroke()
      }
    }
  }
  return ctx.getImageData(0, 0, SIZE, SIZE)
}

const textures = {
  'grass-tex': () => grassTexture('#a3d47c', '#5f9d43', '#d3eeb6', 7),
  'lawn-tex': () => grassTexture('#b9e09a', '#6fae4f', '#e4f5d2', 11),
}

export function addCartoonImage(map, id) {
  if (!textures[id] || map.hasImage(id)) return
  map.addImage(id, textures[id]())
}

export function addAllCartoonImages(map) {
  for (const id of Object.keys(textures)) addCartoonImage(map, id)
}
