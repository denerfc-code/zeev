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

            const imgSrc = imgInterna.getAttribute('src');
            console.log("Imagem encontrada (src bruto):", imgSrc);

            let srcFinal;
            if (imgSrc.startsWith('http')) {
                srcFinal = imgSrc;
            } else {
                const urlBase = new URL(link.href);
                srcFinal = urlBase.origin + (imgSrc.startsWith('/') ? imgSrc : '/' + imgSrc);
            }

            console.log("Src final:", srcFinal);

            const novaImagem = document.createElement('img');

            novaImagem.src = srcFinal;

            novaImagem.alt = 'Evidência';

            novaImagem.classList.add('custom-imagem-evidencia');

            novaImagem.onerror = () => {
                console.error("Erro ao carregar imagem:", srcFinal);
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
