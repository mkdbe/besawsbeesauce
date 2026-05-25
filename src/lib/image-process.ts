import sharp from 'sharp'
import path from 'path'
import { unlink } from 'fs/promises'

const MAX_WIDTH = 1200
const MOBILE_WIDTH = 480
const QUALITY = 82
const MOBILE_QUALITY = 75

export async function processUploadedImage(inputPath: string): Promise<string> {
  const dir = path.dirname(inputPath)
  const stem = path.basename(inputPath, path.extname(inputPath))

  const mainPath = path.join(dir, `${stem}.webp`)
  const mobilePath = path.join(dir, `${stem}-mobile.webp`)

  const meta = await sharp(inputPath).metadata()
  const srcWidth = meta.width ?? MAX_WIDTH

  await sharp(inputPath)
    .resize(srcWidth > MAX_WIDTH ? MAX_WIDTH : undefined, undefined, { withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(mainPath)

  await sharp(inputPath)
    .resize(MOBILE_WIDTH, undefined, { withoutEnlargement: true })
    .webp({ quality: MOBILE_QUALITY })
    .toFile(mobilePath)

  if (inputPath !== mainPath) {
    await unlink(inputPath).catch(() => {})
  }

  return mainPath
}
