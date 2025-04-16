const calcularLucro = () => {
    const obterValor = (seletor) => parseFloat(document.querySelector(seletor).value) || 0;
    
    const parametros = {
        preco: obterValor("#pdtpreco") || 0,
        custo: obterValor("#pdtcusto") || 0,
        kit: obterValor("#pdtkit") || 1,
        frete: obterValor("#pdtenvio") || 0,
        embalagem: obterValor("#pdtembalagem") || 0,
        imposto: (obterValor("#pdtimposto") || 10) / 100
    };

    const canais = document.querySelectorAll('input[type="checkbox"]:checked');
    const resultadosDiv = document.getElementById('resultados');
    resultadosDiv.innerHTML = '';

    canais.forEach(canal => {
        // Calcula preço de venda, lucro bruto e a margem de lucro para cada canal
        const { lucro, margem } = calcularPrecoVenda(canal.value.toLowerCase(), parametros);
        resultadosDiv.innerHTML += `<p class="bg-white text-center text-lg p-4 mb-4 rounded-xl shadow-sm font-[Open_Sans] text-slate-950">
        ${canal.value} : Lucro R$ ${lucro.toFixed(2)} | Margem ${margem.toFixed(2)}%
        </p>`;
      });
};

const calcularPrecoVenda = (canal, { preco, custo, kit, frete, embalagem, imposto }) => {
    let impostoVenda = preco * imposto;
    let custoTotal = (custo * kit) + frete + embalagem + impostoVenda;
    let lucroResultado;

        switch(canal) {
            case 'mercadolivre':
                const comissaoMeli = preco * 0.115;
                const taxaVendaMeli = preco < 29 ? 6.25 : preco >= 29 && preco < 50 ? 6.50 : preco >= 50 && preco < 79 ? 6.75 : 0;
                const custoFinalMeli = comissaoMeli + taxaVendaMeli + custoTotal;
                lucroResultado = calcularLucroBruto(preco, custoFinalMeli);
                break;
            
            case 'shopee':
                const comissaoShopee = preco * 0.20 > 100 ? 100 : preco * 0.20;
                const taxaVendaShopee = 4;
                const custoFinalShopee = comissaoShopee + taxaVendaShopee + custoTotal;
                lucroResultado = calcularLucroBruto(preco, custoFinalShopee);
                break;

            case 'magalu':
                const comissaoMagalu = preco * 0.18;
                const taxaVendaMagalu = 5;
                const custoFinalMagalu = comissaoMagalu + taxaVendaMagalu + custoTotal;
                lucroResultado = calcularLucroBruto(preco, custoFinalMagalu);
                break;

            case 'amazon':
                const comissaoAmazon = preco * 0.15;
                const taxaVendaAmazon = preco < 30 ? 4.50 : preco >= 30 && preco < 79 ? 8.00 : 0;
                const custoFinalAmazon = comissaoAmazon + taxaVendaAmazon + custoTotal;
                lucroResultado = calcularLucroBruto(preco, custoFinalAmazon);
                break;

            default:
                throw new Error(`Canal ${canal} não suportado`);
        }

    const margem = calcularMargem(preco, lucroResultado);
    return { 
        lucro: Number(lucroResultado),
        margem: Number(margem)
    };
};

const calcularLucroBruto = (preco, custoFinal) => {
    return (preco - custoFinal);
}

const calcularMargem = (preco, lucro) => { 
    if (preco === 0) return 0; 
    return (lucro / preco) * 100; 
};