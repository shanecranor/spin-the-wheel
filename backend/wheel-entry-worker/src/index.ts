import { EntryProps } from '@shared/types';
import { Action as Command, ViewerEntryBody } from './types';
export interface Env {
	WHEEL_ENTRIES: DurableObjectNamespace;
}

// Worker code:

export default {
	async fetch(request: Request, env: Env) {
		let url = new URL(request.url);
		let name = url.searchParams.get('name');
		if (!name) {
			return new Response('Select a Durable Object to contact by using the `name` URL query string parameter, for example, ?name=A');
		}

		let id = env.WHEEL_ENTRIES.idFromName(name);

		// Construct the stub for the Durable Object using the ID.
		// A stub is a client Object used to send messages to the Durable Object.
		let obj = env.WHEEL_ENTRIES.get(id);

		// Send a request to the Durable Object, then await its response.
		return obj.fetch(request);
	},
};

// Durable Object

export class WheelEntries {
	state: DurableObjectState;
	webSockets: Set<WebSocket>;
	storage: DurableObjectStorage;
	constructor(state: DurableObjectState, env: Env) {
		this.state = state;
		this.storage = state.storage;
		this.webSockets = new Set();
	}
	// Define the broadcast function
	broadcast(message: string) {
		this.webSockets.forEach((ws) => {
			ws.send(message);
		});
	}

	async getEntry(id: string, onError: (message: string) => void, action: Command) {
		const entry = await this.storage.get(id);
		if (!entry) {
			onError(`${action} failed, Entry ID: ${id} not found`);
			return;
		}
		return entry;
	}

	async deleteEntry(id: string, onError: (message: string) => void) {
		const action: Command = 'Delete';
		const existed = await this.storage.delete(id);
		if (!existed) {
			onError(`${action} failed, Entry ID: ${id} not found`);
			return;
		}
		this.broadcast(JSON.stringify({ action, id }));
	}

	async createEntry(entry: EntryProps) {
		// update the storage
		await this.storage.put(entry.id.toString(), entry);
		// update the clients
		this.broadcast(JSON.stringify({ action: 'create', entry }));
	}

	async approveEntry(id: string, onError: (message: string) => void) {
		const action: Command = 'Approve';
		const entry = await this.getEntry(id, onError, action);
		if (!entry) return;

		await this.storage.put(id, { ...entry, isSafe: true });
		this.broadcast(JSON.stringify({ action, id }));
	}

	async moveToWheel(id: string, onError: (message: string) => void) {
		const action: Command = 'Move to wheel';
		const entry = await this.getEntry(id, onError, action);
		if (!entry) return;

		await this.storage.put(id, { ...entry, isOnWheel: true });
		this.broadcast(JSON.stringify({ action, id }));
	}

	async sendCurrentState(serverWebSocket: WebSocket) {
		const action: Command = 'Get data';
		let entries = Array.from((await this.storage.list<EntryProps>()).values());
		serverWebSocket.send(JSON.stringify({ action, entries }));
	}
	// Handle requests sent to the Durable Object
	async fetch(request: Request) {
		// Apply requested action.
		let url = new URL(request.url);
		// upgrade to websockets
		if (request.headers.get('Upgrade') !== 'websocket') {
			//accept a regular post request for viewers adding entries (don't need to open a websocket for them)
			if (request.method === 'POST' && url.pathname === '/add') {
				// somehow validate that the viewer's tokens are valid
				// and that they actually paid the spark ammount for the entry
				const body: ViewerEntryBody = await request.json();
				const newEntry: EntryProps = {
					id: crypto.randomUUID(),
					text: body.text,
					author: body.author,
					isSafe: false,
					isOnWheel: false,
				};
				this.createEntry(newEntry);
			}

			return new Response('Expected a websocket', { status: 400 });
		}
		const pair = new WebSocketPair();
		const { 0: clientWebSocket, 1: serverWebSocket } = pair;
		serverWebSocket.accept();
		this.webSockets.add(serverWebSocket);

		this.sendCurrentState(serverWebSocket);

		const sendServerError = (message: string) => {
			serverWebSocket.send(JSON.stringify({ error: message }));
		};
		// Listen for messages sent to the server
		serverWebSocket.addEventListener('message', (event) => {
			if (typeof event.data !== 'string') {
				sendServerError('Invalid message format');
				return;
			}
			let eventData;
			try {
				eventData = JSON.parse(event.data);
			} catch (error) {
				sendServerError('Invalid JSON');
				return;
			}

			switch (eventData.command as Command) {
				case 'Create':
					const newEntry: EntryProps = {
						id: crypto.randomUUID(),
						text: eventData.data.text,
						author: eventData.data.author,
						isSafe: eventData.isAdmin === true,
						isOnWheel: eventData.isAdmin === true,
					};
					this.createEntry(newEntry);
					break;
				case 'Approve':
					this.approveEntry(eventData.id, sendServerError);
					break;
				case 'Move to wheel':
					this.moveToWheel(eventData.id, sendServerError);
					break;
				case 'Delete':
					this.deleteEntry(eventData.id, sendServerError);
					break;
				case 'Get data':
					this.sendCurrentState(serverWebSocket);
					break;
				default:
					sendServerError('Invalid command');
					return;
			}
		});

		// Remove the server websocket when it is closed
		serverWebSocket.addEventListener('close', (event) => {
			this.webSockets.delete(serverWebSocket);
		});

		// return the client websocket
		return new Response(null, { status: 101, webSocket: clientWebSocket });
	}
}
