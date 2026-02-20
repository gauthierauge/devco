import { listProducts, createProduct, updateProduct, deleteProduct } from "../api/productApi";
import { SearchBar } from "../components/SearchBar";
import { ProductCard } from "../components/ProductCard";
import { toProductCardView } from "../mappers/productPresenter";
import { filterProducts, toView } from "../services/productService";
import { authService } from "../services/authService";
import { cartService } from "../services/cartService";

type HomeState = {
  products: Awaited<ReturnType<typeof listProducts>>;
  query: string;
  editingId: string | null;
  searchTimeout: number | null;
};

const initialState: HomeState = {
  products: [],
  query: "",
  editingId: null,
  searchTimeout: null,
};

const setState = (state: HomeState, patch: Partial<HomeState>): HomeState => ({
  ...state,
  ...patch,
});

const renderForm = (state: HomeState) => {
  if (!authService.isLoggedIn()) {
    return "";
  }

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
          <label class="dropzone" id="image-dropzone">
            <input
              name="images"
              type="file"
              accept="image/*"
              multiple
              class="dropzone-input"
              ${state.editingId ? "" : "required"}
            />
            <span class="dropzone-text">Déposez vos images</span>
            <span class="dropzone-subtext">ou cliquez pour sélectionner</span>
            <span class="dropzone-files" id="dropzone-files">Aucune image sélectionnée</span>
          </label>
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
  const canManage = authService.isLoggedIn();
  const cards = filtered
    .map(toProductCardView)
    .map((product) => ProductCard({ ...product, canManage }))
    .join("");
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

const renderHome = (state: HomeState) => {
  const canManage = authService.isLoggedIn();
  const content = canManage
    ? `
      <div class="grid">
        ${renderForm(state)}
        ${renderList(state)}
      </div>
    `
    : `
      <div class="grid-center">
        ${renderList(state)}
      </div>
    `;

  return `
  <div class="page">
    <header class="page-header">
      <h1>Collection Décoration</h1>
      <p>Gérez vos pièces artisanales et objets déco.</p>
    </header>
    ${content}
  </div>
`;
};

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
      const value = searchInput.value;
      if (state.searchTimeout) {
        window.clearTimeout(state.searchTimeout);
      }
      const timeout = window.setTimeout(() => {
        state = setState(state, { query: value });
        const grid = document.getElementById("product-grid");
        if (!grid) return;
        const filtered = filterProducts(state.products, state.query).map(toView);
        const canManage = authService.isLoggedIn();
        const cards = filtered
          .map(toProductCardView)
          .map((product) => ProductCard({ ...product, canManage }))
          .join("");
        grid.innerHTML = cards || "<p>Aucun produit.</p>";
      }, 500);
      state = setState(state, { searchTimeout: timeout });
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

    const dropzone = document.getElementById("image-dropzone") as HTMLLabelElement | null;
    const dropzoneFiles = document.getElementById("dropzone-files") as HTMLSpanElement | null;
    const dropzoneInput = dropzone?.querySelector<HTMLInputElement>('input[name="images"]') ?? null;

    const updateDropzone = (files: File[]) => {
      if (!dropzoneFiles) return;
      if (files.length === 0) {
        dropzoneFiles.textContent = "Aucune image sélectionnée";
        return;
      }
      dropzoneFiles.textContent =
        files.length === 1 ? files[0].name : `${files.length} images sélectionnées`;
    };

    dropzoneInput?.addEventListener("change", () => {
      const files = dropzoneInput.files ? Array.from(dropzoneInput.files) : [];
      updateDropzone(files);
    });

    dropzone?.addEventListener("dragover", (event) => {
      event.preventDefault();
      dropzone.classList.add("is-dragging");
    });

    dropzone?.addEventListener("dragleave", () => {
      dropzone.classList.remove("is-dragging");
    });

    dropzone?.addEventListener("drop", (event) => {
      event.preventDefault();
      dropzone.classList.remove("is-dragging");
      if (!dropzoneInput) return;
      const files = Array.from(event.dataTransfer?.files ?? []);
      if (files.length === 0) return;
      const dataTransfer = new DataTransfer();
      files.forEach((file) => dataTransfer.items.add(file));
      dropzoneInput.files = dataTransfer.files;
      updateDropzone(files);
    });

    document.querySelectorAll("[data-action]").forEach((el) => {
      el.addEventListener("click", async () => {
        const action = (el as HTMLElement).dataset.action;
        const id = (el as HTMLElement).dataset.id;
        if (!id) return;

        if (action === "add-to-cart") {
          cartService.addItem(id, 1);
          const btn = el as HTMLButtonElement;
          const originalText = btn.textContent;
          btn.textContent = "✓ Ajouté";
          btn.disabled = true;

          setTimeout(() => {
            btn.textContent = originalText;
            btn.disabled = false;
          }, 1500);
          return;
        }

        if (action === "delete") {
          if (!authService.isLoggedIn()) return;
          await deleteProduct(id);
          await load();
          return;
        }

        if (action === "edit") {
          if (!authService.isLoggedIn()) return;
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
