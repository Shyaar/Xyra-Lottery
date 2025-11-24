"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { PrivyWagmiConnector } from "@privy-io/wagmi-connector";
import { ReactNode } from "react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { http } from "viem";

// --- Configure wagmi chains ---
const { chains, publicClient } = configureChains(
  [baseSepolia],
  [http()]
);

const wagmiConfig = createConfig({
  autoConnect: true,
  publicClient,
});

export function AppPrivyProvider({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider
      appId="cmh96xl5100l5jv0c3zz84y1c"
      config={{
        embeddedWallets: {
          createOnLogin: "all-users",
        },
      }}
    >
      <WagmiConfig config={wagmiConfig}>
        <PrivyWagmiConnector wagmiChainsConfig={{ chains }}>
          {children}
        </PrivyWagmiConnector>
      </WagmiConfig>
    </PrivyProvider>
  );
}
