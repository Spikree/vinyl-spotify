import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Toaster } from "@/components/ui/sonner";
import Gradient from "./components/shared/Gradient";
import Login from "./pages/Login";
import CallbackHandler from "./components/CallbackHandler";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import PlayerPage from "./pages/PlayerPage";

const queryClient = new QueryClient();

function App() {
  const isAuthenticated = !!localStorage.getItem("spotify_access_token");

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Gradient />
            <Routes>
              <Route
                path="/"
                element={
                  isAuthenticated ? <Navigate to="/player" /> : <Login />
                }
              />
              <Route path="/callback" element={<CallbackHandler />} />
              <Route
                path="/player"
                element={isAuthenticated ? <PlayerPage /> : <Navigate to="/" />}
              />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
