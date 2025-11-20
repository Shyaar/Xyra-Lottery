// hooks/useLotteryManager.ts
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useReadContract, useAccount } from "wagmi";
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

  useEffect(() => {
    console.log("🔍 [useRoundActive:init]", { caller, contractAddress });
  }, [caller]);

  useEffect(() => {
    if (isLoading) toast.info("⏳ roundActive loading...", { autoClose: 1000 });
    if (isError && !toastShownRef.current.error) {
      console.error("❌ [useRoundActive] Error reading contract", { caller, contractAddress, isError });
      toast.error("❌ Error fetching roundActive");
      toastShownRef.current.error = true;
    }
    if (data !== undefined && !toastShownRef.current.success) {
      console.log("✅ [useRoundActive] Result:", { data, caller, contractAddress });
      toast.success("✅ roundActive loaded");
      toastShownRef.current.success = true;
    }
  }, [data, isLoading, isError, caller]);

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

  useEffect(() => console.log("🔍 [useRoundId:init]", { caller, contractAddress }), [caller]);

  useEffect(() => {
    if (isLoading) toast.info("⏳ roundId loading...", { autoClose: 1000 });
    if (isError && !toastShownRef.current.error) {
      console.error("❌ [useRoundId] Error reading contract", { caller, contractAddress, isError });
      toast.error("❌ Error fetching roundId");
      toastShownRef.current.error = true;
    }
    if (data !== undefined && !toastShownRef.current.success) {
      console.log("✅ [useRoundId] Result:", { data, caller, contractAddress });
      toast.success("✅ roundId loaded");
      toastShownRef.current.success = true;
    }
  }, [data, isLoading, isError, caller]);

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
    if (isLoading) toast.info("⏳ getUserTickets loading...", { autoClose: 1000 });
    if (isError && !toastShownRef.current.error) {
      console.error("❌ [useUserTickets] Error reading contract", { caller, contractAddress, isError });
      toast.error("❌ Error fetching getUserTickets");
      toastShownRef.current.error = true;
    }
    if (data !== undefined && !toastShownRef.current.success) {
      console.log("✅ [useUserTickets] Result:", { data, caller, contractAddress });
      toast.success("✅ getUserTickets loaded");
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

  useEffect(() => console.log("🔍 [useTicketById:init]", { caller, contractAddress, ticketId }), [caller, ticketId]);

  useEffect(() => {
    if (isLoading) toast.info("⏳ getTicketById loading...", { autoClose: 1000 });
    if (isError && !toastShownRef.current.error) {
      console.error("❌ [useTicketById] Error reading contract", { caller, contractAddress, isError });
      toast.error("❌ Error fetching getTicketById");
      toastShownRef.current.error = true;
    }
    if (data !== undefined && !toastShownRef.current.success) {
      console.log("✅ [useTicketById] Result:", { data, caller, contractAddress });
      toast.success("✅ getTicketById loaded");
      toastShownRef.current.success = true;
    }
  }, [data, isLoading, isError, caller]);

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

  useEffect(() => {
    console.log("🔍 [useRoundEndTimestamp:init]", { caller, contractAddress });
  }, [caller]);

  useEffect(() => {
    if (isLoading) toast.info("⏳ roundEndTimestamp loading...", { autoClose: 1000 });
    if (isError && !toastShownRef.current.error) {
      console.error("❌ [useRoundEndTimestamp] Error reading contract", { caller, contractAddress, isError });
      toast.error("❌ Error fetching roundEndTimestamp");
      toastShownRef.current.error = true;
    }
    if (data !== undefined && !toastShownRef.current.success) {
      console.log("✅ [useRoundEndTimestamp] Result:", { data, caller, contractAddress });
      toast.success("✅ roundEndTimestamp loaded");
      toastShownRef.current.success = true;
    }
  }, [data, isLoading, isError, caller]);

  return { data: data as bigint, isLoading, isError, refetch, callerAddress: caller };
}

