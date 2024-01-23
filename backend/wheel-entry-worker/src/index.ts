import { EntryProps, Command, isEntryProps, globalParamMap, GlobalParamSettingCommand } from '@shared/types';
import { CreateMessage, DeleteMessage, SetterMessage, WSMessage } from '@shared/websocket-types';
import { ViewerEntryBody } from './types';
import { getTruffleTokenPayload, getUserInfoFromTruffle } from './auth';
export interface Env {
	WHEEL_ENTRIES: DurableObjectNamespace;
}

// Worker code:

export default {
	async fetch(request: Request, env: Env) {
		//get and validate the auth token
		const authToken = request.headers.get('Authorization');
		if (!authToken) {
			return new Response('Missing Authorization header', { status: 401 });
		}
		const accessToken = authToken.split(' ')[1];
		if (!accessToken) {
			return new Response('Missing access token', { status: 401 });
		}
		//get orgId from the access tokend to use as the durable object room id
		const { orgId } = await getTruffleTokenPayload(accessToken);

		let id = env.WHEEL_ENTRIES.idFromName(orgId);

		// Construct the stub for the Durable Object using the ID.
		// A stub is a client Object used to send messages to the Durable Object.
		let obj = env.WHEEL_ENTRIES.get(id);

		// Send a request to the Durable Object, then await its response.
		return obj.fetch(request);
	},
};

// Durable Object

interface WebSocketInfo {
	id: string;
	webSocket: WebSocket;
}
export class WheelEntries {
	state: DurableObjectState;
	webSockets: Set<WebSocketInfo>;
	storage: DurableObjectStorage;
	constructor(state: DurableObjectState, env: Env) {
		this.state = state;
		this.storage = state.storage;
		this.webSockets = new Set();
	}
	// Define the broadcast function
	broadcast(message: string) {
		this.webSockets.forEach((client) => {
			client.webSocket.send(message);
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
		const command: Command = Command.Delete;
		const existed = await this.storage.delete(id);
		if (!existed) {
			onError(`${command} failed, Entry ID: ${id} not found`);
			return;
		}
		const message: DeleteMessage = { command, id };
		this.broadcastObject(message);
	}

	async createEntry(entry: EntryProps) {
		const command: Command = Command.Create;
		// update the storage
		await this.storage.put(entry.id.toString(), entry);
		// update the clients
		const message: CreateMessage = { command, entry };
		this.broadcastObject(message);
	}

	async setIsSafe(id: string, isSafe: boolean, onError: (message: string) => void) {
		const command: Command = Command.SetIsSafe;
		const entry = await this.getEntry(id, onError, command);
		if (!entry) return;
		await this.storage.put(id, { ...entry, isSafe });
		const message: SetterMessage = { command, id, value: isSafe };
		this.broadcastObject(message);
	}

	async setIsOnWheel(id: string, isOnWheel: boolean, onError: (message: string) => void) {
		const command: Command = Command.SetIsOnWheel;
		const entry = await this.getEntry(id, onError, command);
		if (!entry) return;
		await this.storage.put(id, { ...entry, isOnWheel });
		const message: SetterMessage = { command, id, value: isOnWheel };
		this.broadcastObject(message);
	}

	async setIsWinner(id: string, isWinner: boolean, onError: (message: string) => void) {
		const command: Command = Command.SetIsWinner;
		const entry = await this.getEntry(id, onError, command);
		if (!entry) return;
		await this.storage.put(id, { ...entry, isWinner });
		const message: SetterMessage = { command, id, value: isWinner };
		this.broadcastObject(message);
	}

	async sendCurrentState(serverWebSocket: WebSocket) {
		const command: Command = Command.GetData;
		const storageMap = await this.storage.list();
		let globalParams = {};
		//get each global param from the storage build a globalParams object
		for (const key of Object.values(GlobalParamSettingCommand)) {
			console.log('checking key', key);
			const commandKey = key as GlobalParamSettingCommand;
			if (!(key in globalParamMap)) {
				console.error(`Invalid global param command ${key}`);
				continue;
			}
			globalParams = { ...globalParams, [globalParamMap[commandKey]]: await this.storage.get(globalParamMap[commandKey]) };
			console.log('globalParams', globalParams);
			//not an Entry so delete from the entries map
			storageMap.delete(globalParamMap[commandKey]);
		}
		let entries = Array.from(storageMap.values());
		serverWebSocket.send(JSON.stringify({ command, entries, ...globalParams }));
	}

	async setGlobalParam(command: GlobalParamSettingCommand, value: boolean | string) {
		if (!(command in globalParamMap)) {
			console.error(`Invalid global param command ${command}`);
			return;
		}
		await this.storage.put(globalParamMap[command], value);

		const message: WSMessage = { command, value };
		this.broadcastObject(message);
	}

	// Handle requests sent to the Durable Object
	async fetch(request: Request) {
		const authToken = request.headers.get('Authorization');
		if (!authToken) {
			return new Response('Missing Authorization header', { status: 401 });
		}
		const accessToken = authToken.split(' ')[1];
		if (!accessToken) {
			return new Response('Missing access token', { status: 401 });
		}

		let url = new URL(request.url);
		// upgrade to websockets
		if (request.headers.get('Upgrade') !== 'websocket') {
			//accept a regular post request for viewers adding entries (don't need to open a websocket for them)
			if (request.method === 'POST' && url.pathname === '/add') {
				const { name } = await getUserInfoFromTruffle(accessToken);
				const body: ViewerEntryBody = await request.json();
				const newEntry: EntryProps = {
					id: crypto.randomUUID(),
					text: body.text,
					author: name,
					isSafe: false,
					isOnWheel: false,
				};
				this.createEntry(newEntry);
				return new Response('Sucessfully added to the wheel!', { status: 200 });
			}

			return new Response('Expected a websocket', { status: 400 });
		}
		//if the request is a websocket upgrade request the client needs to be a mod or admin
		const { name, roles } = await getUserInfoFromTruffle(accessToken);
		const isMod = roles.includes('moderator');
		const isAdmin = roles.includes('admin');
		if (!isMod && !isAdmin) {
			return new Response('Unauthorized (must be admin or mod)', { status: 401 });
		}
		const pair = new WebSocketPair();
		const { 0: clientWebSocket, 1: serverWebSocket } = pair;
		serverWebSocket.accept();
		const serverWebSocketData = { webSocket: serverWebSocket, id: crypto.randomUUID(), name };
		this.webSockets.add(serverWebSocketData);

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
						author: serverWebSocketData.name,
						isSafe: eventData.entry.isSafe || false,
						isOnWheel: eventData.entry.isOnWheel || false,
						isWinner: eventData.entry.isWinner || false,
						weight: eventData.entry.weight || 1,
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
				case 'setIsAcceptingEntries':
				case 'setIsGameStarted':
					if (typeof eventData.value !== 'boolean') {
						sendServerError('Invalid value (should be a boolean)');
						return;
					}
					this.setGlobalParam(eventData.command, eventData.value);
					break;
				case 'setRules':
					if (typeof eventData.value !== 'string') {
						sendServerError('Invalid rules (should be a string)');
						return;
					}
					this.setGlobalParam(eventData.command, eventData.value);
					break;
				default:
					sendServerError('Invalid command');
					return;
			}
		});

		// Remove the server websocket when it is closed
		serverWebSocket.addEventListener('close', (event) => {
			this.webSockets.delete(serverWebSocketData);
		});

		// return the client websocket
		return new Response(null, { status: 101, webSocket: clientWebSocket });
	}
}
