import {
  useAccount,
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useEffect } from "react";
import { toast } from "react-toastify";
import userRegistryABI from "../src/contracts/userRegistry.json";

// ============================================================
// 🔍 READ USER STATE — FULL LOGGING
// ============================================================
export function useReadUser(userAddress: `0x${string}` | undefined) {
  const contractAddress = process.env
    .NEXT_PUBLIC_USER_REGISTRY_CONTRACT_ADDRESS as `0x${string}`;

  console.log("🔍 [useReadUser:init]", {
    userAddress,
    contractAddress,
  });



  const { data, isLoading, isError, refetch } = useReadContract({
    address: contractAddress,
    abi: userRegistryABI,
    functionName: "isRegistered",
    args: userAddress? [userAddress]:undefined, // ✅ pass the address here
    query: {
      enabled: !!userAddress,
    },
  });

  // Log lifecycle changes
  useEffect(() => {
    if (isLoading) console.log("⏳ [useReadUser] Loading...");
    if (isError)
      console.log("❌ [useReadUser] Error reading contract,", isError);
    if (data !== undefined)
      console.log("✅ [useReadUser] Result:", { registered: data });
  }, [data, isLoading, isError]);

  return { data, isLoading, isError, refetch };
}

// ============================================================
// ⚙️ USER ACTIONS — WRITE + CONFIRMATION FULL LOGGING
// ============================================================
export function useUserActions(userAddress: `0x${string}` | undefined) {
  const { isConnected } = useAccount();
  const contractAddress = process.env
    .NEXT_PUBLIC_USER_REGISTRY_CONTRACT_ADDRESS as `0x${string}`;

  console.log("⚙️ [useUserActions:init]", {
    userAddress,
    contractAddress,
  });

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
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Log: write status changes
  // useEffect(() => {
  //   if (isPending) console.log("⏳ [write] Transaction pending...");
  //   if (writeError) console.error("❌ [write:error]", writeError);
  // }, [isPending, writeError]);

  // Log: hash received
  // useEffect(() => {
  //   if (hash) {
  //     console.log("📨 [write:hash] Transaction Hash:", hash);
  //     toast.info(`Tx sent: ${hash.slice(0, 8)}...`);
  //   }
  // }, [hash]);

  // Log: confirmation lifecycle
  useEffect(() => {
    if (isConfirming) console.log("⏳ [confirm] Waiting for confirmation...");
    if (isConfirmed) {
      // console.log("🎉 [confirm] Transaction confirmed!");
      toast.success("Transaction confirmed!");
    }
    if (confirmError) {
      // console.error("❌ [confirm:error]", confirmError);
      toast.error("Transaction failed during confirmation");
    }
  }, [isConfirming, isConfirmed, confirmError]);

  // ============================================================
  // 🚀 REGISTER USER FUNCTION
  // ============================================================
  const registerUser = async () => {
    // console.log("⚙️ [registerUser:called]", {
    //   isConnected,
    //   userAddress,
    // });

    if (!isConnected || !userAddress) {
      toast.error("Wallet not connected!");
      // console.error("❌ [registerUser] No wallet/connection");
      throw new Error("Wallet not connected or address missing");
    }

    try {
      // console.log("📤 [registerUser] Sending transaction...");

      const tx = await writeContractAsync({
        address: contractAddress,
        abi: userRegistryABI,
        functionName: "register",
        account: userAddress,
      });

      // console.log("📨 [registerUser] Tx sent:", tx);
      // toast.info("Transaction sent, waiting for confirmation...");

      return tx;
    } catch (err) {
      // console.error("🔴 [registerUser:error]", err);
      toast.error("Registration failed. Check console.");
      throw err;
    }
  };

  return {
    registerUser,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    writeError,
    confirmError,
  };
}
