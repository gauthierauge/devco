import { initRouter } from "./router";

const startApp = () => {
  const app = document.getElementById("app");
  if (!app) return;

  initRouter();
};

export { startApp };
