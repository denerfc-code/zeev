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
            // Extrai o ID do documento da URL
            const match = link.href.match(/\/document\/preview\/(\d+)/);
            const documentoId = match ? match[1] : null;
            
            console.log("Processando documento ID:", documentoId);

            // Tenta primeiro encontrar a imagem no preview (para PNG)
            const response = await fetch(link.href, {
                credentials: 'include'
            });

            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            let imgInterna = doc.querySelector('img');
            
            // Se não encontrou imagem no preview, tenta URL direta (para JPG)
            if (!imgInterna && documentoId) {
                // Tenta diferentes padrões de URL que o Zeev pode usar
                const possiveisUrls = [
                    `${window.location.origin}/document/download/${documentoId}`,
                    `${window.location.origin}/uploads/${documentoId}.jpg`,
                    `${window.location.origin}/uploads/evidencias/${documentoId}.jpg`,
                    link.href.replace('/preview/', '/download/')
                ];
                
                for (const url of possiveisUrls) {
                    try {
                        console.log("Tentando URL:", url);
                        const testResponse = await fetch(url, { method: 'HEAD', credentials: 'include' });
                        if (testResponse.ok) {
                            imgInterna = { src: url };
                            console.log("URL direta encontrada:", url);
                            break;
                        }
                    } catch (e) {
                        continue;
                    }
                }
            }

            if (!imgInterna) {
                console.warn("Nenhuma imagem encontrada para o documento.");
                continue;
            }

            console.log("Imagem encontrada:", imgInterna.src);

            const novaImagem = document.createElement('img');
            novaImagem.src = imgInterna.src;
            novaImagem.alt = 'Evidência';
            novaImagem.classList.add('custom-imagem-evidencia');
            novaImagem.style.maxWidth = '100%';
            novaImagem.style.height = 'auto';
            
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
