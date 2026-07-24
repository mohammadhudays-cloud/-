import type { Question } from '../lib/types'
import { Badge, difficultyLabel, difficultyTone } from './ui'
import { Markdown } from './Markdown'

const OPTION_LABELS = ['أ', 'ب', 'ج', 'د']

interface Props {
  question: Question
  chosen: number | null
  onChoose: (i: number) => void
  // when revealed, show correct/incorrect colouring + explanation
  revealed: boolean
  index?: number
  total?: number
  showExplanation?: boolean
}

export function QuestionCard({
  question,
  chosen,
  onChoose,
  revealed,
  index,
  total,
  showExplanation = true,
}: Props) {
  return (
    <div className="animate-slideup">
      <div className="mb-3 flex items-center justify-between gap-2">
        {typeof index === 'number' && typeof total === 'number' ? (
          <span className="text-sm font-bold text-muted tabular">
            سؤال {index + 1} من {total}
          </span>
        ) : (
          <span />
        )}
        <Badge tone={difficultyTone(question.difficulty)}>{difficultyLabel(question.difficulty)}</Badge>
      </div>

      <h2 className="mb-5 text-lg font-bold leading-loose">{question.stem}</h2>

      <div className="grid gap-2.5">
        {question.options.map((opt, i) => {
          const isCorrect = i === question.answer
          const isChosen = i === chosen
          let cls =
            'border-app surface hover:border-brand-400 hover:bg-brand-50/40 dark:hover:bg-brand-900/20'
          let labelCls = 'bg-black/5 dark:bg-white/10 text-muted'

          if (revealed) {
            if (isCorrect) {
              cls = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/25'
              labelCls = 'bg-emerald-500 text-white'
            } else if (isChosen) {
              cls = 'border-rose-500 bg-rose-50 dark:bg-rose-900/25'
              labelCls = 'bg-rose-500 text-white'
            } else {
              cls = 'border-app surface opacity-70'
            }
          } else if (isChosen) {
            cls = 'border-brand-500 bg-brand-50 dark:bg-brand-900/25 ring-1 ring-brand-500'
            labelCls = 'bg-brand-600 text-white'
          }

          return (
            <button
              key={i}
              disabled={revealed}
              onClick={() => onChoose(i)}
              className={`flex items-center gap-3 rounded-xl border p-3.5 text-right transition ${cls} disabled:cursor-default`}
            >
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-extrabold ${labelCls}`}
              >
                {OPTION_LABELS[i]}
              </span>
              <span className="font-semibold leading-relaxed">{opt}</span>
              {revealed && isCorrect && <span className="mr-auto text-emerald-600">✓</span>}
              {revealed && isChosen && !isCorrect && <span className="mr-auto text-rose-600">✗</span>}
            </button>
          )
        })}
      </div>

      {revealed && showExplanation && (
        <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50/60 p-4 dark:border-brand-800 dark:bg-brand-900/20 animate-pop">
          <div className="mb-1 flex items-center gap-2 font-bold text-brand-700 dark:text-brand-300">
            <span>💡</span> الشرح
          </div>
          <div className="text-[0.95rem] leading-loose">
            <Markdown source={question.explanation} />
          </div>
        </div>
      )}
    </div>
  )
}
