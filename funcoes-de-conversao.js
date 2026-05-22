// Funções de conversão (mantidas para consistência, mesmo que não usadas diretamente aqui)
function custom_converterStringParaDate(valor) {
    if (!valor) return null;
    const [dia, mes, ano] = valor.split("/");
    return new Date(ano, mes - 1, dia);
}

function custom_converterDateParaString(valor) {
    if (!valor) return '';
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
 *
 * Devido a problemas de segurança ou configuração do servidor, links de preview
 * podem não funcionar diretamente na tag <img>, mesmo que abram em uma nova aba.
 * Esta versão tenta buscar a imagem via fetch e convertê-la em um URL de objeto.
 */
async function custom_exibirImagensParaImpressao() {
    console.log("Zai: Iniciando custom_exibirImagensParaImpressao...");

    // 1. Centraliza o seletor do campo 'evidencias'
    // Dener, por favor, confirme se 'div[xid="divevidencias"]' ainda é o identificador correto
    // para o container do campo de evidências. Se não for, me informe o identificador correto.
    const campoEvidencias = document.querySelector("div[xid='divevidencias']");

    // 2. Verifica se o campo existe no relatório
    if (!campoEvidencias) {
        console.warn("Zai: O campo 'evidencias' NÃO foi encontrado usando o seletor 'div[xid=\"divevidencias\"]'. Por favor, verifique o identificador (xid).");
        return;
    }
    console.log("Zai: Campo 'evidencias' encontrado.");

    // 3. Encontra todos os links de pré-visualização de documentos dentro do campo de evidências.
    const linksDeEvidencia = campoEvidencias.querySelectorAll('a[href*="document/preview"]');
    console.log(`Zai: Encontrados ${linksDeEvidencia.length} links de pré-visualização.`);

    if (linksDeEvidencia.length === 0) {
        console.warn("Zai: Nenhum link de pré-visualização com 'document/preview' foi encontrado dentro do campo de evidências.");
        return; // Não há links para processar
    }

    // 4. Itera sobre cada link encontrado para buscar e exibir as imagens.
    for (const link of linksDeEvidencia) {
        const urlImagemOriginal = link.href;

        // Verifica se o URL do link existe e se uma imagem para este link ainda não foi adicionada.
        // Isso evita adicionar a mesma imagem múltiplas vezes em caso de reexecução da função.
        if (urlImagemOriginal && !link.nextElementSibling?.classList.contains('custom-imagem-evidencia')) {
            console.log(`Zai: Tentando carregar imagem para o URL: ${urlImagemOriginal}`);

            try {
                // 5. Usa fetch para obter a imagem. O fetch geralmente envia os cookies de sessão
                // necessários para acessar recursos protegidos.
                const response = await fetch(urlImagemOriginal);

                if (!response.ok) {
                    // Se a resposta não for OK (ex: 404, 403, 500), lançamos um erro.
                    throw new Error(`Erro ao buscar a imagem: ${response.status} ${response.statusText}`);
                }

                // 6. Obtém os dados da imagem como um Blob (objeto binário grande)
                const imageBlob = await response.blob();

                // 7. Cria um URL de objeto que pode ser usado como src para a tag <img>.
                // Este URL é temporário e aponta para os dados da imagem no navegador.
                const objectURL = URL.createObjectURL(imageBlob);

                // 8. Cria o elemento <img> e define o src com o URL de objeto
                const imagemElemento = document.createElement('img');
                imagemElemento.src = objectURL;
                imagemElemento.alt = `Evidência: ${link.textContent || 'Anexo'}`;
                imagemElemento.classList.add('custom-imagem-evidencia'); // Adiciona uma classe para estilização via CSS.

                // 9. Insere a imagem logo após o link original no DOM.
                link.after(imagemElemento);

                // Adiciona uma quebra de linha após a imagem para melhor organização visual.
                imagemElemento.after(document.createElement('br'));
                console.log("Zai: Imagem carregada via fetch e inserida no DOM com sucesso.");

                // Boa prática: Liberar o Object URL quando ele não for mais necessário para economizar memória.
                // Para relatórios que são visualizados e depois fechados, pode não ser crítico,
                // mas é uma boa prática.
                // window.addEventListener('beforeunload', () => URL.revokeObjectURL(objectURL));

            } catch (error) {
                console.error(`Zai: Erro ao carregar ou exibir a imagem do link "${urlImagemOriginal}":`, error);
                // Opcional: Adicionar uma mensagem de erro visível ao usuário no relatório
                const erroElemento = document.createElement('p');
                erroElemento.textContent = `Não foi possível carregar a evidência "${link.textContent || 'Anexo'}". Erro: ${error.message}`;
                erroElemento.style.color = 'red'; // Estilo simples para destacar o erro
                link.after(erroElemento);
                link.after(document.createElement('br'));
            }
        } else if (!urlImagemOriginal) {
            console.warn(`Zai: Link não possui um URL válido.`);
        } else {
            console.log(`Zai: Imagem para o link já existe ou condição não atendida.`);
        }
    }
    console.log("Zai: custom_exibirImagensParaImpressao finalizada.");
}

// 10. Adiciona um listener para executar a função 'custom_exibirImagensParaImpressao'
document.addEventListener("DOMContentLoaded", custom_exibirImagensParaImpressao);
