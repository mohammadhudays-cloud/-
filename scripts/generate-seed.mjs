// يولّد ملفات SQL لتعبئة قاعدة البيانات + ملف bank.json المدمج في الواجهة
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';

const sections = JSON.parse(readFileSync('data/sections.json', 'utf8'));
const topics = JSON.parse(readFileSync('data/topics.json', 'utf8'));

// كل ملفات الأسئلة في المجلد تُدمج تلقائياً، فيكفي إضافة ملف جديد لتوسعة البنك
const questionFiles = readdirSync('data/questions')
  .filter((f) => f.endsWith('.json'))
  .sort();
const questions = questionFiles.flatMap((f) =>
  JSON.parse(readFileSync(`data/questions/${f}`, 'utf8'))
);

// التحقق من سلامة البنك قبل التوليد
const topicSlugs = new Set(topics.map((t) => t.slug));
const seen = new Set();
for (const q of questions) {
  if (seen.has(q.id)) throw new Error(`معرّف مكرر: ${q.id}`);
  seen.add(q.id);
  if (!topicSlugs.has(q.topic)) throw new Error(`موضوع غير معروف "${q.topic}" في ${q.id}`);
  if (!Array.isArray(q.options) || q.options.length !== 4)
    throw new Error(`عدد الخيارات ليس 4 في ${q.id}`);
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3)
    throw new Error(`إجابة غير صالحة في ${q.id}`);
  if (!q.explanation) throw new Error(`لا يوجد شرح في ${q.id}`);
  if (![1, 2, 3].includes(q.difficulty)) throw new Error(`صعوبة غير صالحة في ${q.id}`);
}

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;

mkdirSync('supabase/seed', { recursive: true });

let sql = 'begin;\n';
for (const s of sections) {
  sql += `insert into public.pl_sections (slug, title, short_title, description, icon, color, sort) values (${q(s.slug)}, ${q(s.title)}, ${q(s.short_title)}, ${q(s.description)}, ${q(s.icon)}, ${q(s.color)}, ${s.order}) on conflict (slug) do update set title = excluded.title, short_title = excluded.short_title, description = excluded.description, icon = excluded.icon, color = excluded.color, sort = excluded.sort;\n`;
}
for (const t of topics) {
  sql += `insert into public.pl_topics (slug, section_slug, title, sort, notes) values (${q(t.slug)}, ${q(t.section)}, ${q(t.title)}, ${t.order}, ${q(t.notes)}) on conflict (slug) do update set section_slug = excluded.section_slug, title = excluded.title, sort = excluded.sort, notes = excluded.notes;\n`;
}
sql += 'commit;\n';
writeFileSync('supabase/seed/01_sections_topics.sql', sql);

const BATCH = 45;
let fileIdx = 0;
for (let i = 0; i < questions.length; i += BATCH) {
  fileIdx++;
  const batch = questions.slice(i, i + BATCH);
  let s = 'begin;\n';
  for (const it of batch) {
    s += `insert into public.pl_questions (id, topic_slug, difficulty, stem, options, answer, explanation) values (${q(it.id)}, ${q(it.topic)}, ${it.difficulty}, ${q(it.stem)}, ${q(JSON.stringify(it.options))}::jsonb, ${it.answer}, ${q(it.explanation)}) on conflict (id) do update set topic_slug = excluded.topic_slug, difficulty = excluded.difficulty, stem = excluded.stem, options = excluded.options, answer = excluded.answer, explanation = excluded.explanation;\n`;
  }
  s += 'commit;\n';
  writeFileSync(`supabase/seed/02_questions_${String(fileIdx).padStart(2, '0')}.sql`, s);
}

mkdirSync('src/data', { recursive: true });
writeFileSync(
  'src/data/bank.json',
  JSON.stringify({ sections, topics, questions }, null, 0)
);

console.log(`generated: ${sections.length} sections, ${topics.length} topics, ${questions.length} questions in ${fileIdx} SQL batches`);
