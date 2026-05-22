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

    console.log("=================================");
    console.log("INICIANDO EXIBIÇÃO DE EVIDÊNCIAS");
    console.log("=================================");

    // Campo evidências
    const campoEvidencias = document.querySelector(
        "div[xid='divevidencias']"
    );

    if (!campoEvidencias) {

        console.warn(
            "Campo de evidências não encontrado."
        );

        return;

    }

    // Busca links preview
    const links = campoEvidencias.querySelectorAll(
        'a[href*="document/preview"]'
    );

    console.log(
        `Encontrados ${links.length} anexos.`
    );

    if (links.length === 0) {

        console.warn("Nenhum anexo encontrado.");

        return;

    }

    // Percorre anexos
    for (const link of links) {

        try {

            // Evita duplicidade
            if (
                link.nextElementSibling &&
                link.nextElementSibling.classList.contains(
                    'custom-imagem-evidencia'
                )
            ) {

                continue;

            }

            console.log("=================================");
            console.log("PROCESSANDO LINK:");
            console.log(link.href);

            // Busca preview HTML
            const response = await fetch(
                link.href,
                {
                    credentials: 'include'
                }
            );

            if (!response.ok) {

                console.error(
                    "Erro ao abrir preview:",
                    response.status
                );

                continue;

            }

            // HTML preview
            const html = await response.text();

            // Parse HTML
            const parser = new DOMParser();

            const doc = parser.parseFromString(
                html,
                'text/html'
            );

            let srcImagem = null;

            // =========================
            // TENTA IMG NORMAL
            // =========================

            const img = doc.querySelector('img');

            if (img) {

                srcImagem =
                    img.src ||
                    img.getAttribute('src') ||
                    img.getAttribute('data-src') ||
                    img.getAttribute('srcset');

                console.log(
                    "Imagem encontrada via IMG:",
                    srcImagem
                );

            }

            // =========================
            // TENTA SOURCE
            // =========================

            if (!srcImagem) {

                const source =
                    doc.querySelector('source');

                if (source) {

                    srcImagem =
                        source.src ||
                        source.getAttribute('src') ||
                        source.getAttribute(
                            'srcset'
                        );

                    console.log(
                        "Imagem encontrada via SOURCE:",
                        srcImagem
                    );

                }

            }

            // =========================
            // TENTA DATA-SRC
            // =========================

            if (!srcImagem) {

                const lazy =
                    doc.querySelector('[data-src]');

                if (lazy) {

                    srcImagem =
                        lazy.getAttribute(
                            'data-src'
                        );

                    console.log(
                        "Imagem encontrada via DATA-SRC:",
                        srcImagem
                    );

                }

            }

            // =========================
            // TENTA BACKGROUND IMAGE
            // =========================

            if (!srcImagem) {

                const elementos =
                    doc.querySelectorAll('*');

                for (const el of elementos) {

                    const bg =
                        window.getComputedStyle(el)
                            .backgroundImage;

                    if (
                        bg &&
                        bg !== 'none' &&
                        bg.includes('url(')
                    ) {

                        srcImagem = bg
                            .replace('url("', '')
                            .replace('url(', '')
                            .replace('")', '')
                            .replace(')', '');

                        console.log(
                            "Imagem encontrada via BACKGROUND:",
                            srcImagem
                        );

                        break;

                    }

                }

            }

            // =========================
            // NÃO ENCONTROU
            // =========================

            if (!srcImagem) {

                console.warn(
                    "Não foi possível localizar imagem."
                );

                console.log(
                    "HTML COMPLETO DO PREVIEW:"
                );

                console.log(
                    doc.body.innerHTML
                );

                continue;

            }

            // =========================
            // AJUSTA URL RELATIVA
            // =========================

            if (
                srcImagem.startsWith('/')
            ) {

                srcImagem =
                    window.location.origin +
                    srcImagem;

            }

            console.log(
                "URL FINAL DA IMAGEM:"
            );

            console.log(srcImagem);

            // =========================
            // CRIA IMAGEM
            // =========================

            const novaImagem =
                document.createElement('img');

            novaImagem.src = srcImagem;

            novaImagem.alt = 'Evidência';

            novaImagem.classList.add(
                'custom-imagem-evidencia'
            );

            // Log carregamento
            novaImagem.onload = () => {

                console.log(
                    "Imagem carregada com sucesso."
                );

            };

            // Log erro
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

    console.log("=================================");
    console.log("FINALIZADO");
    console.log("=================================");

}

// =========================
// INICIALIZAÇÃO
// =========================

window.addEventListener("load", () => {

    console.log(
        "Página carregada."
    );

    // Delay Zeev
    setTimeout(() => {

        custom_exibirImagensParaImpressao();

    }, 2000);

});
