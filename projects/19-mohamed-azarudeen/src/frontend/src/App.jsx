import { useState } from 'react'
import Header from './components/Header.jsx'
import ConfigPanel from './components/ConfigPanel.jsx'
import UploadZone from './components/UploadZone.jsx'
import DatasetPreview from './components/DatasetPreview.jsx'
import QueryPanel from './components/QueryPanel.jsx'
import ResultPanel from './components/ResultPanel.jsx'
import styles from './App.module.css'

const MODELS = [
  { value: 'llama3.1:8b',      label: 'Llama 3.1 8B' },
  { value: 'llama3.2:latest',  label: 'Llama 3.2' },
  { value: 'deepseek-r1:7b',   label: 'DeepSeek R1 7B' },
  { value: 'qwen2.5:7b',       label: 'Qwen 2.5 7B' },
  { value: 'mistral:latest',   label: 'Mistral' },
  { value: 'qwen2.5-coder:7b', label: 'Qwen 2.5 Coder 7B' },
]

export default function App() {
  const [config, setConfig] = useState({ e2bKey: '', model: MODELS[0].value })
  const [dataset, setDataset] = useState(null)   // DatasetMeta from API
  const [result, setResult]   = useState(null)   // AnalysisResult from API
  const [history, setHistory] = useState([])     // [{query, result}]

  function handleResult(query, res) {
    setResult(res)
    setHistory(h => [{ query, result: res }, ...h].slice(0, 12))
  }

  return (
    <div className={styles.app}>
      <Header />

      <div className={styles.layout}>
        {/* ── LEFT RAIL ── */}
        <aside className={styles.sidebar}>
          <ConfigPanel
            config={config}
            setConfig={setConfig}
            models={MODELS}
          />

          {!dataset ? (
            <UploadZone onDataset={setDataset} />
          ) : (
            <DatasetPreview
              dataset={dataset}
              onReset={() => { setDataset(null); setResult(null); setHistory([]) }}
            />
          )}
        </aside>

        {/* ── MAIN AREA ── */}
        <main className={styles.main}>
          <QueryPanel
            disabled={!dataset || !config.e2bKey}
            sessionId={dataset?.session_id}
            config={config}
            onResult={handleResult}
          />

          {result && (
            <ResultPanel result={result} />
          )}

          {history.length > 1 && (
            <HistoryBar history={history} onSelect={r => setResult(r.result)} />
          )}
        </main>
      </div>
    </div>
  )
}

function HistoryBar({ history, onSelect }) {
  return (
    <section style={{ marginTop: '2rem' }}>
      <h3 style={{ color: 'var(--muted)', fontSize: '.75rem', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.75rem' }}>
        Query History
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
        {history.map((h, i) => (
          <button
            key={i}
            onClick={() => onSelect(h)}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--muted)',
              fontFamily: 'var(--mono)',
              fontSize: '.75rem',
              padding: '.5rem .75rem',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'border-color .15s, color .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
          >
            {h.query}
          </button>
        ))}
      </div>
    </section>
  )
}
