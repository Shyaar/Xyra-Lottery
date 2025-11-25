"use client";
import React, { useEffect, useState } from "react";
import ClaimPrizeModal from "./ClaimPrizeModal";
import ConnectWalletModal from "./ConnectWalletModal";
import HistoryModal from "./HistoryModal";
import ParticipantsModal from "./ParticipantsModal";
import SettingsModal from "./SettingsModal";
import WithdrawRefundModal from "./WithdrawRefundModal";
import FundWalletModal from "./FundWalletModal"; // Added import
import { useBuyTicketWrite } from "../../../hooks/useBuyTicketWrite";
import { useRouter } from "next/navigation";
import { useAccount, useDisconnect, useBalance } from "wagmi";
import Countdown from "../components/Countdown";
import {
  useRoundActive,
  useRoundEndTimestamp,
  useUserTickets,
  useEntryCount,
  useWinner,
  usePrizeAmountRedeemed,
  useExpectedRefund,
  useRoundId,
} from "../../../hooks/useReadLottery";
import { useStartRound } from "../../../hooks/useStartRound";
import { useClaimPrize } from "../../../hooks/useClaimPrize";
import { useClaimPrincipal } from "../../../hooks/useClaimPrincipal";
import { formatUnits, parseUnits } from "viem";
import { useApproveUSDC, useUSDCAllowance } from "../../../hooks/useApproval";
import { useVaultWrite } from "../../../hooks/useVault";
import {
  Clock,
  Ticket,
  DollarSign,
  Users,
  Wallet,
  Coins,
  Award,
  PlayCircle,
  Hash,
  ShoppingCart,
  PlusCircle,
  Gift,
  ChevronRight,
  RefreshCcw,
  Timer,
  Crown,
  NotebookPen,
} from "lucide-react";

type Ticket = {
  ticketId: bigint;
  roundEndTimestamp: bigint;
  principal: bigint;
  owner: string;
};

export default function HomePage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

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

  const { claimPrize, isLoading: isClaimPrizePending } = useClaimPrize();
  const { claimPrincipal, isLoading: isClaimPrincipalPending } =
    useClaimPrincipal();

  const {
    approve,
    isLoading: isApproving,
    isSuccess: isApproved,
  } = useApproveUSDC();

  const { earnToStrategy, withdrawFromStrategy, emergencyWithdrawAllFromStrategy } = useVaultWrite();
  const vaultContractAddress = process.env
    .NEXT_PUBLIC_TOKEN_VAULT_CONTRACT_ADDRESS as `0x${string}`;
  const { data: vaultBalanceData } = useBalance({
    address: vaultContractAddress,
    token: usdcTokenAddress,
  });

  const handleRoundEnd = () => {
    console.log("Round ended. Earning to strategy.");
    if (vaultBalanceData) {
      earnToStrategy(vaultBalanceData.value);

      setTimeout(() => {
        console.log("Withdrawing from strategy.");
        emergencyWithdrawAllFromStrategy();
      }, 60000); // 1 minute
    }
  };

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
    if (roundActive && !isLoading) {
      // console.log("Round not active, attempting to start new round...");
    }
    if (allowance && !isLoading) {
      // console.log("Allllaaaaawwwwweeeeeee", allowance);
    }
    if (winnerAddress && !isLoading) {
      // console.log("Winnnneeeerrrrrrrr!!!!!!!!!!!!!!!!!", winnerAddress);
    }

    if (prizeAmount && !isPrizeAmountLoading) {
      // console.log("PrizeWOOOOOMMMMMNNNNNN}}}}}}}}}}}}}}}}}", prizeAmount);
    }

    // console.log("isClaimPrizePending", isClaimPrizePending);
  }, [
    roundActive,
    allowance,
    winnerAddress,
    prizeAmount,
    isClaimPrincipalPending,
  ]);

  const handleBuyTicket = async () => {
    const amount = parseUnits("0.0001", 6);

    // console.log("ALLLLLLLLLLLLLLLOOOWWWWWWW:>>>>>>>", allowance);

    if (!allowance || allowance < amount) {
      await approve(amount);
      return;
    }

    buyTicket(amount);
  };

  type ModalName =
    | "connectWallet"
    | "withdrawRefund"
    | "claimPrize"
    | "tokenSelector"
    | "participants"
    | "history"
    | "fundWallet"
    | "settings";

  const openModal = (modalName: ModalName) =>
    setModals((prev) => ({ ...prev, [modalName]: true }));
  const closeModal = (modalName: ModalName) =>
    setModals((prev) => ({ ...prev, [modalName]: false }));

  const handleClaimPrize = () => {
    // console.log("claim prize clicked");
    claimPrize();
  };

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
          {/* Winner Section */}
          <section className="border border-yellow-400 font-semibold bg-yellow-400/10 text-sm rounded-lg p-6">
            <h3 className="text-2xl font-bold mb-4 text-yellow flex items-center">
              <Timer className="w-6 h-6 mr-2" /> Round{" "}
              {currentRoundId ? `#${currentRoundId.toString()}` : "#..."}
              {!roundActive &&
                !isWinnerLoading &&
                winnerAddress &&
                winnerAddress === address &&
                " Winner!"}
            </h3>

            <div className="flex flex-col space-y-2 b-4 ">
              {roundActive ? (
                <>
                  <div className="flex items-center">
                    <PlayCircle className="w-5 h-5 mr-2 text-green-500" /> Round is Active
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" /> Round Ends:{" "}
                    <strong>
                      {roundEndTimestamp
                        ? new Date(
                            Number(roundEndTimestamp) * 1000
                          ).toLocaleString()
                        : "..."}
                    </strong>
                  </div>

                  <button
                    className="bg-gray-700 text-gray-400 font-bold text-center py-3 rounded-lg px-4 mt-4 cursor-not-allowed flex items-center justify-center"
                    disabled
                  >
                    <Clock className="w-5 h-5 mr-2" /> Round has not yet ended
                  </button>
                </>
              ) : isWinnerLoading ||
                isPrizeAmountLoading ||
                isExpectedRefundLoading ||
                isRoundIdLoading ? (
                <p>Loading round results...</p>
              ) : winnerAddress ? (
                winnerAddress === address ? (
                  <>
                    <div className="flex items-center">
                      <Crown className="w-5 h-5 mr-2 text-yellow-500" /> Winning Address:{" "}
                      <strong className="px-6 py-3 w-full text-yellow-500 text-lg rounded font-semibold transition-all transform hover:scale-105 uppercase tracking-wide">
                        {address
                          ? address
                          : // ? `${address.slice(0, 12)}...${address.slice(-4)}`
                            "N/A"}
                      </strong>
                    </div>

                    {/* <div>
                      Prize Amount:{" "}
                      <strong className="text-yellow">
                        {parseFloat(formatUnits(prizeAmount, 6)).toFixed(4)} ETH
                      </strong>
                    </div> */}

                    <button
                      onClick={() => handleClaimPrize()}
                      disabled={isClaimPrizePending}
                      className="px-6 py-3 w-full bg-yellow-400 text-black rounded font-semibold text-sm hover:bg-yellow-500 transition-all transform hover:scale-105 uppercase tracking-wide flex items-center justify-center"
                    >
                      <Coins className="w-5 h-5 mr-2" />
                       {isClaimPrizePending
                        ? "Claiming Prize..."
                        : "Claim Prize"}
                    </button>
                  </>
                ) : (
                  <>
                    <div>Better luck next time!</div>

                    {expectedRefundAmount && expectedRefundAmount > 0 ? (
                      <>
                        <div className="flex items-center">
                          <DollarSign className="w-5 h-5 mr-2" /> Expected Refund:{" "}
                          <strong className="text-yellow">
                            {parseFloat(
                              formatUnits(expectedRefundAmount, 6)
                            ).toFixed(4)}{" "}
                            ETH
                          </strong>
                        </div>

                        <button
                          onClick={() => claimPrincipal()}
                          className={`bg-transparent text-yellow border border-yellow font-bold py-2 px-4 rounded-none mt-2 ${
                            isClaimPrincipalPending
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          } flex items-center justify-center`}
                          disabled={isClaimPrincipalPending}
                        >
                          <Wallet className="w-5 h-5 mr-2" />
                          {isClaimPrincipalPending
                            ? "Claiming Principal..."
                            : "Claim Principal"}
                        </button>
                      </>
                    ) : (
                      <div>No principal to claim.</div>
                    )}
                  </>
                )
              ) : (
                <div>Round results not yet available.</div>
              )}
            </div>
          </section>

          {/* Buy Tickets Section */}
          <section className="rounded-lg p-6 border border-white font-semibold bg-white/10 text-sm">
            <section className="p-6">
              <h3 className="text-2xl font-bold mb-4 flex items-center">
                <Ticket className="w-6 h-6 mr-2 text-center" /> Buy Tickets
              </h3>

              <p className="mb-6 text-gray-300">
                Buy. Play. Win Without Losing.
                <br />
                Enter lottery, let your stake earn yield,
                <br />
                winner takes yield, others get refunded.
              </p>

              <div className="px-4 py-2 w-full bg-yellow-400 text-black rounded-lg font-semibold text-sm hover:bg-yellow-500 transition-all transform hover:scale-105 uppercase tracking-wide text-center">
                <button
                  onClick={() => handleBuyTicket()}
                  className={`bg-yellow text-ash rounded-none font-bold py-3 px-6 flex-grow flex items-center justify-center ${
                    !roundActive || isLoading || isBuyTicketPending
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={!roundActive || isLoading || isBuyTicketPending}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {isBuyTicketPending
                    ? "Buying..."
                    : !roundActive && !isLoading
                    ? "Finalizing previous round!"
                    : "Buy"}
                </button>
              </div>

              {!roundActive && !isLoading && (
                <p className="text-red-500 text-sm mt-2 text-center">
                  Lottery is currently finalizing the previous round. Please
                  wait for the next round to start.
                </p>
              )}
            </section>

            <div className="grid grid-cols-4 gap-4 text-center border-t border-yellow pt-6">
              <div className="flex flex-col items-center">
                <span className="block text-sm text-yellow-400">
                  <DollarSign className="w-4 h-4 inline-block mr-1" /> Ticket amount
                </span>
                <strong className="text-xl">usdc 0.0001</strong>
              </div>

              <div className="flex flex-col items-center">
                <span className="block text-sm text-yellow-400">
                  <Hash className="w-4 h-4 inline-block mr-1" /> Round
                </span>
                <strong className="text-xl">#1</strong>
              </div>

              <div className="flex flex-col items-center">
                <span className="block text-sm text-yellow-400">
                  <Clock className="w-4 h-4 inline-block mr-1" /> Time Left
                </span>
                <strong className="text-xl">
                  <Countdown
                    targetTimestamp={
                      roundActive && roundEndTimestamp
                        ? Number(roundEndTimestamp)
                        : undefined
                    }
                    onComplete={handleRoundEnd}
                  />
                </strong>
              </div>

              <div className="flex flex-col items-center justify-end">
                <div className="flex items-center">
                  <p className="text-sm text-yellow-400 flex items-center">
                    <Users className="w-4 h-4 inline-block mr-1" /> Participants
                  </p>
                </div>
                <strong className="text-xl">
                  {isEntryCountLoading
                    ? "..."
                    : entryCount !== undefined
                    ? entryCount.toString()
                    : "N/A"}
                </strong>
                <button
                  onClick={() => openModal("participants")}
                  className="text-yellow-600 hover:underline text-sm flex items-center"
                >
                  view all <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Right Panel */}
        <div className="flex flex-col space-y-6 px-2 rounded-lg">
          {/* wallet */}
          <section className="rounded-lg p-6 border bg-black/10 border-white/10">
            <h3 className="text-sm mb-4 text-center flex items-center justify-center">
              <Wallet className="w-5 h-5 mr-2" /> Your Wallet
            </h3>

            <div className="flex justify-center gap-2 text-center items-center">
              <div className="text-4xl font-bold text-yellow-400">
                {selectedCurrency === "ETH" && usdcBalanceData ? (
                  <>
                    {parseFloat(formatUnits(usdcBalanceData.value, 6)).toFixed(
                      4
                    )}
                  </>
                ) : selectedCurrency === "USD" &&
                  usdcBalanceData &&
                  usdcToUsdRate !== null ? (
                  <>
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(
                      parseFloat(formatUnits(usdcBalanceData.value, 6)) *
                        usdcToUsdRate
                    )}
                  </>
                ) : (
                  "Loading..."
                )}
              </div>

              <select
                className="bg-transparent px-2 bg-none text-sm text-yellow-400 rounded-none p-2"
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
              >
                <option>Usdc</option>
                <option>USD</option>
              </select>
            </div>

            <div className="flex text-center flex-col space-y-3">
              <div>
                <p className="">
                  {address
                    ? `${address.slice(0, 8)}...${address.slice(-4)}`
                    : "N/A"}
                </p>
              </div>

              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => openModal("fundWallet")}
                  className="px-6 py-3 w-full bg-yellow-400 text-black rounded font-semibold text-sm hover:bg-yellow-500 transition-all transform hover:scale-105 uppercase tracking-wide flex items-center justify-center"
                >
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Fund
                </button>
              </div>
            </div>
          </section>

          {/* My Tickets */}
          <section className="bg-ash rounded-none p-2 border-t border-yellow-400">
            <h3 className="text-2xl font-bold mb-4 flex items-center">
              <NotebookPen className="w-6 h-6 mr-2" /> My Tickets
            </h3>

            {isUserTicketsLoading && <p>Loading your tickets...</p>}

            {!userTickets?.length && !isUserTicketsLoading && (
              <p>You have no tickets yet.</p>
            )}

            <div className="flex flex-col gap-4">
              {userTickets?.map((ticket) => {
                const endTime = Number(ticket.roundEndTimestamp) * 1000;
                const now = Date.now();
                const diff = endTime - now;
                const redeemable = diff <= 0;

                let remaining = "";
                if (redeemable) {
                  remaining = "Redeem Now";
                } else {
                  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                  const minutes = Math.floor((diff / 1000 / 60) % 60);
                  const seconds = Math.floor((diff / 1000) % 60);

                  remaining =
                    days >= 1
                      ? `${days}d ${hours}h`
                      : `${hours}h ${minutes}m ${seconds}s`;
                }

                return (
                  <div
                    key={ticket.ticketId.toString()}
                    className="border border-white font-semibold bg-white/10 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="w-2/3">
                      <div className="font-bold text-md flex items-center">
                        <Ticket className="w-4 h-4 mr-1" /> Ticket #
                        {ticket.ticketId.toString()}
                      </div>

                      <div className="text-gray-300 flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {parseFloat(formatUnits(ticket.principal, 6)).toFixed(
                          4
                        )}{" "}
                        usdc
                      </div>

                      <div className="text-xs text-gray-400 mt-1 flex items-center">
                        <Clock className="w-3 h-3 mr-1" /> Ends:{" "}
                        {new Date(endTime).toLocaleString()}
                      </div>
                    </div>

                    <div className="w-1/3 text-right">
                      {redeemable ? (
                        <button
                          onClick={() => openModal("withdrawRefund")}
                          className="bg-yellow text-ash font-semibold py-2 px-4 text-[11px] rounded-none flex items-center justify-center"
                        >
                          <Gift className="w-4 h-4 mr-1" /> Redeem Now
                        </button>
                      ) : (
                        <button
                          disabled
                          className="font-semibold py-2 px-4 text-[11px] rounded-none bg-gray-700 text-gray-400 cursor-not-allowed"
                        >
                          {remaining}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
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
