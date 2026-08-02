import { useState, useEffect, useCallback } from "react";
import { api } from "../api.js";
import styles from "./UrlList.module.css";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function truncate(str, max = 40) {
  return str.length > max ? str.slice(0, max) + "…" : str;
}

export default function UrlList({ refreshKey }) {
  const [data, setData] = useState({ urls: [], total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deletingCode, setDeletingCode] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.getAll(page, 8);
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load, refreshKey]);

  async function handleDelete(code) {
    if (!confirm(`Delete /${code}?`)) return;
    setDeletingCode(code);
    try {
      await api.delete(code);
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingCode(null);
    }
  }

  async function handleCopy(shortUrl, code) {
    await navigator.clipboard.writeText(shortUrl);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  if (loading && data.urls.length === 0) {
    return (
      <div className={styles.loading}>
        <span className={styles.loadDot} /><span className={styles.loadDot} /><span className={styles.loadDot} />
      </div>
    );
  }

  if (!loading && data.urls.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>∅</span>
        <p>No URLs shortened yet. Start above!</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Recent Links</h2>
        <span className={styles.count}>{data.total} total</span>
      </div>

      <div className={styles.list}>
        {data.urls.map((url, i) => (
          <div
            key={url.shortCode}
            className={styles.item}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className={styles.itemMain}>
              <a
                href={url.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.code}
              >
                /{url.shortCode}
              </a>
              <span className={styles.original} title={url.originalUrl}>
                {truncate(url.originalUrl, 45)}
              </span>
            </div>

            <div className={styles.itemMeta}>
              <span className={styles.stat}>
                <span className={styles.statIcon}>↗</span>
                {url.clicks} click{url.clicks !== 1 ? "s" : ""}
              </span>
              <span className={styles.time}>{timeAgo(url.createdAt)}</span>
            </div>

            <div className={styles.actions}>
              <button
                className={`${styles.actionBtn} ${copiedCode === url.shortCode ? styles.copied : ""}`}
                onClick={() => handleCopy(url.shortUrl, url.shortCode)}
                title="Copy short URL"
              >
                {copiedCode === url.shortCode ? "✓" : "⎘"}
              </button>
              <button
                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                onClick={() => handleDelete(url.shortCode)}
                disabled={deletingCode === url.shortCode}
                title="Delete"
              >
                {deletingCode === url.shortCode ? "…" : "✕"}
              </button>
            </div>
          </div>
        ))}
      </div>


      {data.totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Prev
          </button>
          <span className={styles.pageInfo}>{page} / {data.totalPages}</span>
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

