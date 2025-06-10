// js/script.js

// 1) Opções de comissão específicas por canal
const commissionOptionsMap = {
  mercadolivre: [
    { label: '11.5%', value: 0.115 },
    { label: '16.5%', value: 0.165 },
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
    { label: '12%', value: 0.12 },
    { label: '10%', value: 0.10 },
    { label: '11%', value: 0.11 },
    { label: '13%', value: 0.13 },
    { label: '14%', value: 0.14 },
    { label: '15%', value: 0.15 },
    { label: 'Custom', value: 'custom' }
  ],
  magalu: [
    { label: '18%', value: 0.18 },
    { label: '14.5%', value: 0.145 },
    { label: 'Custom', value: 'custom' }
  ],
  tiktok: [
    { label: '18%', value: 0.18 },
    { label: '6%', value: 0.06 },
    { label: '12%', value: 0.12 },
    { label: '14%', value: 0.14 },
    { label: '16%', value: 0.16 },
    { label: 'Custom', value: 'custom' }
  ],
  shein: [
    { label: '16%', value: 0.16 },
    { label: 'Custom', value: 'custom' }
  ],
  nuvemshop: [
    { label: 'PIX', value: 0.0099 },
    { label: 'boleto', value: 0 },
    { label: '1x', value: 0.0499 },
    { label: '2x', value: 0.0797 },
    { label: '3x', value: 0.0946 },
    { label: '4x', value: 0.1095 },
    { label: '5x', value: 0.1244 },
    { label: '6x', value: 0.1393 },
    { label: '7x', value: 0.1542 },
    { label: '8x', value: 0.1691 },
    { label: '9x', value: 0.1840 },
    { label: '10x', value: 0.1989 },
    { label: '11x', value: 0.2138 },
    { label: '12x', value: 0.2287 },
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
    return price > 0 && price < 30 ? 4.50 : price >= 30 && price < 79 ? 8.00 : 0;
  },
  magalu: price => {
    return price > 1 ? 5.00 : 0 // fixa
  },
  tiktok: price => {
    return price > 1 && price < 79 ? 2.00 : 0 // fixa
  },
  shein: price => {
    return price > 1 ? 0.00 : 0 // fixa
  },
  nuvemshop: (price, label) => {
    if (!price) return 0;
    const parcelas = [
        '1x','2x','3x','4x','5x','6x','7x','8x','9x','10x','11x','12x'
    ];
    if (parcelas.includes(label)) return 0.35;
    if (label === 'PIX') return 0;
    if (label === 'boleto') return 2.39;
    return 0;
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
  const impostoPct= (parseFloat(document.getElementById('pdtimposto').value)|| 10) / 100;
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

// 7) Renderiza o card de cada canal com os dados calculados
function renderChannelCard(key, nome, params) {
  const state    = channelStates[key];
  const opts     = commissionOptionsMap[key] || [];
  const price    = params.preco;
  const kitCost  = params.custo * params.kit;
  const taxAmt   = price * params.impostoPct;
  const commRate = state.commission;
  const baseRate = commRate === 'custom' ? state.customCommission : commRate;

  // Limitação da comissão da Shopee a R$100
  const commAmtUncapped = price * baseRate;
  let commAmt = commAmtUncapped;
  if (key === 'shopee' && commAmt > 100) {
    commAmt = 100;
  }

  // Nuvemshop tem regras especiais para taxa de venda
  if (key === 'nuvemshop') {
    // Descobre o label selecionado no select
    const selectedOption = opts.find(o => o.value === state.commission);
    const label = selectedOption ? selectedOption.label : '';
    fee = (channelFeeRules[key] || (() => 0))(price, label);
  } else {
    fee = (channelFeeRules[key] || (() => 0))(price);
  }

  //const fee       = (channelFeeRules[key] || (() => 0))(price);
  const totalCost = kitCost + fee + commAmt + params.frete + params.embalagem + taxAmt;
  const lucro     = price - totalCost;
  const margem    = price ? (lucro / price) * 100 : 0;

  // Define a cor de fundo para todos os blocos (Venda, Lucro e Margem) baseando no valor da Margem
  let blocosBgColor;
  if (margem < 0) {
    blocosBgColor = 'bg-[#FDE2E1]'; // Vermelho para margem negativa
  } else if (margem >= 0 && margem <= 5) {
    blocosBgColor = 'bg-[#FEF3C7]'; // Amarelo para margem entre 0% e 5%
  } else {
    blocosBgColor = 'bg-[#DCFCE7]'; // Verde para margem maior que 5%
  }

  const card = document.createElement('div');
  card.className = 'card bg-[#F7F9FC] rounded-2xl shadow-lg w-full max-w-xl p-4 border border-[#E4E9F0] mb-4 justify-self-center';

  card.innerHTML = `
    <!-- HEADER -->
    <div class="flex justify-between items-center mb-4">
      <div>
        <h3 class="font-semibold text-lg text-[#334155]">${nome}</h3>
        <p class="text-sm text-[#64748B]">Escolha a opção de comissão</p>
      </div>
      <div class="flex items-center space-x-2 w-1/3">
        <select class="commission-select w-full text-sm p-2 border rounded bg-gray-50 shadow-sm">
          ${opts.map(o => `
            <option value="${o.value}" ${o.value === commRate ? 'selected' : ''}>
              ${o.label}
            </option>`).join('')}
        </select>
        <input type="number"
               class="custom-commission text-sm p-2 border rounded w-16 bg-gray-50"
               placeholder="%"
               style="display: ${commRate === 'custom' ? 'block' : 'none'}"
               value="${commRate === 'custom'
                        ? (state.customCommission * 100).toFixed(2) 
                        : ''}"
        />
      </div>
    </div>

    <!-- GRID DE INFORMAÇÕES EM 3 COLUNAS -->
    <div class="grid grid-cols-3 gap-4">
      <div class="bg-[#F1F5F9] p-3 rounded-lg">
        <p class="text-xs md:text-sm text-[#475569]">Custo Total</p>
        <p class="font-bold text-[#0F172A] text-sm md:text-base">R$ ${kitCost.toFixed(2)}</p>
      </div>
      <div class="bg-[#F1F5F9] p-3 rounded-lg">
        <p class="text-xs md:text-sm text-[#475569]">Taxa de Venda</p>
        <p class="font-bold text-[#0F172A] text-sm md:text-base">R$ ${fee.toFixed(2)}</p>
      </div>
      <div class="bg-[#F1F5F9] p-3 rounded-lg">
        <p class="text-xs md:text-sm text-[#475569]">Comissão</p>
        <p class="font-bold text-[#0F172A] text-sm md:text-base">R$ ${commAmt.toFixed(2)}</p>
      </div>
      <div class="bg-[#F1F5F9] p-3 rounded-lg">
        <p class="text-xs md:text-sm text-[#475569]">Frete</p>
        <p class="font-bold text-[#0F172A] text-sm md:text-base">R$ ${params.frete.toFixed(2)}</p>
      </div>
      <div class="bg-[#F1F5F9] p-3 rounded-lg">
        <p class="text-xs md:text-sm text-[#475569]">Embalagem</p>
        <p class="font-bold text-[#0F172A] text-sm md:text-base">R$ ${params.embalagem.toFixed(2)}</p>
      </div>
      <div class="bg-[#F1F5F9] p-3 rounded-lg">
        <p class="text-xs md:text-sm text-[#475569]">Imposto</p>
        <p class="font-bold text-[#0F172A] text-sm md:text-base">R$ ${taxAmt.toFixed(2)}</p>
      </div>
    </div>

    <!-- VENDA, LUCRO E MARGEM EM BLOCOS INDIVIDUAIS -->
    <div class="grid grid-cols-3 gap-4 mt-5">
      <div class="p-3 rounded-lg ${blocosBgColor} shadow-sm">
        <p class="text-xs md:text-sm text-[#475569]">Venda</p>
        <p class="font-bold text-[#0F172A] text-md md:text-xl">R$ ${price.toFixed(2)}</p>
      </div>
      <div class="p-3 rounded-lg ${blocosBgColor} shadow-sm">
        <p class="text-xs md:text-sm text-[#475569]">Lucro</p>
        <p class="font-bold text-[#0F172A] text-md md:text-xl">R$ ${lucro.toFixed(2)}</p>
      </div>
      <div class="p-3 rounded-lg ${blocosBgColor} shadow-sm">
        <p class="text-xs md:text-sm text-[#475569]">Margem</p>
        <p class="font-bold text-[#0F172A] text-md md:text-xl">${margem.toFixed(2)}%</p>
      </div>
    </div>
  `;

  // Eventos de mudança do select e input custom
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