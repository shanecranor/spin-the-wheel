import { verify, decode } from '@tsndr/cloudflare-worker-jwt';
type PayloadProps = {
	sub: string; //this is the user id
	isAnon: boolean;
	type: 'packageInstall' | 'global';
	orgId: string;
	orgMemberId: string;
	packageId: string;
	packageMemberId: string;
};

const MYCELIUM_API_URL = 'https://mycelium.truffle.vip/graphql';
const MYCELIUM_PUBLIC_ES256_KEY =
	'-----BEGIN PUBLIC KEY-----\n' +
	'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEGzVELuVubW1DcXJPZ7cHssy4SXc0\n' +
	'd6inNpg1L8Lwo/YqSnNQwW+nJTQOm9q+ZAfJUjOgHpfMpyNYVOzaWunz2Q==\n' +
	'-----END PUBLIC KEY-----';
type Response = {
	data: {
		me: {
			name: string;
		};
		orgUser: {
			name: string;
			roleConnection: {
				nodes: {
					id: string;
					name: string;
					rank: number;
				}[];
			};
		};
	};
};

export const getUserInfoFromTruffle = async (accessToken: string) => {
	const query = `
		query {
			me { name }
			orgUser {
				name
				roleConnection {
					nodes {
						id
						name
						rank
					}
				}
			}
		}
	`;
	//fetch user info from truffle server using the access token
	const response = await fetch(MYCELIUM_API_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-access-token': accessToken,
		},
		body: JSON.stringify({ query }),
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data = (await response.json()) as Response['data'];
	// Check for errors in the response body
	if (typeof data !== 'object' || data === null) {
		throw new Error('Invalid response from server');
	}

	if ('errors' in data && data.errors) {
		throw new Error(JSON.stringify(data.errors));
	}

	const name = data.orgUser.name || data.me.name;
	const roles = data.orgUser.roleConnection.nodes;
	return { name, roles };
};

type TokenData = {
	userId: string;
	type: 'packageInstall' | 'global';
	orgId: string;
	orgMemberId: string;
	isAnon: boolean;
	packageId: string;
	packageMemberId: string;
};

export const validateAccessToken: (token: string) => Promise<TokenData> = async (token: string) => {
	const isValid = await verify(token, MYCELIUM_PUBLIC_ES256_KEY, { algorithm: 'ES256' });

	if (!isValid) {
		throw new Error('Invalid token');
	}
	// token is valid, so we can grab user info from the token
	// user id is stored as the sub prop in the JWT payload

	const payload = decode(token).payload as PayloadProps;
	return {
		userId: payload.sub,
		type: payload.type,
		orgId: payload.orgId,
		orgMemberId: payload.orgMemberId,
		isAnon: payload.isAnon,
		packageId: payload.packageId,
		packageMemberId: payload.packageMemberId,
	};
};
