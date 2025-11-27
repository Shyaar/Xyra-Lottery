// hooks/useLotteryWrite.ts
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import lotteryManagerABI from "../src/contracts/LotteryManager.json";
import tokenVaultABI from "../src/contracts/TokenVault.json";

const lotteryManagerAddress = process.env
  .NEXT_PUBLIC_LOTTERY_MANAGER_CONTRACT_ADDRESS as `0x${string}`;
const tokenVaultAddress = process.env
    .NEXT_PUBLIC_TOKEN_VAULT_CONTRACT_ADDRESS as `0x${string}`;

export function useLotteryWrite() {
  const { address: callerAddress } = useAccount();
  const caller = callerAddress ?? null;
  const toastShownRef = useRef<{ success?: boolean; error?: boolean }>({});
  const [functionName, setFunctionName] = useState<string | null>(null);
  const [isWithdrawSuccessful, setIsWithdrawSuccessful] = useState(false);

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
  } = useWaitForTransactionReceipt({
    hash,
  });

  const resetWithdrawSuccess = () => {
    setIsWithdrawSuccessful(false);
  };

  const performStart = () => {
    if (!caller) {
      toast.error("Please connect your wallet.");
      return;
    }
    setFunctionName("performStart");
    writeContract({
      address: lotteryManagerAddress,
      abi: lotteryManagerABI,
      functionName: "performStart",
      args: [],
    });
  };

  const performClose = () => {
    if (!caller) {
      toast.error("Please connect your wallet.");
      return;
    }
    setFunctionName("performClose");
    writeContract({
      address: lotteryManagerAddress,
      abi: lotteryManagerABI,
      functionName: "performClose",
      args: [],
    });
  };

  const earnAndHarvest = () => {
    if (!caller) {
      toast.error("Please connect your wallet.");
      return;
    }
    setFunctionName("earnAndHarvest");
    writeContract({
      address: tokenVaultAddress,
      abi: tokenVaultABI,
      functionName: "earnAndHarvest",
      args: [],
    });
  };

    const emergencyWithdrawFromStrategy = () => {
    if (!caller) {
      toast.error("Please connect your wallet.");
      return;
    }
    setFunctionName("emergencyWithdrawAllFromStrategy");
    writeContract({
      address: tokenVaultAddress,
      abi: tokenVaultABI,
      functionName: "emergencyWithdrawAllFromStrategy",
      args: [],
    });
    };

  const resetVaultFlags = () => {
    if (!caller) {
      toast.error("Please connect your wallet.");
      return;
    }
    setFunctionName("resetFlags");
    writeContract({
      address: tokenVaultAddress,
      abi: tokenVaultABI,
      functionName: "resetFlags",
      args: [],
    });
  };

  useEffect(() => {
    if (isWritePending) {
      toast.info("⏳ Confirm transaction in your wallet...", { autoClose: false });
    }
    if (isWriteError && !toastShownRef.current.error) {
      console.error("❌ [useLotteryWrite] Error initiating transaction", {
        caller,
        writeError,
      });
      toast.error(`❌ Error: ${writeError?.message || "Unknown error"}`);
      toastShownRef.current.error = true;
    }
  }, [isWritePending, isWriteError, writeError, caller]);

  useEffect(() => {
    if (isConfirming) {
      toast.info("⏳ Confirming transaction...", { autoClose: false });
    }
    if (isConfirmed) {
      toast.dismiss(); // Dismiss previous info toast
      toast.success("✅ Transaction confirmed!");
      if (functionName === "emergencyWithdrawAllFromStrategy") {
        setIsWithdrawSuccessful(true);
      }
    }
    if (isConfirmError && !toastShownRef.current.error) {
      console.error("❌ [useLotteryWrite] Error confirming transaction", {
        caller,
        confirmError,
      });
      toast.error(`❌ Error confirming transaction: ${confirmError?.message || "Unknown error"}`);
      toastShownRef.current.error = true;
    }
  }, [isConfirming, isConfirmed, isConfirmError, confirmError, caller, functionName]);

  return {
    performStart,
    performClose,
    earnAndHarvest,
    emergencyWithdrawFromStrategy,
    resetVaultFlags,
    isLoading: isWritePending || isConfirming,
    isSuccess: isConfirmed,
    isWithdrawSuccessful,
    resetWithdrawSuccess,
    isError: isWriteError || isConfirmError,
    error: writeError || confirmError,
  };
}