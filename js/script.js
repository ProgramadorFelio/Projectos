let categoriaActual="todas";
        let mensagemActual=null;
        //buscar os favoritos e o numero de visualizacoes no localStorage, se nao houver, inicializar com um array vazio e 0, isso no armazenamento local do navegador, para que os dados persistam mesmo apos fechar a pagina
        let favoritos=JSON.parse(localStorage.getItem('inspirarFavoritos')) || [];
        let Visualizadas=Number(localStorage.getItem("inspiraVisualizadas")) || 0;

        const quoteText=document.getElementById("quoteText");
        const quoteCategory=document.getElementById("quoteCategory");
        const quoteNumber=document.getElementById("quoteNumber");
        const quoteAuthor=document.getElementById("quoteAuthor");
        const quoteCard=document.getElementById("quoteCard");
        const favoriteBtn=document.getElementById("favoriteBtn");
        const copybtn=document.getElementById("copybtn");
        const sharebtn=document.getElementById("sharebtn");
        const newMessageBtn=document.getElementById("newMessageBtn");
        const themeBtn=document.getElementById("themeBtn");
        const themeIcon=document.getElementById("themeIcon");
        const categorias=document.getElementById("categorias");
        const favoriteStat=document.getElementById("favoriteStat");
        const favoritesList=document.getElementById("favoritesList");
        const viewCount=document.getElementById("viewCount");
        const categoryResult=document.getElementById("categoryResult");
        const searchInput =document.getElementById("searchInput");
        const toast=document.getElementById("toast");
        const toastMessage=document.getElementById("toastMessage");
        const toastIcon=document.getElementById("toastIcon");

        //transformar o array de favoritos em uma string(text) JSON e armazenar no localStorage, e o mesmo para o numero de visualizacoes

        function guardarDados(){
            localStorage.setItem("inspirarFavoritos", JSON.stringify(favoritos));
            localStorage.setItem("inspiraVisualizados", Visualizadas);
        }
        function MostrarToast(mensagem, icon="fa-solid fa-certificate"){
            toastMessage.textContent=mensagem;
            toastIcon.innerHTML=`<i class="${icon}"></i>`;
            toast.classList.add("show");//adicionar a classe "show" para exibir o toast neste caso o css

            clearTimeout(window.toastTimeout);
            window.toastTimeout=setTimeout(()=>{
                toast.classList.remove("show");//remover a classe "show" para ocultar o toast
            },2500);
        }
        // Fonte remota com milhares de frases organizadas por categorias.
        // As frases não ficam escritas dentro deste HTML: são carregadas da Internet.
        const FONTE_FRASES = "https://gist.githubusercontent.com/wandersonalwes/9935b8ef428683c9688471d603644b0c/raw/ed1fd98824f1b4119b72e7c73dc5d7363029610d/quotes.json";
        let bancoFrases = null;

        const categoriasRemotas = {
            Motivacao: "Motivação",
            Amor: "Amor",
            Sucesso: "Sucesso",
            Amizade: "Amizade",
            Reflexao: "Reflexão"
        };

        //funcao para copiar texto para a area de transferencia, utilizando a API do clipboard se disponivel, ou um fallback com textarea para navegadores mais antigos
        async function copiarTexto(texto){
            if(navigator.clipboard && window.isSecureContext){//como se fosse API do navegador que permite ler ou escrever na area de transferencia
                await navigator.clipboard.writeText(texto);
                return;
            }
            // fallback para navegadores mais antigos
            const area=document.createElement("textarea");
            area.value=texto;
            area.style.position="fixed";
            area.style.opacity="0";
            document.body.appendChild(area);
            area.select();
            document.execCommand("copy");
            area.remove();
        }

        function mostrarmensagem(mensagem,contarVisualizacao=true){
            if(!mensagem)return;
            //actualizar a mensagem actual, o texto, a categoria e o numero da mensagem
            mensagemActual=mensagem;
            quoteText.textContent=mensagem.text;
            quoteAuthor.textContent=`- ${mensagem.autor || "Inspira+"}`;
            quoteCategory.textContent=` ${mensagem.categoria.toUpperCase()}`;//toUpperCase() para deixar a categoria em maiusculo
            // Como a mensagem é carregada diretamente da Internet, não existe
            // um total local de mensagens. O indicador mostra a sequência da sessão.
            const sequencia = Number(sessionStorage.getItem("inspiraSequencia")) || 0;
            const novaSequencia = sequencia + 1;
            sessionStorage.setItem("inspiraSequencia", novaSequencia);
            quoteNumber.textContent=`${String(novaSequencia).padStart(2, "0")}/∞`;
            if(contarVisualizacao){
                Visualizadas ++;
                guardarDados();
            }
            //actualizar o estado do botao de favorito e as estatisticas
            actualizarBotaoFavorito();
            actualizarEstatisticas();
            quoteCard.classList.remove("animate");
            void quoteCard.offsetWidth;
            quoteCard.classList.add("animate");
        }

        async function carregarBancoFrases(){
            if(bancoFrases) return bancoFrases;

            const resposta = await fetch(FONTE_FRASES, { cache: "no-store" });
            if(!resposta.ok) throw new Error("Não foi possível carregar as frases da Internet.");

            const dados = await resposta.json();
            if(!Array.isArray(dados)) throw new Error("Formato de frases inválido.");

            bancoFrases = dados;
            return bancoFrases;
        }

        function escolherFrase(lista, categoria){
            if(!lista.length) return null;

            const item = lista[Math.floor(Math.random() * lista.length)];
            const texto = typeof item === "string" ? item : (item.quote || item.frase || item.text || "");
            const autor = typeof item === "object" && item.author ? item.author : "Inspira+";

            return {
                id: Date.now() + Math.random(),
                categoria,
                text: texto,
                autor
            };
        }

        async function gerarNovaMensagem(){
            quoteText.textContent = "A carregar uma nova mensagem...";
            quoteCategory.textContent = categoriaActual === "todas" ? "INSPIRA+" : categoriaActual.toUpperCase();

            try {
                const banco = await carregarBancoFrases();
                let lista = [];

                if(categoriaActual === "todas"){
                    // Em "Todas", usamos somente as 5 categorias do Inspira+.
                    const nomes = Object.values(categoriasRemotas);
                    lista = banco.filter(item => nomes.includes(item?.name));

                    if(lista.length){
                        // Escolhe uma categoria e depois uma frase dessa categoria.
                        const grupo = lista[Math.floor(Math.random() * lista.length)];
                        mensagemActual = escolherFrase(grupo.quotes || [], grupo.name);
                    }
                } else {
                    const nomeRemoto = categoriasRemotas[categoriaActual];
                    const grupo = banco.find(item => item?.name === nomeRemoto);

                    if(grupo && Array.isArray(grupo.quotes)){
                        mensagemActual = escolherFrase(grupo.quotes, categoriaActual);
                    }
                }

                if(!mensagemActual || !mensagemActual.text){
                    throw new Error("A categoria não foi encontrada na fonte de frases.");
                }

                mostrarmensagem(mensagemActual);

            } catch(erro) {
                console.error(erro);
                quoteText.textContent = "Não foi possível carregar as mensagens da Internet.";
                quoteCategory.textContent = "ERRO";
                MostrarToast("Erro ao buscar mensagens", "fa-solid fa-triangle-exclamation");
            }
        }

        //actualizar o estado do botao de favorito, adicionando ou removendo a classe "is-favorite" e alterando o icone
        function actualizarBotaoFavorito(){
            const favorito=favoritos.some(item=>item.id===mensagemActual.id);
            favoriteBtn.classList.toggle("is-favorite", favorito);//remove uma classe se o item nao for favorito e adiciona se for, para alterar a cor do botao css nesse caso a cor do botao de favorito muda se a mensagem for favorita ou nao
            favoriteBtn.classList.toggle("fa-solid", favorito);
            favoriteBtn.classList.toggle("fa-regular", !favorito);
            favoriteBtn.setAttribute("aria-label", favorito ? "Remover dos favoritos" : "Adicionar aos favoritos");//serve para adicionar um atributo html de um elemento
        }
        //actualizar as estatisticas de visualizacao e favoritos

        function actualizarEstatisticas(){
            viewCount.textContent=Visualizadas;
            favoriteStat.textContent=favoritos.length;
        }
        //renderizar a lista de favoritos, filtrando com base no termo de pesquisa e actualizando o conteudo do elemento favoritesList com os itens correspondentes ou uma mensagem de estado vazio se nao houver favoritos

        function renderizarFavoritos(){
            const termo=searchInput.value.trim().toLowerCase();
            const lista=favoritos.filter(item=>item.text.toLowerCase().includes(termo));
            favoritesList.innerHTML=lista.length ? lista.map(item=>`
                <article class="favorites-item">
                    <span class="item-category">${item.categoria.toUpperCase()}</span>
                    <p>${item.text}</p>
                    <button class="remove-favorite" type="button" data-remove="${item.id}" aria-label="Remover favorito"><i class="fa-solid fa-xmark"></i></button>
                    <button class="item-copy" type="button" data-copy="${item.id}"><i class="fa-solid fa-copy"></i> Copiar</button>
                </article>`).join("") : `<div class="empty-state"><span class="empty-icon"><i class="fa-regular fa-heart"></i></span><p>Ainda nao tens mensagens favoritas.</p></div>`;
        }
        //adicionar event listeners para os botoes e elementos interativos

        categorias.addEventListener("click", event=>{
            const botaoCategoria=event.target.closest(".category");
            if(!botaoCategoria)return;
            categoriaActual=botaoCategoria.dataset.category;
            document.querySelectorAll(".category").forEach(item=>item.classList.toggle("active", item===botaoCategoria));
            categoryResult.textContent = categoriaActual === "todas" ? "Mensagens motivacionais da Internet" : "Mensagens da categoria " + categoriaActual;
            gerarNovaMensagem();
        });
        //adicionar ou remover a mensagem actual dos favoritos, actualizando o armazenamento local, o estado do botao de favorito, as estatisticas e a lista de favoritos renderizada

        favoriteBtn.addEventListener("click", ()=>{
            const indice=favoritos.findIndex(item=>item.id===mensagemActual.id);
            if(indice >= 0){ favoritos.splice(indice, 1); MostrarToast("Removida dos favoritos"); }
            else { favoritos.push(mensagemActual); MostrarToast("Adicionada aos favoritos"); }
            guardarDados(); actualizarBotaoFavorito(); actualizarEstatisticas(); renderizarFavoritos();
        });
        //adicionar event listeners para copiar, partilhar, gerar nova mensagem, alterar tema, pesquisar e interagir com lista de favoritos

        copybtn.addEventListener("click", async ()=>{
            await copiarTexto(mensagemActual.text);
            MostrarToast("Mensagem copiada");
        });
        sharebtn.addEventListener("click", async ()=>{
            if(navigator.share) await navigator.share({title:"Inspira+", text:mensagemActual.text});
            else { await copiarTexto(mensagemActual.text); MostrarToast("Mensagem copiada"); }
        });
        newMessageBtn.addEventListener("click", gerarNovaMensagem);

        //para alterar o tema
        themeBtn.addEventListener("click", ()=>{
            document.body.classList.toggle("dark");
            themeIcon.className=document.body.classList.contains("dark") ? "fa-solid fa-moon" : "fa-solid fa-sun";
        });
        searchInput.addEventListener("input", renderizarFavoritos);
        favoritesList.addEventListener("click", event=>{
            const remover=event.target.closest("[data-remove]");
            if(remover){ favoritos=favoritos.filter(item=>item.id !== Number(remover.dataset.remove)); guardarDados(); actualizarEstatisticas(); renderizarFavoritos(); }
            const copiar=event.target.closest("[data-copy]");
            if(copiar){ const item=favoritos.find(favorito=>favorito.id === Number(copiar.dataset.copy)); if(item) copiarTexto(item.text).then(()=>MostrarToast("Mensagem copiada")); }
        });

        gerarNovaMensagem();
        actualizarEstatisticas();
        renderizarFavoritos();
