"use client";
import React, { useEffect, useState } from "react";
import ClaimPrizeModal from "./modals/ClaimPrizeModal";
import ConnectWalletModal from "./modals/ConnectWalletModal";
import HistoryModal from "./modals/HistoryModal";
import ParticipantsModal from "./modals/ParticipantsModal";
import SettingsModal from "./modals/SettingsModal";
import WithdrawRefundModal from "./modals/WithdrawRefundModal";
import FundWalletModal from "./modals/FundWalletModal"; // Added import
import WinnerSection from "./components/WinnerSection";
import BuyTicketsSection from "./components/BuyTicketsSection";
import RightPanel from "./components/RightPanel";
import { useBuyTicketWrite } from "../../../hooks/useBuyTicketWrite";
import { useRouter } from "next/navigation";
import { useAccount, useDisconnect, useBalance } from "wagmi";
import {
  useRoundActive,
  useRoundEndTimestamp,
  useUserTickets,
  useEntryCount,
  useWinner,
  usePrizeAmountRedeemed,
  useExpectedRefund,
  useRoundId,
  usePrizeClaimed,
  useOwner,
} from "../../../hooks/useReadLottery";
import { useLotteryWrite } from "../../../hooks/useLotteryWrite";
import { parseUnits } from "viem";
import { useApproveUSDC, useUSDCAllowance } from "../../../hooks/useApproval";
import UiButton from "./components/UiButton";
import { useClaimPrize } from "../../../hooks/useClaimPrize";
import { useClaimPrincipal } from "../../../hooks/useClaimPrincipal";
import { Loader } from "lucide-react";
import { useHarvestingState, useWithdrawnState } from "../../../hooks/useVaultReader";

type Ticket = {
  ticketId: bigint;
  roundEndTimestamp: bigint;
  principal: bigint;
  owner: string;
};

export default function HomePage() {
  type ModalName =
    | "connectWallet"
    | "withdrawRefund"
    | "claimPrize"
    | "tokenSelector"
    | "participants"
    | "history"
    | "fundWallet"
    | "settings";

  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [roundEnded, setRoundEnded] = useState(false);
  const [isRoundEndTimePassed, setIsRoundEndTimePassed] = useState(false);
  const [canActivateHarvestTimer, setCanActivateHarvestTimer] = useState(false);
  const [isHarvestButtonEnabled, setIsHarvestButtonEnabled] = useState(false);
  const [isWithdrawButtonEnabled, setIsWithdrawButtonEnabled] = useState(false);
  const [isCloseButtonEnabled, setIsCloseButtonEnabled] = useState(false);
  const { data: owner } = useOwner();
  const {
    performStart,
    performClose,
    earnAndHarvest,
    emergencyWithdrawFromStrategy,
    resetVaultFlags,
    isLoading: isLotteryWriteLoading,
    isSuccess: isLotteryWriteSuccess,
    isWithdrawSuccessful,
    resetWithdrawSuccess,
    isError: isLotteryWriteError,
  } = useLotteryWrite();
  const { data: roundActive, isLoading } = useRoundActive();
  const { data: roundEndTimestamp } = useRoundEndTimestamp();
  const { buyTicket, isLoading: isBuyTicketPending } = useBuyTicketWrite();
  const { data: userTickets, isLoading: isUserTicketsLoading } =
    useUserTickets(address);
  const { data: entryCount, isLoading: isEntryCountLoading } = useEntryCount();

  // Fetch USDC Balance
  const usdcTokenAddress = process.env
    .NEXT_PUBLIC_USDC_TOKEN_ADDRESS as `0x${string}`;
  const { data: usdcBalanceData } = useBalance({
    address: address,
    token: usdcTokenAddress,
  });

  const { data: winnerAddress, isLoading: isWinnerLoading } = useWinner();
  const { data: prizeAmount, isLoading: isPrizeAmountLoading } =
    usePrizeAmountRedeemed();
  const { data: expectedRefundAmount, isLoading: isExpectedRefundLoading } =
    useExpectedRefund(address);
  const { data: currentRoundId, isLoading: isRoundIdLoading } = useRoundId();
  const { data: prizeClaimed } = usePrizeClaimed();
  const { claimPrize, isLoading: isClaimPrizePending } = useClaimPrize();
  const { claimPrincipal, isLoading: isClaimPrincipalPending } =
    useClaimPrincipal();
  const [strategyTriggered, setStrategyTriggered] = useState(false);
  const {
    approve,
    isLoading: isApproving,
    isSuccess: isApproved,
  } = useApproveUSDC();

  const vaultContractAddress = process.env
    .NEXT_PUBLIC_TOKEN_VAULT_CONTRACT_ADDRESS as `0x${string}`;
  const { data: vaultBalanceData } = useBalance({
    address: vaultContractAddress,
    token: usdcTokenAddress,
  });
  const [modals, setModals] = useState({
    connectWallet: false,
    withdrawRefund: false,
    claimPrize: false,
    tokenSelector: false,
    participants: false,
    history: false,
    settings: false,
    fundWallet: false, // Added new modal state
  });
  const [selectedCurrency, setSelectedCurrency] = useState("ETH");
  const [usdcToUsdRate, setUsdcToUsdRate] = useState<number | null>(null);
  const { allowance, refetchAllowance, isError, error } = useUSDCAllowance();

  const openModal = (modalName: ModalName) =>
    setModals((prev) => ({ ...prev, [modalName]: true }));
  const closeModal = (modalName: ModalName) =>
    setModals((prev) => ({ ...prev, [modalName]: false }));

  const [stage, setStage] = useState("");
  const { data: isHarvesting } = useHarvestingState();
  const { data: hasWithdrawn } = useWithdrawnState();

  function handleDisconnect() {
    disconnect();
    router.push("/");
  }

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  useEffect(() => {
    if(!roundActive){
      setStage("Ready to Start");
    }
    if (roundActive && roundEndTimestamp) {
      setStage("Round Active");

      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      if (now > Number(roundEndTimestamp)) {
        setIsRoundEndTimePassed(true);
        setIsHarvestButtonEnabled(true);
        setStage("Ready to Harvest");
      }
    }
  }, [roundEndTimestamp, isRoundEndTimePassed, roundActive]);

  useEffect(() => {
    if (roundActive && isHarvestButtonEnabled) {
      if(isHarvesting){
        setIsWithdrawButtonEnabled(true);
        setIsHarvestButtonEnabled(false);
        setStage("Ready to Withdraw");
      } else {
        const timer = setTimeout(() => {
          setIsWithdrawButtonEnabled(true);
          setIsHarvestButtonEnabled(false);
          setStage("Ready to Withdraw")
  
        }, 2 * 60 * 1000); // 2 minutes in milliseconds
  
        return () => clearTimeout(timer); // Cleanup on unmount or if conditions change
      }
    }
  }, [isHarvestButtonEnabled, roundActive, isHarvesting]);

  useEffect(() => {
    if ((roundActive && isLotteryWriteSuccess && isWithdrawSuccessful) || hasWithdrawn) {
      setIsCloseButtonEnabled(true);
      resetWithdrawSuccess();
      setStage("Ready to Close Round")
    }
  }, [isLotteryWriteSuccess, isWithdrawSuccessful]);

  useEffect(() => {
    if (currentRoundId) {
      setRoundEnded(false);
      setStrategyTriggered(false);
    }
  }, [currentRoundId]);

  const handleBuyTicket = async () => {
    const amount = parseUnits("0.0001", 6);

    if (!allowance || allowance < amount) {
      // Approve and then call buyTicket automatically
      await approve(amount);
      const interval = setInterval(async () => {
        const { data: updatedAllowance } = await refetchAllowance();
        if (updatedAllowance && updatedAllowance >= amount) {
          clearInterval(interval);
          buyTicket(amount); // call buy after approval
        }
      }, 1000);
      return;
    }

    // If already approved
    buyTicket(amount);
    
  };

  const handleClaimPrize = () => {
    // console.log("claim prize clicked");
    claimPrize();
  };

  console.log("RoundActiveeeenjadgkxksjdfc}}}}}}", roundActive);

  function handleStart(): void {
    console.log("RoundActiveeeenjadgkxksjdfc}}}}}}", roundActive);
    console.log("CLICKEEEEEDDDDDDDDDDDDDDDDDDD%%%%%%%%%%%%%% startRound");
      setStage("Starting")
    performStart();
  }

  function handleEarnAndHarvest(): void {
    console.log("CLICKEEEEEDDDDDDDDDDDDDDDDDDD *************** harvest");
    console.log("HARVEST BUTTON ENABLED", isHarvestButtonEnabled);
      setStage("Harvesting")
    earnAndHarvest();
  }

  function handleEmergencyWithdrawFromStrategy(): void {
    console.log("CLICKEEEEEDDDDDDDDDDDDDDDDDDD ^^^^^^^^^^^^^^^^^^^^^ withdraw");
      setStage("Withdrawing")

    emergencyWithdrawFromStrategy();
  }

  function handlePerformClose(): void {
    console.log("CLICKEEEEEDDDDDDDDDDDDDDDDDDD £££££££££££££££££ close");
      setStage("Closing")
    resetVaultFlags();
    performClose();
  }

  return (
    <div className="relative flex flex-col min-h-screen font-serif bg-black text-white overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(234,179,8,0.05),transparent_50%)]" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255,255,255,0.03) 2px,
            rgba(255,255,255,0.03) 4px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            rgba(255,255,255,0.03) 2px,
            rgba(255,255,255,0.03) 4px
          )`,
          }}
        />
      </div>

      <nav className="relative z-10 flex justify-between items-center px-6 md:px-16 py-4 border-b border-yellow-400/20 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-yellow-400 rounded transform rotate-45" />
          <span className="text-2xl font-bold tracking-tight">Xyra</span>
        </div>

        {isConnected && address && (
          <button
            onClick={handleDisconnect}
            className=" px-6 py-3 bg-yellow-400 text-black rounded font-semibold text-sm hover:bg-yellow-500 transition-all transform hover:scale-105 uppercase tracking-wide"
          >
            {`${address.slice(0, 6)}...${address.slice(-4)}`}
          </button>
        )}
      </nav>

      <main className="flex md:grid-cols-3 gap-6 mx-40 py-12">
        <div className="md:col-span-2 flex flex-col space-y-6 ">
          {address === owner && (
            <div>
              <div className="flex gap-6">
                <button
                  onClick={() => handleStart()}
                  disabled={roundActive}
                  className="px-6 py-3 w-full bg-yellow-400 text-black rounded font-semibold text-sm hover:bg-yellow-500 transition-all transform hover:scale-105 tracking-wide flex items-center justify-center disabled:bg-yellow-400/10 disabled:border disabled:border-yellow-500/10 disabled:text-white/40"
                >
                  {isLotteryWriteLoading ? "Please Wait" : "Start Round"}
                </button>

                <button
                  onClick={() => handleEarnAndHarvest()}
                  disabled={!isHarvestButtonEnabled}
                  className="px-6 py-3 w-full bg-yellow-400 text-black rounded font-semibold text-sm hover:bg-yellow-500 transition-all transform hover:scale-105 tracking-wide flex items-center justify-center disabled:bg-yellow-400/10 disabled:border disabled:border-yellow-500/10 disabled:text-white/40"
                >
                  {isLotteryWriteLoading ? "Please wait" : "Harvest"}
                </button>

                <button
                  onClick={() => handleEmergencyWithdrawFromStrategy()}
                  disabled={!isWithdrawButtonEnabled}
                  className="px-6 py-3 w-full bg-yellow-400 text-black rounded font-semibold text-sm hover:bg-yellow-500 transition-all transform hover:scale-105 tracking-wide flex items-center justify-center disabled:bg-yellow-400/10 disabled:border disabled:border-yellow-500/10 disabled:text-white/40"
                >
                  {isLotteryWriteLoading ? "Please Wait" : "Withdraw"}
                </button>

                <button
                  onClick={() => handlePerformClose()}
                  disabled={!isCloseButtonEnabled}
                  className="px-6 py-3 w-full bg-yellow-400 text-black rounded font-semibold text-sm hover:bg-yellow-500 transition-all transform hover:scale-105 tracking-wide flex items-center justify-center disabled:bg-yellow-400/10 disabled:border disabled:border-yellow-500/10 disabled:text-white/40"
                >
                  {isLotteryWriteLoading ? "Please Wait" : "Close Round"}
                </button>
              </div>
              <p className="text-white text-xs p-4">{stage}!</p>
            </div>
          )}
          {/* Winner Section */}
          <WinnerSection
            currentRoundId={currentRoundId}
            roundActive={roundActive}
            isWinnerLoading={isWinnerLoading}
            winnerAddress={winnerAddress}
            address={address}
            roundEndTimestamp={roundEndTimestamp}
            isPrizeAmountLoading={isPrizeAmountLoading}
            isExpectedRefundLoading={isExpectedRefundLoading}
            isRoundIdLoading={isRoundIdLoading}
            prizeAmount={prizeAmount}
            expectedRefundAmount={expectedRefundAmount}
            handleClaimPrize={handleClaimPrize}
            isClaimPrizePending={isClaimPrizePending}
            claimPrincipal={() => claimPrincipal()}
            isClaimPrincipalPending={isClaimPrincipalPending}
            prizeClaimed={prizeClaimed}
          />

          {/* Buy Tickets Section */}
          <BuyTicketsSection
            handleBuyTicket={handleBuyTicket}
            roundActive={roundActive}
            isLoading={isLoading}
            isBuyTicketPending={isBuyTicketPending}
            roundEnded={roundEnded}
            roundEndTimestamp={roundEndTimestamp}
            isEntryCountLoading={isEntryCountLoading}
            entryCount={entryCount}
            openModal={openModal}
          />
        </div>

        {/* Right Panel */}
        <RightPanel
          selectedCurrency={selectedCurrency}
          usdcBalanceData={usdcBalanceData}
          usdcToUsdRate={usdcToUsdRate}
          setSelectedCurrency={setSelectedCurrency}
          address={address}
          openModal={openModal}
          isUserTicketsLoading={isUserTicketsLoading}
          userTickets={userTickets}
        />
      </main>

      {/* Modals */}
      <ConnectWalletModal
        isOpen={modals.connectWallet}
        onClose={() => closeModal("connectWallet")}
      />
      <WithdrawRefundModal
        isOpen={modals.withdrawRefund}
        onClose={() => closeModal("withdrawRefund")}
      />
      <ClaimPrizeModal
        isOpen={modals.claimPrize}
        onClose={() => closeModal("claimPrize")}
      />
      <ParticipantsModal
        isOpen={modals.participants}
        onClose={() => closeModal("participants")}
      />
      <HistoryModal
        isOpen={modals.history}
        onClose={() => closeModal("history")}
      />
      <SettingsModal
        isOpen={modals.settings}
        onClose={() => closeModal("settings")}
      />
      <FundWalletModal
        isOpen={modals.fundWallet}
        onClose={() => closeModal("fundWallet")}
      />

      {/* Footer */}
      <footer className="flex flex-col justify-center items-center p-6 border-t border-yellow text-center">
        <div className="text-sm font-medium mb-1">LotteryDApp</div>
        <div className="text-xs text-gray-400">
          © 2025 LotteryDApp. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
