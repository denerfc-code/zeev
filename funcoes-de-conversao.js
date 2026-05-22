// =========================
// FUNÇÕES AUXILIARES
// =========================

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

    return parseFloat(
        valor?.replace(/\./g, '')?.replace(',', '.')
    ) || 0;

}

function custom_converterDecimalParaString(valor) {

    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(valor);

}

// =========================
// EXIBIR IMAGENS DAS EVIDÊNCIAS
// =========================

async function custom_exibirImagensParaImpressao() {

    console.log("Iniciando exibição das evidências...");

    // Campo de evidências
    const campoEvidencias = document.querySelector(
        "div[xid='divevidencias']"
    );

    if (!campoEvidencias) {

        console.warn("Campo de evidências não encontrado.");

        return;

    }

    // Busca links preview
    const links = campoEvidencias.querySelectorAll(
        'a[href*="document/preview"]'
    );

    console.log(`Encontrados ${links.length} anexos.`);

    if (links.length === 0) {

        console.warn("Nenhum anexo encontrado.");

        return;

    }

    // Percorre anexos
    for (const link of links) {

        try {

            // Evita duplicar imagem
            if (
                link.nextElementSibling &&
                link.nextElementSibling.classList.contains(
                    'custom-imagem-evidencia'
                )
            ) {

                continue;

            }

            console.log("Abrindo preview:", link.href);

            // Busca HTML da página preview
            const response = await fetch(link.href, {
                credentials: 'include'
            });

            if (!response.ok) {

                console.error(
                    "Erro ao abrir preview:",
                    response.status
                );

                continue;

            }

            // Converte HTML
            const html = await response.text();

            const parser = new DOMParser();

            const doc = parser.parseFromString(
                html,
                'text/html'
            );

            // Procura imagem/source
            const elementoMidia = doc.querySelector(
                'img, source'
            );

            if (!elementoMidia) {

                console.warn(
                    "Nenhuma mídia encontrada dentro do preview."
                );

                continue;

            }

            // Obtém src
            const srcImagem =
                elementoMidia.src ||
                elementoMidia.getAttribute('src') ||
                elementoMidia.getAttribute('srcset');

            if (!srcImagem) {

                console.warn(
                    "Não foi possível obter o src da imagem."
                );

                continue;

            }

            console.log("Imagem encontrada:", srcImagem);

            // Cria imagem
            const novaImagem = document.createElement('img');

            novaImagem.src = srcImagem;

            novaImagem.alt = 'Evidência';

            novaImagem.classList.add(
                'custom-imagem-evidencia'
            );

            // Erro imagem
            novaImagem.onerror = () => {

                console.error(
                    "Erro ao carregar imagem:",
                    srcImagem
                );

            };

            // Adiciona após link
            link.after(novaImagem);

            // Quebra linha
            novaImagem.after(
                document.createElement('br')
            );

        } catch (erro) {

            console.error(
                "Erro ao processar evidência:",
                erro
            );

        }

    }

    console.log("Finalizado.");

}

// =========================
// INICIALIZAÇÃO
// =========================

// Aguarda carregamento total do Zeev
window.addEventListener("load", () => {

    console.log("Página carregada.");

    // Delay extra porque o Zeev carrega anexos depois
    setTimeout(() => {

        custom_exibirImagensParaImpressao();

    }, 2000);

});
