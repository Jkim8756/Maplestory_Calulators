import { mkdir, writeFile } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
const wikiBase = 'https://maplestorywiki.net'
const mediaBase = 'https://media.maplestorywiki.net'
const bossPageUrl = `${wikiBase}/w/Bosses`
const mesoPageUrl = `${wikiBase}/w/Meso`
const intensePowerCrystalPageUrl = `${wikiBase}/w/Intense_Power_Crystal`
const difficulties = ['Easy', 'Normal', 'Hard', 'Chaos', 'Extreme']

const outputDataPath = join(root, 'src', 'data', 'wiki', 'bosses.snapshot.json')
const bossAssetDir = join(root, 'public', 'assets', 'wiki', 'bosses')
const itemAssetDir = join(root, 'public', 'assets', 'wiki', 'items')

await mkdir(join(root, 'src', 'data', 'wiki'), { recursive: true })
await mkdir(bossAssetDir, { recursive: true })
await mkdir(itemAssetDir, { recursive: true })

const bossHtml = await fetchText(bossPageUrl)
const mesoHtml = await fetchText(mesoPageUrl)
const intensePowerCrystalHtml = await fetchText(intensePowerCrystalPageUrl)
const revisionId = matchFirst(bossHtml, /wgRevisionId":(\d+)/)
const oldId = matchFirst(bossHtml, /oldid=(\d+)/)
const lastEdited = decodeHtml(matchFirst(bossHtml, /<li id="footer-info-lastmod">\s*([^<]+)<\/li>/))

const tableHtml = matchFirst(bossHtml, /<table class="wikitable">([\s\S]*?)<\/table>/)
const rows = [...tableHtml.matchAll(/<tr[\s\S]*?<\/tr>/g)].map((match) => match[0]).slice(2)

const bosses = []
for (const row of rows) {
  const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((match) => match[1])
  if (cells.length < 6) continue

  const nameCell = cells[0]
  const imageUrl = matchFirst(nameCell, /<img[^>]+src="([^"]+)"/)
  const anchors = [...nameCell.matchAll(/<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
  const textAnchor = anchors.find((anchor) => !anchor[2].includes('<img') && !anchor[1].startsWith('#cite'))
  if (!textAnchor) continue

  const name = cleanText(textAnchor[2])
  const slug = slugify(name)
  const imageExt = extname(new URL(imageUrl).pathname) || '.png'
  const imageFilename = `${slug}${imageExt}`
  const localImagePath = `/assets/wiki/bosses/${imageFilename}`
  await downloadBinary(imageUrl, join(bossAssetDir, imageFilename))

  const levels = Object.fromEntries(difficulties.map((difficulty, index) => {
    const value = cleanText(cells[index + 1])
    return [difficulty, value === '-' ? null : Number.parseInt(value, 10)]
  }))

  const dropsResult = await safeExtractDropsByDifficulty(new URL(textAnchor[1], wikiBase).toString(), levels)
  bosses.push({
    name,
    wikiUrl: new URL(textAnchor[1], wikiBase).toString(),
    imageUrl,
    localImagePath,
    levels,
    dropsByDifficulty: dropsResult.dropsByDifficulty,
    dropExtractionError: dropsResult.error,
  })
}

const itemAssets = []
const mesoImageUrl = findMediaUrl(mesoHtml, /Meso3\.png/)
if (mesoImageUrl) {
  await downloadBinary(mesoImageUrl, join(itemAssetDir, 'meso.png'))
  itemAssets.push({ id: 'meso', sourceUrl: mesoImageUrl, localPath: '/assets/wiki/items/meso.png' })
}

for (const [id, pattern] of [
  ['intense-power-crystal-daily', /Etc_Intense_Power_Crystal_%28Daily%29\.png/],
  ['intense-power-crystal-weekly', /Etc_Intense_Power_Crystal_%28Weekly%29\.png/],
  ['intense-power-crystal-monthly', /Etc_Intense_Power_Crystal_%28Monthly%29\.png/],
]) {
  const sourceUrl = findMediaUrl(intensePowerCrystalHtml, pattern) || findMediaUrl(mesoHtml, pattern)
  if (!sourceUrl) continue
  const localName = `${id}${extname(new URL(sourceUrl).pathname) || '.png'}`
  await downloadBinary(sourceUrl, join(itemAssetDir, localName))
  itemAssets.push({ id, sourceUrl, localPath: `/assets/wiki/items/${localName}` })
}

const snapshot = {
  source: {
    title: 'Bosses - MapleStory Wiki',
    url: bossPageUrl,
    relatedUrls: {
      intensePowerCrystal: intensePowerCrystalPageUrl,
      meso: mesoPageUrl,
    },
    revisionId: revisionId ? Number(revisionId) : null,
    oldId: oldId ? Number(oldId) : null,
    lastEdited,
    license: 'Creative Commons Attribution-NonCommercial-ShareAlike 3.0',
    fetchedAt: new Date().toISOString(),
  },
  bosses,
  itemAssets,
}

await writeFile(outputDataPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8')
console.log(`Stored ${bosses.length} bosses in ${outputDataPath}`)
console.log(`Stored ${bosses.length} boss images in ${bossAssetDir}`)
console.log(`Stored ${itemAssets.length} item assets in ${itemAssetDir}`)

async function extractDropsByDifficulty(url, levels) {
  const html = await fetchText(url)
  const result = {}
  for (const difficulty of difficulties.filter((item) => levels[item] !== null)) {
    const rewardIndex = html.indexOf(`id="${difficulty}:_Reward"`)
    const bossIndex = html.indexOf(`id="${difficulty}:_Boss"`)
    const startIndex = rewardIndex >= 0 ? rewardIndex : bossIndex
    if (startIndex < 0) continue
    const nextHeadingIndex = html.indexOf('<div class="mw-heading mw-heading', startIndex + 1)
    const block = html.slice(startIndex, nextHeadingIndex >= 0 ? nextHeadingIndex : undefined)
    const categories = {
      equipment: extractDropCategory(block, 'Equipment Drops'),
      usable: extractDropCategory(block, 'Usable Drops'),
      setup: extractDropCategory(block, 'Set-up Drops'),
      etc: extractDropCategory(block, 'Etc\\. Drops'),
      quest: extractDropCategory(block, 'Quest Drops'),
    }
    const flat = Object.values(categories).flat().filter((drop) => drop !== 'None')
    if (flat.length > 0) result[difficulty] = { categories, flat }
  }
  return result
}

async function safeExtractDropsByDifficulty(url, levels) {
  try {
    return { dropsByDifficulty: await extractDropsByDifficulty(url, levels), error: '' }
  } catch (error) {
    return { dropsByDifficulty: {}, error: error instanceof Error ? error.message : String(error) }
  }
}

function extractDropCategory(block, labelPattern) {
  const pattern = new RegExp(`<th[^>]*>\\s*${labelPattern}\\s*<\\/th>\\s*<td[^>]*>([\\s\\S]*?)<\\/td>\\s*<\\/tr>`, 'i')
  const categoryHtml = block.match(pattern)?.[1] ?? ''
  if (!categoryHtml) return []
  const items = [...categoryHtml.matchAll(/<li[^>]*>([\s\S]*?)(?=<\/li>)/g)]
    .map((match) => cleanText(match[1]))
    .filter(Boolean)
  if (items.length > 0) return unique(items)
  const text = cleanText(categoryHtml)
  return text ? [text] : []
}

async function fetchText(url) {
  await sleep(1600)
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(url, { headers: { 'user-agent': 'MaplestoryCalculatorsLocalSnapshot/0.1' } })
    if (response.ok) return response.text()
    if (response.status !== 429 || attempt === 3) throw new Error(`Failed to fetch ${url}: ${response.status}`)
    await sleep(4000 * (attempt + 1))
  }
  throw new Error(`Failed to fetch ${url}`)
}

async function downloadBinary(url, destination) {
  const response = await fetch(url, { headers: { 'user-agent': 'MaplestoryCalculatorsLocalSnapshot/0.1' } })
  if (!response.ok) throw new Error(`Failed to download ${url}: ${response.status}`)
  const bytes = new Uint8Array(await response.arrayBuffer())
  await writeFile(destination, bytes)
}

function matchFirst(value, pattern) {
  return value.match(pattern)?.[1] ?? ''
}

function findMediaUrl(html, pattern) {
  const urls = [...html.matchAll(/https:\/\/media\.maplestorywiki\.net\/yetidb\/[^"'\s<>]+/g)].map((match) => match[0])
  return urls.find((url) => pattern.test(url)) ?? ''
}

function cleanText(html) {
  return decodeHtml(html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim())
}

function decodeHtml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&#95;', '_')
    .replaceAll('&#91;', '[')
    .replaceAll('&#93;', ']')
    .replaceAll('&nbsp;', ' ')
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function unique(values) {
  return [...new Set(values)]
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
