import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Fix para altura de viewport em mobile (lida com barra de URL do navegador)
const setVH = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

setVH();
window.addEventListener('resize', setVH);
window.addEventListener('orientationchange', setVH);

createRoot(document.getElementById("root")!).render(<App />);
