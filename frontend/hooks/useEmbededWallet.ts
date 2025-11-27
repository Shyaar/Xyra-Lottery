import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useEffect, useState } from "react";

export function useEmbeddedWallet() {
  const { user } = usePrivy();
  const { wallets } = useWallets();

  const [embeddedWallet, setEmbeddedWallet] = useState<any>(null);
  const [provider, setProvider] = useState<any>(null);

  // useEffect(() => {
  //   if (!user || wallets.length === 0) return;

  //   // 1️⃣ Detect the embedded wallet
  //   const embedded = wallets.find((w) => w.walletClientType === "privy");
  //   if (!embedded) return;

  //   setEmbeddedWallet(embedded);

  //   // 2️⃣ Extract EIP-1193 provider
  //   const eip1193Provider = embedded.getEthereumProvider();
  //   setProvider(eip1193Provider);
  // }, [user, wallets]);

  console.log("Embedded wallet:", embeddedWallet);
  console.log("Provider:", provider);

  return { embeddedWallet, provider };
}
