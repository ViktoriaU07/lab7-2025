const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let price = 100;

function sendBalance(ws, userState) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ 
            type: 'balance', 
            data: {
                usd: userState.usd.toFixed(2), 
                crypto: userState.crypto.toFixed(2)
            }
        }));
    }
}

setInterval(() => {
    const change = (Math.random() * 10) - 5;
    price = Math.max(1, price + change);
    
    const update = JSON.stringify({ type: 'price', value: price.toFixed(2) });
    
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(update);
        }
    });
}, 3000);

wss.on('connection', ws => {
    let userState = { usd: 1000, crypto: 0 }; 

    ws.send(JSON.stringify({ type: 'price', value: price.toFixed(2) }));
    sendBalance(ws, userState);

    ws.on('message', message => {
        const msg = JSON.parse(message);
        
        let operationSuccessful = false;

        if (msg.action === 'buy') {
            if (userState.usd >= price) {
                userState.usd -= price;
                userState.crypto += 1;
                operationSuccessful = true;
            }
        } else if (msg.action === 'sell') {
            if (userState.crypto >= 1) {
                userState.crypto -= 1;
                userState.usd += price;
                operationSuccessful = true;
            }
        }
        
        if (operationSuccessful) {
            sendBalance(ws, userState);
        }
    });

    ws.on('close', () => {
        console.log('Клієнт відключився');
    });
});

console.log('Crypto WebSocket Server running on port 8080');