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
            const urlParts = link.href.match(/\/document\/preview\/(\d+)/);
            const documentId = urlParts ? urlParts[1] : null;
            
            // Tenta encontrar o tipo de arquivo pelo texto do link
            const linkText = link.innerText || link.textContent || '';
            const isPdf = linkText.toLowerCase().includes('.pdf') || linkText.toLowerCase().includes('pdf');
            const isJpg = linkText.toLowerCase().includes('.jpg') || linkText.toLowerCase().includes('.jpeg');
            const isPng = linkText.toLowerCase().includes('.png');
            
            console.log(`Processando: ${linkText} (ID: ${documentId})`);

            if (isPdf) {
                // Para PDFs, adiciona um iframe ou link de download
                console.log("Arquivo PDF detectado");
                const pdfContainer = document.createElement('div');
                pdfContainer.style.margin = '10px 0';
                pdfContainer.style.border = '1px solid #ddd';
                pdfContainer.style.padding = '10px';
                
                const pdfLink = document.createElement('a');
                pdfLink.href = link.href;
                pdfLink.textContent = `📄 ${linkText} - Clique para visualizar PDF`;
                pdfLink.target = '_blank';
                pdfLink.style.display = 'block';
                pdfLink.style.marginBottom = '5px';
                
                pdfContainer.appendChild(pdfLink);
                link.after(pdfContainer);
                continue;
            }
            
            // Tenta buscar a imagem diretamente via API do Zeev (se disponível)
            let imageUrl = null;
            
            // Estratégia 1: Tentar buscar via endpoint de download
            if (documentId) {
                const downloadUrl = link.href.replace('/preview/', '/download/');
                try {
                    console.log("Tentando download direto:", downloadUrl);
                    const testResponse = await fetch(downloadUrl, {
                        credentials: 'include',
                        method: 'HEAD'
                    });
                    
                    if (testResponse.ok) {
                        imageUrl = downloadUrl;
                        console.log("URL de download encontrada:", imageUrl);
                    }
                } catch (e) {
                    console.log("Download direto não disponível");
                }
            }
            
            // Estratégia 2: Buscar no preview atual
            if (!imageUrl) {
                console.log("Buscando no preview:", link.href);
                const response = await fetch(link.href, {
                    credentials: 'include'
                });
                
                const html = await response.text();
                
                // Procura por diferentes padrões de imagem
                const patterns = [
                    // Imagem em tag img
                    /<img[^>]+src=["']([^"']+)["'][^>]*>/gi,
                    // Imagem em data-src (lazy loading)
                    /data-src=["']([^"']+)["']/gi,
                    // URL de imagem em JavaScript
                    /(?:imageUrl|imgUrl|src)\s*[:=]\s*["']([^"']+\.(?:jpg|jpeg|png|gif))["']/gi,
                    // Blob URLs
                    /(blob:[^"'\s]+)/gi,
                    // URLs de CDN
                    /(https?:\/\/[^"'\s]+\.(?:jpg|jpeg|png|gif))/gi
                ];
                
                for (const pattern of patterns) {
                    const matches = [...html.matchAll(pattern)];
                    if (matches.length > 0) {
                        imageUrl = matches[0][1];
                        console.log("Imagem encontrada via padrão:", imageUrl);
                        break;
                    }
                }
                
                // Se ainda não encontrou, tenta extrair do DOM parseado
                if (!imageUrl) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    
                    // Procura por elementos de imagem em visualizadores comuns
                    const possibleImages = [
                        ...doc.querySelectorAll('img'),
                        ...doc.querySelectorAll('[data-image]'),
                        ...doc.querySelectorAll('[data-url]'),
                        ...doc.querySelectorAll('.image-viewer img'),
                        ...doc.querySelectorAll('.file-preview img'),
                        ...doc.querySelectorAll('.document-viewer img')
                    ];
                    
                    for (const img of possibleImages) {
                        const src = img.src || img.getAttribute('data-image') || img.getAttribute('data-url');
                        if (src && (src.includes('blob:') || src.match(/\.(jpg|jpeg|png|gif)/i))) {
                            imageUrl = src;
                            console.log("Imagem encontrada no DOM:", imageUrl);
                            break;
                        }
                    }
                }
            }
            
            // Estratégia 3: Tentar converter para blob se for base64
            if (!imageUrl && documentId) {
                try {
                    const blobResponse = await fetch(link.href, {
                        credentials: 'include'
                    });
                    const blob = await blobResponse.blob();
                    
                    if (blob.type.startsWith('image/')) {
                        imageUrl = URL.createObjectURL(blob);
                        console.log("Blob de imagem criado");
                    } else if (blob.type === 'application/pdf') {
                        console.log("É um PDF, ignorando...");
                        continue;
                    }
                } catch (e) {
                    console.log("Falha ao criar blob:", e);
                }
            }
            
            if (!imageUrl) {
                console.warn(`Não foi possível extrair imagem para: ${linkText}`);
                // Adiciona link alternativo
                const fallbackLink = document.createElement('a');
                fallbackLink.href = link.href;
                fallbackLink.textContent = `🔗 ${linkText}`;
                fallbackLink.target = '_blank';
                fallbackLink.style.display = 'block';
                fallbackLink.style.margin = '5px 0';
                fallbackLink.style.padding = '8px';
                fallbackLink.style.backgroundColor = '#f5f5f5';
                fallbackLink.style.borderRadius = '4px';
                fallbackLink.style.textDecoration = 'none';
                fallbackLink.style.color = '#0066cc';
                link.after(fallbackLink);
                continue;
            }
            
            // Cria elemento para exibir a imagem
            const container = document.createElement('div');
            container.style.margin = '15px 0';
            container.style.border = '1px solid #e0e0e0';
            container.style.padding = '12px';
            container.style.borderRadius = '6px';
            container.style.backgroundColor = '#fafafa';
            
            const title = document.createElement('div');
            title.textContent = linkText;
            title.style.fontWeight = 'bold';
            title.style.marginBottom = '8px';
            title.style.fontSize = '14px';
            title.style.color = '#333';
            
            const imagem = document.createElement('img');
            imagem.src = imageUrl;
            imagem.alt = linkText;
            imagem.style.maxWidth = '100%';
            imagem.style.height = 'auto';
            imagem.style.borderRadius = '4px';
            imagem.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            
            // Indicador de loading
            const loading = document.createElement('div');
            loading.textContent = '⏳ Carregando imagem...';
            loading.style.fontSize = '12px';
            loading.style.color = '#666';
            loading.style.marginTop = '5px';
            
            container.appendChild(title);
            container.appendChild(imagem);
            container.appendChild(loading);
            
            imagem.onload = () => {
                loading.remove();
                console.log(`Imagem carregada: ${linkText}`);
            };
            
            imagem.onerror = () => {
                loading.textContent = '❌ Falha ao carregar imagem. Clique no link original para visualizar.';
                loading.style.color = '#d32f2f';
                console.error(`Erro ao carregar: ${imageUrl}`);
            };
            
            link.after(container);
            
        } catch (e) {
            console.error("Erro ao processar evidência:", e);
        }
        
        // Pequeno delay para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log("Finalizado.");
}

// Executa quando a página carregar
if (document.readyState === 'loading') {
    window.addEventListener("load", () => {
        setTimeout(() => custom_exibirImagensParaImpressao(), 2000);
    });
} else {
    setTimeout(() => custom_exibirImagensParaImpressao(), 2000);
}
