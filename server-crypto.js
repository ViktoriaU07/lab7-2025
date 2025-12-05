const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let price = 100;

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
    ws.send(JSON.stringify({ type: 'balance', data: userState }));

    ws.on('message', message => {
        const msg = JSON.parse(message);

        if (msg.action === 'buy') {
            if (userState.usd >= price) {
                userState.usd -= price;
                userState.crypto += 1;
            }
        } else if (msg.action === 'sell') {
            if (userState.crypto >= 1) {
                userState.crypto -= 1;
                userState.usd += price;
            }
        }

        ws.send(JSON.stringify({ type: 'balance', data: userState }));
    });
});

console.log('Crypto WebSocket Server running on port 8080');