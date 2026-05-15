import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, Loader } from 'lucide-react'
import { uploadDataset } from '../lib/api.js'
import styles from './UploadZone.module.css'

export default function UploadZone({ onDataset }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const onDrop = useCallback(async (accepted) => {
    if (!accepted.length) return
    setError(null)
    setLoading(true)
    try {
      const meta = await uploadDataset(accepted[0])
      onDataset(meta)
    } catch (e) {
      setError(e?.response?.data?.detail ?? 'Upload failed.')
    } finally {
      setLoading(false)
    }
  }, [onDataset])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
    disabled: loading,
  })

  return (
    <div
      {...getRootProps()}
      className={`${styles.zone} ${isDragActive ? styles.active : ''} ${loading ? styles.loading : ''}`}
    >
      <input {...getInputProps()} />
      {loading
        ? <Loader size={28} className={styles.spinner} />
        : <UploadCloud size={28} className={styles.icon} />
      }
      <p className={styles.primary}>
        {isDragActive ? 'Drop it!' : loading ? 'Uploading…' : 'Drop a CSV here'}
      </p>
      <p className={styles.secondary}>or click to browse · max 50 MB</p>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}
