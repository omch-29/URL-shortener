import { useState } from "react";
import { api } from "../api.js";
import styles from "./ShortenForm.module.css";

export default function ShortenForm({ onShortened }) {
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await api.shorten(url.trim(), customCode.trim());
      setResult(data);
      onShortened?.(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleReset() {
    setResult(null);
    setUrl("");
    setCustomCode("");
    setError("");
  }

  return (
    <div className={styles.wrapper}>
      {!result ? (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.mainInput}>
            <span className={styles.linkIcon}>⌁</span>
            <input
              type="text"
              placeholder="Paste your long URL here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={styles.urlInput}
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className={styles.submitBtn}
            >
              {loading ? <span className={styles.spinner} /> : "Snip →"}
            </button>
          </div>

          <div className={styles.options}>
            <button
              type="button"
              className={styles.toggleCustom}
              onClick={() => setShowCustom((v) => !v)}
            >
              {showCustom ? "− Hide" : "+ Custom alias"}
            </button>

            {showCustom && (
              <div className={styles.customRow}>
                <span className={styles.prefix}>snip.io/</span>
                <input
                  type="text"
                  placeholder="my-brand"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  className={styles.customInput}
                  maxLength={30}
                />
              </div>
            )}
          </div>

          {error && <p className={styles.error}>⚠ {error}</p>}
        </form>
      ) : (
        <div className={styles.result}>
          <div className={styles.resultHeader}>
            <span className={styles.checkmark}>✓</span>
            <p className={styles.resultLabel}>URL shortened successfully</p>
          </div>

          <div className={styles.shortUrlBox}>
            <span className={styles.shortUrl}>{result.shortUrl}</span>
            <button
              onClick={handleCopy}
              className={`${styles.copyBtn} ${copied ? styles.copied : ""}`}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <div className={styles.original}>
            <span className={styles.originalLabel}>Original:</span>
            <span className={styles.originalUrl}>{result.originalUrl}</span>
          </div>

          <button onClick={handleReset} className={styles.newBtn}>
            + Shorten another
          </button>
        </div>
      )}
    </div>
  );
}