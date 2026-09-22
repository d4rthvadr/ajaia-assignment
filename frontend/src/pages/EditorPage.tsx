import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  ChevronDown,
  Download,
  FileUp,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Paperclip,
  Share2,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { api, ApiError, type Attachment, type ShareUser } from "../lib/api";
import { Button, FieldLabel, TextInput } from "../components/ui/button";

const SAVE_DEBOUNCE_MS = 1500;
const POLL_INTERVAL_MS = 3000;

export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [canEdit, setCanEdit] = useState(true);
  const [shares, setShares] = useState<ShareUser[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [shareEmail, setShareEmail] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const lastKnownVersion = useRef(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const uploadInput = useRef<HTMLInputElement>(null);
  const importInput = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editable: true,
    onUpdate: ({ editor: currentEditor }) => {
      if (!id || !canEdit) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        const { document } = await api.saveDocument(
          id,
          currentEditor.getHTML(),
        );
        lastKnownVersion.current = document.version;
      }, SAVE_DEBOUNCE_MS);
    },
  });

  useEffect(() => {
    if (!id || !editor) return;
    api
      .getDocument(id)
      .then(({ document }) => {
        const editable = document.access !== "shared";
        setCanEdit(editable);
        editor.setEditable(editable);
        editor.commands.setContent(document.content || "", {
          emitUpdate: false,
        });
        lastKnownVersion.current = document.version;
        api
          .getAttachments(id)
          .then(({ attachments: loadedAttachments }) =>
            setAttachments(loadedAttachments),
          );
        if (editable) {
          api.getShares(id).then(({ users }) => setShares(users));
        }
        setStatus("ready");
      })
      .catch((error) => {
        setActionError(
          error instanceof ApiError && error.status === 403
            ? "You do not have access to this document. Open it from Shared with me while signed in as the recipient."
            : error instanceof ApiError
              ? error.message
              : "Unable to load this document.",
        );
        setStatus("error");
      });
  }, [editor, id]);

  async function handleShare(event: React.FormEvent) {
    event.preventDefault();
    if (!id || !shareEmail.trim()) return false;
    setActionError(null);
    setActionMessage(null);
    try {
      await api.shareDocument(id, shareEmail.trim());
      const { users } = await api.getShares(id);
      setShares(users);
      setShareEmail("");
      setActionMessage("Access granted.");
      return true;
    } catch (error) {
      setActionError(
        error instanceof ApiError ? error.message : "Unable to grant access",
      );
      return false;
    }
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!id || !file) return;
    setActionError(null);
    setActionMessage(null);
    try {
      const { attachment } = await api.uploadAttachment(id, file);
      setAttachments((current) => [attachment, ...current]);
      setActionMessage("Attachment uploaded.");
    } catch (error) {
      setActionError(
        error instanceof ApiError
          ? error.message
          : "Unable to upload attachment",
      );
    }
    event.target.value = "";
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!id || !file) return;
    setActionError(null);
    setActionMessage(null);
    try {
      const { document } = await api.importFile(id, file);
      editor?.commands.setContent(document.content || "", {
        emitUpdate: false,
      });
      lastKnownVersion.current = document.version;
      setActionMessage("Document imported.");
    } catch (error) {
      setActionError(
        error instanceof ApiError ? error.message : "Unable to import document",
      );
    }
    event.target.value = "";
  }

  useEffect(() => {
    if (!id || !editor) return;
    const interval = setInterval(async () => {
      try {
        const { document } = await api.getDocument(id);
        if (document.version > lastKnownVersion.current && !editor.isFocused) {
          lastKnownVersion.current = document.version;
          editor.commands.setContent(document.content || "", {
            emitUpdate: false,
          });
        }
      } catch {
        // Keep the current document visible if a background poll fails.
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [editor, id]);

  if (status === "loading")
    return (
      <main className="page-shell">
        <p className="empty-state">Loading document...</p>
      </main>
    );
  if (status === "error" || !editor)
    return (
      <main className="page-shell">
        <p className="alert">
          {actionError ?? "Unable to load this document."}
        </p>
        <Link className="button button-secondary" to="/documents">
          Back to documents
        </Link>
      </main>
    );

  return (
    <main className="editor-shell">
      <header className="editor-topbar">
        <Link className="brand" to="/documents">
          Draftroom
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          <Link className="nav-link" to="/documents">
            Documents
          </Link>
          {canEdit && (
            <Dialog.Root open={shareOpen} onOpenChange={setShareOpen}>
              <Dialog.Trigger asChild>
                <Button variant="secondary" size="sm">
                  <Share2 size={15} /> Share
                </Button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="dialog-overlay" />
                <Dialog.Content className="dialog-content">
                  <Dialog.Title className="dialog-title">
                    Share this document
                  </Dialog.Title>
                  <Dialog.Description className="dialog-description">
                    Give an existing user view-only access.
                  </Dialog.Description>
                  <form
                    className="share-form"
                    onSubmit={async (event) => {
                      const shared = await handleShare(event);
                      if (shared) setShareOpen(false);
                    }}
                  >
                    <FieldLabel htmlFor="share-email-dialog">
                      User email
                    </FieldLabel>
                    <div className="input-row">
                      <TextInput
                        id="share-email-dialog"
                        type="email"
                        value={shareEmail}
                        onChange={(event) => setShareEmail(event.target.value)}
                        placeholder="reader@example.com"
                        required
                      />
                      <Button type="submit">Grant access</Button>
                    </div>
                  </form>
                  {shares.length > 0 && (
                    <ul className="share-list">
                      {shares.map((share) => (
                        <li key={share.id}>{share.email}</li>
                      ))}
                    </ul>
                  )}
                  <Dialog.Close asChild>
                    <Button variant="ghost" size="sm" className="dialog-close">
                      Done
                    </Button>
                  </Dialog.Close>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          )}
          <span className="save-status">
            {canEdit ? "Saved automatically" : "View only"}
          </span>
        </nav>
      </header>
      <section className="editor-page">
        <p className="eyebrow">Working document</p>
        <h1>Document</h1>
        <p className="editor-hint">
          {canEdit
            ? "Shape the rough edges. Changes save as you write."
            : "You have view-only access to this document."}
        </p>
        {canEdit && (
          <div className="editor-toolbar" aria-label="Formatting tools">
            <Button
              variant="ghost"
              size="icon"
              className={
                editor.isActive("bold") ? "tool-button active" : "tool-button"
              }
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="Bold"
              aria-label="Bold"
            >
              <Bold size={17} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={
                editor.isActive("italic") ? "tool-button active" : "tool-button"
              }
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="Italic"
              aria-label="Italic"
            >
              <Italic size={17} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={
                editor.isActive("heading", { level: 2 })
                  ? "tool-button active"
                  : "tool-button"
              }
              type="button"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              title="Heading"
              aria-label="Heading"
            >
              <Heading2 size={17} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={
                editor.isActive("bulletList")
                  ? "tool-button active"
                  : "tool-button"
              }
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              title="Bulleted list"
              aria-label="Bulleted list"
            >
              <List size={17} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={
                editor.isActive("orderedList")
                  ? "tool-button active"
                  : "tool-button"
              }
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              title="Numbered list"
              aria-label="Numbered list"
            >
              <ListOrdered size={17} />
            </Button>
          </div>
        )}
        <EditorContent editor={editor} className="editor-content" />
        {(actionError || actionMessage) && (
          <p className={actionError ? "alert" : "action-message"} role="status">
            {actionError ?? actionMessage}
          </p>
        )}
        <div className="editor-panels">
          <section className="editor-panel">
            <div className="panel-heading">
              <div className="panel-title">
                <Paperclip size={16} aria-hidden="true" />
                <h2>Attachments</h2>
              </div>
              <span>
                {attachments.length} file{attachments.length === 1 ? "" : "s"}
              </span>
            </div>
            {canEdit && (
              <div className="file-actions">
                <input
                  ref={uploadInput}
                  className="visually-hidden"
                  type="file"
                  accept=".txt,.md,text/plain,text/markdown"
                  onChange={handleUpload}
                />
                <input
                  ref={importInput}
                  className="visually-hidden"
                  type="file"
                  accept=".txt,.md,text/plain,text/markdown"
                  onChange={handleImport}
                />
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <Button variant="secondary" size="sm">
                      <FileUp size={16} /> File actions{" "}
                      <ChevronDown size={14} />
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      className="dropdown-content"
                      align="start"
                    >
                      <DropdownMenu.Item
                        className="dropdown-item"
                        onSelect={() => {
                          uploadInput.current?.click();
                        }}
                      >
                        Upload file
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        className="dropdown-item"
                        onSelect={() => {
                          importInput.current?.click();
                        }}
                      >
                        Import as content
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </div>
            )}
            {attachments.length > 0 ? (
              <ul className="attachment-list">
                {attachments.map((attachment) => (
                  <li key={attachment.id}>
                    <span>{attachment.filename}</span>
                    <a href={api.attachmentDownloadUrl(attachment.id)}>
                      <Download size={14} aria-hidden="true" />
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-state">No attachments yet.</p>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
