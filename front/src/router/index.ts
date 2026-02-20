import { Home } from "../pages/Home";
import { Product } from "../pages/Product";
import { Stats } from "../pages/Stats";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { Dashboard } from "../pages/Dashboard";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { checkRouteAccess } from "./protect";

type Route = {
  path: RegExp;
  getView: (params: Record<string, string>) => { html: string; mount: () => void };
};

const routes: Route[] = [
  { path: /^\/$/, getView: () => Home() },
  { path: /^\/product\/(?<id>[^/]+)$/, getView: (params) => Product(params.id) },
  { path: /^\/stats$/, getView: () => Stats() },
  { path: /^\/login$/, getView: () => Login() },
  { path: /^\/register$/, getView: () => Register() },
  { path: /^\/dashboard$/, getView: () => Dashboard() },
];

const matchRoute = (pathname: string) => {
  const match = routes.find((route) => route.path.test(pathname));
  if (!match) return null;
  const exec = match.path.exec(pathname);
  const params = (exec?.groups ?? {}) as Record<string, string>;
  return { route: match, params };
};

const renderRoute = async () => {
  const pathname = window.location.pathname;

  const redirect = checkRouteAccess(pathname);
  if (redirect) {
    window.history.pushState({}, "", redirect);
    renderRoute();
    return;
  }

  const app = document.getElementById("app");
  if (!app) return;

  const navbar = Navbar();
  app.innerHTML = `
    ${navbar.html}
    <main id="view" class="container"></main>
    ${Footer()}
  `;
  navbar.mount();

  const container = document.getElementById("view");
  if (!container) return;

  const match = matchRoute(pathname) ?? matchRoute("/");
  if (!match) return;

  const view = match.route.getView(match.params);
  container.innerHTML = view.html;
  await view.mount();
};

const initRouter = () => {
  document.body.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    const link = target?.closest("[data-link]") as HTMLAnchorElement | null;
    if (!link) return;
    event.preventDefault();
    window.history.pushState({}, "", link.href);
    renderRoute();
  });

  window.addEventListener("popstate", renderRoute);

  renderRoute();
};

export { initRouter };
