import { EntryProps, Command, isEntryProps } from '@shared/types';
import { CreateMessage, DeleteMessage, SetterMessage, WSMessage } from '@shared/websocket-types';
import { ViewerEntryBody } from './types';
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
	broadcastObject(message: WSMessage) {
		this.broadcast(JSON.stringify(message));
	}

	async getEntry(id: string, onError: (message: string) => void, command: Command) {
		const entry = await this.storage.get(id);
		if (!entry) {
			onError(`${command} failed, Entry ID: ${id} not found`);
			return;
		}
		return entry;
	}

	async deleteEntry(id: string, onError: (message: string) => void) {
		const command: Command = 'Delete';
		const existed = await this.storage.delete(id);
		if (!existed) {
			onError(`${command} failed, Entry ID: ${id} not found`);
			return;
		}
		const message: DeleteMessage = { command, id };
		this.broadcastObject(message);
	}

	async createEntry(entry: EntryProps) {
		// update the storage
		await this.storage.put(entry.id.toString(), entry);
		// update the clients
		const message: CreateMessage = { command: 'Create', entry };
		this.broadcastObject(message);
	}

	async setIsSafe(id: string, isSafe: boolean, onError: (message: string) => void) {
		const command: Command = 'setIsSafe';
		const entry = await this.getEntry(id, onError, command);
		if (!entry) return;
		await this.storage.put(id, { ...entry, isSafe });
		const message: SetterMessage = { command, id, value: isSafe };
		this.broadcastObject(message);
	}

	async setIsOnWheel(id: string, isOnWheel: boolean, onError: (message: string) => void) {
		const command: Command = 'setIsOnWheel';
		const entry = await this.getEntry(id, onError, command);
		if (!entry) return;
		await this.storage.put(id, { ...entry, isOnWheel });
		const message: SetterMessage = { command, id, value: isOnWheel };
		this.broadcastObject(message);
	}

	async setIsWinner(id: string, isWinner: boolean, onError: (message: string) => void) {
		const command: Command = 'setIsWinner';
		const entry = await this.getEntry(id, onError, command);
		if (!entry) return;
		await this.storage.put(id, { ...entry, isWinner });
		const message: SetterMessage = { command, id, value: isWinner };
		this.broadcastObject(message);
	}

	async sendCurrentState(serverWebSocket: WebSocket) {
		const command: Command = 'Get data';
		let entries = Array.from((await this.storage.list<EntryProps>()).values());
		serverWebSocket.send(JSON.stringify({ command, entries }));
	}

	async setRules(rules: string) {
		await this.storage.put('gameRules', rules);
		this.broadcast(rules);
	}
	// Handle requests sent to the Durable Object
	async fetch(request: Request) {
		// Apply requested command.
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
			let eventData: WSMessage;
			try {
				eventData = JSON.parse(event.data);
			} catch (error) {
				sendServerError('Invalid JSON');
				return;
			}
			if ('error' in eventData) {
				// need this to filter the error out of the union type
				// the client should never send the server an error
				console.error(eventData.error);
				return;
			}

			switch (eventData.command) {
				case 'Create':
					if (!eventData.entry) {
						sendServerError('No entry data provided');
						return;
					}
					if (!eventData.entry.text) {
						sendServerError('No entry text provided');
						return;
					}
					const newEntry: EntryProps = {
						id: crypto.randomUUID(),
						text: eventData.entry.text,
						author: eventData.entry.author,
						isSafe: eventData.entry.isSafe || false,
						isOnWheel: eventData.entry.isOnWheel || false,
						isWinner: eventData.entry.isWinner || false,
					};
					if (!isEntryProps(newEntry)) {
						sendServerError('Invalid entry data');
						return;
					}
					this.createEntry(newEntry);
					break;
				case 'setIsSafe':
					this.setIsSafe(eventData.id, eventData.value, sendServerError);
					break;
				case 'setIsOnWheel':
					this.setIsOnWheel(eventData.id, eventData.value, sendServerError);
					break;
				case 'setIsWinner':
					this.setIsWinner(eventData.id, eventData.value, sendServerError);
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
