// hooks/useBuyTicketWrite.ts
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import lotteryManagerABI from "../src/contracts/LotteryManager.json";
import { useUserTickets } from "./useReadLottery";

const contractAddress = process.env
  .NEXT_PUBLIC_LOTTERY_MANAGER_CONTRACT_ADDRESS as `0x${string}`;

export function useBuyTicketWrite() {
  const { address: callerAddress } = useAccount();
  const caller = callerAddress ?? null;
  const toastShownRef = useRef<{ success?: boolean; error?: boolean }>({});
  const { refetch: refetchUserTickets } = useUserTickets(callerAddress);

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

  const buyTicket = (amount: bigint) => {
    if (!caller) {
      toast.error("Please connect your wallet to buy a ticket.");
      return;
    }

    writeContract({
      address: contractAddress,
      abi: lotteryManagerABI,
      functionName: "buyTicket",
      args: [amount], // <-- REQUIRED
    });
  };

  useEffect(() => {
    if (isWritePending) {
      toast.info("⏳ Confirm transaction in your wallet...");
    }
    if (isWriteError && !toastShownRef.current.error) {
      // console.error("❌ [useBuyTicketWrite] Error initiating transaction", { caller, contractAddress, writeError });
      toast.error(
        `❌ Error buying ticket: ${writeError?.message || "Unknown error"}`
      );
      toastShownRef.current.error = true;
    }
  }, [isWritePending, isWriteError, writeError, caller]);

  useEffect(() => {
    if (isConfirming) {
      toast.info("⏳ Confirming transaction...");
    }
    if (isConfirmed) {
      toast.dismiss();
      toast.success("✅ Ticket purchased successfully!");
      refetchUserTickets();
    }
    if (isConfirmError && !toastShownRef.current.error) {
      // console.error("❌ [useBuyTicketWrite] Error confirming transaction", { caller, contractAddress, confirmError });
      toast.error(
        `❌ Error confirming ticket purchase: ${
          confirmError?.message || "Unknown error"
        }`
      );
      toastShownRef.current.error = true;
    }
  }, [
    isConfirming,
    isConfirmed,
    isConfirmError,
    confirmError,
    caller,
    refetchUserTickets,
  ]);

  return {
    buyTicket,
    isLoading: isWritePending || isConfirming,
    isSuccess: isConfirmed,
    isError: isWriteError || isConfirmError,
    error: writeError || confirmError,
  };
}
