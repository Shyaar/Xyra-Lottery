import { useEffect } from "react";
import { toast } from "react-toastify";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import lotteryManagerABI from "../src/contracts/LotteryManager.json";
import { useRoundActive, useRoundEndTimestamp } from "./useReadLottery";

export function useStartRound() {
  const { isConnected } = useAccount();
  const { address: callerAddress } = useAccount();
  const caller = callerAddress ?? null;
  const contractAddress = process.env
    .NEXT_PUBLIC_LOTTERY_MANAGER_CONTRACT_ADDRESS as `0x${string}`;

  // useEffect(() => {
  //   console.log("🔍 [useRoundActive:init]", { caller, contractAddress });
  // }, [caller]);

  const { refetch: refetchRoundActive } = useRoundActive();
  const { refetch: refetchRoundEndTimestamp } = useRoundEndTimestamp();

  const {
    data: hash,
    writeContractAsync,
    isPending,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({ hash });

  // Log: write status changes
  useEffect(() => {
    // if (isPending) console.log("⏳ [write] Transaction pending...");
    if (writeError) console.error("❌ [write:error]", writeError);
  }, [isPending, writeError]);

  // Log: hash received
  // useEffect(() => {
  //   if (hash) {
  //     console.log("📨 [write:hash] Transaction Hash:", hash);
  //     toast.info(`Tx sent: ${hash.slice(0, 8)}...`);
  //   }
  // }, [hash]);

  // Log: confirmation lifecycle
  useEffect(() => {
    // if (isConfirming) console.log("⏳ [confirm] Waiting for confirmation...");
    if (isConfirmed) {
      // console.log("🎉 [confirm] Transaction confirmed!");
      toast.success("Round started successfully!");
      refetchRoundActive();
      refetchRoundEndTimestamp();
    }
    if (confirmError) {
      // console.error("❌ [confirm:error]", confirmError);
      toast.error("Transaction failed during confirmation");
    }
  }, [isConfirming, isConfirmed, confirmError, refetchRoundActive, refetchRoundEndTimestamp]);

  // ============================================================
  // 🚀 START ROUND FUNCTION
  // ============================================================
  const startRound = async (durationSeconds: number) => {
    // console.log("⚙️ [startRound:called]", { isConnected, durationSeconds });

    if (!isConnected) {
      toast.error("Wallet not connected!");
      // console.error("❌ [startRound] Wallet not connected");
      throw new Error("Wallet not connected");
    }

    try {
      // console.log("📤 [startRound] Sending transaction...");

      const tx = await writeContractAsync({
        address: contractAddress,
        abi: lotteryManagerABI,
        functionName: "startRound",
        args: [durationSeconds],
      });

      // console.log("📨 [startRound] Tx sent:", tx);
      toast.info("Transaction sent, waiting for confirmation...");

      return tx;
    } catch (err) {
      // console.error("🔴 [startRound:error]", err);
      toast.error("Failed to start round. Check console.");
      throw err;
    }
  };

  return {
    startRound,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    writeError,
    confirmError,
  };
}
