async function custom_exibirImagensParaImpressao() {

    console.log("Iniciando exibição de evidências...");

    const campoEvidencias = document.querySelector("div[xid='divevidencias']");

    if (!campoEvidencias) {
        console.warn("Campo de evidências não encontrado.");
        return;
    }

    const links = campoEvidencias.querySelectorAll('a[href*="document/preview"]');

    console.log(`Encontrados ${links.length} anexos.`);

    for (const link of links) {

        try {

            console.log("Abrindo preview:", link.href);

            const response = await fetch(link.href, {
                credentials: 'include'
            });

            const html = await response.text();

            const parser = new DOMParser();

            const doc = parser.parseFromString(html, 'text/html');

            const imgInterna = doc.querySelector('img');

            if (!imgInterna) {

                console.warn("Nenhuma imagem encontrada dentro do preview.");

                continue;
            }

            console.log("Imagem encontrada:", imgInterna.src);

            const novaImagem = document.createElement('img');

            novaImagem.src = imgInterna.src;

            novaImagem.alt = 'Evidência';

            novaImagem.classList.add('custom-imagem-evidencia');

            novaImagem.onerror = () => {
                console.error("Erro ao carregar imagem:", imgInterna.src);
            };

            link.after(novaImagem);

            novaImagem.after(document.createElement('br'));

        } catch (e) {

            console.error("Erro ao processar evidência:", e);

        }

    }

    console.log("Finalizado.");

}

window.addEventListener("load", () => {

    setTimeout(() => {

        custom_exibirImagensParaImpressao();

    }, 2000);

});



criei um link no github para usar no zeev, porem so funciona com png, jpg quebra a imagem
