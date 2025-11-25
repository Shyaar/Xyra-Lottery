// hooks/useVaultWrite.ts
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import tokenVaultABI from "../src/contracts/TokenVault.json";

const contractAddress = process.env.NEXT_PUBLIC_TOKEN_VAULT_CONTRACT_ADDRESS as `0x${string}`;

export function useVaultWrite() {
  const { address: callerAddress } = useAccount();
  const caller = callerAddress ?? null;
  const toastShownRef = useRef<{ success?: boolean; error?: boolean }>({});

  const {
    data: hash,
    writeContract,
    isPending: isWritePending,
    isError: isWriteError,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isConfirmError,
    error: confirmError,
  } = useWaitForTransactionReceipt({ hash });

  const earnToStrategy = (amount: bigint) => {
    if (!caller) {
      toast.error("Please connect your wallet.");
      return;
    }

    writeContract({
      address: contractAddress,
      abi: tokenVaultABI,
      functionName: "earnToStrategy",
      args: [amount],
    });
  };

  const withdrawFromStrategy = (amount: bigint) => {
    if (!caller) {
      toast.error("Please connect your wallet.");
      return;
    }

    writeContract({
      address: contractAddress,
      abi: tokenVaultABI,
      functionName: "withdrawFromStrategy",
      args: [amount],
    });
  };

  const emergencyWithdrawAllFromStrategy = () => {
    if (!caller) {
      toast.error("Please connect your wallet.");
      return;
    }

    writeContract({
      address: contractAddress,
      abi: tokenVaultABI,
      functionName: "emergencyWithdrawAllFromStrategy",
    });
  };

  useEffect(() => {
    if (isWritePending) {
      toast.info("⏳ Confirm transaction in your wallet...", { autoClose: false });
    }
    if (isWriteError && !toastShownRef.current.error) {
      console.error("❌ [useVaultWrite] Error initiating transaction", { caller, contractAddress, writeError });
      toast.error(`❌ Error initiating transaction: ${writeError?.message || "Unknown error"}`);
      toastShownRef.current.error = true;
    }
  }, [isWritePending, isWriteError, writeError, caller]);

  useEffect(() => {
    if (isConfirming) {
      toast.info("⏳ Confirming transaction...", { autoClose: false });
    }
    if (isConfirmed) {
      toast.dismiss();
      toast.success("✅ Transaction successful!");
    }
    if (isConfirmError && !toastShownRef.current.error) {
      console.error("❌ [useVaultWrite] Error confirming transaction", { caller, contractAddress, confirmError });
      toast.error(`❌ Error confirming transaction: ${confirmError?.message || "Unknown error"}`);
      toastShownRef.current.error = true;
    }
  }, [isConfirming, isConfirmed, isConfirmError, confirmError, caller]);

  return {
    earnToStrategy,
    withdrawFromStrategy,
    emergencyWithdrawAllFromStrategy,
    isLoading: isWritePending || isConfirming,
    isSuccess: isConfirmed,
    isError: isWriteError || isConfirmError,
    error: writeError || confirmError,
  };
}
