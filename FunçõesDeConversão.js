// Funções de conversão (mantidas para consistência, mesmo que não usadas diretamente aqui)
function custom_converterStringParaDate(valor) {
    const [dia, mes, ano] = valor.split("/");
    return new Date(ano, mes - 1, dia);
}

function custom_converterDateParaString(valor) {
    return new Intl.DateTimeFormat('pt-BR').format(valor);
}

function custom_converterStringParaDecimal(valor) {
    return parseFloat(valor?.replace(/\./g, '')?.replace(',', '.')) || 0;
}

function custom_converterDecimalParaString(valor) {
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valor);
}

/**
 * @function custom_exibirImagensParaImpressao
 * @description Localiza o campo de evidências, extrai os URLs das imagens anexadas
 * e as exibe diretamente no formulário/relatório para que sejam impressas.
 * Esta função é projetada para ser executada em modo de visualização/leitura.
 */
function custom_exibirImagensParaImpressao() {
    console.log("Zai: (Relatório - JS Externo) Iniciando custom_exibirImagensParaImpressao...");

    // 1. Centraliza o seletor do campo 'evidencias'
    // Usando o 'xid' que você confirmou.
    const campoEvidencias = document.querySelector("div[xid='divevidencias']");

    // 2. Verifica se o campo existe no relatório
    if (!campoEvidencias) {
        console.warn("Zai: (Relatório - JS Externo) O campo 'evidencias' NÃO foi encontrado no relatório usando o seletor 'div[xid=\"divevidencias\"]'. Verifique o 'xid'.");
        return;
    }
    console.log("Zai: (Relatório - JS Externo) Campo 'evidencias' encontrado:", campoEvidencias);

    // 3. Encontra todos os links de pré-visualização de documentos dentro do campo de evidências.
    const linksDeEvidencia = campoEvidencias.querySelectorAll('a[href*="document/preview"]');
    console.log(`Zai: (Relatório - JS Externo) Encontrados ${linksDeEvidencia.length} links de pré-visualização.`);

    // 4. Itera sobre cada link encontrado para criar e adicionar as imagens.
    if (linksDeEvidencia.length === 0) {
        console.warn("Zai: (Relatório - JS Externo) Nenhum link de pré-visualização com 'document/preview' foi encontrado dentro do campo de evidências.");
    }

    linksDeEvidencia.forEach(link => {
        const urlImagem = link.href;

        // 5. Verifica se o URL do link existe e se uma imagem para este link ainda não foi adicionada.
        if (urlImagem && !link.nextElementSibling?.classList.contains('custom-imagem-evidencia')) {
            console.log(`Zai: (Relatório - JS Externo) Criando imagem para o URL: ${urlImagem}`);
            const imagemElemento = document.createElement('img');
            imagemElemento.src = urlImagem;
            imagemElemento.alt = `Evidência: ${link.textContent}`;
            imagemElemento.classList.add('custom-imagem-evidencia'); // Adiciona uma classe para estilização via CSS.

            // Insere a imagem logo após o link original no DOM.
            link.after(imagemElemento);
            // Adiciona uma quebra de linha após a imagem para melhor organização visual,
            // especialmente se houver múltiplos arquivos.
            imagemElemento.after(document.createElement('br'));
            console.log("Zai: (Relatório - JS Externo) Imagem criada e inserida no DOM.");
        } else if (!urlImagem) {
            console.warn(`Zai: (Relatório - JS Externo) Link não possui um URL válido.`);
        } else {
            console.log(`Zai: (Relatório - JS Externo) Imagem para o link já existe ou condição não atendida.`);
        }
    });
    console.log("Zai: (Relatório - JS Externo) custom_exibirImagensParaImpressao finalizada.");
}

// 6. Adiciona um listener para executar a função 'custom_exibirImagensParaImpressao'
document.addEventListener("DOMContentLoaded", custom_exibirImagensParaImpressao);
