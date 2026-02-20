import { listProducts, createProduct, updateProduct, deleteProduct } from "../api/productApi";
import { SearchBar } from "../components/SearchBar";
import { presentProductCard } from "../mappers/productPresenter";
import { filterProducts, toView } from "../services/productService";

type HomeState = {
  products: Awaited<ReturnType<typeof listProducts>>;
  query: string;
  editingId: string | null;
};

const initialState: HomeState = {
  products: [],
  query: "",
  editingId: null,
};

const setState = (state: HomeState, patch: Partial<HomeState>): HomeState => ({
  ...state,
  ...patch,
});

const renderForm = (state: HomeState) => {
  const editingProduct = state.products.find((product) => product.id === state.editingId);
  const label = editingProduct?.label ?? "";
  const description = editingProduct?.description ?? "";
  const category = editingProduct?.category ?? "";
  const price = editingProduct?.price?.toString() ?? "";
  const required = state.editingId ? "" : "required";

  return `
    <section class="panel">
      <h2>${state.editingId ? "Modifier" : "Ajouter"} un produit</h2>
      <form id="product-form" class="form">
        <label>
          Libellé
          <input name="label" type="text" value="${label}" ${required} />
        </label>
        <label>
          Description
          <textarea name="description" rows="3" ${required}>${description}</textarea>
        </label>
        <label>
          Catégorie
          <input name="category" type="text" value="${category}" ${required} />
        </label>
        <label>
          Prix (€)
          <input name="price" type="number" step="0.01" min="0" value="${price}" ${required} />
        </label>
        <label>
          Images
          <input name="images" type="file" accept="image/*" multiple ${state.editingId ? "" : "required"} />
        </label>
        <div class="form-actions">
          <button class="btn" type="submit">${state.editingId ? "Mettre à jour" : "Créer"}</button>
          <button class="btn btn-outline" type="button" id="reset-form">${state.editingId ? "Annuler" : "Réinitialiser"}</button>
        </div>
      </form>
    </section>
  `;
};

const renderList = (state: HomeState) => {
  const filtered = filterProducts(state.products, state.query).map(toView);
  const cards = filtered.map(presentProductCard).join("");
  return `
      <section class="panel">
        <div class="panel-header">
          <h2>Produits</h2>
          ${SearchBar(state.query)}
        </div>
        <div class="product-grid" id="product-grid">${cards || "<p>Aucun produit.</p>"}</div>
      </section>
    `;
};

const renderHome = (state: HomeState) => `
  <div class="page">
    <header class="page-header">
      <h1>Collection Décoration</h1>
      <p>Gérez vos pièces artisanales et objets déco.</p>
    </header>
    <div class="grid">
      ${renderForm(state)}
      ${renderList(state)}
    </div>
  </div>
`;

const Home = () => {
  let state = initialState;

  const load = async () => {
    const products = await listProducts({ q: state.query || undefined });
    state = setState(state, { products });
    repaint();
  };

  const repaint = () => {
    const container = document.getElementById("view");
    if (!container) return;
    container.innerHTML = renderHome(state);
    bind();
  };

  const bind = () => {
    const searchInput = document.getElementById("search-input") as HTMLInputElement | null;
    searchInput?.addEventListener("input", () => {
      state = setState(state, { query: searchInput.value });
      const grid = document.getElementById("product-grid");
      if (!grid) return;
      const filtered = filterProducts(state.products, state.query).map(toView);
      const cards = filtered.map(presentProductCard).join("");
      grid.innerHTML = cards || "<p>Aucun produit.</p>";
    });

    const form = document.getElementById("product-form") as HTMLFormElement | null;
    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const imagesInput = form.querySelector<HTMLInputElement>('input[name="images"]');
      const imagesFiles = imagesInput?.files ? Array.from(imagesInput.files) : [];
      const editingProduct = state.products.find((product) => product.id === state.editingId);

      const rawLabel = String(data.get("label") || "").trim();
      const rawDescription = String(data.get("description") || "").trim();
      const rawCategory = String(data.get("category") || "").trim();
      const rawPrice = String(data.get("price") || "").trim();
      const parsedPrice = rawPrice === "" ? null : Number(rawPrice);

      if (state.editingId) {
        if (!editingProduct) return;
        const updatePayload = {
          label: rawLabel || editingProduct.label,
          description: rawDescription || editingProduct.description,
          category: rawCategory || editingProduct.category,
          price: parsedPrice ?? editingProduct.price,
          images: imagesFiles.length > 0 ? imagesFiles : undefined,
        };
        await updateProduct(state.editingId, updatePayload);
      } else {
        if (!rawLabel || !rawDescription || !rawCategory || parsedPrice === null) return;
        await createProduct({
          label: rawLabel,
          description: rawDescription,
          category: rawCategory,
          price: parsedPrice,
          images: imagesFiles,
        });
      }

      state = setState(state, { editingId: null });
      await load();
    });

    document.getElementById("reset-form")?.addEventListener("click", () => {
      state = setState(state, { editingId: null });
      repaint();
    });

    document.querySelectorAll("[data-action]").forEach((el) => {
      el.addEventListener("click", async () => {
        const action = (el as HTMLElement).dataset.action;
        const id = (el as HTMLElement).dataset.id;
        if (!id) return;

        if (action === "delete") {
          await deleteProduct(id);
          await load();
          return;
        }

        if (action === "edit") {
          state = setState(state, { editingId: id });
          repaint();
        }

        if (action === "view") {
          window.history.pushState({}, "", `/product/${id}`);
          window.dispatchEvent(new PopStateEvent("popstate"));
        }
      });
    });
  };

  const mount = async () => {
    repaint();
    await load();
  };

  return { html: renderHome(state), mount };
};

export { Home };
