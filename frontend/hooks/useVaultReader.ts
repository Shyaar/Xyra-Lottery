
import { useReadContract, useAccount } from "wagmi";
import tokenVaultABI from "../src/contracts/TokenVault.json";

const contractAddress = process.env.NEXT_PUBLIC_TOKEN_VAULT_CONTRACT_ADDRESS as `0x${string}`;

export function useHarvestingState() {
  const { data, isLoading, isError, refetch } = useReadContract({
    address: contractAddress,
    abi: tokenVaultABI,
    functionName: "harvesting",
    query: { enabled: true },
  });

  return { data: data as boolean, isLoading, isError, refetch };
}

export function useWithdrawnState() {
  const { data, isLoading, isError, refetch } = useReadContract({
    address: contractAddress,
    abi: tokenVaultABI,
    functionName: "withdrawn",
    query: { enabled: true },
  });

  return { data: data as boolean, isLoading, isError, refetch };
}
