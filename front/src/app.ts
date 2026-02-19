import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { initRouter } from "./router";

const renderLayout = () => `
  ${Navbar()}
  <main id="view" class="container"></main>
  ${Footer()}
`;

const startApp = () => {
  const app = document.getElementById("app");
  if (!app) return;
  app.innerHTML = renderLayout();
  initRouter();
};

export { startApp };
