// script.js

// Referências aos elementos importantes no DOM
const inputCidade = document.getElementById('cidade');
const selectPerfil = document.getElementById('perfil');
const divResultado = document.getElementById('resultado'); // Div onde o roteiro/sugestão será exibido

/**
 * @function renderizarSugestaoPasseio
 * @description Constrói dinamicamente o HTML da sugestão de passeio a partir de um objeto JSON
 * retornado pela API e o exibe na área de resultado.
 * @param {object} dadosPasseio - O objeto JSON contendo os dados da sugestão de passeio.
 * Espera a seguinte estrutura: { titulo: string, introducao: string, locais_principais: string[], dicas_extras: string[], encerramento: string }.
 */
function renderizarSugestaoPasseio(dadosPasseio) {
    // Adicionado log para ver os dados recebidos antes da validação
    console.log("DEBUG (frontend): Dados recebidos para renderização:", dadosPasseio);

    // Validação básica dos dados
    if (!dadosPasseio || typeof dadosPasseio !== 'object' || !dadosPasseio.titulo ||
        !Array.isArray(dadosPasseio.locais_principais) || !Array.isArray(dadosPasseio.dicas_extras)) {
        console.error("ERRO (frontend): Dados da sugestão de passeio no formato inesperado. Objeto inválido:", dadosPasseio);
        divResultado.innerHTML = '<p class="text-red-600 font-semibold">Erro ao renderizar a sugestão de passeio recebida. Formato inválido.</p>';
        divResultado.classList.remove('hidden');
        divResultado.classList.add('text-red-600');
        return;
    }

    let htmlPasseio = `
        <div class="bg-white p-6 rounded-xl shadow-md border border-gray-200 text-left">
            <h2 class="text-2xl font-bold mb-4 text-gray-800">${dadosPasseio.titulo}</h2>
            ${dadosPasseio.introducao ? `<p class="text-gray-700 mb-4">${dadosPasseio.introducao}</p>` : ''}
    `;

    if (dadosPasseio.locais_principais && dadosPasseio.locais_principais.length > 0) {
        htmlPasseio += `
            <h3 class="text-xl font-semibold mb-2 text-gray-700">Locais Principais:</h3>
            <ul class="list-disc list-inside text-gray-700 mb-4">
        `;
        // Certifique-se de que cada item é uma string antes de mapear
        htmlPasseio += dadosPasseio.locais_principais.map(local => `<li class="mb-1">${String(local)}</li>`).join('');
        htmlPasseio += `</ul>`; // Corrigido erro de digitação de htmlPassecao
    }

    if (dadosPasseio.dicas_extras && dadosPasseio.dicas_extras.length > 0) {
        htmlPasseio += `
            <h3 class="text-xl font-semibold mb-2 text-gray-700">Dicas Extras:</h3>
            <ul class="list-disc list-inside text-gray-700 mb-4">
        `;
        // Certifique-se de que cada item é uma string antes de mapear
        htmlPasseio += dadosPasseio.dicas_extras.map(dica => `<li class="mb-1">${String(dica)}</li>`).join('');
        htmlPasseio += `</ul>`;
    }

    if (dadosPasseio.encerramento) {
        htmlPasseio += `
            <p class="text-gray-700 italic mt-4">${dadosPasseio.encerramento}</p>
        `;
    }

    htmlPasseio += `</div>`; // Fecha a div interna

    divResultado.innerHTML = htmlPasseio;
    divResultado.classList.remove('hidden');
    divResultado.classList.remove('text-red-600'); // Remove a classe de erro se presente
}

/**
 * @function gerarPasseios
 * @description Coleta os dados dos campos de entrada, envia para a API,
 * processa a resposta e exibe o resultado na tela.
 */
async function gerarPasseios() {
    const cidade = inputCidade.value.trim();
    const perfil = selectPerfil.value;
    const botaoGerar = document.querySelector('button'); // Pega o botão "Gerar Passeios"

    if (!cidade) {
        alert('Por favor, informe a cidade ou região.');
        return;
    }

    // Desabilita o botão e mostra "Gerando..."
    botaoGerar.disabled = true;
    botaoGerar.innerHTML = 'Gerando Passeio...';
    divResultado.innerHTML = '<p class="text-center text-gray-500">Carregando sugestões...</p>';
    divResultado.classList.remove('hidden'); // Garante que a área de resultado esteja visível

    const dados = {
        cidade: cidade,
        perfil: perfil
    };

    try {
        const resposta = await fetch('http://127.0.0.1:5000/sugestao_passeio', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();
        console.log('DEBUG (frontend): Resposta JSON completa da API:', resultado); // Log completo da resposta

        // Verifica se a API retornou um erro (que pode ser um erro do Flask ou um erro parseado da IA)
        if (resultado && typeof resultado === 'object' && resultado.error) {
            console.error('ERRO (frontend): Erro da API:', resultado.error);
            divResultado.innerHTML = `<p class="text-red-600 font-semibold text-center">Erro: ${resultado.error}</p>`;
            divResultado.classList.add('text-red-600');
        } else {
            // Assume que o resultado é a sugestão de passeio
            renderizarSugestaoPasseio(resultado[0]);
        }

    } catch (error) {
        console.error('ERRO (frontend): Erro ao comunicar com o servidor ou parsear JSON:', error);
        divResultado.innerHTML = `<p class="text-red-600 font-semibold text-center">Ocorreu um erro ao tentar comunicar com o servidor: ${error.message}</p>`;
        divResultado.classList.add('text-red-600');
    } finally {
        // Reabilita o botão e restaura o texto
        botaoGerar.disabled = false;
        botaoGerar.innerHTML = 'Gerar Passeios';
    }
}