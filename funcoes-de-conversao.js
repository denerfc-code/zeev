```javascript id="m4x2cf"
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
// EXIBIR IMAGENS
// =========================

async function custom_exibirImagensParaImpressao() {

    console.log("=================================");
    console.log("INICIANDO EVIDÊNCIAS");
    console.log("=================================");

    const campoEvidencias = document.querySelector(
        "div[xid='divevidencias']"
    );

    if (!campoEvidencias) {

        console.warn(
            "Campo de evidências não encontrado."
        );

        return;

    }

    const links = campoEvidencias.querySelectorAll(
        'a[href*="document/preview"]'
    );

    console.log(
        `Encontrados ${links.length} anexos.`
    );

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
            console.log("PROCESSANDO:");
            console.log(link.href);

            // =========================
            // BUSCA PREVIEW
            // =========================

            const response = await fetch(
                link.href,
                {
                    credentials: 'include'
                }
            );

            if (!response.ok) {

                console.error(
                    "Erro preview:",
                    response.status
                );

                continue;

            }

            const html = await response.text();

            // =========================
            // EXTRAI URL JPG/PNG DIRETO
            // =========================

            let srcImagem = null;

            // Procura URLs completas
            const regex =
                /https?:\/\/[^"' ]+\.(jpg|jpeg|png|webp)/gi;

            const urlsEncontradas =
                html.match(regex);

            if (
                urlsEncontradas &&
                urlsEncontradas.length > 0
            ) {

                srcImagem =
                    urlsEncontradas[0];

                console.log(
                    "URL encontrada via REGEX:",
                    srcImagem
                );

            }

            // =========================
            // TENTA SRC NORMAL
            // =========================

            if (!srcImagem) {

                const parser =
                    new DOMParser();

                const doc =
                    parser.parseFromString(
                        html,
                        'text/html'
                    );

                const img =
                    doc.querySelector('img');

                if (img) {

                    srcImagem =
                        img.src ||
                        img.getAttribute('src') ||
                        img.getAttribute(
                            'data-src'
                        ) ||
                        img.getAttribute(
                            'srcset'
                        );

                    console.log(
                        "Imagem encontrada via IMG:",
                        srcImagem
                    );

                }

            }

            // =========================
            // NÃO ENCONTROU
            // =========================

            if (!srcImagem) {

                console.warn(
                    "Imagem não localizada."
                );

                console.log(
                    "HTML PREVIEW:"
                );

                console.log(html);

                continue;

            }

            // =========================
            // URL RELATIVA
            // =========================

            if (
                srcImagem.startsWith('/')
            ) {

                srcImagem =
                    window.location.origin +
                    srcImagem;

            }

            console.log(
                "URL FINAL:"
            );

            console.log(srcImagem);

            // =========================
            // BAIXA IMAGEM VIA BLOB
            // =========================

            const imagemResponse =
                await fetch(
                    srcImagem,
                    {
                        credentials:
                            'include'
                    }
                );

            if (!imagemResponse.ok) {

                console.error(
                    "Erro download imagem:",
                    imagemResponse.status
                );

                continue;

            }

            const blob =
                await imagemResponse.blob();

            const objectURL =
                URL.createObjectURL(blob);

            console.log(
                "Blob criado."
            );

            // =========================
            // CRIA IMG
            // =========================

            const novaImagem =
                document.createElement('img');

            novaImagem.src =
                objectURL;

            novaImagem.alt =
                'Evidência';

            novaImagem.classList.add(
                'custom-imagem-evidencia'
            );

            novaImagem.onload =
                () => {

                    console.log(
                        "Imagem carregada."
                    );

                };

            novaImagem.onerror =
                () => {

                    console.error(
                        "Erro renderização imagem."
                    );

                };

            link.after(
                novaImagem
            );

            novaImagem.after(
                document.createElement(
                    'br'
                )
            );

        } catch (erro) {

            console.error(
                "Erro geral:",
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

window.addEventListener(
    "load",
    () => {

        console.log(
            "Página carregada."
        );

        setTimeout(() => {

            custom_exibirImagensParaImpressao();

        }, 2000);

    }
);
```
