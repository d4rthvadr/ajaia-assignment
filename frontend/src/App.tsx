import { Navigate, Route, Routes } from "react-router-dom";
import { AuthPage } from "./pages/AuthPage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { EditorPage } from "./pages/EditorPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/documents" element={<DocumentsPage />} />
      <Route path="/doc/:id" element={<EditorPage />} />
      <Route path="*" element={<Navigate to="/documents" replace />} />
    </Routes>
  );
}

export default App;
