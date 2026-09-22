import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";

const SAVE_DEBOUNCE_MS = 1500;
const POLL_INTERVAL_MS = 3000;

// Tracer bullet: plain textarea, no Tiptap/shadcn polish yet - proves autosave + poll wiring.
export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const lastKnownVersion = useRef(0);
  const isFocused = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!id) return;
    api.getDocument(id).then(({ document }) => {
      setContent(document.content);
      lastKnownVersion.current = document.version;
      setStatus("ready");
    });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const interval = setInterval(async () => {
      const { document } = await api.getDocument(id);
      if (document.version > lastKnownVersion.current) {
        lastKnownVersion.current = document.version;
        if (!isFocused.current) {
          setContent(document.content);
        }
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [id]);

  function handleChange(value: string) {
    setContent(value);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      if (!id) return;
      const { document } = await api.saveDocument(id, value);
      lastKnownVersion.current = document.version;
    }, SAVE_DEBOUNCE_MS);
  }

  if (status === "loading") return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 640, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Document</h1>
      <textarea
        value={content}
        onFocus={() => (isFocused.current = true)}
        onBlur={() => (isFocused.current = false)}
        onChange={(e) => handleChange(e.target.value)}
        rows={20}
        style={{ width: "100%", fontFamily: "monospace", fontSize: 14 }}
      />
    </div>
  );
}
