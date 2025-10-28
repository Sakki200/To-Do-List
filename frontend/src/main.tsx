import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Lists from "./pages/Lists";
import "./css/index.css";

const router = createBrowserRouter([{ path: "/", element: <Home /> }, {path: "/lists", element: <Lists />}]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
