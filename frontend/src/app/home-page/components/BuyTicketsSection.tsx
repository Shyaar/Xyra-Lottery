import React from "react";
import {
  Ticket,
  ShoppingCart,
  DollarSign,
  Hash,
  Clock,
  Users,
  ChevronRight,
} from "lucide-react";
import Countdown from "../../components/Countdown";

// ----------------------
// LOCAL MODAL NAME TYPE
// ----------------------
export type ModalName = "participants" | "fundWallet" | "claimPrize";

interface BuyTicketsSectionProps {
  handleBuyTicket: () => void;
  roundActive: boolean | undefined;
  isLoading: boolean;
  isBuyTicketPending: boolean;
  roundEnded: boolean;
  roundEndTimestamp: bigint | undefined;
  isEntryCountLoading: boolean;
  entryCount: bigint | undefined;
  openModal: (modalName: ModalName) => void; // FIXED
}

const BuyTicketsSection: React.FC<BuyTicketsSectionProps> = ({
  handleBuyTicket,
  roundActive,
  isLoading,
  isBuyTicketPending,
  roundEnded,
  roundEndTimestamp,
  isEntryCountLoading,
  entryCount,
  openModal,
}) => (
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
          onClick={handleBuyTicket}
          className={`bg-yellow text-ash rounded-none font-bold py-3 px-6 flex-grow flex items-center justify-center w-full ${
            !roundActive || isLoading || isBuyTicketPending || roundEnded
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          disabled={!roundActive || isLoading || isBuyTicketPending || roundEnded}
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          {isBuyTicketPending
            ? "Buying..."
            : roundEnded
            ? "Round Ended"
            : !roundActive && !isLoading
            ? "Finalizing previous round!"
            : "Buy"}
        </button>
      </div>

      {!roundActive && !isLoading && (
        <p className="text-red-500 text-sm mt-2 text-center">
          Lottery is currently finalizing the previous round. Please wait for
          the next round to start.
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
          />
        </strong>
      </div>

      <div className="flex flex-col items-center justify-end">
        <p className="text-sm text-yellow-400 flex items-center">
          <Users className="w-4 h-4 inline-block mr-1" /> Participants
        </p>

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
);

export default BuyTicketsSection;
