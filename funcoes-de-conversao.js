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

function custom_exibirImagensParaImpressao() {

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
        // CRIA IMG
        // ======================================

        var imagem =
            document.createElement("img");

        // Remove parâmetros problemáticos
        var urlImagem =
            link.href;

        // Força abertura limpa
        urlImagem =
            urlImagem.replace(
                "/preview",
                "/download"
            );

        imagem.src =
            urlImagem;

        imagem.alt =
            "Evidência";

        imagem.className =
            "custom-imagem-evidencia";

        // ======================================
        // SUCESSO
        // ======================================

        imagem.onload =
            function () {

                console.log(
                    "Imagem carregada com sucesso."
                );

            };

        // ======================================
        // ERRO
        // ======================================

        imagem.onerror =
            function () {

                console.error(
                    "Erro ao carregar imagem:"
                );

                console.error(
                    this.src
                );

            };

        // Adiciona imagem
        link.after(imagem);

        // Quebra linha
        imagem.after(
            document.createElement("br")
        );

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
