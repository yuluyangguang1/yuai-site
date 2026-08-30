#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════
// 免费模型活动 · 自动核对 + 自动搜集
//   核对: 逐个探测 key-data.json 里每个活动的链接可达性,
//         连续 3 次失败自动标记 status=expired(页面灰显)。
//   搜集: 从 AI HOT(https://aihot.virxact.com)匿名 API v1
//         抓取含"免费额度/送 Token/free tier"等关键词的资讯,
//         去重后写入 key-candidates.json 供人工核录。
//
// 用法:  node scripts/refresh-offers.mjs [--skip-collect]
// 本地跑外网需代理:  HTTPS_PROXY=http://127.0.0.1:7897 NODE_USE_ENV_PROXY=1 node scripts/refresh-offers.mjs
// CI(GitHub Actions)直连,无需任何密钥。
// ═══════════════════════════════════════════════════════════
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DATA = path.join(ROOT, 'key-data.json');
const CAND = path.join(ROOT, 'key-candidates.json');
const UA = 'yuai-r.cn offers checker (+https://yuai-r.cn/key.html)';
const today = () => new Date().toISOString().slice(0, 10);
const sleep = ms => new Promise(r => setTimeout(r, ms));

// 403/429/503 多为反爬或限流,链接本身还活着
const reachable = s => s < 400 || s === 403 || s === 429 || s === 503;

async function checkUrl(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: { 'user-agent': UA, accept: 'text/html,*/*' },
    });
    return reachable(res.status);
  } catch (_) {
    return false;
  } finally {
    clearTimeout(t);
  }
}

// ── 1. 过期核对 ─────────────────────────────────────────────
async function verify() {
  const db = JSON.parse(fs.readFileSync(DATA, 'utf8'));
  let expired = 0, checked = 0;
  for (const o of db.offers) {
    if (o.status === 'expired') continue; // 已判定过期不再白跑;人工复活后重新纳入
    const ok = await checkUrl(o.url);
    checked++;
    if (ok) {
      o.failures = 0;
      o.lastVerified = today();
      if (o.status === 'stale') o.status = 'active';
    } else {
      o.failures = (o.failures || 0) + 1;
      if (o.failures >= 3 && o.status !== 'expired') { o.status = 'expired'; expired++; }
    }
    process.stdout.write(`${ok ? '✓' : '✗'} ${o.id}${o.status === 'expired' ? ' → expired' : ''}\n`);
    await sleep(400); // 温和限速
  }
  db.updatedAt = new Date().toISOString();
  fs.writeFileSync(DATA, JSON.stringify(db, null, 2) + '\n');
  process.stdout.write(`verify: ${checked} checked, ${expired} newly expired\n`);
}

// ── 2. 自动搜集(AI HOT 匿名 API v1) ────────────────────────
const QUERIES = [
  { q: '免费额度', window: '30d' },
  { q: '免费 API', window: '30d' },
  { q: '送 Token', window: '30d' },
  { q: 'free tier', window: '30d' },
];
const HIT = /免费|白嫖|送.{0,8}Token|注册.{0,8}额度|free\s*tier|no credit card/i;

async function collect() {
  let db = { schema: 1, updatedAt: null, candidates: [] };
  try { db = JSON.parse(fs.readFileSync(CAND, 'utf8')); } catch (_) {}
  const seen = new Set(db.candidates.map(c => c.id));
  const items = [];
  for (const { q, window: w } of QUERIES) {
    try {
      const u = `https://aihot.virxact.com/api/v1/items?q=${encodeURIComponent(q)}&window=${w}&limit=30`;
      const res = await fetch(u, { headers: { accept: 'application/json', 'user-agent': UA } });
      if (res.ok) {
        const j = await res.json();
        items.push(...(j.items || []));
      }
    } catch (_) {}
    await sleep(500);
  }
  let added = 0;
  for (const it of items) {
    if (seen.has(it.id)) continue;
    const text = `${it.title || ''} ${it.summary || ''}`;
    if (!HIT.test(text)) continue;
    db.candidates.push({
      id: it.id,
      title: it.title,
      summary: (it.summary || '').slice(0, 160),
      url: (it.links && (it.links.original || it.links.aihot)) || null,
      aihot: it.links && it.links.aihot,
      publishedAt: it.publishedAt,
      foundAt: new Date().toISOString(),
      source: 'AI HOT',
    });
    seen.add(it.id);
    added++;
  }
  db.candidates = db.candidates.slice(-40); // 只保留最近 40 条
  db.updatedAt = new Date().toISOString();
  fs.writeFileSync(CAND, JSON.stringify(db, null, 2) + '\n');
  process.stdout.write(`collect: +${added} candidates (total ${db.candidates.length})\n`);
}

const skipCollect = process.argv.includes('--skip-collect');
await verify();
if (!skipCollect) await collect();
