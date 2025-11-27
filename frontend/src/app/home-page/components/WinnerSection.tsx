
import React from "react";
import {
  Timer,
  PlayCircle,
  Clock,
  Crown,
  Coins,
  DollarSign,
  Wallet,
} from "lucide-react";
import { formatUnits } from "viem";

interface WinnerSectionProps {
  currentRoundId: bigint | undefined;
  roundActive: boolean | undefined;
  isWinnerLoading: boolean;
  winnerAddress: `0x${string}` | undefined;
  address: `0x${string}` | undefined;
  roundEndTimestamp: bigint | undefined;
  isPrizeAmountLoading: boolean;
  isExpectedRefundLoading: boolean;
  isRoundIdLoading: boolean;
  prizeAmount: bigint | undefined;
  expectedRefundAmount: bigint | undefined;
  handleClaimPrize: () => void;
  isClaimPrizePending: boolean;
  claimPrincipal: () => void;
  isClaimPrincipalPending: boolean;
  prizeClaimed: boolean | undefined;
}

const WinnerSection: React.FC<WinnerSectionProps> = ({
  currentRoundId,
  roundActive,
  isWinnerLoading,
  winnerAddress,
  address,
  roundEndTimestamp,
  isPrizeAmountLoading,
  isExpectedRefundLoading,
  isRoundIdLoading,
  prizeAmount,
  expectedRefundAmount,
  handleClaimPrize,
  isClaimPrizePending,
  claimPrincipal,
  isClaimPrincipalPending,
  prizeClaimed,
}) => (
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
            <PlayCircle className="w-5 h-5 mr-2 text-green-500" /> Round is
            Active
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
              <Crown className="w-5 h-5 mr-2 text-yellow-500" /> Winning
              Address:{" "}
              <strong className="px-6 py-3 w-full text-yellow-500 text-lg rounded font-semibold transition-all transform hover:scale-105 uppercase tracking-wide">
                {address ? address : "N/A"}
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
              disabled={isClaimPrizePending || prizeClaimed}
              className="px-6 py-3 w-full bg-yellow-400 text-black rounded font-semibold text-sm hover:bg-yellow-500 transition-all transform hover:scale-105 uppercase tracking-wide flex items-center justify-center"
            >
              <Coins className="w-5 h-5 mr-2" />
              {isClaimPrizePending
                ? "Claiming Prize..."
                : prizeClaimed
                ? "Prize Already Claimed"
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
);

export default WinnerSection;
