// ============================================================
// 🏦 useVault.ts — Full Logging + Refactored to Your New Style
// ============================================================

import {
  useAccount,
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
  useBalance,
} from "wagmi";
import { useEffect } from "react";
import { toast } from "react-toastify";
import tokenVaultABI from "../src/contracts/TokenVault.json";

// ============================================================
// 🔍 READ: VAULT BALANCE (USDC)
// ============================================================
export function useVaultBalance() {
  const vaultAddress = process.env
    .NEXT_PUBLIC_TOKEN_VAULT_CONTRACT_ADDRESS as `0x${string}`;
  const usdcAddress = process.env
    .NEXT_PUBLIC_USDC_TOKEN_ADDRESS as `0x${string}`;

  console.log("🔍 [useVaultBalance:init]", {
    vaultAddress,
    usdcAddress,
  });

  const { data, isLoading, isError, refetch } = useBalance({
    address: vaultAddress,
    token: usdcAddress,
    query: {
      enabled: !!vaultAddress && !!usdcAddress,
    },
  });

  useEffect(() => {
    // if (isLoading) console.log("⏳ [useVaultBalance] Loading vault balance...");
    // if (isError) console.log("❌ [useVaultBalance] Failed to fetch balance");
    if (data)
      console.log("💰 [useVaultBalance] Balance fetched:", {
        formatted: data.formatted,
      });
  }, [data, isLoading, isError]);

  return { balance: data, isLoading, isError, refetch };
}


