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
            const response = await fetch(link.href, { credentials: 'include' });
            const html = await response.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');

            let imgInterna = doc.querySelector('img');
            if (!imgInterna) {
                console.warn("Nenhuma imagem no preview.");
                continue;
            }

            let imgSrc = imgInterna.getAttribute('src');
            let srcFinal = imgSrc.startsWith('http') ? imgSrc : new URL(link.href).origin + (imgSrc.startsWith('/') ? imgSrc : '/' + imgSrc);

            // Verifica se a URL retorna HTML em vez de imagem (caso JPG)
            let imgResponse = await fetch(srcFinal, { credentials: 'include' });
            const contentType = imgResponse.headers.get('content-type') || '';

            if (contentType.includes('text/html')) {
                console.log("Thumbnail retornou HTML, buscando imagem interna...");
                const html2 = await imgResponse.text();
                const doc2 = new DOMParser().parseFromString(html2, 'text/html');
                const imgInterna2 = doc2.querySelector('img');
                if (!imgInterna2) {
                    console.warn("Nenhuma imagem encontrada na segunda página.");
                    continue;
                }
                const imgSrc2 = imgInterna2.getAttribute('src');
                srcFinal = imgSrc2.startsWith('http') ? imgSrc2 : new URL(srcFinal).origin + (imgSrc2.startsWith('/') ? imgSrc2 : '/' + imgSrc2);
                console.log("Src final (2ª camada):", srcFinal);
                imgResponse = await fetch(srcFinal, { credentials: 'include' });
            }

            const blob = await imgResponse.blob();
            console.log("Tipo:", blob.type, "Tamanho:", blob.size);

            const novaImagem = document.createElement('img');
            novaImagem.src = URL.createObjectURL(blob);
            novaImagem.alt = 'Evidência';
            novaImagem.classList.add('custom-imagem-evidencia');
            novaImagem.onerror = () => console.error("Erro ao carregar imagem final.");

            link.after(novaImagem);
            novaImagem.after(document.createElement('br'));

        } catch (e) {
            console.error("Erro ao processar evidência:", e);
        }
    }

    console.log("Finalizado.");
}

window.addEventListener("load", () => setTimeout(custom_exibirImagensParaImpressao, 2000));
