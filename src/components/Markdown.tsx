import { Fragment, type ReactNode } from 'react'

// A tiny, dependency-free renderer for the subset of Markdown used in notes:
// ## / ### headings, **bold**, "- " bullet lists, and | pipe | tables.

function renderInline(text: string, keyBase: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return <strong key={`${keyBase}-b${i}`}>{p.slice(2, -2)}</strong>
    }
    return <Fragment key={`${keyBase}-t${i}`}>{p}</Fragment>
  })
}

export function Markdown({ source }: { source: string }) {
  const lines = source.split('\n')
  const out: ReactNode[] = []
  let list: string[] = []
  let table: string[] = []
  let k = 0

  const flushList = () => {
    if (!list.length) return
    const items = list
    out.push(
      <ul key={`ul${k++}`}>
        {items.map((li, i) => (
          <li key={i}>{renderInline(li, `li${k}-${i}`)}</li>
        ))}
      </ul>
    )
    list = []
  }

  const flushTable = () => {
    if (!table.length) return
    const rows = table
      .map((r) => r.trim().replace(/^\|/, '').replace(/\|$/, ''))
      .map((r) => r.split('|').map((c) => c.trim()))
    const header = rows[0]
    const body = rows.slice(2) // skip the |---| separator row
    out.push(
      <div key={`tw${k++}`} style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              {header.map((c, i) => (
                <th key={i}>{renderInline(c, `th${k}-${i}`)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, ri) => (
              <tr key={ri}>
                {row.map((c, ci) => (
                  <td key={ci}>{renderInline(c, `td${k}-${ri}-${ci}`)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
    table = []
  }

  for (const raw of lines) {
    const line = raw.trimEnd()
    if (line.startsWith('|')) {
      flushList()
      table.push(line)
      continue
    }
    flushTable()
    if (line.startsWith('### ')) {
      flushList()
      out.push(<h3 key={`h${k++}`}>{renderInline(line.slice(4), `h${k}`)}</h3>)
    } else if (line.startsWith('## ')) {
      flushList()
      out.push(<h2 key={`h${k++}`}>{renderInline(line.slice(3), `h${k}`)}</h2>)
    } else if (line.startsWith('- ')) {
      list.push(line.slice(2))
    } else if (line.trim() === '') {
      flushList()
    } else {
      flushList()
      out.push(<p key={`p${k++}`}>{renderInline(line, `p${k}`)}</p>)
    }
  }
  flushList()
  flushTable()

  return <div className="prose-ar">{out}</div>
}
