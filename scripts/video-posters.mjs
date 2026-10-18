// Одноразовый: качает ролики видеообложек из Object Storage, меряет ffprobe
// и вырезает первый кадр в WebP. Нужны системные ffmpeg и ffprobe.
// Кадр ffmpeg отдаёт в PNG, в WebP (q 80) его переводит sharp: в сборке
// ffmpeg из Homebrew кодировщика libwebp может не быть.
// Обложки — в .tmp/video/posters/, в хранилище их заливают вручную
// (new-pages/video/posters/). В репозиторий не кладём.
import { execFileSync } from 'node:child_process'
import { mkdirSync, existsSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

const BASE = 'https://storage.yandexcloud.net/landing-main/new-pages/video/'
const DIR = '.tmp/video'
const POSTERS = join(DIR, 'posters')

const VIDEOS = [
  ['video-aston-martin', 'Aston%20Martin%20Video.mp4'],
  ['video-body', 'Body%20Video.mp4'],
  ['video-chuni', 'Chuni%20Video.mp4'],
  ['video-fortnite', 'Fortnite%20Video.mp4'],
  ['video-mona-liza', 'Mona%20Liza%20Video.mp4'],
  ['video-adidas', 'Superstar%20Video.mp4'],
  ['video-kupalnik', 'Swimwear%20Video.mp4'],
  ['video-puzyri', 'Puziry.mp4'],
]

const MAX_MB = 3

mkdirSync(POSTERS, { recursive: true })

const fps = (r) => {
  const [a, b] = r.split('/').map(Number)
  return b ? Math.round((a / b) * 100) / 100 : a
}
const gcd = (a, b) => (b ? gcd(b, a % b) : a)

const rows = []
for (const [slug, file] of VIDEOS) {
  const mp4 = join(DIR, `${slug}.mp4`)
  if (!existsSync(mp4)) {
    const res = await fetch(BASE + file)
    if (!res.ok) throw new Error(`${slug}: ${res.status} ${BASE + file}`)
    writeFileSync(mp4, Buffer.from(await res.arrayBuffer()))
  }

  const info = JSON.parse(execFileSync('ffprobe', [
    '-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height,r_frame_rate,codec_name:format=duration',
    '-of', 'json', mp4,
  ]))
  const s = info.streams[0]
  const g = gcd(s.width, s.height)
  rows.push({
    slug,
    size: `${s.width}×${s.height}`,
    ratio: `${s.width / g}:${s.height / g}`,
    is34: s.width * 4 === s.height * 3,
    fps: fps(s.r_frame_rate),
    duration: Math.round(Number(info.format.duration) * 100) / 100,
    codec: s.codec_name,
    mb: Math.round((statSync(mp4).size / 1048576) * 100) / 100,
  })

  const png = execFileSync('ffmpeg', [
    '-v', 'error', '-i', mp4, '-frames:v', '1',
    '-vf', 'scale=900:-2', '-f', 'image2pipe', '-vcodec', 'png', '-',
  ], { maxBuffer: 64 * 1024 * 1024 })
  await sharp(png).webp({ quality: 80 }).toFile(join(POSTERS, `${slug}.webp`))
}

console.table(rows)

const notes = []
for (const r of rows) {
  if (!r.is34) notes.push(`${r.slug}: не 3:4 (${r.size}, ${r.ratio})`)
  if (r.mb > MAX_MB) notes.push(`${r.slug}: ${r.mb} МБ > ${MAX_MB} МБ — ffmpeg -i ${r.slug}.mp4 -c:v libx264 -crf 26 -preset slow -an -movflags +faststart ${r.slug}-web.mp4`)
}
const sizes = new Set(rows.map((r) => r.size))
if (sizes.size > 1) notes.push(`Разное разрешение: ${[...sizes].join(', ')}`)
console.log(notes.length ? notes.join('\n') : 'Замечаний нет')
console.log(`Обложки: ${POSTERS}/`)
