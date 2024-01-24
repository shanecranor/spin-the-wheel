/**
 * Extracts the access token from the Sec-WebSocket-Protocol header or the standard header.
 * @param request - The incoming request object.
 * @returns The extracted access token, or null if not found.
 */
export function extractAccessToken(request: Request) {
	// Check the standard header first
	const authHeaderToken = request.headers.get('Authorization');
	if (authHeaderToken) {
		const [type, token] = authHeaderToken.split(' ');
		if (type === 'Bearer' && token) return token;
	}
	const protocols = request.headers.get('Sec-WebSocket-Protocol');
	if (!protocols) {
		return null; // No Sec-WebSocket-Protocol header found
	}

	const protocolList = protocols.split(',').map((s) => s.trim());
	// the format of the protocol is "access_token, ${token}"
	// so we split on the comma and take the second value
	const token = protocolList.length > 1 ? protocolList[1] : null;
	return token || null;
}
