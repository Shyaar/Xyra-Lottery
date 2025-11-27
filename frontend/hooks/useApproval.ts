import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { erc20Abi } from "viem"; // Standard ERC20 ABI


const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_TOKEN_ADDRESS as `0x${string}`;
const LOTTERY_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_LOTTERY_MANAGER_CONTRACT_ADDRESS as `0x${string}`;


export function useApproveUSDC() {
  const { address: callerAddress } = useAccount();
  const caller = callerAddress ?? null;
  const [amountToApprove, setAmountToApprove] = useState<bigint>(0n);
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

  const approve = (amount: bigint) => {
    if (!caller) {
      toast.error("Please connect your wallet to approve USDC.");
      return;
    }

    setAmountToApprove(amount);

    // console.log("💡 [useApproveUSDC] Attempting to approve USDC", {
    //   caller,
    //   amount,
    //   contractAddress: USDC_ADDRESS,
    //   spender: LOTTERY_MANAGER_ADDRESS,
    // });

    writeContract({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: "approve",
      args: [LOTTERY_MANAGER_ADDRESS, amount],
    });
  };

  useEffect(() => {
    if (isWritePending) {
      toast.info("⏳ Confirm transaction in your wallet...");
    }

    if (isWriteError && !toastShownRef.current.error) {
      // console.error("❌ [useApproveUSDC] Error initiating transaction", {
      //   caller,
      //   contractAddress: USDC_ADDRESS,
      //   amountToApprove,
      //   writeError,
      // });
      toast.error(`❌ Error approving USDC: ${writeError?.message || "Unknown error"}`);
      toastShownRef.current.error = true;
    }
  }, [isWritePending, isWriteError, writeError, caller, amountToApprove]);

  useEffect(() => {
    if (isConfirming) {
      toast.info("⏳ Confirming transaction...");
    }

    if (isConfirmed && !toastShownRef.current.success) {
      toast.dismiss();
      // console.log("✅ [useApproveUSDC] USDC approved successfully", {
      //   caller,
      //   contractAddress: USDC_ADDRESS,
      //   amount: amountToApprove,
      // });
      toast.success("✅ USDC approved successfully!");
      toastShownRef.current.success = true;
    }

    if (isConfirmError && !toastShownRef.current.error) {
      // console.error("❌ [useApproveUSDC] Error confirming transaction", {
      //   caller,
      //   contractAddress: USDC_ADDRESS,
      //   amountToApprove,
      //   confirmError,
      // });
      toast.error(`❌ Error confirming USDC approval: ${confirmError?.message || "Unknown error"}`);
      toastShownRef.current.error = true;
    }
  }, [isConfirming, isConfirmed, isConfirmError, confirmError, caller, amountToApprove]);

  return {
    approve,
    isLoading: isWritePending || isConfirming,
    isSuccess: isConfirmed,
    isError: isWriteError || isConfirmError,
    error: writeError || confirmError,
  };
}


export function useUSDCAllowance() {
  const { address: caller } = useAccount();
  const toastShownRef = useRef<{ error?: boolean }>({});

  const { data: allowance, refetch, isLoading, isError, error } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "allowance",
    args: [caller!, LOTTERY_MANAGER_ADDRESS],
  });

  // Debug logging
  // useEffect(() => {
  //   if (isLoading) {
  //     console.log("⏳ [useUSDCAllowance] Fetching USDC allowance...", {
  //       caller,
  //       contractAddress: USDC_ADDRESS,
  //       spender: LOTTERY_MANAGER_ADDRESS,
  //     });
  //   }

  //   if (!isLoading && allowance !== undefined) {
  //     console.log("✅ [useUSDCAllowance] Fetched USDC allowance", {
  //       caller,
  //       allowance: allowance?.toString(),
  //       contractAddress: USDC_ADDRESS,
  //       spender: LOTTERY_MANAGER_ADDRESS,
  //     });
  //   }

  //   if (isError && !toastShownRef.current.error) {
  //     console.error("❌ [useUSDCAllowance] Error fetching allowance", {
  //       caller,
  //       contractAddress: USDC_ADDRESS,
  //       spender: LOTTERY_MANAGER_ADDRESS,
  //       error,
  //     });
  //     toastShownRef.current.error = true;
  //   }
  // }, [isLoading, isError, allowance, caller, error]);

  return {
    allowance,
    refetchAllowance: refetch,
    isLoading,
    isError,
    error,
  };
}
