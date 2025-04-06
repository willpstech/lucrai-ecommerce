calcularLucro = () => {
    //variaveis para os campos de entrada de dados formatados
    let pdtCusto = parseFloat(document.querySelector("#pdtcusto").value, 10) || 0;
    let pdtImposto = parseInt(document.querySelector("#pdtimposto").value, 10) || 0;
    let pdtFrete = parseFloat(document.querySelector("#pdtenvio").value, 10) || 0;
    let pdtEmbalagem = parseFloat(document.querySelector("#pdtembalagem").value, 10) || 1;
    let pdtKit = parseFloat(document.querySelector("#pdtkit").value, 10) || 1;
    let pdtMargem = parseFloat(document.querySelector("#pdtmargem").value, 10) || 0;

    let canalMLivre = window.document.getElementById("meli");
    // Identifica quais switches estão selecionados
    let canais = document.querySelectorAll('input[type="checkbox"]:checked');
    let resultadosDiv = document.getElementById('vendameli');
    resultadosDiv.innerHTML = '';  // Limpa resultados anteriores

}

function calcularPreco(canais, pdtCusto, pdtImposto, pdtFrete, pdtEmbalagem, pdtKit, pdtMargem) {
    let custoTotal = (pdtCusto * pdtKit) + pdtFrete + pdtEmbalagem;

    switch (canais) {
        case 'mercadoLivre':
            return calcularComImposto(custoTotal, pdtMargem, pdtImposto);

        case 'shopee':
            let precoShopee = calcularComImposto(custoTotal, pdtMargem, Imposto);
            let taxaAdicionalShopee = 10;  // Exemplo de taxa extra
            precoShopee += (precoShopee * taxaAdicionalShopee / 100);
            return precoShopee;

        default:
            return 0;
    }
}

function calcularComImposto(custoTotal, margem, imposto) {
    let precoBase = custoTotal * (1 + margem / 100);
    let precoVendaComImposto = precoBase / (1 - imposto / 100);
    return precoVendaComImposto;
}