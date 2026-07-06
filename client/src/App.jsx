import { useState } from "react";
import SF from "./components/SF.jsx";
import UrlList from "./components/UrlList.jsx";
import styles from "./App.module.css";

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  function handleShortened() {
    
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className={styles.app}>
      {/* Background orbs */}
      <div className={styles.orb1} />
      <div className={styles.orb2} />

      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>⌁</span>
            <span className={styles.logoText}>snip</span>
          </div>
          <p className={styles.tagline}>
            Shorten URLs. Track clicks. Stay sharp.
          </p>
        </header>

        {/* Hero stat bar */}
        <div className={styles.statBar}>
          <div className={styles.statItem}>
            <span className={styles.statDot} style={{ background: "#7c6aff" }} />
            <span>nanoid — 7-char unique codes</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statDot} style={{ background: "#4ade80" }} />
            <span>Click tracking</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statDot} style={{ background: "#ff6a6a" }} />
            <span>Custom aliases</span>
          </div>
        </div>

        {/* Main form */}
        <section className={styles.formSection}>
          <SF onShortened={handleShortened} />
        </section>

        {/* URL List */}
        <section className={styles.listSection}>
          <UrlList refreshKey={refreshKey} />
        </section>

        <footer className={styles.footer}>
          <span>Built with Node.js · Express · MongoDB · React · Vite</span>
        </footer>
      </div>
    </div>
  );
}