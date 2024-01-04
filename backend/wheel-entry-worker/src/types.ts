export interface ViewerEntryBody {
	authToken: string;
	text: string;
	author: string;
}

export type Action = 'Create' | 'Delete' | 'Approve' | 'Move to wheel' | 'Get data';
