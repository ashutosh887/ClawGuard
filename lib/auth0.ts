import { Auth0Client } from "@auth0/nextjs-auth0/server";
import config from "@/config";

export const auth0 = new Auth0Client();

let mgmtToken: string | null = null;
let mgmtTokenExpiry = 0;

export async function getManagementToken(): Promise<string> {
  if (mgmtToken && Date.now() < mgmtTokenExpiry) return mgmtToken;

  const res = await fetch(
    `https://${config.auth0.domain}/oauth/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: config.auth0.clientId,
        client_secret: config.auth0.clientSecret,
        audience: config.auth0.audience,
      }),
    }
  );

  if (!res.ok) throw new Error(`Management token failed: ${res.statusText}`);
  const data = await res.json();
  mgmtToken = data.access_token;
  mgmtTokenExpiry = Date.now() + data.expires_in * 1000 - 60_000;
  return mgmtToken!;
}
