// hooks/useLotteryManager.ts
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useReadContract, useAccount, useReadContracts } from "wagmi"; // Added useReadContracts
import { Abi } from "viem";
import lotteryManagerABI from "../src/contracts/LotteryManager.json";

export type Ticket = {
  ticketId: bigint;
  roundEndTimestamp: bigint;
  principal: bigint;
  owner: string;
};

const contractAddress = process.env
  .NEXT_PUBLIC_LOTTERY_MANAGER_CONTRACT_ADDRESS as `0x${string}`;

// -----------------------------
// 🔹 INDIVIDUAL READ HOOKS
// Each hook has its own logs, toast, and state
// -----------------------------

export function useRoundActive() {
  const { address: callerAddress } = useAccount();
  const caller = callerAddress ?? null;
  const toastShownRef = useRef<{ success?: boolean; error?: boolean }>({});

  const { data, isLoading, isError, refetch } = useReadContract({
    address: contractAddress,
    abi: lotteryManagerABI,
    functionName: "roundActive",
    query: { enabled: true },
  });

  // useEffect(() => {
  //   console.log("🔍 [useRoundActive:init]", { caller, contractAddress });
  // }, [caller]);

  // useEffect(() => {
  //   if (isLoading) toast.info("⏳ roundActive loading...", { autoClose: 1000 });
  //   if (isError && !toastShownRef.current.error) {
  //     console.error("❌ [useRoundActive] Error reading contract", { caller, contractAddress, isError });
  //     toast.error("❌ Error fetching roundActive");
  //     toastShownRef.current.error = true;
  //   }
  //   if (data !== undefined && !toastShownRef.current.success) {
  //     console.log("✅ [useRoundActive] Result:", { data, caller, contractAddress });
  //     toast.success("✅ roundActive loaded");
  //     toastShownRef.current.success = true;
  //   }
  // }, [data, isLoading, isError, caller]);

  return { data: data as boolean, isLoading, isError, refetch, callerAddress: caller };
}

export function useRoundId() {
  const { address: callerAddress } = useAccount();
  const caller = callerAddress ?? null;
  const toastShownRef = useRef<{ success?: boolean; error?: boolean }>({});

  const { data, isLoading, isError, refetch } = useReadContract({
    address: contractAddress,
    abi: lotteryManagerABI,
    functionName: "roundId",
    query: { enabled: true },
  });

  // useEffect(() => console.log("🔍 [useRoundId:init]", { caller, contractAddress }), [caller]);

  // useEffect(() => {
  //   if (isLoading) toast.info("⏳ roundId loading...", { autoClose: 1000 });
  //   if (isError && !toastShownRef.current.error) {
  //     console.error("❌ [useRoundId] Error reading contract", { caller, contractAddress, isError });
  //     toast.error("❌ Error fetching roundId");
  //     toastShownRef.current.error = true;
  //   }
  //   if (data !== undefined && !toastShownRef.current.success) {
  //     console.log("✅ [useRoundId] Result:", { data, caller, contractAddress });
  //     toast.success("✅ roundId loaded");
  //     toastShownRef.current.success = true;
  //   }
  // }, [data, isLoading, isError, caller]);

  return { data: data as bigint, isLoading, isError, refetch, callerAddress: caller };
}

export function useUserTickets(userAddress?: `0x${string}`) {
  const { address: callerAddress } = useAccount();
  const caller = callerAddress ?? null;
  const toastShownRef = useRef<{ success?: boolean; error?: boolean }>({});

  const { data, isLoading, isError, refetch } = useReadContract({
    address: contractAddress,
    abi: lotteryManagerABI,
    functionName: "getUserTickets",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress },
  });

  useEffect(() => console.log("🔍 [useUserTickets:init]", { caller, contractAddress, userAddress }), [caller, userAddress]);

  useEffect(() => {
    // if (isLoading) toast.info("⏳ fetching your Tickets...", { autoClose: 1000 });
    if (isError && !toastShownRef.current.error) {
      // console.error("❌ [useUserTickets] Error reading contract", { caller, contractAddress, isError });
      toast.error("❌ Error fetching getUserTickets");
      toastShownRef.current.error = true;
    }
    if (data !== undefined && !toastShownRef.current.success) {
      // console.log("✅ [useUserTickets] Result:", { data, caller, contractAddress });
      // toast.success("✅ getUserTickets loaded");
      toastShownRef.current.success = true;
    }
  }, [data, isLoading, isError, caller]);

  return { data: data as Ticket[], isLoading, isError, refetch, callerAddress: caller };
}

export function useTicketById(ticketId: bigint) {
  const { address: callerAddress } = useAccount();
  const caller = callerAddress ?? null;
  const toastShownRef = useRef<{ success?: boolean; error?: boolean }>({});

  const { data, isLoading, isError, refetch } = useReadContract({
    address: contractAddress,
    abi: lotteryManagerABI,
    functionName: "getTicketById",
    args: [ticketId],
    query: { enabled: !!ticketId },
  });

  // useEffect(() => console.log("🔍 [useTicketById:init]", { caller, contractAddress, ticketId }), [caller, ticketId]);

  // useEffect(() => {
  //   if (isLoading) toast.info("⏳ getTicketById loading...", { autoClose: 1000 });
  //   if (isError && !toastShownRef.current.error) {
  //     // console.error("❌ [useTicketById] Error reading contract", { caller, contractAddress, isError });
  //     toast.error("❌ Error fetching getTicketById");
  //     toastShownRef.current.error = true;
  //   }
  //   if (data !== undefined && !toastShownRef.current.success) {
  //     console.log("✅ [useTicketById] Result:", { data, caller, contractAddress });
  //     toast.success("✅ getTicketById loaded");
  //     toastShownRef.current.success = true;
  //   }
  // }, [data, isLoading, isError, caller]);

  return { data: data as Ticket, isLoading, isError, refetch, callerAddress: caller };
}

export function useRoundEndTimestamp() {
  const { address: callerAddress } = useAccount();
  const caller = callerAddress ?? null;
  const toastShownRef = useRef<{ success?: boolean; error?: boolean }>({});

  const { data, isLoading, isError, refetch } = useReadContract({
    address: contractAddress,
    abi: lotteryManagerABI,
    functionName: "roundEndTimestamp",
    query: { enabled: true },
  });

  // useEffect(() => {
  //   console.log("🔍 [useRoundEndTimestamp:init]", { caller, contractAddress });
  // }, [caller]);

  // useEffect(() => {
  //   if (isLoading) toast.info("⏳ roundEndTimestamp loading...", { autoClose: 1000 });
  //   if (isError && !toastShownRef.current.error) {
  //     console.error("❌ [useRoundEndTimestamp] Error reading contract", { caller, contractAddress, isError });
  //     toast.error("❌ Error fetching roundEndTimestamp");
  //     toastShownRef.current.error = true;
  //   }
  //   if (data !== undefined && !toastShownRef.current.success) {
  //     console.log("✅ [useRoundEndTimestamp] Result:", { data, caller, contractAddress });
  //     toast.success("✅ roundEndTimestamp loaded");
  //     toastShownRef.current.success = true;
  //   }
  // }, [data, isLoading, isError, caller]);

  return { data: data as bigint, isLoading, isError, refetch, callerAddress: caller };
}

export function useEntryCount() {
  const { address: callerAddress } = useAccount();
  const caller = callerAddress ?? null;
  const toastShownRef = useRef<{ success?: boolean; error?: boolean }>({});

  const { data, isLoading, isError, refetch } = useReadContract({
    address: contractAddress,
    abi: lotteryManagerABI,
    functionName: "entryCount",
    query: { enabled: true },
  });

  // useEffect(() => {
  //   console.log("🔍 [useEntryCount:init]", { caller, contractAddress });
  // }, [caller]);

  // useEffect(() => {
  //   if (isLoading) toast.info("⏳ entryCount loading...", { autoClose: 1000 });
  //   if (isError && !toastShownRef.current.error) {
  //     console.error("❌ [useEntryCount] Error reading contract", { caller, contractAddress, isError });
  //     toast.error("❌ Error fetching entryCount");
  //     toastShownRef.current.error = true;
  //   }
  //   if (data !== undefined && !toastShownRef.current.success) {
  //     console.log("✅ [useEntryCount] Result:", { data, caller, contractAddress });
  //     toast.success("✅ entryCount loaded");
  //     toastShownRef.current.success = true;
  //   }
  // }, [data, isLoading, isError, caller]);

  return { data: data as bigint, isLoading, isError, refetch, callerAddress: caller };
}

export function useParticipants() {
  const { data: entryCount, isLoading: isEntryCountLoading } = useEntryCount();
  const { address: callerAddress } = useAccount();
  const caller = callerAddress ?? null;
  const toastShownRef = useRef<{ success?: boolean; error?: boolean }>({});

  const contracts = entryCount
    ? Array.from({ length: Number(entryCount) }, (_, i) => ({
        address: contractAddress,
        abi: lotteryManagerABI as Abi,
        functionName: "entries",
        args: [BigInt(i)],
      }))
    : [];

  const { data, isLoading, isError, refetch } = useReadContracts({
    contracts,
    query: { enabled: !isEntryCountLoading && (entryCount !== undefined && entryCount > 0n) },
  });

  const participants = data?.map(result => result.result).filter(Boolean) as `0x${string}`[] | undefined;

  // useEffect(() => {
  //   if (isEntryCountLoading) return;

  //   if (isLoading) toast.info("⏳ participants loading...", { autoClose: 1000 });
  //   if (isError && !toastShownRef.current.error) {
  //     console.error("❌ [useParticipants] Error reading contract", { caller, contractAddress, isError });
  //     toast.error("❌ Error fetching participants");
  //     toastShownRef.current.error = true;
  //   }
  //   if (participants !== undefined && !toastShownRef.current.success) {
  //     console.log("✅ [useParticipants] Result:", { participants, caller, contractAddress });
  //     toast.success("✅ participants loaded");
  //     toastShownRef.current.success = true;
  //   }
  // }, [participants, isLoading, isError, isEntryCountLoading, caller]);

  return { data: participants, isLoading: isLoading || isEntryCountLoading, isError, refetch, callerAddress: caller };
}

export function useWinner() {
  const { address: callerAddress } = useAccount();
  const caller = callerAddress ?? null;
  const toastShownRef = useRef<{ success?: boolean; error?: boolean }>({});

  const { data, isLoading, isError, refetch } = useReadContract({
    address: contractAddress,
    abi: lotteryManagerABI,
    functionName: "winner",
    query: { enabled: true },
  });

  // useEffect(() => console.log("🔍 [useWinner:init]", { caller, contractAddress }), [caller]);

  useEffect(() => {
    // if (isLoading) toast.info("⏳ winner loading...", { autoClose: 1000 });
    if (isError && !toastShownRef.current.error) {
      // console.error("❌ [useWinner] Error reading contract", { caller, contractAddress, isError });
      toast.error("❌ Error fetching winner");
      toastShownRef.current.error = true;
    }
    if (data !== undefined && !toastShownRef.current.success) {
      // console.log("✅ [useWinner] Result:", { data, caller, contractAddress });
      // toast.success("✅ winner loaded");
      toastShownRef.current.success = true;
    }
  }, [data, isLoading, isError, caller]);

  return { data: data as `0x${string}`, isLoading, isError, refetch, callerAddress: caller };
}

export function usePrizeAmountRedeemed() {
  const { address: callerAddress } = useAccount();
  const caller = callerAddress ?? null;
  const toastShownRef = useRef<{ success?: boolean; error?: boolean }>({});

  const { data, isLoading, isError, refetch } = useReadContract({
    address: contractAddress,
    abi: lotteryManagerABI,
    functionName: "prizeAmountRedeemed",
    query: { enabled: true },
  });

  // useEffect(() => console.log("🔍 [usePrizeAmountRedeemed:init]", { caller, contractAddress }), [caller]);

  // useEffect(() => {
  //   if (isLoading) toast.info("⏳ prizeAmountRedeemed loading...", { autoClose: 1000 });
  //   if (isError && !toastShownRef.current.error) {
  //     console.error("❌ [usePrizeAmountRedeemed] Error reading contract", { caller, contractAddress, isError });
  //     toast.error("❌ Error fetching prizeAmountRedeemed");
  //     toastShownRef.current.error = true;
  //   }
  //   if (data !== undefined && !toastShownRef.current.success) {
  //     console.log("✅ [usePrizeAmountRedeemed] Result:", { data, caller, contractAddress });
  //     toast.success("✅ prizeAmountRedeemed loaded");
  //     toastShownRef.current.success = true;
  //   }
  // }, [data, isLoading, isError, caller]);

  return { data: data as bigint, isLoading, isError, refetch, callerAddress: caller };
}

export function useExpectedRefund(userAddress?: `0x${string}`) {
  const { address: callerAddress } = useAccount();
  const caller = callerAddress ?? null;
  const toastShownRef = useRef<{ success?: boolean; error?: boolean }>({});

  const { data, isLoading, isError, refetch } = useReadContract({
    address: contractAddress,
    abi: lotteryManagerABI,
    functionName: "expectedRefund",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress },
  });

  // useEffect(() => console.log("🔍 [useExpectedRefund:init]", { caller, contractAddress, userAddress }), [caller, userAddress]);

  // useEffect(() => {
  //   if (isLoading) toast.info("⏳ expectedRefund loading...", { autoClose: 1000 });
  //   if (isError && !toastShownRef.current.error) {
  //     console.error("❌ [useExpectedRefund] Error reading contract", { caller, contractAddress, isError });
  //     toast.error("❌ Error fetching expectedRefund");
  //     toastShownRef.current.error = true;
  //   }
  //   if (data !== undefined && !toastShownRef.current.success) {
  //     console.log("✅ [useExpectedRefund] Result:", { data, caller, contractAddress });
  //     toast.success("✅ expectedRefund loaded");
  //     toastShownRef.current.success = true;
  //   }
  // }, [data, isLoading, isError, caller]);

  return { data: data as bigint, isLoading, isError, refetch, callerAddress: caller };
}

export function usePrizeClaimed() {
  const { address: callerAddress } = useAccount();
  const caller = callerAddress ?? null;
  const toastShownRef = useRef<{ success?: boolean; error?: boolean }>({});

  const { data, isLoading, isError, refetch } = useReadContract({
    address: contractAddress,
    abi: lotteryManagerABI,
    functionName: "prizeClaimed",
    query: { enabled: true },
  });

  // useEffect(() => {
  //   console.log("🔍 [usePrizeClaimed:init]", { caller, contractAddress });
  // }, [caller]);

  useEffect(() => {
    // if (isLoading) {
    //   toast.info("⏳ prizeClaimed loading...", { autoClose: 1000 });
    //   return;
    // }

    if (isError && !toastShownRef.current.error) {
      // console.error("❌ [usePrizeClaimed] Error reading contract", {
      //   caller,
      //   contractAddress,
      //   isError,
      // });
      toast.error("❌ Error fetching prizeClaimed");
      toastShownRef.current.error = true;
    }

    if (data !== undefined && !toastShownRef.current.success) {
      // console.log("✅ [usePrizeClaimed] Result:", {
      //   data,
      //   caller,
      //   contractAddress,
      // });
      // toast.success("✅ prizeClaimed");
      toastShownRef.current.success = true;
    }
  }, [data, isLoading, isError, caller]);

  return { data: data as boolean, isLoading, isError, refetch, callerAddress: caller };
}


export function useOwner() {
  const { address: callerAddress } = useAccount();
  const caller = callerAddress ?? null;
  const toastShownRef = useRef<{ success?: boolean; error?: boolean }>({});

  const { data, isLoading, isError, refetch } = useReadContract({
    address: contractAddress,
    abi: lotteryManagerABI,
    functionName: "owner",
    query: { enabled: true },
  });

  // useEffect(() => console.log("🔍 [useOwner:init]", { caller, contractAddress }), [caller]);

  // useEffect(() => {
  //   if (isLoading) toast.info("⏳ owner loading...", { autoClose: 1000 });
  //   if (isError && !toastShownRef.current.error) {
  //     console.error("❌ [useOwner] Error reading contract", { caller, contractAddress, isError });
  //     toast.error("❌ Error fetching owner");
  //     toastShownRef.current.error = true;
  //   }
  //   if (data !== undefined && !toastShownRef.current.success) {
  //     console.log("✅ [useOwner] Result:", { data, caller, contractAddress });
  //     toastShownRef.current.success = true;
  //   }
  // }, [data, isLoading, isError, caller]);

  return { data: data as `0x${string}`, isLoading, isError, refetch, callerAddress: caller };
}
