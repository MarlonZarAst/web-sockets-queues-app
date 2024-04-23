
const lblTicket = document.querySelector("#lbl-new-ticket");  
const button = document.querySelector("button");


async function lastTicket(){
  const response = await fetch("/api/tickets/last").then(resp => resp.json());
  lblTicket.innerText = response;
}

async function createTicket(){
  const newTicket = await fetch("/api/tickets",{
    method: "POST",
  }).then(resp => resp.json());
  lblTicket.innerText = newTicket.number;
}

button.addEventListener("click", createTicket);

lastTicket();