import { Home } from "../pages/Home";
import { Product } from "../pages/Product";
import { CspReports } from "../pages/CspReports";

type Route = {
  path: RegExp;
  getView: (params: Record<string, string>) => { html: string; mount: () => void };
};

const routes: Route[] = [
  { path: /^\/$/, getView: () => Home() },
  { path: /^\/product\/(?<id>[^/]+)$/, getView: (params) => Product(params.id) },
  { path: /^\/csp-reports$/, getView: () => CspReports() },
];

const matchRoute = (pathname: string) => {
  const match = routes.find((route) => route.path.test(pathname));
  if (!match) return null;
  const exec = match.path.exec(pathname);
  const params = (exec?.groups ?? {}) as Record<string, string>;
  return { route: match, params };
};

const renderRoute = async () => {
  const container = document.getElementById("view");
  if (!container) return;

  const match = matchRoute(window.location.pathname) ?? matchRoute("/");
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
