import fsextra from 'fs-extra';
import path from 'path';
import { B24OAuth } from '@bitrix24/b24jssdk';

const TOKEN_FILE = path.join('/mnt/auth_data', 'b24_auth_tokens.json');
const PORT = process.env.PORT || 3000;

// Tell TS this can be either the B24 instance or null
let _b24Instance: B24OAuth | null = null;

// ---------------------------
// Interfaces
// ---------------------------
interface B24Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  clientEndpoint: string;
  serverEndpoint: string;
  memberId: string;
  userId: number;
  domain: string;
  applicationToken: string;
  expires: number;
  scope: string;
  status: "F" | "D" | "T" | "P" | "L" | "S";
}

// ---------------------------
// App credentials
// ---------------------------
const oauthSecret = {
    // Provide fallbacks so TS doesn't complain about potentially undefined env vars
    clientId: process.env.BITRIX_CLIENT_ID || '',
    clientSecret: process.env.BITRIX_CLIENT_SECRET || '',
};

// ---------------------------
// Helper to get the correct redirect URI
// ---------------------------
export function getRedirectUri(): string {
    return process.env.BITRIX_REDIRECT_URI || `http://localhost:${PORT}/auth/callback`;
}

// ---------------------------
// Load/Save Tokens
// ---------------------------
async function loadTokens(): Promise<B24Tokens | null> {
    if (await fsextra.pathExists(TOKEN_FILE)) {
        return fsextra.readJson(TOKEN_FILE);
    }
    return null;
}

async function saveTokens(tokens: B24Tokens): Promise<void> {
    await fsextra.writeJson(TOKEN_FILE, tokens, { spaces: 2 });
}

// ---------------------------
// Authorization URL generation
// ---------------------------
export function getAuthorizationUrl(): string {
    const redirectUri = getRedirectUri();
    const encodedRedirectUri = encodeURIComponent(redirectUri);
    return `https://pcicrm.bitrix24.com/oauth/authorize/?client_id=${oauthSecret.clientId}&response_type=code&redirect_uri=${encodedRedirectUri}`;
}

// ---------------------------
// Handle OAuth Redirect
// ---------------------------
export async function handleOAuthRedirect(code: string): Promise<void> {
    const redirectUri = getRedirectUri(); 
    const correctDomain = "pcicrm.bitrix24.com";
    
    const url = `https://oauth.bitrix.info/oauth/token/?grant_type=authorization_code&client_id=${oauthSecret.clientId}&client_secret=${oauthSecret.clientSecret}&redirect_uri=${redirectUri}&code=${code}`;

    const res = await fetch(url, { method: 'POST' });
    const data = await res.json();

    if (!data.access_token) {
        console.error('Bitrix Token Exchange Error:', data);
        throw new Error('Failed to get access token. Check the authorization code and client credentials.');
    }

    const correctedData: B24Tokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        clientEndpoint: data.client_endpoint,
        serverEndpoint: data.server_endpoint,
        memberId: data.member_id,
        userId: Number(data.user_id),
        domain: correctDomain || data.domain, 
        applicationToken: data.application_token || 'PLACEHOLDER_FOR_SDK_INIT', 
        expires: data.expires,
        scope: data.scope,
        status: data.status as "F" | "D" | "T" | "P" | "L" | "S",
    };

    await saveTokens(correctedData);
}

// ---------------------------
// Initialize B24OAuth Singleton
// ---------------------------
export async function initB24(): Promise<B24OAuth | null> {
    if (_b24Instance) return _b24Instance;

    let oauthParams = await loadTokens();

    if (!oauthParams) {
        return null; 
    }

    const oauth = new B24OAuth(oauthParams, oauthSecret);

    // Auto-save refreshed tokens (Typed as 'any' or you can import the specific type from the SDK if available)
    oauth.setCallbackRefreshAuth(async ({ b24OAuthParams }: any) => {
        await saveTokens(b24OAuthParams as B24Tokens);
    });

    _b24Instance = oauth;
    return _b24Instance;
}

// ---------------------------
// Export ready-to-use b24 object
// ---------------------------
export const b24 = {
    async init(): Promise<B24OAuth | null> {
        _b24Instance = await initB24();
        return _b24Instance;
    },
    get instance(): B24OAuth {
        if (!_b24Instance) throw new Error('B24 instance not initialized. Call b24.init() first.');
        return _b24Instance;
    },
};