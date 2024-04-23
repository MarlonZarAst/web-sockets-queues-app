

const deskHeader = document.querySelector('h1');
const lblPending = document.querySelector('#lbl-pending');
const lblCurrentTicket = document.querySelector('small');
const btnDraw = document.querySelector('#btn-draw');
const btnDone = document.querySelector('#btn-done');

const searchParams = new URLSearchParams(window.location.search);
const noMoreAlert = document.querySelector('.alert');

if (!searchParams.has('escritorio')) {
  window.location = 'index.html';
  throw new Error('Escritorio es requerido');
}

const deskNumber = searchParams.get('escritorio');
let workingTicket = null;
deskHeader.innerText = deskNumber;



function checkTicketCount(currentCount = 0){
  if (currentCount === 0) {
    noMoreAlert.classList.remove('d-none');
  } else {
    noMoreAlert.classList.add('d-none');
  }
  lblPending.innerHTML = currentCount;
}

async function loadInitialCount(){
  const pending = await fetch('/api/tickets/pending').then(resp => resp.json());
  checkTicketCount(pending.length);
}

async function getTicket(){
  await finishTicket();
  const {status, ticket, message} = await fetch(`/api/tickets/draw/${deskNumber}`)
    .then(resp => resp.json());
  if (status === 'Error') {
    lblCurrentTicket.innerText = message;
    return;
  }

  console.log(ticket);
  workingTicket = ticket;
  lblCurrentTicket.innerText = ticket.number;
}
async function finishTicket(){
  if(!workingTicket) return;

  const {status, message} = await fetch(`/api/tickets/done/${workingTicket.id}`,{
    method: 'PUT'}).then(response => response.json());
  console.log({status, message});

  if (status === 'ok'){
    workingTicket = null;
    lblCurrentTicket.innerText = 'Nadie';
  }
}

function connectToWebSockets() {

  console.log('Connecting to WebSockets');
  const socket = new WebSocket( 'ws://localhost:3000/ws' );
  console.log(socket);

  socket.onmessage = ( event ) => {
    const {type, payload} = JSON.parse( event.data);
    if(type !== 'on-ticket-count-changed') return;
    checkTicketCount(payload);
  };

  socket.onclose = ( event ) => {
    console.log( 'Connection closed' );
    setTimeout( () => {
      console.log( 'retrying to connect' );
      connectToWebSockets();
    }, 1500 );

  };

  socket.onopen = ( event ) => {
    console.log( 'Connected' );
  };

}


btnDraw.addEventListener('click', getTicket);
btnDone.addEventListener('click', finishTicket);


// Init
loadInitialCount();
connectToWebSockets();
