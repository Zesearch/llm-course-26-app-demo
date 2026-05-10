import { useState } from 'react'
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import styles from './ResultPanel.module.css'

const TABS = ['Chart', 'Code', 'LLM Response']

export default function ResultPanel({ result }) {
  const [tab, setTab] = useState('Chart')
  const [showRaw, setShowRaw] = useState(false)

  const hasChart = !!result.chart_base64
  const hasError = !!result.error

  return (
    <div className={styles.panel}>
      {/* Status bar */}
      <div className={styles.statusBar}>
        <div className={styles.statusLeft}>
          {hasError
            ? <><XCircle size={14} className={styles.iconRed} /> Execution error</>
            : <><CheckCircle size={14} className={styles.iconGreen} /> Analysis complete</>
          }
        </div>
        <div className={styles.statusRight}>
          <Clock size={12} />
          <span>{result.execution_time_ms} ms</span>
          <span className={styles.modelBadge}>{result.model}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className={styles.content}>
        {tab === 'Chart' && (
          <div className={styles.chartArea}>
            {hasChart ? (
              <img
                src={`data:image/png;base64,${result.chart_base64}`}
                alt="Generated chart"
                className={styles.chart}
              />
            ) : result.stdout ? (
              <pre className={styles.stdout}>{result.stdout}</pre>
            ) : hasError ? (
              <div className={styles.errorBox}>
                <XCircle size={20} className={styles.iconRed} />
                <pre className={styles.errorText}>{result.error}</pre>
              </div>
            ) : (
              <p className={styles.empty}>No visual output produced.</p>
            )}
          </div>
        )}

        {tab === 'Code' && (
          <div className={styles.codeWrap}>
            <pre className={styles.code}><code>{result.extracted_code}</code></pre>
          </div>
        )}

        {tab === 'LLM Response' && (
          <div className={styles.llmWrap}>
            <p className={styles.llmText}>{result.llm_response}</p>
          </div>
        )}
      </div>

      {/* Collapsible error detail when on chart tab */}
      {hasError && tab === 'Chart' && (
        <div className={styles.errorDetail}>
          <button
            className={styles.toggle}
            onClick={() => setShowRaw(s => !s)}
          >
            {showRaw ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {showRaw ? 'Hide' : 'Show'} error detail
          </button>
          {showRaw && <pre className={styles.errorText}>{result.error}</pre>}
        </div>
      )}
    </div>
  )
}
