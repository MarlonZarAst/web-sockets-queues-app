
function renderTickets(tickets = []){
  for(var i = 0; i < tickets.length; i++){
    if (i>= 4) break; 
    const ticket = tickets[i];
    if(!ticket) continue;

    const lblTicket = document.querySelector(`#lbl-ticket-0${i+1}`);
    const lblDesk = document.querySelector(`#lbl-desk-0${i+1}`);

    lblTicket.innerText = `Ticket ${ticket.number}`;
    lblDesk.innerText = ticket.handleAtDesk;
  }
}

async function loadCurrentTickets() {
  const tickets = await fetch('api/tickets/working-on').then(resp => resp.json());
  console.log(tickets);
  renderTickets(tickets)
}

function connectToWebSockets() {

  console.log('Connecting to WebSockets from public js');
  const socket = new WebSocket( 'ws://localhost:3000/ws' );
  console.log(socket);

  socket.onmessage = ( event ) => {
    const {type, payload} = JSON.parse( event.data);
    console.log( type );
    if(type !== 'on-working-changed') return;
    renderTickets(payload);
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

loadCurrentTickets();
connectToWebSockets();