/*calcularLucro = () => {
    //variaveis para os campos de entrada de dados formatados
    let pdtCusto = parseFloat(document.querySelector("#pdtcusto").value, 10) || 5;
    let pdtImposto = parseInt(document.querySelector("#pdtimposto").value, 10) || 10;
    let pdtFrete = parseFloat(document.querySelector("#pdtenvio").value, 10) || 0;
    let pdtEmbalagem = parseFloat(document.querySelector("#pdtembalagem").value, 10) || 0;
    let pdtKit = parseFloat(document.querySelector("#pdtkit").value, 10) || 6;
    let pdtMargem = parseFloat(document.querySelector("#pdtmargem").value, 10) || 10;

// Identifica quais switches estão selecionados
let canais = document.querySelectorAll('input[type="checkbox"]:checked');
let resultadosDiv = document.getElementById('resultados');
resultadosDiv.innerHTML = '';  // Limpa resultados anteriores

canais.forEach(function(canalCheckbox) {
    let canal = canalCheckbox.value;
    let precoVenda = calcularPreco(canal, pdtCusto, pdtEmbalagem, pdtImposto, pdtMargem, pdtKit, pdtFrete);
    resultadosDiv.innerHTML += `<p>O preço de venda para ${canal} é R$ ${precoVenda.toFixed(2)}</p>`;
});
}

function calcularPreco(canal, pdtCusto, pdtEmbalagem, pdtImposto, pdtMargem, pdtKit, pdtFrete) {
// Inicialmente, estimativa inicial para o preço base um pouco alta, para garantir margem de ajuste na iteração
let precoBase = ((pdtCusto * pdtKit) + pdtFrete + pdtEmbalagem) * 3;

let margemCalculada = -1; // Para guarida no laço a margem até que seja viável
while (Math.abs(margemCalculada - pdtMargem) > 0.0001) {
    let custoTotal = (pdtCusto * pdtKit) + pdtFrete + pdtEmbalagem;
    
    // Com base no canal calcula a margem
    switch (canal) {
        case 'mercadoLivre':
            margemCalculada = calcularMargem(precoBase, custoTotal, pdtImposto, 0, 0);
            break;

        case 'shopee':
            let comissaoShopee = precoBase * 0.20;
            let taxaVendaShopee = 4;
            margemCalculada = calcularMargem(precoBase, custoTotal, impostoFinal, comissaoShopee, taxaVendaShopee);
            break;

        default:
            margemCalculada = 0; // Para prevenir valores indefinidos
            break;
    }

    // Ajusta o preço base de acordo com a diferença da margem real para a margem desejada
    precoBase *= (1 + (pdtMargem - margemCalculada) / 100);
}

return precoBase;
}

function calcularMargem(precoBase, custoTotal, pdtImposto, comissao, taxa) {
let custoComComissaoETaxa = custoTotal + comissao + taxa + impostoFinal;
let lucroBruto = precoBase - custoComComissaoETaxa;
let margem = (lucroBruto / custoTotal) * 100;

return margem;
}*/
function calcularLucro() {
  // Variáveis para os campos de entrada de dados formatados
  let pdtCusto = parseFloat(document.querySelector("#pdtcusto").value, 10) || 5;
  let pdtImposto = parseInt(document.querySelector("#pdtimposto").value, 10) || 10;
  let pdtFrete = parseFloat(document.querySelector("#pdtenvio").value, 10) || 0;
  let pdtEmbalagem = parseFloat(document.querySelector("#pdtembalagem").value, 10) || 0;
  let pdtKit = parseFloat(document.querySelector("#pdtkit").value, 10) || 6;
  let pdtMargem = parseFloat(document.querySelector("#pdtmargem").value, 10) || 10;

  // Identifica quais switches estão selecionados
  let canais = document.querySelectorAll('input[type="checkbox"]:checked');
  let resultadosDiv = document.getElementById('resultados');
  resultadosDiv.innerHTML = ''; // Limpa resultados anteriores

  canais.forEach(function (canalCheckbox) {
      let canal = canalCheckbox.value;
      let precoVenda = calcularPreco(canal, pdtCusto, pdtEmbalagem, pdtImposto, pdtMargem, pdtKit, pdtFrete);
      resultadosDiv.innerHTML += `<p>O preço de venda para ${canal} é R$ ${precoVenda.toFixed(2)}</p>`;
  });
}

function calcularPreco(canal, pdtCusto, pdtEmbalagem, pdtImposto, pdtMargem, pdtKit, pdtFrete) {
  let custoTotal = (pdtCusto * pdtKit) + pdtFrete + pdtEmbalagem;
  let precoBase = custoTotal; // Inicia com o custo total 

  let margemCalculada = -1;

  while (Math.abs(margemCalculada - pdtMargem) > 0.0001) {
      let comissao = 0;
      let taxa = 0;

      if (canal === 'shopee') {
          comissao = precoBase * 0.20;
          taxa = 4;
      }

      // Calcula margem baseada nas custo, comissões, taxas, e impostos
      margemCalculada = calcularMargem(precoBase, custoTotal, pdtImposto, comissao, taxa);

      // Ajusta 'precoBase'
      precoBase *= (1 + (pdtMargem - margemCalculada) / 100);
  }

  return precoBase;
}

function calcularMargem(precoBase, custoTotal, pdtImposto, comissao, taxa) {
  let precoLiquido = precoBase - comissao - taxa;
  let custoComImposto = custoTotal + (precoBase * (pdtImposto / 100));
  let lucroBruto = precoLiquido - custoComImposto;
  let margem = (lucroBruto / custoComImposto) * 100;  // Corrigi a fórmula da margem

  return margem;
}