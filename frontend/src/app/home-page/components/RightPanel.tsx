import React from "react";
import {
  Wallet,
  PlusCircle,
  NotebookPen,
  Ticket,
  DollarSign,
  Clock,
  Gift,
} from "lucide-react";
import { formatUnits } from "viem";

// ----------------------
// LOCAL MODAL NAME TYPE
// ----------------------
export type ModalName = "fundWallet" | "withdrawRefund";

interface RightPanelProps {
  selectedCurrency: string;
  usdcBalanceData: any;
  usdcToUsdRate: number | null;
  setSelectedCurrency: (currency: string) => void;
  address: `0x${string}` | undefined;
  openModal: (modalName: ModalName) => void; // FIXED
  isUserTicketsLoading: boolean;
  userTickets: any[] | undefined;
}

const RightPanel: React.FC<RightPanelProps> = ({
  selectedCurrency,
  usdcBalanceData,
  usdcToUsdRate,
  setSelectedCurrency,
  address,
  openModal,
  isUserTicketsLoading,
  userTickets,
}) => (
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
              {parseFloat(formatUnits(usdcBalanceData.value, 6)).toFixed(4)}
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
            {address ? `${address.slice(0, 8)}...${address.slice(-4)}` : "N/A"}
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
                  {parseFloat(formatUnits(ticket.principal, 6)).toFixed(4)} usdc
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
);

export default RightPanel;
