import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Connection from "./pages/Connection";
import Validation from "./pages/Validation";
import Invitation from "./pages/Invitation";
import Lists from "./pages/Lists";
import Canva from "./pages/Canva";
import "./css/index.css";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/connection", element: <Connection /> },
  { path: "/validation", element: <Validation /> },
  { path: "/invitation", element: <Invitation /> },
  { path: "/lists", element: <Lists /> },
  { path: "/lists/:id", element: <Canva /> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
