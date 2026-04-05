const config = {
  appName: "ClawGuard",
  appDescription:
    "Local AI that safely touches the world — with zero token exposure.",

  auth0: {
    secret: process.env.AUTH0_SECRET!,
    baseUrl: process.env.AUTH0_BASE_URL ?? "http://localhost:3000",
    issuerBaseUrl: process.env.AUTH0_ISSUER_BASE_URL!,
    clientId: process.env.AUTH0_CLIENT_ID!,
    clientSecret: process.env.AUTH0_CLIENT_SECRET!,
    domain: process.env.AUTH0_DOMAIN!,
    audience: process.env.AUTH0_AUDIENCE!,
  },

  connections: {
    google: process.env.AUTH0_GOOGLE_CONNECTION ?? "google-oauth2",
    slack: process.env.AUTH0_SLACK_CONNECTION ?? "slack",
    github: process.env.AUTH0_GITHUB_CONNECTION ?? "github",
  },
} as const;

export default config;
