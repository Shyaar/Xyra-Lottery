"use client";
import React, { useEffect, useState } from "react";
import ClaimPrizeModal from "./ClaimPrizeModal";
import ConnectWalletModal from "./ConnectWalletModal";
import HistoryModal from "./HistoryModal";
import ParticipantsModal from "./ParticipantsModal";
import SettingsModal from "./SettingsModal";
import WithdrawRefundModal from "./WithdrawRefundModal";
import { useBuyTicketWrite } from "../../../hooks/useBuyTicketWrite";
import { useRouter } from "next/navigation";
import { useAccount, useDisconnect, useBalance } from "wagmi";
import Countdown from "../components/Countdown";
import {
  useRoundActive,
  useRoundEndTimestamp,
  useUserTickets,
  useEntryCount,
  useWinner, // Add this
  usePrizeAmountRedeemed, // Add this
  useExpectedRefund, // Add this
  useRoundId, // Add this for displaying round number
} from "../../../hooks/useReadLottery";
import { useStartRound } from "../../../hooks/useStartRound";
import { useClaimPrize } from "../../../hooks/useClaimPrize"; // Add this
import { useClaimPrincipal } from "../../../hooks/useClaimPrincipal"; // Add this
import { formatEther } from "viem";

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
  const { startRound, isPending: isStartRoundPending } = useStartRound();
  const { buyTicket, isLoading: isBuyTicketPending } = useBuyTicketWrite();
  const { data: userTickets, isLoading: isUserTicketsLoading } =
    useUserTickets(address);
  const { data: entryCount, isLoading: isEntryCountLoading } = useEntryCount();

  // Fetch ETH Balance
  const { data: ethBalanceData } = useBalance({
    address: address,
  });

  const { data: winnerAddress, isLoading: isWinnerLoading } = useWinner();
  const { data: prizeAmount, isLoading: isPrizeAmountLoading } = usePrizeAmountRedeemed();
  const { data: expectedRefundAmount, isLoading: isExpectedRefundLoading } = useExpectedRefund(address);
  const { data: currentRoundId, isLoading: isRoundIdLoading } = useRoundId();

  // Add write hooks
  const { claimPrize, isLoading: isClaimPrizePending } = useClaimPrize();
  const { claimPrincipal, isLoading: isClaimPrincipalPending } = useClaimPrincipal();

  const [modals, setModals] = useState({
    connectWallet: false,
    withdrawRefund: false,
    claimPrize: false,
    tokenSelector: false,
    participants: false,
    history: false,
    settings: false,
  });

  const [selectedCurrency, setSelectedCurrency] = useState("ETH");

  const [ethToUsdRate, setEthToUsdRate] = useState<number | null>(null);

  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
        );
        const data = await response.json();
        setEthToUsdRate(data.ethereum.usd);
      } catch (error) {
        console.error("Error fetching ETH price:", error);
        setEthToUsdRate(null);
      }
    };

    fetchEthPrice();
    const interval = setInterval(fetchEthPrice, 60000); // Fetch every minute
    return () => clearInterval(interval);
  }, []);

  // -----------------------------
  // Redirect if wallet not connected
  // -----------------------------
  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  // -----------------------------
  // Start round when necessary
  // -----------------------------
  useEffect(() => {
    if (roundActive && !isLoading) {
      console.log("Round not active, attempting to start new round...");
    }
  }, [roundActive]);

  // -----------------------------
  // Modal helpers
  // -----------------------------
  type ModalName =
    | "connectWallet"
    | "withdrawRefund"
    | "claimPrize"
    | "tokenSelector"
    | "participants"
    | "history"
    | "settings";

  const openModal = (modalName: ModalName) =>
    setModals((prev) => ({ ...prev, [modalName]: true }));
  const closeModal = (modalName: ModalName) =>
    setModals((prev) => ({ ...prev, [modalName]: false }));


  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-4 md:px-6 border-b border-cyan-500 shadow-cyan-glow">
        <div className="text-xl font-bold">LotteryDApp</div>
        {isConnected && address && (
          <button
            onClick={() => disconnect()}
            className="px-8 py-3 btn-glow rounded-none font-semibold text-base"
          >
            {`${address.slice(0, 6)}...${address.slice(-4)}`}
          </button>
        )}
      </nav>

      {/* Main */}
      <main className="p-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 flex flex-col space-y-6">
          {/* Winner Section */}
          <section className="bg-green-900 border border-green-500 rounded-none p-6 shadow-cyan-glow">
            <h3 className="text-2xl font-bold mb-3 text-green-400">
              Round {currentRoundId ? `#${currentRoundId.toString()}` : '#...'}
              {!roundActive && !isWinnerLoading && winnerAddress && winnerAddress === address && " Winner!"}
            </h3>
            <div className="flex flex-col space-y-2">
              {roundActive ? (
                <>
                  <div>Round is Active</div>
                  <div>
                    Round Ends:{" "}
                    <strong>
                      {roundEndTimestamp ? new Date(Number(roundEndTimestamp) * 1000).toLocaleString() : "..."}
                    </strong>
                  </div>
                  <button
                    className="bg-gray-700 text-gray-400 font-bold py-2 px-4 rounded-none mt-2 cursor-not-allowed"
                    disabled
                  >
                    Round has not yet ended
                  </button>
                </>
              ) : ( // Round is not active
                <>
                  {isWinnerLoading || isPrizeAmountLoading || isExpectedRefundLoading || isRoundIdLoading ? (
                    <p>Loading round results...</p>
                  ) : winnerAddress && prizeAmount ? (
                    // Round ended, display winner or principal claim
                    winnerAddress === address ? (
                      // User is the winner
                      <>
                        <div>
                          Winning Address:{" "}
                          <strong className="font-mono">
                            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "N/A"}
                          </strong>
                        </div>
                        <div>
                          Prize Amount:{" "}
                          <strong className="text-green-400">
                            {parseFloat(formatEther(prizeAmount)).toFixed(4)} ETH
                          </strong>
                        </div>
                        <button
                          onClick={() => claimPrize()}
                          className={`bg-transparent text-green-400 border border-green-600 font-bold py-2 px-4 rounded-none btn-glow mt-2 ${
                            isClaimPrizePending ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          disabled={isClaimPrizePending}
                        >
                          {isClaimPrizePending ? "Claiming Prize..." : "Claim Prize"}
                        </button>
                      </>
                    ) : (
                      // User is not the winner
                      <>
                        <div>Better luck next time!</div>
                        {expectedRefundAmount && expectedRefundAmount > 0 ? (
                          <>
                            <div>
                              Expected Refund:{" "}
                              <strong className="text-blue-400">
                                {parseFloat(formatEther(expectedRefundAmount)).toFixed(4)} ETH
                              </strong>
                            </div>
                            <button
                              onClick={() => claimPrincipal()}
                              className={`bg-transparent text-blue-400 border border-blue-600 font-bold py-2 px-4 rounded-none btn-glow mt-2 ${
                                isClaimPrincipalPending ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                              disabled={isClaimPrincipalPending}
                            >
                              {isClaimPrincipalPending ? "Claiming Principal..." : "Claim Principal"}
                            </button>
                          </>
                        ) : (
                          <div>No principal to claim.</div>
                        )}
                      </>
                    )
                  ) : (
                    // Fallback for when winner/prize data isn't available
                    <div>Round results not yet available.</div>
                  )}
                </>
              )}
            </div>
          </section>

          {/* Buy Tickets Section */}
          <section className="bg-gray-900 rounded-none p-6 shadow-cyan-glow border border-cyan-500">
            <section className="p-6">
              <h3 className="text-2xl font-bold mb-4">Buy Tickets</h3>
              <p className="mb-6 text-gray-400">
                Buy. Play. Win Without Losing.
                <br />
                Enter lottery, let your stake earn yield,
                <br />
                winner takes yield, others get refunded.
              </p>
              <div className="flex justify-between items-center">
                <button
                  onClick={() => buyTicket(BigInt(0.0001 * 1e18))} // 0.0001 ETH
                  className={`btn-glow rounded-none font-bold py-3 px-6 flex-grow ${
                    !roundActive || isLoading || isBuyTicketPending
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={!roundActive || isLoading || isBuyTicketPending}
                >
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

            <div className="grid grid-cols-4 gap-4 text-center border-t border-cyan-500 pt-6">
              <div>
                <span className="block text-sm text-gray-400">
                  Ticket amount
                </span>
                <strong className="text-xl">eth 0.0001</strong>
              </div>
              <div>
                <span className="block text-sm text-gray-400">Round</span>
                <strong className="text-xl">#1</strong>
              </div>
              <div>
                <span className="block text-sm text-gray-400">Time Left</span>
                <strong className="text-xl">
                  <Countdown
                    targetTimestamp={
                      roundActive ? roundEndTimestamp : undefined
                    }
                  />
                </strong>
              </div>
              <div className="flex items-end justify-center gap-2">
                <div>
                  <p className="text-sm text-gray-400">Participants</p>
                  <strong className="text-xl">
                    {isEntryCountLoading ? "..." : entryCount !== undefined ? entryCount.toString() : "N/A"}
                  </strong>
                </div>
                <button
                  onClick={() => openModal("participants")}
                  className="text-cyan-400 hover:underline text-sm"
                >
                  view all
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Right Panel */}
        <div className="flex flex-col space-y-6 border-r ">
          <section className="bg-gray-900 rounded-none p-6 shadow-cyan-glow border border-cyan-500">
            <h3 className="text-2xl font-bold mb-4">Your Wallet</h3>
            <div className="flex flex-col space-y-3">
              <div>
                Address: <strong className="font-mono">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'N/A'}</strong>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-lg font-bold">
                  Total:{" "}
                  {selectedCurrency === "ETH" && ethBalanceData ? (
                    <>{parseFloat(formatEther(ethBalanceData.value)).toFixed(4)} ETH</>
                  ) : selectedCurrency === "USD" && ethBalanceData && ethToUsdRate !== null ? (
                    <>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(
                        parseFloat(formatEther(ethBalanceData.value)) *
                          ethToUsdRate
                      )}
                    </>
                  ) : (
                    "Loading..."
                  )}
                </div>
                <select
                  className="bg-gray-800 border border-cyan-500 text-white text-sm rounded-none p-2"
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                >
                  <option>ETH</option>
                  <option>USD</option>
                </select>
              </div>
              <div className="flex space-x-2 mt-4">
                <button className="btn-glow rounded-none font-semibold py-2 px-4 w-full">
                  Fund
                </button>
                <button
                  onClick={() => openModal("withdrawRefund")}
                  className="btn-glow rounded-none font-semibold py-2 px-4 w-full"
                >
                  Withdraw
                </button>
              </div>
            </div>
          </section>

          {/* Tickets */}
          <section className="bg-gray-900 rounded-none p-6 shadow-cyan-glow border border-cyan-500">
            <h3 className="text-2xl font-bold mb-4">My Tickets</h3>
            {isUserTicketsLoading && <p>Loading your tickets...</p>}
            {!userTickets?.length && !isUserTicketsLoading && (
              <p>You have no tickets yet.</p>
            )}
            <div className="flex flex-col gap-4">
              {userTickets?.map((ticket) => {
                const endTime = Number(ticket.roundEndTimestamp) * 1000; // Convert bigint seconds to milliseconds
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
                      : `${hours}m ${minutes}m ${seconds}s`;
                }

                return (
                  <div
                    key={ticket.ticketId.toString()} // Use ticketId as key
                    className="bg-gray-800 border border-cyan-500 shadow-cyan-glow rounded-none p-4 flex items-center justify-between"
                  >
                    <div className="w-2/3">
                      <div className="font-bold text-md">
                        Ticket #{ticket.ticketId.toString()}
                      </div>
                      <div className="text-gray-400">
                        Principal: {parseFloat(formatEther(ticket.principal)).toFixed(4)} ETH
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Ends: {new Date(endTime).toLocaleString()}
                      </div>
                    </div>
                    <div className="w-1/3 text-right">
                      {redeemable ? (
                        <button
                          onClick={() => openModal("withdrawRefund")} // Placeholder for redeem action
                          className="btn-glow font-semibold py-2 px-4 text-[11px] rounded-none"
                        >
                          Redeem Now
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

      {/* Footer */}
      <footer className="flex flex-col justify-center items-center p-6 border-t border-cyan-500 text-center shadow-cyan-glow">
        <div className="text-sm font-medium mb-1">LotteryDApp</div>
        <div className="text-xs text-gray-500">
          © 2025 LotteryDApp. All rights reserved.
        </div>
      </footer>
    </div>
  );
}