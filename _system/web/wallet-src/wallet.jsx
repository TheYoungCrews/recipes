// Wallet island: RainbowKit + wagmi + viem, SIWE against /api/nonce + /api/session. Lazy-loaded by app.js on "Wallet" click.
// Build: cd _system/web/wallet-src && npm i && npm run build  (outputs ../wallet.js + ../wallet.css)
import "@rainbow-me/rainbowkit/styles.css";
import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { WagmiProvider, createConfig, http, useAccount } from "wagmi";
import { mainnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, RainbowKitAuthenticationProvider, createAuthenticationAdapter, connectorsForWallets, useConnectModal, lightTheme } from "@rainbow-me/rainbowkit";
import { rainbowWallet, zerionWallet, walletConnectWallet, metaMaskWallet, coinbaseWallet, injectedWallet } from "@rainbow-me/rainbowkit/wallets";
import { getAddress } from "viem";

const qc = new QueryClient();
let root = null, cfgCache = null, api = { onDone: () => {}, say: () => {} };

function makeConfig(projectId) {
  const groups = projectId
    ? [{ groupName: "Wallets", wallets: [rainbowWallet, zerionWallet, metaMaskWallet, coinbaseWallet, walletConnectWallet, injectedWallet] }]
    : [{ groupName: "Wallets", wallets: [injectedWallet, coinbaseWallet] }];
  const connectors = connectorsForWallets(groups, { appName: "Crews & Anna's Kitchen", projectId: projectId || "no-walletconnect" });
  return createConfig({ chains: [mainnet], connectors, transports: { [mainnet.id]: http() }, ssr: false });
}

function App({ projectId, openSignal }) {
  const [status, setStatus] = useState("unauthenticated");
  const config = useMemo(() => makeConfig(projectId), [projectId]);
  const adapter = useMemo(() => createAuthenticationAdapter({
    getNonce: async () => (await (await fetch("/api/nonce", { credentials: "same-origin" })).json()).nonce,
    createMessage: ({ nonce, address }) => {
      const now = new Date();
      return `${location.host} wants you to sign in with your Ethereum account:\n${getAddress(address)}\n\nSign in to Crews & Anna's Kitchen.\n\nURI: ${location.origin}\nVersion: 1\nChain ID: 1\nNonce: ${nonce}\nIssued At: ${now.toISOString()}\nExpiration Time: ${new Date(now.getTime() + 9 * 60e3).toISOString()}`;
    },
    verify: async ({ message, signature }) => {
      const r = await fetch("/api/session", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ siwe: { message, signature } }) });
      if (r.ok) { setStatus("authenticated"); api.onDone(); return true; }
      api.say(r.status === 403 ? "That wallet isn't on the cook list." : "Couldn't sign in with that wallet. Try again?");
      return false;
    },
    signOut: async () => setStatus("unauthenticated"),
  }), []);
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={qc}>
        <RainbowKitAuthenticationProvider adapter={adapter} status={status}>
          <RainbowKitProvider initialChain={mainnet} modalSize="compact" appInfo={{ appName: "Crews & Anna's Kitchen" }}
            theme={lightTheme({ accentColor: "#5f7f5a", accentColorForeground: "#fffdf7", borderRadius: "large", fontStack: "system" })}>
            <Opener openSignal={openSignal} />
          </RainbowKitProvider>
        </RainbowKitAuthenticationProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function Opener({ openSignal }) {
  const { openConnectModal } = useConnectModal();
  const { isConnected, status } = useAccount();
  useEffect(() => { if (openConnectModal) openConnectModal(); }, [openSignal, openConnectModal, status]);
  return null;
}

let signal = 0;
window.KWALLET = {
  async open(opts = {}) {
    api = { onDone: opts.onDone || (() => {}), say: opts.say || (() => {}) };
    if (!cfgCache) cfgCache = await fetch("/api/config").then(r => r.json()).catch(() => ({}));
    if (!root) { const el = document.createElement("div"); el.id = "kwallet"; document.body.appendChild(el); root = createRoot(el); }
    signal += 1;
    root.render(<App projectId={cfgCache.walletConnectProjectId || null} openSignal={signal} />);
  },
};
