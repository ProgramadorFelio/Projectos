 const mensagens=[
           {
             id:1,
            categoria:"Motivacao",
            text:"Acredite em si e nunca desista dos seus sonhos"
           },
           {
             id:2,
            categoria:"Motivacao",
            text:"Cada pequeno pesso aproxima-te dos teus maiores objectivos"
           },
           {
             id:3,
            categoria:"Motivacao",
            text:"Nao precisas de ser perfeito, apenas precisas de continuar"
           },
           {
             id:4,
            categoria:"Amor",
            text:"O amor comeca quando quando aprendemos a cuidar tambem dos pequenos detalhes"
           },
           {
            id:5,
            categoria:"Amor",
            text:"Onde existe carinho, ate os momentos simples se tornam especiais"
           },
           {
            id:6,
            categoria:"Sucesso",
            text:"O sucesso e contruido com consciencia, paciencia e dedeicacao"
           },
           {
            id:7,
            categoria:"Sucesso",
            text:"Grandes resultados comecam com decisoes pequenas, mas corajosas"
           },
           {
            id:8,
            categoria:"Amizade",
            text:"Uma boa amizade torna os dias dificeis mais leves e os felizes ainda melhores"
           },
           {
            id:9,
            categoria:"Amizade",
            text:"Amigos verdadeiros celebram a stuas conquistas e apoiam os teus recomecos"
           },
           {
            id:10,
            categoria:"Reflexao",
            text:"As vezes, desacelerar e a melhor forma de perceber o que realmente importa"
           },
           {
            id:11,
            categoria:"Reflexao",
            text:"O presente e o unico momento que podemos realmente transformar"
           },
           {
            id:12,
            categoria:"Motivacao",
            text:"O teu futuro agradece cada esforco que fazes hoje"
           }
        ];
        let categoriaActual="todas";
        let mensagemActual=mensagens[0];
        //buscar os favoritos e o numero de visualizacoes no localStorage, se nao houver, inicializar com um array vazio e 0, isso no armazenamento local do navegador, para que os dados persistam mesmo apos fechar a pagina
        let favoritos=JSON.parse(localStorage.getItem('inspirarFavoritos')) || [];
        let Visualizadas=Number(localStorage.getItem("inspiraVisualizadas")) || 0;

        const quoteText=document.getElementById("quoteText");
        const quoteCategory=document.getElementById("quoteCategory");
        const quoteNumber=document.getElementById("quoteNumber");
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
        function obterMensagensFiltradas(){
            if(categoriaActual==="todas"){
                return mensagens;
            }
            return mensagens.filter(mensagem =>mensagem.categoria===categoriaActual);

        }
        function obterIndiceAleatorio(lista){
            return Math.floor(Math.random()*lista.length);
        }
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
            quoteCategory.textContent=` ${mensagem.categoria.toUpperCase()}`;//toUpperCase() para deixar a categoria em maiusculo
            const lista=obterMensagensFiltradas();
            const posicao=lista.findIndex(item=>item.id===mensagem.id);
            //actualizar o numero da mensagem atual e o total de mensagens filtradas, formatando com dois digitos
            quoteNumber.textContent=`${String(posicao + 1).padStart(2, "0")}/${String(lista.length).padStart(2,"0") }` ;
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

        function gerarNovaMensagem(){
            const lista=obterMensagensFiltradas();
            if(lista.length===0)return;
            let novaMensagem;

            if(lista.length>1){
                do{
                    novaMensagem=lista[obterIndiceAleatorio(lista)];
                }while(novaMensagem.id===mensagemActual.id);
            }else{
                novaMensagem=lista[0];
            }
            mostrarmensagem(novaMensagem);
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
            const lista=obterMensagensFiltradas();
            categoryResult.textContent=`${lista.length} mensagem${lista.length===1 ? "" : "s"}`;
            mostrarmensagem(lista[0], false);
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

        mostrarmensagem(mensagens[0], false);
        actualizarEstatisticas();
        renderizarFavoritos();
