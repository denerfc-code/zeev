async function custom_exibirImagensParaImpressao() {

    console.log("Iniciando exibição de evidências...");

    const campoEvidencias = document.querySelector("div[xid='divevidencias']");

    if (!campoEvidencias) {
        console.warn("Campo de evidências não encontrado.");
        return;
    }

    const linksDeEvidencia = campoEvidencias.querySelectorAll('a[href*="document/preview"]');

    console.log(`Encontrados ${linksDeEvidencia.length} anexos.`);

    for (const link of linksDeEvidencia) {

        if (link.nextElementSibling?.classList.contains('custom-imagem-evidencia')) {
            continue;
        }

        const imagemElemento = document.createElement('img');

        imagemElemento.src = link.href;

        imagemElemento.alt = 'Evidência';

        imagemElemento.classList.add('custom-imagem-evidencia');

        imagemElemento.onerror = () => {
            console.error("Erro ao carregar imagem:", link.href);
        };

        link.after(imagemElemento);

        imagemElemento.after(document.createElement('br'));

    }

    console.log("Finalizado.");
}

window.addEventListener("load", () => {

    setTimeout(() => {
        custom_exibirImagensParaImpressao();
    }, 2000);

});
