import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UniverseProvider } from "@/hooks/useUniverse";
import { PersonaViewer } from "@/pages/PersonaViewer";
import { PoliciesViewer } from "@/pages/PoliciesViewer";
import { ToolsViewer } from "@/pages/ToolsViewer";

export default function App() {
  return (
    <UniverseProvider>
      <TooltipProvider delayDuration={200}>
        <AppShell>
          <Routes>
            <Route path="/" element={<Navigate to="/persona" replace />} />
            <Route path="/persona" element={<PersonaViewer />} />
            <Route path="/persona/:personaId" element={<PersonaViewer />} />
            <Route path="/policies" element={<PoliciesViewer />} />
            <Route path="/policies/:docId" element={<PoliciesViewer />} />
            <Route path="/tools" element={<ToolsViewer />} />
            <Route path="/tools/:toolName" element={<ToolsViewer />} />
            <Route path="*" element={<Navigate to="/persona" replace />} />
          </Routes>
        </AppShell>
      </TooltipProvider>
    </UniverseProvider>
  );
}
