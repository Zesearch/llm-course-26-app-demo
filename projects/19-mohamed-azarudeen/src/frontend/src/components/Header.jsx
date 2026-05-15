import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>◈</span>
          <span className={styles.logoText}>DataLens<span className={styles.logoAi}>AI</span></span>
        </div>
        <p className={styles.tagline}>Natural language → instant insight</p>
        <div className={styles.pill}>v2.0 · Local LLM · Sandboxed</div>
      </div>
    </header>
  )
}
