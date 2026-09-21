const nome = document.querySelector("#name");
const senha = document.querySelector("#senha");
const form = document.querySelector("form");

form.addEventListener("submit", (e) => {
    let enviarform= true;
    if (nome.value === "") {
        alert("Preencha todos campos");
    }
    if (senha.value === "") {
        alert("Prencha todos campos");
        enviarform = false;
    }
    if (enviarform === "") {
        e.preventDefault();
    }

});