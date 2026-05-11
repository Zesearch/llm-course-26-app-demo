import { Trash2 } from 'lucide-react'
import styles from './DatasetPreview.module.css'

export default function DatasetPreview({ dataset, onReset }) {
  return (
    <div className={styles.panel}>
      <div className={styles.top}>
        <div>
          <p className={styles.filename}>{dataset.filename}</p>
          <p className={styles.stats}>
            {dataset.rows.toLocaleString()} rows · {dataset.columns} columns
          </p>
        </div>
        <button className={styles.reset} onClick={onReset} title="Remove dataset">
          <Trash2 size={14} />
        </button>
      </div>

      <div className={styles.cols}>
        {dataset.column_info.map(col => (
          <div key={col.name} className={styles.col}>
            <span className={styles.colName}>{col.name}</span>
            <span className={styles.colType}>{col.dtype}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
