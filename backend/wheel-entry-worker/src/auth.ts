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
const MOTHERTREE_API_URL = 'https://mothertree.truffle.vip/graphql'; //'https://mothertree.staging.bio/graphql';
const MOTHERTREE_PUBLIC_ES256_KEY =
	'-----BEGIN PUBLIC KEY-----\n' +
	'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEGzVELuVubW1DcXJPZ7cHssy4SXc0\n' +
	'd6inNpg1L8Lwo/YqSnNQwW+nJTQOm9q+ZAfJUjOgHpfMpyNYVOzaWunz2Q==\n' +
	'-----END PUBLIC KEY-----';
type OrgMemberResponse = {
	data: {
		orgMember: {
			id: string;
			orgId: string;
			userId: string;
			name: string | null;
			roles: Array<{
				id: string;
				slug: string;
			}>;
		};
	};
};

export const getUserInfoFromTruffle = async (accessToken: string) => {
	const { orgId } = await getTruffleTokenPayload(accessToken);
	const query = `
  query OrgMember {
    orgMember(input: { orgId: "${orgId}" }) {
        id
        orgId
        userId
        name
        roles {
            id
            slug
        }
    }
}
	`;
	//fetch user info from truffle server using the access token
	const response = await fetch(MOTHERTREE_API_URL, {
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

	const respJson = (await response.json()) as OrgMemberResponse;
	// Check for errors in the response body
	if (typeof respJson !== 'object' || respJson === null) {
		throw new Error('Invalid response from server');
	}

	if ('errors' in respJson && respJson.errors) {
		throw new Error(JSON.stringify(respJson.errors));
	}
	const data = respJson.data;
	if (!data || !data.orgMember) {
		throw new Error('no data or orgmember found');
	}
	const user = data.orgMember;
	const name = user.name || 'Anonymous';
	const roles = user.roles.map((role) => role.slug);

	return { name, userId: user.id, roles };
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

/**
 * Validates a JWT token and retrieves the payload data
 * @param token The JWT token.
 * @returns A promise that resolves to the token payload data.
 * @throws An error if the token is invalid.
 */
export const getTruffleTokenPayload: (token: string) => Promise<TokenData> = async (token: string) => {
	const isValid = await verify(token, MOTHERTREE_PUBLIC_ES256_KEY, { algorithm: 'ES256' });

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
