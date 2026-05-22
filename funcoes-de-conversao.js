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

            // Tenta encontrar imagem em diferentes formatos
            let imgInterna = doc.querySelector('img');
            
            // Se não encontrou img, tenta encontrar canvas (alguns sistemas renderizam em canvas)
            if (!imgInterna) {
                const canvas = doc.querySelector('canvas');
                if (canvas) {
                    console.log("Convertendo canvas para imagem...");
                    imgInterna = { src: canvas.toDataURL() };
                }
            }
            
            // Tenta encontrar links de download de imagem
            if (!imgInterna) {
                const downloadLink = Array.from(doc.querySelectorAll('a')).find(a => 
                    a.href && (a.href.match(/\.(jpg|jpeg|png|gif|webp)/i) || 
                    a.innerText.toLowerCase().includes('download') ||
                    a.innerText.toLowerCase().includes('baixar'))
                );
                if (downloadLink && downloadLink.href) {
                    console.log("Link de download encontrado:", downloadLink.href);
                    imgInterna = { src: downloadLink.href };
                }
            }
            
            // Tenta encontrar imagem em background (CSS)
            if (!imgInterna) {
                const elementoComBg = Array.from(doc.querySelectorAll('[style*="background"]')).find(el => 
                    el.style.backgroundImage && el.style.backgroundImage !== 'none'
                );
                if (elementoComBg) {
                    const bgMatch = elementoComBg.style.backgroundImage.match(/url\(["']?([^"')]+)["']?\)/);
                    if (bgMatch && bgMatch[1]) {
                        console.log("Background image encontrada:", bgMatch[1]);
                        imgInterna = { src: bgMatch[1] };
                    }
                }
            }

            if (!imgInterna) {
                // Se ainda não encontrou, tenta extrair dados do blob ou arquivo
                const blobLinks = Array.from(doc.querySelectorAll('a[href*="blob:"], a[download]'));
                if (blobLinks.length > 0) {
                    for (const blobLink of blobLinks) {
                        if (blobLink.href) {
                            try {
                                const blobResponse = await fetch(blobLink.href);
                                const blob = await blobResponse.blob();
                                if (blob.type.startsWith('image/')) {
                                    const imageUrl = URL.createObjectURL(blob);
                                    imgInterna = { src: imageUrl };
                                    break;
                                }
                            } catch (blobErr) {
                                console.warn("Erro ao processar blob:", blobErr);
                            }
                        }
                    }
                }
            }

            if (!imgInterna || !imgInterna.src) {
                console.warn("Nenhuma imagem encontrada dentro do preview.");
                // Adiciona link direto se não encontrar imagem
                const linkTexto = document.createElement('a');
                linkTexto.href = link.href;
                linkTexto.textContent = `📎 ${link.innerText || 'Anexo'}`;
                linkTexto.target = '_blank';
                linkTexto.style.display = 'block';
                linkTexto.style.margin = '5px 0';
                link.after(linkTexto);
                continue;
            }

            console.log("Imagem encontrada:", imgInterna.src);

            // Cria container para a imagem
            const container = document.createElement('div');
            container.style.margin = '10px 0';
            container.style.border = '1px solid #ddd';
            container.style.padding = '10px';
            container.style.borderRadius = '5px';
            
            const novaImagem = document.createElement('img');
            novaImagem.src = imgInterna.src;
            novaImagem.alt = 'Evidência';
            novaImagem.classList.add('custom-imagem-evidencia');
            novaImagem.style.maxWidth = '100%';
            novaImagem.style.height = 'auto';
            novaImagem.style.display = 'block';
            
            // Adiciona informação do tipo de arquivo
            const infoSpan = document.createElement('span');
            infoSpan.textContent = `${link.innerText || 'Evidência'} - `;
            infoSpan.style.fontSize = '12px';
            infoSpan.style.color = '#666';
            
            const tipoArquivo = imgInterna.src.split('.').pop().split('?')[0].toUpperCase();
            infoSpan.textContent += tipoArquivo === 'JPG' ? 'JPEG' : tipoArquivo;
            
            container.appendChild(infoSpan);
            container.appendChild(novaImagem);
            
            novaImagem.onerror = () => {
                console.error("Erro ao carregar imagem:", imgInterna.src);
                infoSpan.textContent += ' ❌ (Falha ao carregar)';
                // Tenta adicionar link alternativo
                const fallbackLink = document.createElement('a');
                fallbackLink.href = link.href;
                fallbackLink.textContent = 'Clique aqui para visualizar';
                fallbackLink.target = '_blank';
                container.appendChild(fallbackLink);
            };

            novaImagem.onload = () => {
                console.log("Imagem carregada com sucesso!");
                infoSpan.textContent += ' ✓';
            };

            link.after(container);

        } catch (e) {

            console.error("Erro ao processar evidência:", e);
            
            // Fallback: adiciona link direto
            const fallbackLink = document.createElement('a');
            fallbackLink.href = link.href;
            fallbackLink.textContent = `📎 ${link.innerText || 'Ver anexo'}`;
            fallbackLink.target = '_blank';
            fallbackLink.style.display = 'block';
            fallbackLink.style.margin = '5px 0';
            fallbackLink.style.padding = '5px';
            fallbackLink.style.backgroundColor = '#f0f0f0';
            fallbackLink.style.borderRadius = '3px';
            link.after(fallbackLink);
            
        }

    }

    console.log("Finalizado.");
}

window.addEventListener("load", () => {

    setTimeout(() => {

        custom_exibirImagensParaImpressao();

    }, 2000);

});
