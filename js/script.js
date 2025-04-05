calcularLucro = () => {
    //variaveis para os campos de entrada de dados formatados
    let pdtCusto = parseFloat(document.querySelector("#pdtcusto").value, 10) || 0;
    let pdtImposto = parseInt(document.querySelector("#pdtimposto").value, 10) || 0;
    let pdtFrete = parseFloat(document.querySelector("#pdtenvio").value, 10) || 0;
    let pdtEmbalagem = parseFloat(document.querySelector("#pdtembalagem").value, 10) || 1;
    let pdtKit = parseFloat(document.querySelector("#pdtkit").value, 10) || 1;
    let pdtMargem = parseFloat(document.querySelector("#pdtmargem").value, 10) || 0;

    let canalMLivre = document.getElementById("#mercadolivre");


    if(canalMLivre.textContent.includes("MercadoLivre")){
        let custoTotal = (pdtCusto * pdtKit) + pdtFrete + pdtEmbalagem;
        
         // Estimativa inicial para o preço de venda
    let precoVenda = custoTotal * (1 + margemDesejada / 100) / (1 - imposto / 100);

    for (let tentativa = 0; tentativa < 100000; tentativa++) {
        // Calcula a margem de lucro real baseado no imposto aplicado ao preço de venda
        let receitaTotal = precoVenda * (1 - imposto / 100);
        let lucroReal = receitaTotal - custoTotal;
        let margemReal = (lucroReal / custoTotal) * 100;

        // Verifica se a margem de lucro real está próxima da margem desejada
        if (Math.abs(margemReal - margemDesejada) < 0.0001) {
            return precoVenda;
        }

        // Ajusta o preço de venda
        precoVenda *= (1 + (margemDesejada - margemReal) / 100);
    }

    return precoVenda;
    }


}

// Exemplo de uso
let pdtCusto = 100;      // Exemplo: R$ 100,00 por unidade
let pdtEmbalagem = 5;   // Custo da embalagem por unidade
let pdtFrete = 15;      // Frete por unidade
let imposto = 10;       // Imposto de 10% sobre o preço de venda
let pdtKit = 2;         // Quantidade de itens no kit
let margemDesejada = 10; // Margem de lucro desejada: 10%

let precoFinal = calcularLucro(pdtCusto, pdtEmbalagem, pdtFrete, imposto, pdtKit, margemDesejada);
console.log(`O preço de venda para o kit é aproximadamente R$ ${precoFinal.toFixed(2)}`);