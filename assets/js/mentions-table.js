(function () {
  "use strict";

  let table = null;
  let tableElement = null;
  let themeObserver = null;

  function destroyMentionsTable() {
    if (themeObserver) {
      themeObserver.disconnect();
      themeObserver = null;
    }
    if (table) {
      try { table.destroy(); } catch (_) {}
      table = null;
    }
    tableElement = null;
  }

  // ==========================================================
  // Theme sync (Chirpy <-> Tabulator)
  // ==========================================================
  function getChirpyMode() {
    const html = document.documentElement;
    const attr = html.getAttribute("data-mode");
    if (attr === "dark" || attr === "light") return attr;
    if (html.classList.contains("dark")) return "dark";
    if (html.classList.contains("light")) return "light";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark" : "light";
  }

  function applyTabulatorTheme() {
    const lightCss = document.getElementById("tabulator-css-light");
    const darkCss = document.getElementById("tabulator-css-dark");
    if (!lightCss || !darkCss) return;
    const isDark = getChirpyMode() === "dark";
    lightCss.disabled = isDark;
    darkCss.disabled = !isDark;
    if (isDark) {
      lightCss.setAttribute("disabled", "");
      darkCss.removeAttribute("disabled");
    } else {
      darkCss.setAttribute("disabled", "");
      lightCss.removeAttribute("disabled");
    }
  }

  // ==========================================================
  // Helpers
  // ==========================================================
  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
  function norm(str) { return String(str || "").trim().toLowerCase(); }
  function uniqueSorted(values) {
    const set = new Set();
    for (const v of values) {
      const s = String(v || "").trim();
      if (s) set.add(s);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }
  function isDefaultExcludedAction(v) {
    const s = String(v || "").trim().toLowerCase();
    return s === "letter" || s === "edm";
  }
  function sameSelection(selected, defaults) {
    return selected.size === defaults.length && defaults.every((v) => selected.has(v));
  }
  function validDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
  }

  // ==========================================================
  // Header popups
  // ==========================================================
  function makeNamePopup(state, onChange) {
    const wrap = document.createElement("div");
    wrap.className = "bf-hpop";
    const title = document.createElement("div");
    title.className = "bf-title";
    title.textContent = "Name";
    const input = document.createElement("input");
    input.className = "bf-input";
    input.type = "text";
    input.placeholder = "Type a name…";
    input.value = state.nameQuery || "";
    input.addEventListener("input", () => {
      state.nameQuery = input.value || "";
      onChange();
    });
    const actions = document.createElement("div");
    actions.className = "bf-actions";
    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "bf-btn";
    clearBtn.textContent = "Clear";
    clearBtn.addEventListener("click", () => {
      state.nameQuery = "";
      input.value = "";
      onChange();
      input.focus();
    });
    actions.appendChild(clearBtn);
    wrap.appendChild(title);
    wrap.appendChild(input);
    wrap.appendChild(actions);
    setTimeout(() => input.focus(), 0);
    return wrap;
  }

  function makeChecklistPopup(opts) {
    const { titleText, allValues, selectedSet, onApply } = opts;
    const wrap = document.createElement("div");
    wrap.className = "bf-hpop";
    const title = document.createElement("div");
    title.className = "bf-title";
    title.textContent = titleText;
    const actions = document.createElement("div");
    actions.className = "bf-actions";
    const btnAll = document.createElement("button");
    btnAll.type = "button";
    btnAll.className = "bf-btn";
    btnAll.textContent = "All";
    const btnNone = document.createElement("button");
    btnNone.type = "button";
    btnNone.className = "bf-btn";
    btnNone.textContent = "None";
    actions.appendChild(btnAll);
    actions.appendChild(btnNone);
    const list = document.createElement("div");
    list.className = "bf-list";
    const checkboxes = [];
    function render() {
      list.innerHTML = "";
      checkboxes.length = 0;
      for (const v of allValues) {
        const row = document.createElement("label");
        row.className = "bf-item";
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = selectedSet.has(v);
        cb.addEventListener("change", () => {
          if (cb.checked) selectedSet.add(v);
          else selectedSet.delete(v);
          onApply();
        });
        const text = document.createElement("span");
        text.textContent = v;
        row.appendChild(cb);
        row.appendChild(text);
        list.appendChild(row);
        checkboxes.push({ v, cb });
      }
    }
    function adjustListHeight() {
      const LIMIT = 20;
      const needsScroll = allValues.length > LIMIT;
      list.classList.toggle("bf-scroll", needsScroll);
      if (!needsScroll) {
        list.style.maxHeight = "none";
        list.style.overflowY = "visible";
        return;
      }
      const firstItem = list.querySelector(".bf-item");
      const rowH = firstItem ? firstItem.getBoundingClientRect().height : 32;
      const desiredPx = Math.ceil(Math.min(LIMIT, allValues.length) * rowH + 12);
      const capPx = Math.floor(window.innerHeight * 0.6);
      list.style.maxHeight = Math.min(desiredPx, capPx) + "px";
      list.style.overflowY = "auto";
    }
    btnAll.addEventListener("click", () => {
      selectedSet.clear();
      for (const v of allValues) selectedSet.add(v);
      for (const x of checkboxes) x.cb.checked = true;
      onApply();
    });
    btnNone.addEventListener("click", () => {
      selectedSet.clear();
      for (const x of checkboxes) x.cb.checked = false;
      onApply();
    });
    wrap.appendChild(title);
    wrap.appendChild(actions);
    wrap.appendChild(list);
    render();
    requestAnimationFrame(adjustListHeight);
    return wrap;
  }

  // New: date-range filter. Date inputs are in the same popup style as the other filters.
  function makeDatePopup(state, onChange) {
    const wrap = document.createElement("div");
    wrap.className = "bf-hpop";
    const title = document.createElement("div");
    title.className = "bf-title";
    title.textContent = "Date range";
    wrap.appendChild(title);

    const addInput = (label, prop) => {
      const text = document.createElement("label");
      text.textContent = label;
      text.style.display = "block";
      text.style.margin = "0.5rem 0 0.25rem";
      const input = document.createElement("input");
      input.type = "date";
      input.className = "bf-input";
      input.value = state[prop];
      input.addEventListener("change", () => {
        state[prop] = validDate(input.value);
        onChange();
      });
      wrap.appendChild(text);
      wrap.appendChild(input);
      return input;
    };
    const fromInput = addInput("From (inclusive)", "dateFrom");
    const toInput = addInput("To (inclusive)", "dateTo");
    const actions = document.createElement("div");
    actions.className = "bf-actions";
    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "bf-btn";
    clearBtn.textContent = "Clear";
    clearBtn.addEventListener("click", () => {
      state.dateFrom = "";
      state.dateTo = "";
      fromInput.value = "";
      toInput.value = "";
      onChange();
    });
    actions.appendChild(clearBtn);
    wrap.appendChild(actions);
    return wrap;
  }

  // ==========================================================
  // Build table
  // ==========================================================
  function buildMentionsTable() {
    const tableEl = document.getElementById("mentions-table");
    const dataEl = document.getElementById("mentions-data");
    if (!tableEl || !dataEl) return;
    if (typeof Tabulator !== "function") {
      console.error("[Mentions] Tabulator not loaded");
      return;
    }
    if (table && tableElement === tableEl) return;
    applyTabulatorTheme();

    let data = [];
    try {
      const raw = (dataEl.textContent || "").trim();
      data = JSON.parse(raw || "[]");
      if (!Array.isArray(data)) data = [];
    } catch (e) {
      console.error("[Mentions] JSON parse failed", e);
      return;
    }
    for (const r of data) {
      if (r && typeof r === "object" && !("quote" in r) && "summary" in r) r.quote = r.summary;
    }
    const houseValues = uniqueSorted(data.map((d) => d.house));
    const partyValues = uniqueSorted(data.map((d) => d.party));
    const actionValues = uniqueSorted(data.map((d) => d.action_type));
    const defaultActions = actionValues.filter((v) => !isDefaultExcludedAction(v));

    // URL format:
    // ?name=Jones&house=Commons&party=Labour&party=Labour+%28Co-op%29
    // &action=Written+Question&from=2024-07-04&to=2026-11-18
    // Multiple selections use repeated parameters. An empty parameter means "none";
    // a missing parameter means "use the default". Unknown query keys are retained.
    const params = new URLSearchParams(window.location.search);
    function selectedFromUrl(key, allowed, defaults) {
      if (!params.has(key)) return new Set(defaults);
      const values = params.getAll(key);
      return new Set(values.filter((value) => value && allowed.includes(value)));
    }
    const state = {
      nameQuery: params.get("name") || "",
      house: selectedFromUrl("house", houseValues, houseValues),
      party: selectedFromUrl("party", partyValues, partyValues),
      action: selectedFromUrl("action", actionValues, defaultActions),
      dateFrom: validDate(params.get("from") || ""),
      dateTo: validDate(params.get("to") || ""),
    };

    function rowFilter(rowData) {
      if (!rowData) return false;
      if (state.nameQuery && !norm(rowData.name).includes(norm(state.nameQuery))) return false;
      if (houseValues.length && !state.house.has(String(rowData.house || "").trim())) return false;
      if (partyValues.length && !state.party.has(String(rowData.party || "").trim())) return false;
      if (actionValues.length && !state.action.has(String(rowData.action_type || "").trim())) return false;
      const rowDate = String(rowData.date || "");
      if (state.dateFrom && rowDate < state.dateFrom) return false;
      if (state.dateTo && rowDate > state.dateTo) return false;
      return true;
    }

    function updateFilteredIndicators() {
      if (!table) return;
      const mark = (field, isFiltered) => {
        const col = table.getColumn(field);
        if (!col) return;
        const el = col.getElement && col.getElement();
        if (!el) return;
        el.classList.toggle("bf-filtered", !!isFiltered);
      };
      mark("name", !!state.nameQuery);
      mark("house", !sameSelection(state.house, houseValues));
      mark("party", !sameSelection(state.party, partyValues));
      mark("action_type", !sameSelection(state.action, actionValues));
      mark("date", !!(state.dateFrom || state.dateTo));
    }

    // Update URL without a reload or a new browser history entry on every click.
    function syncFiltersToUrl() {
      const url = new URL(window.location.href);
      const qs = url.searchParams;
      const setList = (key, selected, defaults) => {
        qs.delete(key);
        if (sameSelection(selected, defaults)) return;
        const values = Array.from(selected).sort((a, b) => a.localeCompare(b));
        if (!values.length) qs.set(key, "");
        else values.forEach((value) => qs.append(key, value));
      };
      qs.delete("name");
      if (state.nameQuery) qs.set("name", state.nameQuery);
      setList("house", state.house, houseValues);
      setList("party", state.party, partyValues);
      setList("action", state.action, defaultActions);
      qs.delete("from");
      qs.delete("to");
      if (state.dateFrom) qs.set("from", state.dateFrom);
      if (state.dateTo) qs.set("to", state.dateTo);
      const nextUrl = url.pathname + url.search + url.hash;
      const currentUrl = window.location.pathname + window.location.search + window.location.hash;
      if (nextUrl !== currentUrl) window.history.replaceState(window.history.state, "", nextUrl);
    }

    function applyFilters(updateUrl = true) {
      if (!table) return;
      table.setFilter(rowFilter);
      updateFilteredIndicators();
      if (updateUrl) syncFiltersToUrl();
    }

    destroyMentionsTable();
    function quoteFormatter(cell) {
      const row = cell.getRow().getData();
      const text = escapeHtml(cell.getValue() || "");
      const url = row.link ? String(row.link) : "";
      const icon = url
        ? `<a class="mentions-open" href="${escapeHtml(url)}" target="_blank" rel="noopener" aria-label="Open source">
              <i class="fas fa-up-right-from-square"></i>
            </a>`
        : "";
      return `<div class="mentions-quote">
                <span class="mentions-quote-text">${text}</span>
                ${icon}
              </div>`;
    }

    table = new Tabulator(tableEl, {
      data,
      layout: "fitColumns",
      placeholder: "No matching entries",
      initialSort: [{ column: "date", dir: "desc" }],
      responsiveLayout: false,
      movableColumns: false,
      columns: [
        {
          title: "Name", field: "name", sorter: "string",
          width: 105, minWidth: 105, widthGrow: 0, widthShrink: 0,
          headerPopup: () => makeNamePopup(state, applyFilters),
          headerPopupIcon: () => "<i class='fas fa-magnifying-glass'></i>",
        },
        {
          title: "House", field: "house", sorter: "string",
          width: 110, minWidth: 110, widthGrow: 0, widthShrink: 0,
          headerPopup: () => makeChecklistPopup({
            titleText: "House", allValues: houseValues, selectedSet: state.house, onApply: applyFilters,
          }),
          headerPopupIcon: () => "<i class='fas fa-filter'></i>",
        },
        {
          title: "Party", field: "party", sorter: "string",
          width: 105, minWidth: 105, widthGrow: 0, widthShrink: 0,
          headerPopup: () => makeChecklistPopup({
            titleText: "Party", allValues: partyValues, selectedSet: state.party, onApply: applyFilters,
          }),
          headerPopupIcon: () => "<i class='fas fa-filter'></i>",
        },
        {
          title: "Action", field: "action_type", sorter: "string",
          width: 110, minWidth: 110, widthGrow: 0, widthShrink: 0,
          headerPopup: () => makeChecklistPopup({
            titleText: "Action", allValues: actionValues, selectedSet: state.action, onApply: applyFilters,
          }),
          headerPopupIcon: () => "<i class='fas fa-filter'></i>",
        },
        {
          title: "Date", field: "date", sorter: "string",
          width: 110, minWidth: 110, widthGrow: 0, widthShrink: 0,
          headerPopup: () => makeDatePopup(state, applyFilters),
          headerPopupIcon: () => "<i class='fas fa-filter'></i>",
        },
        {
          title: "Quote", field: "quote", sorter: "string",
          minWidth: 340, widthGrow: 10, widthShrink: 1,
          formatter: quoteFormatter, headerSort: false,
        },
      ],
    });
    tableElement = tableEl;
    // Initial render respects URL and existing default action exclusions.
    applyFilters(false);

    setTimeout(() => {
      applyTabulatorTheme();
      table && table.redraw(true);
    }, 0);
    setTimeout(() => {
      applyTabulatorTheme();
      table && table.redraw(true);
    }, 150);
    themeObserver = new MutationObserver(() => {
      applyTabulatorTheme();
      table && table.redraw(true);
    });
    themeObserver.observe(document.documentElement, {
      attributes: true, attributeFilter: ["data-mode", "class"],
    });
    const modeBtn = document.getElementById("mode-toggle");
    if (modeBtn) {
      modeBtn.addEventListener("click", () => {
        setTimeout(() => {
          applyTabulatorTheme();
          table && table.redraw(true);
        }, 50);
      });
    }
  }
  document.addEventListener("DOMContentLoaded", buildMentionsTable);
  document.addEventListener("turbo:load", buildMentionsTable);
  document.addEventListener("turbo:before-cache", destroyMentionsTable);
})();
