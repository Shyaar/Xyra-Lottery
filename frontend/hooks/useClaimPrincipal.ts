// hooks/useClaimPrincipal.ts
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import lotteryManagerABI from "../src/contracts/LotteryManager.json";

const contractAddress = process.env
  .NEXT_PUBLIC_LOTTERY_MANAGER_CONTRACT_ADDRESS as `0x${string}`;

export function useClaimPrincipal() {
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
  } = useWaitForTransactionReceipt({
    hash,
  });

  const claimPrincipal = () => {
    if (!caller) {
      toast.error("Please connect your wallet to claim principal.");
      return;
    }
    writeContract({
      address: contractAddress,
      abi: lotteryManagerABI,
      functionName: "claimPrincipal",
      args: [],
    });
  };

  useEffect(() => {
    if (isWritePending) {
      toast.info("⏳ Confirm transaction in your wallet...")
    }
    if (isWriteError && !toastShownRef.current.error) {
      // console.error("❌ [useClaimPrincipal] Error initiating transaction", {
      //   caller,
      //   contractAddress,
      //   writeError,
      // });
      toast.error(`❌ Error claiming principal: ${writeError?.message || "Unknown error"}`);
      toastShownRef.current.error = true;
    }
  }, [isWritePending, isWriteError, writeError, caller]);

  useEffect(() => {
    if (isConfirming) {
      toast.info("⏳ Confirming transaction...");
    }
    if (isConfirmed) {
      toast.dismiss(); // Dismiss previous info toast
      toast.success("✅ Principal claimed successfully!");
    }
    if (isConfirmError && !toastShownRef.current.error) {
      // console.error("❌ [useClaimPrincipal] Error confirming transaction", {
      //   caller,
      //   contractAddress,
      //   confirmError,
      // });
      toast.error(`❌ Error confirming principal claim: ${confirmError?.message || "Unknown error"}`);
      toastShownRef.current.error = true;
    }
  }, [isConfirming, isConfirmed, isConfirmError, confirmError, caller]);

  return {
    claimPrincipal,
    isLoading: isWritePending || isConfirming,
    isSuccess: isConfirmed,
    isError: isWriteError || isConfirmError,
    error: writeError || confirmError,
  };
}