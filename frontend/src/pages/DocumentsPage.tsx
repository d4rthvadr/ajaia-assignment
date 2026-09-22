import { useEffect, useState } from "react";
import { FilePlus2, LogOut, Plus, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api, ApiError, type DocumentSummary } from "../lib/api";
import { Button, StatusBadge, TextInput } from "../components/ui/button";

function DocumentRow({ document }: { document: DocumentSummary }) {
  return (
    <Link className="document-row" to={`/doc/${document.id}`}>
      <span className="document-icon" aria-hidden="true">
        <FilePlus2 size={18} />
      </span>
      <span className="document-row-copy">
        <strong>{document.title}</strong>
        <small>
          Updated {new Date(document.updatedAt).toLocaleDateString()}
        </small>
      </span>
      {document.access === "shared" && (
        <StatusBadge className="badge-outline">Shared</StatusBadge>
      )}
    </Link>
  );
}

export function DocumentsPage() {
  const [owned, setOwned] = useState<DocumentSummary[]>([]);
  const [shared, setShared] = useState<DocumentSummary[]>([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.getDocuments(), api.getSharedDocuments()])
      .then(([ownedResponse, sharedResponse]) => {
        setOwned(ownedResponse.documents);
        setShared(sharedResponse.documents);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          navigate("/login", { replace: true });
          return;
        }
        setError(
          err instanceof ApiError ? err.message : "Unable to load documents",
        );
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const { document } = await api.createDocument(title.trim() || undefined);
      navigate(`/doc/${document.id}`);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Unable to create document",
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleLogout() {
    await api.logout();
    navigate("/login", { replace: true });
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <Link className="brand" to="/documents">
          Draftroom
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          <Link className="nav-link active" to="/documents">
            Documents
          </Link>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={handleLogout}
            title="Log out"
          >
            <LogOut size={16} /> Log out
          </Button>
        </nav>
      </header>

      <section className="page-heading">
        <div>
          <p className="eyebrow">Your workspace</p>
          <h1>Documents</h1>
          <p className="lede">
            Keep your ideas close, and your shared work in view.
          </p>
        </div>
        <form className="create-form" onSubmit={handleCreate}>
          <label htmlFor="document-title">New document</label>
          <div className="input-row">
            <TextInput
              id="document-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Untitled document"
            />
            <Button type="submit" disabled={creating}>
              <Plus size={17} />
              {creating ? "Creating" : "Create"}
            </Button>
          </div>
        </form>
      </section>

      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}
      {loading ? (
        <p className="empty-state">Loading documents...</p>
      ) : (
        <div className="document-sections">
          <section className="document-section">
            <div className="section-heading">
              <h2>My documents</h2>
              <StatusBadge className="badge-secondary">
                {owned.length}
              </StatusBadge>
            </div>
            {owned.length > 0 ? (
              owned.map((document) => (
                <DocumentRow key={document.id} document={document} />
              ))
            ) : (
              <p className="empty-state">Your next document starts here.</p>
            )}
          </section>

          <section className="document-section">
            <div className="section-heading">
              <div className="section-title-with-icon">
                <Users size={17} />
                <h2>Shared with me</h2>
              </div>
              <StatusBadge className="badge-outline">
                {shared.length}
              </StatusBadge>
            </div>
            {shared.length > 0 ? (
              shared.map((document) => (
                <DocumentRow key={document.id} document={document} />
              ))
            ) : (
              <p className="empty-state">
                Documents shared with you will appear here.
              </p>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
