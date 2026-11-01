"use strict";

/* GTSI-SCHEMAS-INTERACTIFS-V1 */
const yearElement = document.getElementById("year");
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

(() => {
  const tabs = Array.from(document.querySelectorAll(".schema-tab[data-schema]"));
  const views = Array.from(document.querySelectorAll(".schema-view[id]"));
  const infoTitle = document.getElementById("schema-info-title");
  const infoDescription = document.getElementById("schema-info-description");

  function selectComponent(button) {
    document.querySelectorAll(".schema-node.is-selected").forEach((node) => {
      node.classList.remove("is-selected");
    });
    button.classList.add("is-selected");
    if (infoTitle) infoTitle.textContent = button.dataset.title || "Composant réseau";
    if (infoDescription) {
      infoDescription.textContent = button.dataset.description || "Aucune description disponible.";
    }
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.schema;
      if (!views.some((view) => view.id === target)) return;

      tabs.forEach((item) => {
        const active = item === tab;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });

      views.forEach((view) => {
        const active = view.id === target;
        view.hidden = !active;
        view.classList.toggle("is-visible", active);
      });

      const firstNode = document.querySelector(`#${target} .schema-node`);
      if (firstNode) selectComponent(firstNode);
    });
  });

  document.querySelectorAll(".schema-node").forEach((button) => {
    button.addEventListener("click", () => selectComponent(button));
  });

  const menuToggle = document.getElementById("menu-toggle");
  document.querySelectorAll("header nav a").forEach((link) => {
    link.addEventListener("click", () => {
      if (menuToggle) menuToggle.checked = false;
      const details = link.closest("details");
      if (details) details.open = false;
    });
  });

  const firstNode = document.querySelector(".schema-view:not([hidden]) .schema-node");
  if (firstNode) selectComponent(firstNode);
})();

console.log("GTSI : site initialisé.");
