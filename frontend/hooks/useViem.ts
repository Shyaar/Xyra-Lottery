'use client'

import { useEffect, useState } from "react";
import { createPublicClient, createWalletClient, http, custom } from "viem";
import { baseSepolia } from "viem/chains";
import { useEmbeddedWallet } from "./useEmbededWallet";



export function useViemClients() {
  const { provider } = useEmbeddedWallet();

  const [publicClient, setPublicClient] = useState<any>(null);
  const [walletClient, setWalletClient] = useState<any>(null);

  useEffect(() => {
    if (!provider) return;

    // 1️⃣ Public viem client (RPC reads)
    const pc = createPublicClient({
      chain: baseSepolia,
      transport: http(), // you can change this to alchemy/infura URL if you want
    });

    setPublicClient(pc);

    // 2️⃣ Wallet viem client (signer)
    const wc = createWalletClient({
      chain: baseSepolia,
      transport: custom(provider), // <-- connect Privy embedded provider
    });

    setWalletClient(wc);
  }, [provider]);

  return { publicClient, walletClient };
}
