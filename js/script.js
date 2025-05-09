// js/script.js

// 1) Opções de comissão específicas por canal
const commissionOptionsMap = {
  mercadolivre: [
    { label: 'Clássico 11.5%', value: 0.115 },
    { label: 'Premium 16.5%', value: 0.165 },
    { label: 'Custom', value: 'custom' }
  ],
  shopee: [
    { label: '20%', value: 0.20 },
    { label: '14%', value: 0.14 },
    { label: '22%', value: 0.22 },
    { label: '23%', value: 0.23 },
    { label: 'Custom', value: 'custom' }
  ],
  amazon: [
    { label: '10%', value: 0.10 },
    { label: '11%', value: 0.11 },
    { label: '12%', value: 0.12 },
    { label: '13%', value: 0.13 },
    { label: '14%', value: 0.14 },
    { label: '15%', value: 0.15 },
    { label: 'Custom', value: 'custom' }
  ],
  magalu: [
    { label: '14.5%', value: 0.145 },
    { label: '18%', value: 0.18 },
    { label: 'Custom', value: 'custom' }
  ]
};

// 2) Regras de taxa de venda por canal (podem variar conforme preço)
const channelFeeRules = {
  mercadolivre: price => {
    return price < 12.50 ? price / 2 : price < 29 ? 6.25 : price >= 29 && price < 50 ? 6.50 : price >= 50 && price < 79 ? 6.75 : 0;  
  },
  shopee: price => {
    // Exemplo: até R$150 → R$3, depois R$4
    return price >= 1 ? 4.00 : 0;
  },
  amazon: price => {
    // Exemplo: 2% sobre o preço + R$1 fixo
    return price < 30 ? 4.50 : price >= 30 && price < 79 ? 8.00 : 0;
  },
  magalu: price => {
    return price > 1 ? 5.00 : 0 // fixa
  }
};

// 3) Estado atual de cada canal (comissão selecionada e custom)
const channelStates = {};

// 4) Ao carregar a página: vincula listeners e calcula inicial
document.addEventListener('DOMContentLoaded', () => {
  bindListeners();
  calculateAll();
});

// 5) Vincula listeners nos inputs gerais e nos checkboxes de canal
function bindListeners() {
  const geral = ['#pdtpreco','#pdtcusto','#pdtkit','#pdtimposto','#pdtembalagem','#pdtenvio'];
  geral.forEach(sel =>
    document.querySelector(sel).addEventListener('input', calculateAll)
  );
  document.querySelectorAll('.switch input[type="checkbox"]')
    .forEach(cb => cb.addEventListener('change', calculateAll));
}

// 6) Função principal: lê parâmetros, limpa e renderiza cards
function calculateAll() {
  const preco     = parseFloat(document.getElementById('pdtpreco').value)   || 0;
  const custo     = parseFloat(document.getElementById('pdtcusto').value)   || 0;
  const kit       = parseInt  (document.getElementById('pdtkit').value, 10) || 1;
  const impostoPct= (parseFloat(document.getElementById('pdtimposto').value)|| 0) / 100;
  const embalagem = parseFloat(document.getElementById('pdtembalagem').value)|| 0;
  const frete     = parseFloat(document.getElementById('pdtenvio').value)   || 0;
  const params    = { preco, custo, kit, impostoPct, embalagem, frete };

  const container = document.getElementById('resultados');
  container.innerHTML = '';

  const checked = Array.from(
    document.querySelectorAll('.switch input[type="checkbox"]')
  ).filter(cb => cb.checked);

  if (checked.length === 0) {
    container.innerHTML = `
      <p class="bg-white text-center text-lg p-4 rounded-xl shadow-sm
                  font-[Open_Sans] text-slate-950">
        Ative os Canais de Marketplace para Calcular
      </p>`;
    return;
  }

  checked.forEach(cb => {
    const key = cb.value.toLowerCase();
    const nome = cb.value;

    // Inicializa estado se não existir
    if (!channelStates[key]) {
      const opts = commissionOptionsMap[key] || [];
      channelStates[key] = {
        commission: opts.length ? opts[0].value : 0,
        customCommission: 0
      };
    }

    renderChannelCard(key, nome, params);
  });
}

// 7) Renderiza/atualiza card de um canal
function renderChannelCard(key, nome, params) {
  const state      = channelStates[key];
  const opts       = commissionOptionsMap[key] || [];
  const price      = params.preco;
  const kitCost    = params.custo * params.kit;
  const taxAmt     = price * params.impostoPct;
  const commRate   = state.commission;
  const baseRate   = commRate === 'custom' ? state.customCommission : commRate;
  const commAmt    = price * baseRate;
  const fee        = (channelFeeRules[key] || (() => 0))(price);
  const totalCost  = kitCost + fee + commAmt + params.frete + params.embalagem + taxAmt;
  const lucro      = price - totalCost;
  const margem     = price ? (lucro / price) * 100 : 0;

  const card = document.createElement('div');
  card.className = 'card bg-white rounded-xl shadow-md text-stone-700 w-full max-w-md px-4 py-3 mb-4 border border-stone-200';

  card.innerHTML = `
    <!-- HEADER -->
    <div class="flex justify-between items-center border-b border-stone-200 pb-3 mb-3">
      <div>
        <h3 class="font-bold text-lg text-stone-800">${nome}</h3>
        <p class="text-xs text-stone-500">Escolha a comissão</p>
      </div>
      <div class="flex items-center space-x-2">
        <select class="commission-select text-xs p-1 border rounded bg-gray-50 shadow-sm">
          ${opts.map(o => `
            <option value="${o.value}" ${o.value === commRate ? 'selected' : ''}>
              ${o.label}
            </option>`).join('')}
        </select>
        <input type="number"
               class="custom-commission text-xs p-1 border rounded w-16 bg-gray-50 shadow-sm"
               placeholder="%"
               style="display: ${commRate === 'custom' ? 'block' : 'none'}"
               value="${commRate === 'custom'
                        ? (state.customCommission * 100).toFixed(2)
                        : ''}"
        />
      </div>
    </div>

    <!-- BODY -->
    <div class="grid grid-cols-3 gap-2 text-xs">
      <div class="bg-stone-50 p-2 rounded-lg shadow-sm">
        <p class="text-stone-500 font-medium">Venda</p>
        <p class="text-stone-800 font-semibold">R$ ${price.toFixed(2)}</p>
      </div>
      <div class="bg-stone-50 p-2 rounded-lg shadow-sm">
        <p class="text-stone-500 font-medium">Custo Total</p>
        <p class="text-stone-800 font-semibold">R$ ${kitCost.toFixed(2)}</p>
      </div>
      <div class="bg-stone-50 p-2 rounded-lg shadow-sm">
        <p class="text-stone-500 font-medium">Taxa de venda</p>
        <p class="text-stone-800 font-semibold">R$ ${fee.toFixed(2)}</p>
      </div>
      <div class="bg-stone-50 p-2 rounded-lg shadow-sm">
        <p class="text-stone-500 font-medium">Comissão</p>
        <p class="text-stone-800 font-semibold">R$ ${commAmt.toFixed(2)}</p>
      </div>
      <div class="bg-stone-50 p-2 rounded-lg shadow-sm">
        <p class="text-stone-500 font-medium">Frete</p>
        <p class="text-stone-800 font-semibold">R$ ${params.frete.toFixed(2)}</p>
      </div>
      <div class="bg-stone-50 p-2 rounded-lg shadow-sm">
        <p class="text-stone-500 font-medium">Embalagem</p>
        <p class="text-stone-800 font-semibold">R$ ${params.embalagem.toFixed(2)}</p>
      </div>
      <div class="bg-stone-50 p-2 rounded-lg shadow-sm col-span-1">
        <p class="text-stone-500 font-medium">Imposto</p>
        <p class="text-stone-800 font-semibold">R$ ${taxAmt.toFixed(2)}</p>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="border-t border-stone-200 mt-3 pt-3 flex justify-evenly items-center bg-amber-50 rounded-lg py-2 px-3">
      <div>
        <p class="text-xs text-stone-500">Lucro</p>
        <p class="text-base font-bold text-stone-800">R$ ${lucro.toFixed(2)}</p>
      </div>
      <div class="text-right">
        <p class="text-xs text-stone-500">Margem</p>
        <p class="text-base font-bold text-stone-800">${margem.toFixed(2)}%</p>
      </div>
    </div>
  `;

  // Eventos para comissão
  const sel = card.querySelector('.commission-select');
  const inp = card.querySelector('.custom-commission');

  sel.addEventListener('change', e => {
    const val = e.target.value;
    if (val === 'custom') {
      inp.style.display = 'block';
      state.commission = 'custom';
      state.customCommission = 0;
    } else {
      inp.style.display = 'none';
      state.commission = parseFloat(val);
    }
    calculateAll();
  });

  inp.addEventListener('change', e => {
    const pct = (parseFloat(e.target.value) || 0) / 100;
    state.customCommission = pct;
    calculateAll();
  });

  document.getElementById('resultados').appendChild(card);
}