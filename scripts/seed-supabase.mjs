// يعبّئ محتوى المنصة إلى Supabase من bank.json محلياً (لا يحمّل البيانات في سياق النموذج)
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_ANON_KEY;
if (!URL || !KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY env');
  process.exit(1);
}
const db = createClient(URL, KEY, { auth: { persistSession: false } });
const bank = JSON.parse(readFileSync('src/data/bank.json', 'utf8'));

const sections = bank.sections.map((s) => ({
  slug: s.slug, title: s.title, short_title: s.short_title,
  description: s.description, icon: s.icon, color: s.color, sort: s.order,
}));
const topics = bank.topics.map((t) => ({
  slug: t.slug, section_slug: t.section, title: t.title, sort: t.order, notes: t.notes,
}));
const questions = bank.questions.map((q) => ({
  id: q.id, topic_slug: q.topic, difficulty: q.difficulty, stem: q.stem,
  options: q.options, answer: q.answer, explanation: q.explanation,
}));

async function up(table, rows, conflict) {
  for (let i = 0; i < rows.length; i += 100) {
    const chunk = rows.slice(i, i + 100);
    const { error } = await db.from(table).upsert(chunk, { onConflict: conflict });
    if (error) { console.error(table, 'error:', error.message); process.exit(1); }
  }
  console.log(`✓ ${table}: ${rows.length} rows`);
}

await up('pl_sections', sections, 'slug');
await up('pl_topics', topics, 'slug');
await up('pl_questions', questions, 'id');

const { count } = await db.from('pl_questions').select('*', { count: 'exact', head: true });
console.log('total questions in DB:', count);
