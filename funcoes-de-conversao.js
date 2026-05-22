// ======================================
// FUNÇÕES AUXILIARES
// ======================================

function custom_converterStringParaDate(valor) {

    if (!valor) {
        return null;
    }

    var partes = valor.split("/");

    return new Date(
        partes[2],
        partes[1] - 1,
        partes[0]
    );

}

function custom_converterDateParaString(valor) {

    if (!valor) {
        return '';
    }

    return new Intl.DateTimeFormat('pt-BR')
        .format(valor);

}

function custom_converterStringParaDecimal(valor) {

    if (!valor) {
        return 0;
    }

    valor = valor
        .replace(/\./g, '')
        .replace(',', '.');

    return parseFloat(valor) || 0;

}

function custom_converterDecimalParaString(valor) {

    return new Intl.NumberFormat(
        'pt-BR',
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ).format(valor);

}

// ======================================
// EXIBIR IMAGENS DAS EVIDÊNCIAS
// ======================================

async function custom_exibirImagensParaImpressao() {

    console.log("=================================");
    console.log("INICIANDO EVIDÊNCIAS");
    console.log("=================================");

    // Campo evidências
    var campoEvidencias = document.querySelector(
        "div[xid='divevidencias']"
    );

    if (!campoEvidencias) {

        console.warn(
            "Campo de evidências não encontrado."
        );

        return;

    }

    // Busca links
    var links = campoEvidencias.querySelectorAll(
        'a[href*="document/preview"]'
    );

    console.log(
        "Encontrados " +
        links.length +
        " anexos."
    );

    if (links.length === 0) {

        return;

    }

    // Percorre anexos
    for (var i = 0; i < links.length; i++) {

        var link = links[i];

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

            console.log("PROCESSANDO:");
            console.log(link.href);

            // ======================================
            // BUSCA HTML PREVIEW
            // ======================================

            var response = await fetch(
                link.href,
                {
                    credentials: 'include'
                }
            );

            if (!response.ok) {

                console.error(
                    "Erro preview: " +
                    response.status
                );

                continue;

            }

            var html = await response.text();

            // ======================================
            // PROCURA URL IMAGEM
            // ======================================

            var regex =
                /https?:\/\/[^"' ]+\.(jpg|jpeg|png|webp)/gi;

            var urlsEncontradas =
                html.match(regex);

            var srcImagem = null;

            if (
                urlsEncontradas &&
                urlsEncontradas.length > 0
            ) {

                srcImagem =
                    urlsEncontradas[0];

                console.log(
                    "URL encontrada:"
                );

                console.log(srcImagem);

            }

            // ======================================
            // TENTA VIA HTML IMG
            // ======================================

            if (!srcImagem) {

                var parser =
                    new DOMParser();

                var doc =
                    parser.parseFromString(
                        html,
                        'text/html'
                    );

                var img =
                    doc.querySelector('img');

                if (img) {

                    srcImagem =
                        img.src ||
                        img.getAttribute('src') ||
                        img.getAttribute('data-src');

                    console.log(
                        "Imagem encontrada via IMG:"
                    );

                    console.log(srcImagem);

                }

            }

            // ======================================
            // NÃO ENCONTROU
            // ======================================

            if (!srcImagem) {

                console.warn(
                    "Imagem não localizada."
                );

                console.log(html);

                continue;

            }

            // ======================================
            // AJUSTA URL RELATIVA
            // ======================================

            if (
                srcImagem.indexOf('/') === 0
            ) {

                srcImagem =
                    window.location.origin +
                    srcImagem;

            }

            console.log(
                "URL FINAL:"
            );

            console.log(srcImagem);

            // ======================================
            // BAIXA IMAGEM
            // ======================================

            var imagemResponse =
                await fetch(
                    srcImagem,
                    {
                        credentials: 'include'
                    }
                );

            if (!imagemResponse.ok) {

                console.error(
                    "Erro download imagem: " +
                    imagemResponse.status
                );

                continue;

            }

            // ======================================
            // CONVERTE PARA BLOB
            // ======================================

            var blob =
                await imagemResponse.blob();

            var objectURL =
                URL.createObjectURL(blob);

            // ======================================
            // CRIA ELEMENTO IMG
            // ======================================

            var novaImagem =
                document.createElement('img');

            novaImagem.src =
                objectURL;

            novaImagem.alt =
                'Evidência';

            novaImagem.className =
                'custom-imagem-evidencia';

            novaImagem.onload =
                function () {

                    console.log(
                        "Imagem carregada."
                    );

                };

            novaImagem.onerror =
                function () {

                    console.error(
                        "Erro ao renderizar imagem."
                    );

                };

            // Adiciona imagem
            link.after(novaImagem);

            // Quebra linha
            novaImagem.after(
                document.createElement('br')
            );

        } catch (erro) {

            console.error(
                "Erro geral:"
            );

            console.error(erro);

        }

    }

    console.log("=================================");
    console.log("FINALIZADO");
    console.log("=================================");

}

// ======================================
// INICIALIZAÇÃO
// ======================================

window.addEventListener(
    "load",
    function () {

        console.log(
            "Página carregada."
        );

        // Delay Zeev
        setTimeout(
            function () {

                custom_exibirImagensParaImpressao();

            },
            2000
        );

    }
);
