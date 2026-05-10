import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { runAnalysis } from '../lib/api.js'
import styles from './QueryPanel.module.css'

const SUGGESTIONS = [
  'Show the distribution of values in each numeric column',
  'Plot a correlation heatmap',
  'Show top 10 categories by count',
  'Display a time series trend if date column exists',
  'Show a scatter plot of two numeric columns',
]

export default function QueryPanel({ disabled, sessionId, config, onResult }) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function submit() {
    if (!query.trim() || loading || disabled) return
    setError(null)
    setLoading(true)
    try {
      const res = await runAnalysis({
        sessionId,
        query,
        model: config.model,
        e2bApiKey: config.e2bKey,
      })
      onResult(query, res)
    } catch (e) {
  const detail = e?.response?.data?.detail
  if (Array.isArray(detail)) {
    // FastAPI validation error — extract the messages
    setError(detail.map(d => d.msg).join(', '))
  } else if (typeof detail === 'string') {
    setError(detail)
  } else {
    setError(e?.message ?? 'Analysis failed.')
  }
} finally {
      setLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit()
  }

  return (
    <div className={styles.panel}>
      <div className={styles.top}>
        <Sparkles size={16} className={styles.sparkle} />
        <span className={styles.label}>Ask anything about your data</span>
      </div>

      <textarea
        className={styles.textarea}
        rows={3}
        placeholder={disabled ? 'Upload a dataset and enter your E2B key to get started…' : 'e.g. Show me sales by region as a bar chart'}
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleKey}
        disabled={disabled || loading}
      />

      {/* Suggestion chips */}
      {!disabled && !loading && (
        <div className={styles.chips}>
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              className={styles.chip}
              onClick={() => setQuery(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className={styles.bottom}>
        {error && <p className={styles.error}>{String(error)}</p>}
        <div style={{ flex: 1 }} />
        <span className={styles.hint}>⌘ Enter to run</span>
        <button
          className={styles.btn}
          onClick={submit}
          disabled={disabled || loading || !query.trim()}
        >
          {loading
            ? <><Loader2 size={15} className={styles.spin} /> Analyzing…</>
            : <><Sparkles size={15} /> Analyze</>
          }
        </button>
      </div>
    </div>
  )
}
