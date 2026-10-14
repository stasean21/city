// Типограф: неразрывные пробелы в текстах сайта.
//
//   npm run typo
//
// Обрабатывает:
//   src/data/*.json — строковые значения (ключи не трогает);
//   src/**/*.vue    — текст между тегами в <template> и атрибуты alt, aria-label, title
//                     (и pill, lead — текстовые пропсы шапки SectionHead).
// Не трогает: остальные атрибуты, {{ … }}, <script>, <style>, комментарии.
// Меняются только пробелы: обычный → неразрывный (U+00A0), файл не переформатируется.
// Правила — src/utils/typo.js (та же функция для строк, собранных в коде)
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { typo } from '../src/utils/typo.js'

const ROOT = new URL('..', import.meta.url).pathname
// hero главной настраивается отдельно: переносы в нём подобраны вручную
const SKIP = new Set(['src/components/sections/HeroSection.vue'])
// служебные данные без видимого текста
const SKIP_JSON = new Set(['src/data/site-blocks.json'])
// атрибуты с видимым или озвучиваемым текстом; pill и lead — пропсы шапки SectionHead
const ATTRS = new Set(['alt', 'aria-label', 'title', 'pill', 'lead'])

function walk(dir, ext, out = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) walk(path, ext, out)
    else if (name.endsWith(ext)) out.push(path)
  }
  return out
}

// json: строки-значения; строка, за которой идёт двоеточие, — ключ
function processJson(src) {
  return src.replace(/"((?:[^"\\\n]|\\.)*)"(\s*:)?/g, (all, body, colon) => (colon ? all : `"${typo(body)}"`))
}

// текст между тегами: {{ … }} пропускаем
function processText(text) {
  return text.split(/(\{\{[\s\S]*?\}\})/).map((part, i) => (i % 2 ? part : typo(part))).join('')
}

// статические alt / aria-label / title — с учётом кавычек
function processTag(tag) {
  return tag.replace(/(\s)([\w:@.-]+)="([^"]*)"/g, (all, sp, name, value) => (
    ATTRS.has(name) ? `${sp}${name}="${typo(value)}"` : all
  ))
}

// верхний <template>…</template> файла: теги читаем с учётом кавычек
// (в атрибутах бывают «>» и «=>»), комментарии оставляем как есть
function processTemplate(tpl) {
  let out = ''
  let i = 0
  while (i < tpl.length) {
    const lt = tpl.indexOf('<', i)
    if (lt === -1) {
      out += processText(tpl.slice(i))
      break
    }
    out += processText(tpl.slice(i, lt))
    if (tpl.startsWith('<!--', lt)) {
      const end = tpl.indexOf('-->', lt) + 3
      out += tpl.slice(lt, end)
      i = end
      continue
    }
    let j = lt + 1
    let quote = ''
    for (; j < tpl.length; j += 1) {
      const c = tpl[j]
      if (quote) {
        if (c === quote) quote = ''
      } else if (c === '"' || c === "'") quote = c
      else if (c === '>') break
    }
    out += processTag(tpl.slice(lt, j + 1))
    i = j + 1
  }
  return out
}

function processVue(src) {
  const start = src.search(/^<template[^>]*>/m)
  if (start === -1) return src
  const open = src.indexOf('>', start) + 1
  // закрывающий тег верхнего шаблона — в начале строки, без отступа
  const close = src.search(/^<\/template>/m)
  if (close === -1) return src
  return src.slice(0, open) + processTemplate(src.slice(open, close)) + src.slice(close)
}

const files = [
  ...walk(join(ROOT, 'src/data'), '.json').map((path) => [path, processJson]),
  ...walk(join(ROOT, 'src'), '.vue').map((path) => [path, processVue]),
]

let changed = 0
let spaces = 0
for (const [path, fn] of files) {
  const rel = relative(ROOT, path)
  if (SKIP.has(rel) || SKIP_JSON.has(rel)) continue
  const src = readFileSync(path, 'utf8')
  const out = fn(src)
  if (out === src) continue
  // страховка: изменились только пробелы
  if (out.replace(/\s/g, '') !== src.replace(/\s/g, '')) throw new Error(`${rel}: изменилось не только пробелы`)
  writeFileSync(path, out)
  const n = [...out].filter((c) => c === ' ').length - [...src].filter((c) => c === ' ').length
  spaces += n
  changed += 1
  console.log(`${rel}: +${n}`)
}
console.log(`файлов: ${changed}, неразрывных пробелов: +${spaces}`)
