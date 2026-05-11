import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import styles from './ConfigPanel.module.css'

export default function ConfigPanel({ config, setConfig, models }) {
  const [show, setShow] = useState(false)

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>⚙ Configuration</h2>

      <label className={styles.label}>
        E2B API Key
        <div className={styles.inputRow}>
          <input
            className={styles.input}
            type={show ? 'text' : 'password'}
            placeholder="e2b_••••••••"
            value={config.e2bKey}
            onChange={e => setConfig(c => ({ ...c, e2bKey: e.target.value }))}
          />
          <button className={styles.toggle} onClick={() => setShow(s => !s)} title="Toggle visibility">
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </label>

      <label className={styles.label}>
        Model
        <select
          className={styles.select}
          value={config.model}
          onChange={e => setConfig(c => ({ ...c, model: e.target.value }))}
        >
          {models.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </label>

      {!config.e2bKey && (
        <p className={styles.warn}>↑ Enter your E2B key to enable analysis</p>
      )}
    </div>
  )
}
