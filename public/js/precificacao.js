// public/js/precificacao.js
(() => {
  "use strict";

  // =========================
  // Helpers
  // =========================
  const qs = (s, el = document) => el.querySelector(s);
  const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));

  function toast(msg, type = "ok") {
    const box = qs("#toasts");
    if (!box) return;
    const el = document.createElement("div");
    el.className = "toast toast--" + type;
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(() => el.classList.add("show"), 10);
    setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => el.remove(), 250);
    }, 3200);
  }

  function num(v, def = null) {
    const n = Number(v);
    return Number.isFinite(n) ? n : def;
  }

  function parseBR(v) {
    if (v == null) return null;
    const s = String(v).trim();
    if (!s) return null;
    // aceita "1.234,56" ou "1234,56" ou "1234.56"
    const cleaned = s.replace(/\./g, "").replace(",", ".");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }

  function fmtBRL(n) {
    const v = Number(n);
    if (!Number.isFinite(v)) return "—";
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function roundTo(mode, value) {
    const v = Number(value);
    if (!Number.isFinite(v)) return v;
    if (mode === "none") return v;

    const base = Math.floor(v);
    const cents = mode === "90" ? 0.9 : mode === "99" ? 0.99 : 0.0;
    const out = base + cents;
    // se arredondou pra baixo demais (ex: 10,10 -> 10,00), sobe 1 real
    if (out < v) return (base + 1) + cents;
    return out;
  }

  // =========================
  // Bootstrap data
  // =========================
  const appEl = qs("#precificacaoApp");
  if (!appEl) return;

  const payload = appEl.getAttribute("data-payload") || "%7B%7D";
  let boot = {};
  try {
    boot = JSON.parse(decodeURIComponent(payload));
  } catch (e) {
    boot = {};
  }

  const SAVE_PRICES_URL = appEl.getAttribute("data-save-prices") || "/admin/precificacao/precos";
  const SAVE_RULES_URL = appEl.getAttribute("data-save-rules") || "/admin/precificacao/regras";

  const CANAIS = ["shopee", "ml", "presencial"];

  const state = {
    products: Array.isArray(boot.products) ? boot.products : [],
    pricesByProductId: boot.pricesByProductId || {},
    rules: boot.rules || {},
    draft: {},    // { [pid]: { [canal]: { por, de } } }
    filter: { q: "", canal: "all", onlyMissing: false },
    lastCalc: { por: null, de: null, canal: "shopee", productId: null }
  };

 function normPriceObj(v) {
  // compat: se vier number (antigo), vira {por:number, de:null}
  if (v == null) return { por: null, de: null };
  if (typeof v === "number") return { por: v, de: null };

  // novo formato
  const por = v.por ?? v.preco_venda ?? null;
  const de = v.de ?? v.preco_de ?? null;

  return { por: num(por, null), de: num(de, null) };
}


  function getBase(pid, canal) {
    const raw = state.pricesByProductId?.[pid]?.[canal];
    return normPriceObj(raw);
  }

  function getDraft(pid, canal) {
    const d = state.draft?.[pid]?.[canal];
    if (!d) return getBase(pid, canal);
    return { por: num(d.por, null), de: num(d.de, null) };
  }

  function setDraft(pid, canal, por, de) {
    state.draft[pid] ||= {};
    state.draft[pid][canal] = {
      por: por == null ? null : por,
      de: de == null ? null : de
    };
  }

  function isDirty() {
    for (const pid of Object.keys(state.draft)) {
      for (const canal of Object.keys(state.draft[pid] || {})) {
        const a = getBase(pid, canal);
        const b = getDraft(pid, canal);
        const samePor = (a.por == null && b.por == null) || Number(a.por) === Number(b.por);
        const sameDe  = (a.de == null && b.de == null) || Number(a.de) === Number(b.de);
        if (!samePor || !sameDe) return true;
      }
    }
    return false;
  }

  function dirtyCount() {
    let c = 0;
    for (const pid of Object.keys(state.draft)) {
      for (const canal of Object.keys(state.draft[pid] || {})) {
        const a = getBase(pid, canal);
        const b = getDraft(pid, canal);
        const samePor = (a.por == null && b.por == null) || Number(a.por) === Number(b.por);
        const sameDe  = (a.de == null && b.de == null) || Number(a.de) === Number(b.de);
        if (!samePor || !sameDe) c++;
      }
    }
    return c;
  }

  function setChip(text) {
    const el = qs("#statsChip");
    if (el) el.textContent = text;
  }

  function setDirtyHint() {
    const el = qs("#dirtyHint");
    if (!el) return;
    const n = dirtyCount();
    if (!n) el.textContent = "Nenhuma alteração pendente.";
    else el.textContent = `${n} alteração(ões) pendente(s).`;
  }

  // =========================
  // Tabs
  // =========================
  function initTabs() {
    const tabs = qsa(".tab");
    const panels = qsa("[data-panel]");

    function openTab(key) {
      tabs.forEach(t => t.classList.toggle("tab--active", t.getAttribute("data-tab") === key));
      panels.forEach(p => p.classList.toggle("hidden", p.getAttribute("data-panel") !== key));
    }

    tabs.forEach(t => {
      t.addEventListener("click", () => openTab(t.getAttribute("data-tab")));
    });

    openTab("preco-fixo");
  }

  // =========================
  // Rules
  // =========================
  function emptyRules() {
    return {
      shopee: { taxa_pct: 0, taxa_fixa: 0, desconto_medio: 0, frete_seller: 0, preco_de_add: 0, margem_min_pct: 0 },
      ml: { taxa_pct: 0, taxa_fixa: 0, desconto_medio: 0, frete_seller: 0, preco_de_add: 0, margem_min_pct: 0 },
      presencial: { taxa_pct: 0, taxa_fixa: 0, desconto_medio: 0, frete_seller: 0, preco_de_add: 0, margem_min_pct: 0 },
    };
  }

  function getRules(canal) {
    const r = state.rules?.[canal] || {};
    const base = emptyRules()[canal];
    return {
      taxa_pct: num(r.taxa_pct, base.taxa_pct),
      taxa_fixa: num(r.taxa_fixa, base.taxa_fixa),
      desconto_medio: num(r.desconto_medio, base.desconto_medio),
      frete_seller: num(r.frete_seller, base.frete_seller),
      preco_de_add: num(r.preco_de_add, base.preco_de_add),
      margem_min_pct: num(r.margem_min_pct, base.margem_min_pct),
    };
  }

  function fillRulesTable() {
    const table = qs("#regrasTable");
    if (!table) return;
    const base = emptyRules();
    for (const canal of CANAIS) {
      const row = table.querySelector(`tr[data-canal="${canal}"]`);
      if (!row) continue;
      const r = state.rules?.[canal] || base[canal];
      qsa("input[data-field]", row).forEach(inp => {
        const f = inp.getAttribute("data-field");
        const v = r?.[f];
        inp.value = v == null ? "" : String(v).replace(".", ",");
      });
    }
  }

  function collectRulesTable() {
    const table = qs("#regrasTable");
    const out = emptyRules();
    if (!table) return out;

    for (const canal of CANAIS) {
      const row = table.querySelector(`tr[data-canal="${canal}"]`);
      if (!row) continue;
      qsa("input[data-field]", row).forEach(inp => {
        const f = inp.getAttribute("data-field");
        const val = parseBR(inp.value);
        out[canal][f] = val == null ? 0 : val;
      });
    }
    return out;
  }

  async function saveRules() {
    const rules = collectRulesTable();
    const res = await fetch(SAVE_RULES_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rules })
    });

    if (!res.ok) throw new Error("Falha ao salvar regras");
    state.rules = rules;
    toast("Regras salvas 💾", "ok");
  }

  // =========================
  // Margin calc
  // =========================
  function calcMargin(price, cost, rules) {
    const p = Number(price);
    const c = Number(cost);
    if (!Number.isFinite(p) || p <= 0) return null;
    if (!Number.isFinite(c)) return null;

    const taxaPct = Number(rules.taxa_pct || 0) / 100;
    const taxaFixa = Number(rules.taxa_fixa || 0);
    const desconto = Number(rules.desconto_medio || 0);
    const frete = Number(rules.frete_seller || 0);

    const liquido = p - (p * taxaPct) - taxaFixa - desconto - frete;
    const lucro = liquido - c;
    const margem = (lucro / p) * 100;

    return { liquido, lucro, margem };
  }

  // =========================
  // Prices table render
  // =========================
  function applyFilters(list) {
    const q = (state.filter.q || "").trim().toLowerCase();
    const canal = state.filter.canal;
    const onlyMissing = !!state.filter.onlyMissing;

    return list.filter(p => {
      const name = String(p.nome || "").toLowerCase();
      const sku = String(p.sku || "").toLowerCase();
      const okQ = !q || name.includes(q) || sku.includes(q);

      if (!okQ) return false;

      if (onlyMissing) {
        if (canal === "all") {
          // missing se todos os canais estão sem Por
          const anyPor = CANAIS.some(c => {
            const v = getDraft(String(p.id), c).por;
            return Number.isFinite(Number(v)) && Number(v) > 0;
          });
          return !anyPor;
        } else {
          const por = getDraft(String(p.id), canal).por;
          return !(Number.isFinite(Number(por)) && Number(por) > 0);
        }
      }

      return true;
    });
  }

function renderPricesTable() {
  const tbody = qs("#precosTable tbody");
  if (!tbody) return;

  const list = applyFilters(state.products);
  const canalForMargin = state.filter.canal !== "all" ? state.filter.canal : "shopee";

  tbody.innerHTML = list.map(p => {
    const pid = String(p.id);

    const cells = CANAIS.map(canal => {
      const v = getDraft(pid, canal);
      const por = v.por == null ? "" : String(v.por).replace(".", ",");
      const de  = v.de  == null ? "" : String(v.de).replace(".", ",");

      return `
        <td class="num">
          <div style="display:flex;flex-direction:column;gap:6px;min-width:140px;">
            <input class="input input--sm num js-price"
              data-pid="${pid}" data-canal="${canal}" data-field="por"
              placeholder="Por" value="${por}" inputmode="decimal"/>

            <input class="input input--sm num js-price"
              data-pid="${pid}" data-canal="${canal}" data-field="de"
              placeholder="De (opcional)" value="${de}" inputmode="decimal"/>
          </div>
        </td>
      `;
    }).join("");

    const porForMargin = getDraft(pid, canalForMargin).por;
    const r = getRules(canalForMargin);
    const m = calcMargin(porForMargin, p.custo_medio ?? p.custo ?? 0, r);

    const marginTxt = m ? `${m.margem.toFixed(1).replace(".", ",")}%` : "—";

    const anyPrice = CANAIS.some(c => {
      const por = getDraft(pid, c).por;
      return Number.isFinite(Number(por)) && Number(por) > 0;
    });

    const status = anyPrice ? "OK" : "Sem preço";

    return `
      <tr>
        <td>${(p.nome || "").replace(/</g, "&lt;")}</td>
        <td>${(p.sku || "").replace(/</g, "&lt;")}</td>
        <td class="num">${Number(p.estoque_atual || 0)}</td>
        <td class="num">${fmtBRL(p.custo_medio ?? p.custo ?? 0)}</td>
        ${cells}
        <td class="num">${marginTxt}</td>
        <td>${status}</td>
      </tr>
    `;
  }).join("");

  const meta = qs("#tableMeta");
  if (meta) meta.textContent = `${list.length} produto(s) exibido(s)`;

  setChip(`Produtos: ${list.length} • Pendências: ${dirtyCount()}`);
  setDirtyHint();
}


  // =========================
  // Input handling
  // =========================
function onPriceInput(e) {
  const inp = e.target.closest(".js-price");
  if (!inp) return;

  const pid = inp.getAttribute("data-pid");
  const canal = inp.getAttribute("data-canal");
  const field = inp.getAttribute("data-field");

  const current = getDraft(pid, canal); // já vem com base se não tiver draft
  const val = parseBR(inp.value);

  const next = { ...current };
  next[field === "por" ? "por" : "de"] = val;

  setDraft(pid, canal, next.por, next.de);

  setChip(`Produtos: ${applyFilters(state.products).length} • Pendências: ${dirtyCount()}`);
  setDirtyHint();
}


  // =========================
  // Save prices
  // =========================
function buildPriceUpdates() {
  const updates = [];

  for (const pid of Object.keys(state.draft)) {
    for (const canal of Object.keys(state.draft[pid] || {})) {
      const base = getBase(pid, canal);
      const cur = getDraft(pid, canal);

      const samePor = (base.por == null && cur.por == null) || Number(base.por) === Number(cur.por);
      const sameDe  = (base.de  == null && cur.de  == null) || Number(base.de)  === Number(cur.de);

      if (samePor && sameDe) continue;

      updates.push({
        productId: pid,
        canal,
        price: cur.por,      // preco_venda
        priceDe: cur.de      // preco_de
      });
    }
  }

  return updates;
}

 async function savePrices() {
  const updates = buildPriceUpdates();

  if (!updates.length) {
    toast("Nada pra salvar 💅", "ok");
    return;
  }

  const res = await fetch(SAVE_PRICES_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ updates })
  });

  if (!res.ok) throw new Error("Falha ao salvar preços");

  // aplica no "base" (COM COMPAT)
  for (const u of updates) {
    state.pricesByProductId[u.productId] ||= { shopee: null, ml: null, presencial: null };
    state.pricesByProductId[u.productId][u.canal] = {
      por: u.price,
      de: u.priceDe,
      // compat:
      preco_venda: u.price,
      preco_de: u.priceDe
    };
  }

  // limpa draft
  state.draft = {};
  renderPricesTable();
  toast("Preços salvos 💾", "ok");
}


  function undoDraft() {
    state.draft = {};
    renderPricesTable();
    toast("Alterações desfeitas", "ok");
  }

  // =========================
  // Filters
  // =========================
  function initFilters() {
    const qProduto = qs("#qProduto");
    const fCanal = qs("#fCanal");
    const onlyMissing = qs("#onlyMissing");
    const btnLimpar = qs("#btnLimparFiltro");
    const btnAplicar = qs("#btnAplicarFiltro");

    if (qProduto) qProduto.addEventListener("input", () => state.filter.q = qProduto.value || "");
    if (fCanal) fCanal.addEventListener("change", () => state.filter.canal = fCanal.value || "all");
    if (onlyMissing) onlyMissing.addEventListener("change", () => state.filter.onlyMissing = !!onlyMissing.checked);

    if (btnAplicar) btnAplicar.addEventListener("click", () => renderPricesTable());

    if (btnLimpar) btnLimpar.addEventListener("click", () => {
      state.filter = { q: "", canal: "all", onlyMissing: false };
      if (qProduto) qProduto.value = "";
      if (fCanal) fCanal.value = "all";
      if (onlyMissing) onlyMissing.checked = false;
      renderPricesTable();
    });
  }

  // =========================
  // Bulk apply suggested
  // =========================
  function suggestedPrice(cost, margemPct, rules) {
    // objetivo: lucro = margemPct% do preço final (aprox)
    const c = Number(cost);
    const m = Number(margemPct) / 100;
    if (!Number.isFinite(c)) return null;

    const taxaPct = Number(rules.taxa_pct || 0) / 100;
    const taxaFixa = Number(rules.taxa_fixa || 0);
    const desconto = Number(rules.desconto_medio || 0);
    const frete = Number(rules.frete_seller || 0);

    // p*(1 - taxaPct - m) - taxaFixa - desconto - frete = c
    const denom = (1 - taxaPct - m);
    if (denom <= 0.01) return null;

    const p = (c + taxaFixa + desconto + frete) / denom;
    return p;
  }

  function initBulk() {
    const btn = qs("#btnAplicarSugerido");
    const bulkCanal = qs("#bulkCanal");
    const roundMode = qs("#roundMode");

    if (!btn || !bulkCanal || !roundMode) return;

 btn.addEventListener("click", () => {
  const canal = bulkCanal.value || "shopee";
  const rules = getRules(canal);

  const margemPct = Number(rules.margem_min_pct || 0);
  const list = applyFilters(state.products);

  let applied = 0;

  for (const p of list) {
    const pid = String(p.id);
    const cur = getDraft(pid, canal);

    const porExists = Number.isFinite(Number(cur.por)) && Number(cur.por) > 0;
    if (porExists && !state.filter.onlyMissing) continue;

    const sug = suggestedPrice(p.custo_medio ?? p.custo ?? 0, margemPct, rules);
    if (!sug) continue;

    const por = roundTo(roundMode.value || "none", sug);

    const deAdd = Number(rules.preco_de_add || 0);
    const de = deAdd > 0 ? roundTo(roundMode.value || "none", por + deAdd) : null;

    setDraft(pid, canal, por, de);
    applied++;
  }

  renderPricesTable();
  toast(applied ? `Aplicado em ${applied} produto(s)` : "Nada pra aplicar", applied ? "ok" : "warn");
});
  }


  // =========================
  // Calculator
  // =========================
  function initCalculator() {
    const calcProduto = qs("#calcProduto");
    const calcCanal = qs("#calcCanal");
    const calcCusto = qs("#calcCusto");
    const calcMargem = qs("#calcMargem");
    const calcTaxaPct = qs("#calcTaxaPct");
    const calcTaxaFixa = qs("#calcTaxaFixa");
    const calcDescontoMedio = qs("#calcDescontoMedio");
    const calcFreteSeller = qs("#calcFreteSeller");
    const calcPrecoDeAdd = qs("#calcPrecoDeAdd");

    const outPrecoSugerido = qs("#outPrecoSugerido");
    const outPrecoDe = qs("#outPrecoDe");
    const outLiquido = qs("#outLiquido");
    const outCogs = qs("#outCogs");
    const outLucro = qs("#outLucro");
    const outMargem = qs("#outMargem");

    const ruleTaxaPct = qs("#ruleTaxaPct");
    const ruleTaxaFixa = qs("#ruleTaxaFixa");
    const ruleDesconto = qs("#ruleDesconto");
    const ruleFrete = qs("#ruleFrete");
    const rulePrecoDe = qs("#rulePrecoDe");
    const ruleMargemMin = qs("#ruleMargemMin");

    const btnPuxarRegras = qs("#btnPuxarRegras");
    const btnCalcular = qs("#btnCalcular");
    const btnCalcReset = qs("#btnCalcReset");
    const calcRoundMode = qs("#calcRoundMode");
    const btnAplicarArredCalc = qs("#btnAplicarArredCalc");
    const btnSalvarPrecoCanal = qs("#btnSalvarPrecoCanal");

    function syncRulePreview() {
      const canal = calcCanal?.value || "shopee";
      const r = getRules(canal);

      if (ruleTaxaPct) ruleTaxaPct.textContent = `${Number(r.taxa_pct || 0).toFixed(2).replace(".", ",")}%`;
      if (ruleTaxaFixa) ruleTaxaFixa.textContent = fmtBRL(r.taxa_fixa || 0);
      if (ruleDesconto) ruleDesconto.textContent = fmtBRL(r.desconto_medio || 0);
      if (ruleFrete) ruleFrete.textContent = fmtBRL(r.frete_seller || 0);
      if (rulePrecoDe) rulePrecoDe.textContent = fmtBRL(r.preco_de_add || 0);
      if (ruleMargemMin) ruleMargemMin.textContent = `${Number(r.margem_min_pct || 0).toFixed(2).replace(".", ",")}%`;

      // preenche inputs (se vazios)
      if (calcTaxaPct && !calcTaxaPct.value) calcTaxaPct.value = String(r.taxa_pct || 0).replace(".", ",");
      if (calcTaxaFixa && !calcTaxaFixa.value) calcTaxaFixa.value = String(r.taxa_fixa || 0).replace(".", ",");
      if (calcDescontoMedio && !calcDescontoMedio.value) calcDescontoMedio.value = String(r.desconto_medio || 0).replace(".", ",");
      if (calcFreteSeller && !calcFreteSeller.value) calcFreteSeller.value = String(r.frete_seller || 0).replace(".", ",");
      if (calcPrecoDeAdd && !calcPrecoDeAdd.value) calcPrecoDeAdd.value = String(r.preco_de_add || 0).replace(".", ",");
      if (calcMargem && !calcMargem.value) calcMargem.value = String(r.margem_min_pct || 0).replace(".", ",");
    }

    function findProductByInput(txt) {
      const t = String(txt || "").trim().toLowerCase();
      if (!t) return null;

      // prioridade: SKU exato
      const bySku = state.products.find(p => String(p.sku || "").toLowerCase() === t);
      if (bySku) return bySku;

      // fallback: nome contém
      return state.products.find(p => String(p.nome || "").toLowerCase().includes(t)) || null;
    }

    function calc() {
      const canal = calcCanal?.value || "shopee";
      const cost = parseBR(calcCusto?.value);
      const margemPct = parseBR(calcMargem?.value);

      const taxaPct = parseBR(calcTaxaPct?.value) || 0;
      const taxaFixa = parseBR(calcTaxaFixa?.value) || 0;
      const desconto = parseBR(calcDescontoMedio?.value) || 0;
      const frete = parseBR(calcFreteSeller?.value) || 0;
      const deAdd = parseBR(calcPrecoDeAdd?.value) || 0;

      if (cost == null || margemPct == null) {
        toast("Preenche custo e margem, more", "warn");
        return;
      }

      const rules = { taxa_pct: taxaPct, taxa_fixa: taxaFixa, desconto_medio: desconto, frete_seller: frete };

      const sug = suggestedPrice(cost, margemPct, rules);
      if (!sug) {
        toast("Não deu pra calcular com esses valores (taxas+margem muito altas)", "warn");
        return;
      }

      let por = sug;
      let de = deAdd > 0 ? (por + deAdd) : null;

      // aplica arredondamento se já estiver setado
      const rm = calcRoundMode?.value || "none";
      por = roundTo(rm, por);
      if (de != null) de = roundTo(rm, de);

      const m = calcMargin(por, cost, rules);

      if (outPrecoSugerido) outPrecoSugerido.textContent = fmtBRL(por);
      if (outPrecoDe) outPrecoDe.textContent = `Preço “DE”: ${de != null ? fmtBRL(de) : "—"}`;
      if (outLiquido) outLiquido.textContent = m ? fmtBRL(m.liquido) : "—";
      if (outCogs) outCogs.textContent = fmtBRL(cost);
      if (outLucro) outLucro.textContent = m ? fmtBRL(m.lucro) : "—";
      if (outMargem) outMargem.textContent = m ? `${m.margem.toFixed(1).replace(".", ",")}%` : "—";

      const prod = findProductByInput(calcProduto?.value);
      state.lastCalc = {
        por,
        de,
        canal,
        productId: prod ? String(prod.id) : null
      };
    }

    function resetCalc() {
      if (calcProduto) calcProduto.value = "";
      if (calcCusto) calcCusto.value = "";
      if (calcMargem) calcMargem.value = "";
      if (calcTaxaPct) calcTaxaPct.value = "";
      if (calcTaxaFixa) calcTaxaFixa.value = "";
      if (calcDescontoMedio) calcDescontoMedio.value = "";
      if (calcFreteSeller) calcFreteSeller.value = "";
      if (calcPrecoDeAdd) calcPrecoDeAdd.value = "";

      if (outPrecoSugerido) outPrecoSugerido.textContent = "—";
      if (outPrecoDe) outPrecoDe.textContent = "Preço “DE”: —";
      if (outLiquido) outLiquido.textContent = "—";
      if (outCogs) outCogs.textContent = "—";
      if (outLucro) outLucro.textContent = "—";
      if (outMargem) outMargem.textContent = "—";

      state.lastCalc = { por: null, de: null, canal: calcCanal?.value || "shopee", productId: null };
    }

   function saveCalcToChannel() {
  const { por, de, canal, productId } = state.lastCalc;

  if (!Number.isFinite(Number(por))) {
    toast("Calcula primeiro, more", "warn");
    return;
  }

  if (!productId) {
    toast("Pra salvar, digita o SKU exato no campo Produto", "warn");
    return;
  }

  setDraft(productId, canal, por, de);
  renderPricesTable();
  toast("Preço aplicado na tabela (pendente de salvar)", "ok");
}


    if (calcCanal) calcCanal.addEventListener("change", () => syncRulePreview());
    if (btnPuxarRegras) btnPuxarRegras.addEventListener("click", () => {
      // reseta campos e puxa padrão do canal
      if (calcTaxaPct) calcTaxaPct.value = "";
      if (calcTaxaFixa) calcTaxaFixa.value = "";
      if (calcDescontoMedio) calcDescontoMedio.value = "";
      if (calcFreteSeller) calcFreteSeller.value = "";
      if (calcPrecoDeAdd) calcPrecoDeAdd.value = "";
      if (calcMargem) calcMargem.value = "";
      syncRulePreview();
      toast("Regras puxadas", "ok");
    });

    if (btnCalcular) btnCalcular.addEventListener("click", calc);
    if (btnCalcReset) btnCalcReset.addEventListener("click", resetCalc);

    if (btnAplicarArredCalc) btnAplicarArredCalc.addEventListener("click", () => {
      if (!Number.isFinite(Number(state.lastCalc.por))) {
        toast("Calcula primeiro", "warn");
        return;
      }
      calc();
      toast("Arredondamento aplicado", "ok");
    });

    if (btnSalvarPrecoCanal) btnSalvarPrecoCanal.addEventListener("click", saveCalcToChannel);

    syncRulePreview();
  }

  // =========================
  // Buttons
  // =========================
  function initButtons() {
    const btnSalvarPrecos = qs("#btnSalvarPrecos");
    const btnSalvarRegras = qs("#btnSalvarRegras");
    const btnSalvarTudo = qs("#btnSalvarTudo");
    const btnDesfazer = qs("#btnDesfazer");
    const btnRecarregarTabela = qs("#btnRecarregarTabela");
    const btnResetRegras = qs("#btnResetRegras");

    if (btnSalvarPrecos) btnSalvarPrecos.addEventListener("click", async () => {
      try { await savePrices(); } catch (e) { toast("Erro ao salvar preços", "err"); }
    });

    if (btnSalvarRegras) btnSalvarRegras.addEventListener("click", async () => {
      try { await saveRules(); } catch (e) { toast("Erro ao salvar regras", "err"); }
    });

    if (btnSalvarTudo) btnSalvarTudo.addEventListener("click", async () => {
      try {
        await saveRules();
        await savePrices();
      } catch (e) {
        toast("Erro ao salvar tudo", "err");
      }
    });

    if (btnDesfazer) btnDesfazer.addEventListener("click", () => undoDraft());
    if (btnRecarregarTabela) btnRecarregarTabela.addEventListener("click", () => renderPricesTable());

    if (btnResetRegras) btnResetRegras.addEventListener("click", () => {
      state.rules = emptyRules();
      fillRulesTable();
      toast("Regras restauradas", "ok");
    });
  }

  // =========================
  // Init
  // =========================
  function init() {
    initTabs();
    fillRulesTable();
    initFilters();
    initBulk();
    initCalculator();
    initButtons();

    document.addEventListener("input", onPriceInput);

    renderPricesTable();
    setChip(`Produtos: ${state.products.length} • Pendências: 0`);
  }

  init();
})();
