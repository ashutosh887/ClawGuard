import { LocalChat } from "@/components/local-chat";
import { RevokeButton } from "@/components/revoke-button";

export default function ChatPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Local Chat</h1>
          <p className="text-sm text-muted mt-1">
            On-device reasoning. External actions brokered through Token Vault.
          </p>
        </div>
        <RevokeButton />
      </div>
      <LocalChat />
    </div>
  );
}
