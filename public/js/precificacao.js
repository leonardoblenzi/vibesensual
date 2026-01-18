// public/js/precificacao.js
(() => {
  // =========================
  // Helpers
  // =========================
  const qs = (sel, el = document) => el.querySelector(sel);
  const qsa = (sel, el = document) => Array.from(el.querySelectorAll(sel));

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }[c]));

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  // pt-BR money parsing: "1.234,56" -> 1234.56
  const parseMoney = (v) => {
    const s = String(v ?? "").trim();
    if (!s) return 0;
    const norm = s.replace(/\./g, "").replace(",", ".");
    const n = Number(norm);
    return Number.isFinite(n) ? n : 0;
  };

  const fmtMoney = (n) => {
    const v = Number(n);
    if (!Number.isFinite(v)) return "—";
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const fmtPct = (n) => {
    const v = Number(n);
    if (!Number.isFinite(v)) return "—";
    return `${v.toFixed(2).replace(".", ",")}%`;
  };

  const roundTo = (price, mode) => {
    const p = Number(price);
    if (!Number.isFinite(p)) return p;

    if (mode === "none") return p;

    const base = Math.floor(p);
    const cents = mode === "90" ? 0.9 : mode === "99" ? 0.99 : 0.0;

    const rounded = base + cents;
    // se o arredondado ficar abaixo do preço, sobe 1 real
    if (rounded < p) return base + 1 + cents;
    return rounded;
  };

  const toast = (title, msg) => {
    const root = qs("#toasts");
    if (!root) return;

    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `
      <div class="toast__bar"></div>
      <div class="toast__body">
        <div class="toast__title">${esc(title)}</div>
        <div class="toast__msg">${esc(msg || "")}</div>
      </div>
    `;
    root.appendChild(el);

    setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = "translateY(6px)";
      el.style.transition = "all .25s ease";
      setTimeout(() => el.remove(), 260);
    }, 3200);
  };

  const api = async (url, opts = {}) => {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
      credentials: "same-origin",
      ...opts,
    });

    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (_) {}

    if (!res.ok) {
      const msg = data?.error || data?.message || `Erro HTTP ${res.status}`;
      const err = new Error(msg);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  };

  // =========================
  // State
  // =========================
  const state = {
    products: [],            // tabela base
    pricesByProductId: {},   // { [productId]: { shopee, ml, presencial } }
    rules: {
      shopee: { taxa_pct: 0, taxa_fixa: 0, desconto_medio: 0, frete_seller: 0, preco_de_add: 0, margem_min_pct: 0 },
      ml:     { taxa_pct: 0, taxa_fixa: 0, desconto_medio: 0, frete_seller: 0, preco_de_add: 0, margem_min_pct: 0 },
      presencial:{ taxa_pct: 0, taxa_fixa: 0, desconto_medio: 0, frete_seller: 0, preco_de_add: 0, margem_min_pct: 0 },
    },
    // dirty tracking
    dirtyCells: new Set(),     // keys like `${productId}:${canal}`
    dirtyRules: false,
    lastSnapshot: null,        // for undo
    filters: { q: "", canal: "all", onlyMissing: false },
    calc: { selectedProductId: null, lastSuggested: null, lastDe: null }
  };

  // =========================
  // Tabs
  // =========================
  function setupTabs() {
    const tabs = qsa(".tab");
    const panels = qsa(".panel");

    tabs.forEach((t) => {
      t.addEventListener("click", () => {
        const name = t.getAttribute("data-tab");
        tabs.forEach((x) => x.classList.toggle("tab--active", x === t));
        panels.forEach((p) => p.classList.toggle("hidden", p.getAttribute("data-panel") !== name));
      });
    });
  }

  // =========================
  // Load initial data
  // =========================
  async function loadAll() {
    try {
      qs("#statsChip") && (qs("#statsChip").textContent = "Carregando…");
      qs("#tableMeta") && (qs("#tableMeta").textContent = "Carregando…");

      // endpoints (vamos criar no back)
      // GET /admin/precificacao/data -> { products, prices, rules }
      const data = await api("/admin/precificacao/data");

      state.products = data.products || [];
      state.pricesByProductId = data.pricesByProductId || {};
      state.rules = data.rules || state.rules;

      // snapshot para undo
      state.lastSnapshot = JSON.parse(JSON.stringify({
        pricesByProductId: state.pricesByProductId,
        rules: state.rules,
      }));

      state.dirtyCells.clear();
      state.dirtyRules = false;

      renderStats();
      renderPriceTable();
      renderRulesTable();
      syncRulePreviewToCalc();
      preloadCalcFromRules();

      toast("Pronto", "Dados carregados.");
    } catch (e) {
      console.error(e);
      toast("Ops", e.message || "Falha ao carregar dados.");
      qs("#tableMeta") && (qs("#tableMeta").textContent = "Falha ao carregar.");
    }
  }

  function renderStats() {
    const total = state.products.length;
    let missing = 0;

    for (const p of state.products) {
      const pr = state.pricesByProductId[p.id] || {};
      if (!pr.shopee || !pr.ml || !pr.presencial) missing++;
    }

    const chip = qs("#statsChip");
    if (chip) chip.textContent = `${total} produtos • ${missing} com preço faltando`;
  }

  // =========================
  // Filters
  // =========================
  function readFiltersFromUI() {
    state.filters.q = (qs("#qProduto")?.value || "").trim().toLowerCase();
    state.filters.canal = qs("#fCanal")?.value || "all";
    state.filters.onlyMissing = !!qs("#onlyMissing")?.checked;
  }

  function applyFilters(list) {
    const { q, canal, onlyMissing } = state.filters;

    return list.filter((p) => {
      if (q) {
        const hit = (p.nome || "").toLowerCase().includes(q) || (p.sku || "").toLowerCase().includes(q);
        if (!hit) return false;
      }

      if (onlyMissing) {
        const pr = state.pricesByProductId[p.id] || {};
        if (canal === "all") {
          if (pr.shopee && pr.ml && pr.presencial) return false;
        } else {
          if (pr[canal]) return false;
        }
      }

      return true;
    });
  }

  // =========================
  // Price table rendering
  // =========================
  function marginFor(canal, price, cost, rules) {
    const p = Number(price);
    const c = Number(cost);
    if (!Number.isFinite(p) || p <= 0 || !Number.isFinite(c)) return null;

    const r = rules[canal] || {};
    const taxaPct = Number(r.taxa_pct) / 100;
    const taxaFixa = Number(r.taxa_fixa);
    const desconto = Number(r.desconto_medio);
    const frete = Number(r.frete_seller);
    const liquido = p - (p * taxaPct) - taxaFixa - desconto - frete;
    const lucro = liquido - c;
    const margem = liquido > 0 ? (lucro / liquido) * 100 : null;
    return { liquido, lucro, margem };
  }

  function statusBadge(p, pr) {
    const s = [];
    if ((p.estoque_atual ?? 0) <= 0) s.push("Sem estoque");
    if (!pr.shopee || !pr.ml || !pr.presencial) s.push("Preço faltando");
    return s.length ? s.join(" • ") : "OK";
  }

  function makePriceInput(productId, canal, value) {
    const v = value ? String(Number(value).toFixed(2)).replace(".", ",") : "";
    return `
      <input
        class="input input--sm num"
        data-price="1"
        data-product="${esc(productId)}"
        data-canal="${esc(canal)}"
        inputmode="decimal"
        placeholder="0,00"
        value="${esc(v)}"
      />
    `;
  }

  function renderPriceTable() {
    const tbody = qs("#precosTable tbody");
    if (!tbody) return;

    const meta = qs("#tableMeta");
    readFiltersFromUI();

    const filtered = applyFilters(state.products);
    if (meta) meta.textContent = `${filtered.length} itens exibidos`;

    tbody.innerHTML = filtered.map((p) => {
      const pr = state.pricesByProductId[p.id] || { shopee: null, ml: null, presencial: null };
      const cost = Number(p.custo ?? p.custo_medio ?? 0);

      const mSho = pr.shopee ? marginFor("shopee", pr.shopee, cost, state.rules) : null;
      const mMl  = pr.ml ? marginFor("ml", pr.ml, cost, state.rules) : null;
      const mPre = pr.presencial ? marginFor("presencial", pr.presencial, cost, state.rules) : null;

      // Mostra margem do canal filtrado (ou a pior margem se "all")
      let show = null;
      if (state.filters.canal === "shopee") show = mSho;
      else if (state.filters.canal === "ml") show = mMl;
      else if (state.filters.canal === "presencial") show = mPre;
      else {
        const candidates = [mSho, mMl, mPre].filter(Boolean).map((x) => x.margem).filter((x) => Number.isFinite(x));
        if (candidates.length) {
          const worst = Math.min(...candidates);
          show = { margem: worst };
        }
      }

      const marginText = show?.margem != null ? fmtPct(show.margem) : "—";
      const st = statusBadge(p, pr);

      return `
        <tr data-row-product="${esc(p.id)}">
          <td>${esc(p.nome || "")}</td>
          <td>${esc(p.sku || "")}</td>
          <td class="num">${esc(p.estoque_atual ?? 0)}</td>
          <td class="num">${esc(fmtMoney(cost))}</td>

          <td class="num">${makePriceInput(p.id, "shopee", pr.shopee)}</td>
          <td class="num">${makePriceInput(p.id, "ml", pr.ml)}</td>
          <td class="num">${makePriceInput(p.id, "presencial", pr.presencial)}</td>

          <td class="num"><strong>${esc(marginText)}</strong></td>
          <td>${esc(st)}</td>
        </tr>
      `;
    }).join("");

    bindPriceInputs();
    updateDirtyHint();
  }

  function bindPriceInputs() {
    qsa('input[data-price="1"]').forEach((inp) => {
      inp.addEventListener("input", () => {
        const productId = inp.getAttribute("data-product");
        const canal = inp.getAttribute("data-canal");
        const key = `${productId}:${canal}`;

        const val = parseMoney(inp.value);
        state.pricesByProductId[productId] ||= {};
        state.pricesByProductId[productId][canal] = val > 0 ? val : null;

        // dirty tracking
        state.dirtyCells.add(key);
        inp.classList.add("cell-dirty");

        // mark row dirty
        const tr = inp.closest("tr");
        tr && tr.classList.add("is-dirty");

        updateDirtyHint();
      });
    });
  }

  function updateDirtyHint() {
    const hint = qs("#dirtyHint");
    if (!hint) return;

    const dirtyCount = state.dirtyCells.size + (state.dirtyRules ? 1 : 0);
    if (dirtyCount <= 0) hint.textContent = "Nenhuma alteração pendente.";
    else hint.textContent = `${dirtyCount} alteração(ões) pendente(s).`;
  }

  // =========================
  // Rules table
  // =========================
  function renderRulesTable() {
    const table = qs("#regrasTable");
    if (!table) return;

    qsa("#regrasTable tbody tr").forEach((tr) => {
      const canal = tr.getAttribute("data-canal");
      const r = state.rules[canal] || {};
      qsa("input[data-field]", tr).forEach((inp) => {
        const field = inp.getAttribute("data-field");
        const v = r[field];

        // % fields vs money fields
        if (field.endsWith("_pct")) {
          inp.value = Number(v ?? 0).toString().replace(".", ",");
        } else {
          inp.value = Number(v ?? 0).toFixed(2).replace(".", ",");
        }
      });
    });

    bindRulesInputs();
  }

  function bindRulesInputs() {
    qsa("#regrasTable input[data-field]").forEach((inp) => {
      inp.addEventListener("input", () => {
        const tr = inp.closest("tr");
        const canal = tr?.getAttribute("data-canal");
        const field = inp.getAttribute("data-field");
        if (!canal || !field) return;

        const isPct = field.endsWith("_pct");
        const val = isPct ? parseMoney(inp.value) : parseMoney(inp.value);

        state.rules[canal] ||= {};
        // porcentagem: limita 0..99.99
        state.rules[canal][field] = isPct ? clamp(val, 0, 99.99) : clamp(val, 0, 9999999);

        state.dirtyRules = true;
        updateDirtyHint();

        // se mexeu em regras, atualiza preview e tabela (margens)
        syncRulePreviewToCalc();
        // (margens recalculadas visualmente no próximo render)
      });
    });
  }

  function syncRulePreviewToCalc() {
    const canal = qs("#calcCanal")?.value || "shopee";
    const r = state.rules[canal] || {};

    const setTxt = (id, val, kind) => {
      const el = qs(id);
      if (!el) return;
      el.textContent = kind === "pct" ? fmtPct(val) : fmtMoney(val);
    };

    setTxt("#ruleTaxaPct", r.taxa_pct, "pct");
    setTxt("#ruleTaxaFixa", r.taxa_fixa, "money");
    setTxt("#ruleDesconto", r.desconto_medio, "money");
    setTxt("#ruleFrete", r.frete_seller, "money");
    setTxt("#rulePrecoDe", r.preco_de_add, "money");

    const elMin = qs("#ruleMargemMin");
    if (elMin) elMin.textContent = fmtPct(r.margem_min_pct ?? 0);
  }

  function preloadCalcFromRules() {
    const canal = qs("#calcCanal")?.value || "shopee";
    const r = state.rules[canal] || {};

    qs("#calcTaxaPct") && (qs("#calcTaxaPct").value = String(r.taxa_pct ?? 0).replace(".", ","));
    qs("#calcTaxaFixa") && (qs("#calcTaxaFixa").value = Number(r.taxa_fixa ?? 0).toFixed(2).replace(".", ","));
    qs("#calcDescontoMedio") && (qs("#calcDescontoMedio").value = Number(r.desconto_medio ?? 0).toFixed(2).replace(".", ","));
    qs("#calcFreteSeller") && (qs("#calcFreteSeller").value = Number(r.frete_seller ?? 0).toFixed(2).replace(".", ","));
    qs("#calcPrecoDeAdd") && (qs("#calcPrecoDeAdd").value = Number(r.preco_de_add ?? 0).toFixed(2).replace(".", ","));
  }

  // =========================
  // Calculator
  // =========================
  function calcSuggested() {
    const canal = qs("#calcCanal")?.value || "shopee";

    const custo = parseMoney(qs("#calcCusto")?.value);
    const margemDesejada = parseMoney(qs("#calcMargem")?.value); // %
    const taxaPct = parseMoney(qs("#calcTaxaPct")?.value);       // %
    const taxaFixa = parseMoney(qs("#calcTaxaFixa")?.value);
    const desconto = parseMoney(qs("#calcDescontoMedio")?.value);
    const frete = parseMoney(qs("#calcFreteSeller")?.value);
    const precoDeAdd = parseMoney(qs("#calcPrecoDeAdd")?.value);

    if (custo <= 0) {
      toast("Atenção", "Informe um custo válido.");
      return null;
    }

    // Queremos: margemDesejada = lucro / liquido
    // liquido = P - P*(taxaPct/100) - taxaFixa - desconto - frete
    // lucro = liquido - custo
    // => margem = (liquido - custo) / liquido = 1 - (custo/liquido)
    // => liquido = custo / (1 - margem)
    const m = clamp(margemDesejada / 100, 0, 0.95); // evita infinito
    const liquidoNecessario = custo / (1 - m);

    // liquido = P*(1 - taxaPct) - (taxaFixa+desconto+frete)
    const t = clamp(taxaPct / 100, 0, 0.95);
    const fixed = taxaFixa + desconto + frete;

    const P = (liquidoNecessario + fixed) / (1 - t);

    const roundMode = qs("#calcRoundMode")?.value || "none";
    const suggested = roundTo(P, roundMode);

    const liquido = suggested - (suggested * t) - fixed;
    const lucro = liquido - custo;
    const margem = liquido > 0 ? (lucro / liquido) * 100 : 0;

    const precoDe = suggested + precoDeAdd;

    state.calc.lastSuggested = suggested;
    state.calc.lastDe = precoDe;

    // output
    qs("#outPrecoSugerido") && (qs("#outPrecoSugerido").textContent = fmtMoney(suggested));
    qs("#outPrecoDe") && (qs("#outPrecoDe").textContent = `Preço “DE”: ${fmtMoney(precoDe)}`);

    qs("#outLiquido") && (qs("#outLiquido").textContent = fmtMoney(liquido));
    qs("#outCogs") && (qs("#outCogs").textContent = fmtMoney(custo));
    qs("#outLucro") && (qs("#outLucro").textContent = fmtMoney(lucro));
    qs("#outMargem") && (qs("#outMargem").textContent = fmtPct(margem));

    // regra de margem mínima
    const min = Number(state.rules[canal]?.margem_min_pct ?? 0);
    if (Number.isFinite(min) && margem < min) {
      toast("Aviso", `Margem ficou abaixo da mínima do canal (${fmtPct(min)}).`);
    }

    return { canal, suggested, precoDe, liquido, lucro, margem };
  }

  // =========================
  // Bulk apply suggested
  // =========================
  function applySuggestedBulk() {
    const canal = qs("#bulkCanal")?.value || "shopee";
    const roundMode = qs("#roundMode")?.value || "none";

    // usa regra global do canal e uma margem padrão (mínima) se não tiver no campo calculadora
    const r = state.rules[canal] || {};
    const margemDesejada = Number(r.margem_min_pct ?? 0);

    let changed = 0;

    for (const p of state.products) {
      const cost = Number(p.custo ?? p.custo_medio ?? 0);
      if (!Number.isFinite(cost) || cost <= 0) continue;

      const pr = state.pricesByProductId[p.id] || {};
      const current = pr[canal];
      // aplica apenas se estiver vazio
      if (current && current > 0) continue;

      // calcula sugerido usando regras globais
      const taxaPct = Number(r.taxa_pct ?? 0);
      const taxaFixa = Number(r.taxa_fixa ?? 0);
      const desconto = Number(r.desconto_medio ?? 0);
      const frete = Number(r.frete_seller ?? 0);

      const m = clamp(margemDesejada / 100, 0, 0.95);
      const liquidoNecessario = cost / (1 - m);
      const t = clamp(taxaPct / 100, 0, 0.95);
      const fixed = taxaFixa + desconto + frete;
      const P = (liquidoNecessario + fixed) / (1 - t);
      const suggested = roundTo(P, roundMode);

      state.pricesByProductId[p.id] ||= {};
      state.pricesByProductId[p.id][canal] = suggested;

      state.dirtyCells.add(`${p.id}:${canal}`);
      changed++;
    }

    renderPriceTable();
    toast("Aplicado", `${changed} preço(s) sugerido(s) preenchido(s) em ${canal.toUpperCase()}.`);
  }

  // =========================
  // Save / Undo
  // =========================
  async function savePrices() {
    if (state.dirtyCells.size === 0) {
      toast("Nada a salvar", "Sem alterações de preço.");
      return;
    }

    // monta payload só do que foi alterado
    const updates = [];
    for (const key of state.dirtyCells) {
      const [productId, canal] = key.split(":");
      const val = state.pricesByProductId[productId]?.[canal] ?? null;
      updates.push({ productId, canal, price: val });
    }

    try {
      await api("/admin/precificacao/prices", {
        method: "POST",
        body: JSON.stringify({ updates }),
      });

      state.dirtyCells.clear();
      updateDirtyHint();
      toast("Salvo", "Preços atualizados com sucesso.");

      // atualiza snapshot
      state.lastSnapshot = JSON.parse(JSON.stringify({
        pricesByProductId: state.pricesByProductId,
        rules: state.rules,
      }));
    } catch (e) {
      console.error(e);
      toast("Erro", e.message || "Falha ao salvar preços.");
    }
  }

  async function saveRules() {
    if (!state.dirtyRules) {
      toast("Nada a salvar", "Sem alterações nas regras.");
      return;
    }
    try {
      await api("/admin/precificacao/rules", {
        method: "POST",
        body: JSON.stringify({ rules: state.rules }),
      });

      state.dirtyRules = false;
      updateDirtyHint();
      toast("Salvo", "Regras globais atualizadas.");

      // snapshot
      state.lastSnapshot = JSON.parse(JSON.stringify({
        pricesByProductId: state.pricesByProductId,
        rules: state.rules,
      }));
    } catch (e) {
      console.error(e);
      toast("Erro", e.message || "Falha ao salvar regras.");
    }
  }

  function undoAll() {
    if (!state.lastSnapshot) return;
    state.pricesByProductId = JSON.parse(JSON.stringify(state.lastSnapshot.pricesByProductId));
    state.rules = JSON.parse(JSON.stringify(state.lastSnapshot.rules));

    state.dirtyCells.clear();
    state.dirtyRules = false;

    renderRulesTable();
    renderPriceTable();
    syncRulePreviewToCalc();
    preloadCalcFromRules();

    toast("Desfeito", "Voltamos pro último estado salvo.");
  }

  async function saveAll() {
    await saveRules();
    await savePrices();
  }

  // =========================
  // Save calculator suggested to fixed price
  // =========================
  function saveCalcToFixed() {
    const canal = qs("#calcCanal")?.value || "shopee";
    const pid = state.calc.selectedProductId;

    if (!pid) {
      toast("Atenção", "Escolha um produto na calculadora para salvar no preço fixo.");
      return;
    }
    if (!state.calc.lastSuggested || state.calc.lastSuggested <= 0) {
      toast("Atenção", "Calcule um preço sugerido antes.");
      return;
    }

    state.pricesByProductId[pid] ||= {};
    state.pricesByProductId[pid][canal] = state.calc.lastSuggested;
    state.dirtyCells.add(`${pid}:${canal}`);

    renderPriceTable();
    toast("Ok", `Preço salvo na tabela (pendente) para ${canal.toUpperCase()}.`);
  }

  // =========================
  // Bind UI
  // =========================
  function bindUI() {
    // Filters
    qs("#btnAplicarFiltro")?.addEventListener("click", () => renderPriceTable());
    qs("#btnLimparFiltro")?.addEventListener("click", () => {
      qs("#qProduto") && (qs("#qProduto").value = "");
      qs("#fCanal") && (qs("#fCanal").value = "all");
      qs("#onlyMissing") && (qs("#onlyMissing").checked = false);
      renderPriceTable();
    });
    qs("#btnRecarregarTabela")?.addEventListener("click", () => renderPriceTable());

    // Bulk
    qs("#btnAplicarSugerido")?.addEventListener("click", applySuggestedBulk);

    // Undo + Save
    qs("#btnDesfazer")?.addEventListener("click", undoAll);
    qs("#btnSalvarPrecos")?.addEventListener("click", savePrices);
    qs("#btnSalvarRegras")?.addEventListener("click", saveRules);
    qs("#btnSalvarTudo")?.addEventListener("click", saveAll);

    // Sync
    qs("#btnSync")?.addEventListener("click", loadAll);

    // Calculator
    qs("#btnCalcular")?.addEventListener("click", calcSuggested);
    qs("#btnCalcReset")?.addEventListener("click", () => {
      ["#calcProduto", "#calcCusto", "#calcMargem"].forEach((id) => qs(id) && (qs(id).value = ""));
      state.calc.selectedProductId = null;
      state.calc.lastSuggested = null;
      state.calc.lastDe = null;
      preloadCalcFromRules();

      ["#outPrecoSugerido","#outPrecoDe","#outLiquido","#outCogs","#outLucro","#outMargem"].forEach((id) => {
        const el = qs(id);
        if (!el) return;
        el.textContent = id === "#outPrecoDe" ? "Preço “DE”: —" : "—";
      });

      toast("Ok", "Calculadora limpa.");
    });

    qs("#calcCanal")?.addEventListener("change", () => {
      syncRulePreviewToCalc();
      preloadCalcFromRules();
    });

    qs("#btnPuxarRegras")?.addEventListener("click", () => {
      preloadCalcFromRules();
      syncRulePreviewToCalc();
      toast("Ok", "Regras aplicadas na calculadora.");
    });

    qs("#btnAplicarArredCalc")?.addEventListener("click", () => {
      if (!state.calc.lastSuggested) {
        toast("Atenção", "Calcule um preço primeiro.");
        return;
      }
      // recalcula já com round mode (reaproveita calcSuggested)
      calcSuggested();
    });

    qs("#btnSalvarPrecoCanal")?.addEventListener("click", saveCalcToFixed);

    // Regras: reset (client-side)
    qs("#btnResetRegras")?.addEventListener("click", () => {
      state.rules = {
        shopee: { taxa_pct: 14, taxa_fixa: 0, desconto_medio: 0, frete_seller: 0, preco_de_add: 5, margem_min_pct: 25 },
        ml:     { taxa_pct: 16, taxa_fixa: 0, desconto_medio: 0, frete_seller: 0, preco_de_add: 5, margem_min_pct: 25 },
        presencial:{ taxa_pct: 0, taxa_fixa: 0, desconto_medio: 0, frete_seller: 0, preco_de_add: 0, margem_min_pct: 35 },
      };
      state.dirtyRules = true;
      renderRulesTable();
      preloadCalcFromRules();
      syncRulePreviewToCalc();
      updateDirtyHint();
      toast("Ok", "Regras restauradas (pendente salvar).");
    });

    // Placeholder: Import/Export (depois conectamos)
    qs("#btnImportar")?.addEventListener("click", () => toast("Em breve", "Importação será implementada depois."));
    qs("#btnExportar")?.addEventListener("click", () => toast("Em breve", "Exportação será implementada depois."));

    // Arredondamento preview (simples: re-render)
    qs("#btnPreviewArred")?.addEventListener("click", () => {
      toast("Prévia", "O arredondamento será aplicado na ação em massa.");
    });

    // calcProduto: por enquanto só input — depois plugamos autocomplete via API
    // (vamos criar endpoint /admin/precificacao/products?q=... e trazer sugestões)
  }

  // =========================
  // Boot
  // =========================
  function boot() {
    setupTabs();
    bindUI();
    loadAll();
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
