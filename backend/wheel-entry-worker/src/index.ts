export interface Env {
	COUNTER: DurableObjectNamespace;
}

// Worker code:

export default {
	async fetch(request: Request, env: Env) {
		let url = new URL(request.url);
		let name = url.searchParams.get('name');
		if (!name) {
			return new Response('Select a Durable Object to contact by using' + ' the `name` URL query string parameter, for example, ?name=A');
		}

		let id = env.COUNTER.idFromName(name);

		// Construct the stub for the Durable Object using the ID.
		// A stub is a client Object used to send messages to the Durable Object.
		let obj = env.COUNTER.get(id);

		// Send a request to the Durable Object, then await its response.
		return obj.fetch(request);
	},
};

// Durable Object

export class Counter {
	state: DurableObjectState;
	webSockets: Set<WebSocket>;
	constructor(state: DurableObjectState, env: Env) {
		this.state = state;
		this.webSockets = new Set();
	}
	// Define the broadcast function
	broadcast(message: string) {
		this.webSockets.forEach((ws) => {
			ws.send(message);
		});
	}
	// Handle requests sent to the Durable Object
	async fetch(request: Request) {
		// Apply requested action.
		let url = new URL(request.url);
		// Check for websocket request
		console.log('DURABLE OBJECT', request.headers.get('Upgrade'));

		if (request.headers.get('Upgrade') === 'websocket') {
			const pair = new WebSocketPair();
			const { 0: clientWebSocket, 1: serverWebSocket } = pair;
			serverWebSocket.accept();
			this.webSockets.add(serverWebSocket);
			let value = Number((await this.state.storage.get('value')) || 0);
			serverWebSocket.send(JSON.stringify({ value }));
			// Handle websocket messages from the client as the server
			serverWebSocket.addEventListener('message', async (event) => {
				let data;
				if (typeof event.data !== 'string') {
					serverWebSocket.send(JSON.stringify({ error: 'Invalid message format' }));
					return;
				}
				try {
					data = JSON.parse(event.data);
				} catch (error) {
					serverWebSocket.send(JSON.stringify({ error: 'Invalid JSON' }));
					return;
				}

				let value = Number((await this.state.storage.get('value')) || 0);

				switch (data.command) {
					case 'increment':
						value++;
						break;
					case 'decrement':
						value--;
						break;
					default:
						serverWebSocket.send(JSON.stringify({ error: 'Unknown command' }));
						return;
				}

				await this.state.storage.put('value', value);

				// Broadcast the updated value to all clients
				this.broadcast(JSON.stringify({ value }));
			});

			// Remove the server websocket when it is closed
			serverWebSocket.addEventListener('close', (event) => {
				this.webSockets.delete(serverWebSocket);
			});

			// return the client websocket
			return new Response(null, { status: 101, webSocket: clientWebSocket });
		}
	}
}
