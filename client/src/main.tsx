import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { RideProvider } from "./context/RideContext";

createRoot(document.getElementById("root")!).render(
  <RideProvider>
    <App />
  </RideProvider>
);
