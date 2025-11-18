// "use client";
// import React, { useState, useEffect } from "react";
// import BuyTicketModal from "./BuyTicketModal";
// import ClaimPrizeModal from "./ClaimPrizeModal";
// import ConnectWalletModal from "./ConnectWalletModal";
// import HistoryModal from "./HistoryModal";
// import ParticipantsModal from "./ParticipantsModal";
// import SettingsModal from "./SettingsModal";
// import TokenSelectorModal from "./TokenSelectorModal";
// import WithdrawRefundModal from "./WithdrawRefundModal";

// const formatCurrency = (value: number) => {
//   return new Intl.NumberFormat("en-US", {
//     style: "currency",
//     currency: "USD",
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   }).format(value);
// };

// // Main Page Component
// export default function HomePage() {
//   const [modals, setModals] = useState({
//     connectWallet: false,
//     buyTicket: false,
//     withdrawRefund: false,
//     claimPrize: false,
//     tokenSelector: false,
//     participants: false,
//     history: false,
//     settings: false,
//   });

//   type ModalName =
//     | "connectWallet"
//     | "buyTicket"
//     | "withdrawRefund"
//     | "claimPrize"
//     | "tokenSelector"
//     | "participants"
//     | "history"
//     | "settings";

//   const openModal = (modalName: ModalName) =>
//     setModals((prev) => ({ ...prev, [modalName]: true }));
//   const closeModal = (modalName: ModalName) =>
//     setModals((prev) => ({ ...prev, [modalName]: false }));

//   const isRoundEnded = true;
//   const [selectedCurrency, setSelectedCurrency] = useState("ETH");
//   const [countdown, setCountdown] = useState("");
//   const [redeemable, setRedeemable] = useState(false);

//   useEffect(() => {
//     const targetDate = new Date();
//     targetDate.setDate(targetDate.getDate() + 1);
//     targetDate.setHours(targetDate.getHours() + 12);
//     targetDate.setMinutes(targetDate.getMinutes() + 30);

//     const interval = setInterval(() => {
//       const now = new Date();
//       const difference = targetDate.getTime() - now.getTime();

//       if (difference <= 0) {
//         setCountdown("Redeem Now");
//         setRedeemable(true);
//         clearInterval(interval);
//         return;
//       }

//       const days = Math.floor(difference / (1000 * 60 * 60 * 24));
//       const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
//       const minutes = Math.floor((difference / 1000 / 60) % 60);
//       const seconds = Math.floor((difference / 1000) % 60);

//       if(days < 1){
//         setCountdown(`${hours}h ${minutes}m ${seconds}s`);
//       } else {
//         setCountdown(`${days}d ${hours}h`);
//       }
//     }, 1000);

//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="flex flex-col min-h-screen bg-white text-black">
//       {/* Navigation Bar */}
//       <nav className="flex justify-between items-center p-4 md:px-6 border-b border-gray-200">
//         <div className="text-xl font-bold">LotteryDApp</div>
//         <button
//           onClick={() => openModal("connectWallet")}
//           className="px-4 py-2 bg-black text-white border-none rounded-md cursor-pointer font-medium"
//         >
//           Connect Wallet
//         </button>
//       </nav>

//       <main className="p-12 grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="md:col-span-2 flex flex-col space-y-6">
//           {/* 7. Winner Section */}
//           {isRoundEnded && (
//             <section className="bg-green-50 border border-green-300 rounded-lg p-6 shadow-lg">
//               <h3 className="text-2xl font-bold mb-3 text-green-700">
//                 Round #123 Winner!
//               </h3>
//               <div className="flex flex-col space-y-2">
//                 <div>
//                   Winning Address:{" "}
//                   <strong className="font-mono">0xWIN...NER</strong>
//                 </div>
//                 <div>
//                   Prize Amount: <strong className="text-green-600">$998</strong>
//                 </div>
//                 <button
//                   onClick={() => openModal("claimPrize")}
//                   className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg self-start mt-2 transition duration-300"
//                 >
//                   Claim Prize
//                 </button>
//               </div>
//             </section>
//           )}
//           {/* 2. Round Summary Card */}
//           <section className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
//             <section className=" p-6 ">
//               <h3 className="text-2xl font-bold mb-4">Buy Tickets</h3>
//               <p className="mb-6 text-[#0a090a]/60">
//                 Buy. Play. Win Without Losing.
//                 <br />
//                 Enter with any token, let your stake earn yield, <br />
//                 at the end of the round one player wins the lottery and takes
//                 the yield
//                 <br />
//                 everyone else gets fully refunded.
//               </p>
//               <div className="flex justify-between items-center">
//                 <button
//                   onClick={() => openModal("buyTicket")}
//                   className="bg-black text-white font-bold py-3 px-6 rounded-lg transition duration-300 flex-grow"
//                 >
//                   Buy
//                 </button>

//                 <div className="ml-4 flex gap-2 border border-[#0a090a]/10 p-2 rounded-lg bg-[#0a090a]/10">
//                   <img
//                     src="/path/to/token-a-icon.png"
//                     alt="Token Icon"
//                     className="h-6 w-6 rounded-full"
//                   />
//                   <select
//                     className=""
//                     value={selectedCurrency}
//                     onChange={(e) => setSelectedCurrency(e.target.value)}
//                   >
//                     <option>USD</option>
//                     <option>ETH</option>
//                     <option>BTC</option>
//                     <option>USDT</option>
//                   </select>
//                 </div>
//               </div>
//             </section>
//             <div className="grid grid-cols-4 gap-4 text-center border-t border-[#0a090a]/10 pt-6">
//               <div>
//                 <span className="block text-sm text-gray-600">
//                   Ticket amount
//                 </span>
//                 <strong className="text-xl">$5</strong>
//               </div>

//               <div>
//                 <span className="block text-sm text-gray-600">Round</span>
//                 <strong className="text-xl">#124</strong>
//               </div>
//               <div>
//                 <span className="block text-sm text-gray-600">Time Left</span>
//                 <strong className="text-xl">1d 12h 30m</strong>
//               </div>
//               <div>
//                 <div className="flex items-center justify-center gap-2">
//                   <strong className="text-xl">12</strong>
//                   <button
//                     onClick={() => openModal("participants")}
//                     className="text-blue-600 hover:underline text-sm"
//                   >
//                     See All Participants
//                   </button>
//                 </div>
//                 <span className="block text-sm text-gray-600">
//                   Participants
//                 </span>
//               </div>
//             </div>
//           </section>

//           {/* 8. Activity Feed */}
//           {/* <section className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
//             <h3 className="text-2xl font-bold mb-4">Activity</h3>
//             <div className="flex flex-col space-y-2 h-32 overflow-y-auto">
//               <div className="bg-gray-100 rounded-md p-2">
//                 You bought 15 tickets.
//               </div>
//               <div className="bg-gray-100 rounded-md p-2">
//                 Round #123 ended.
//               </div>
//               <div className="bg-gray-100 rounded-md p-2">
//                 You claimed a refund.
//               </div>
//             </div>
//             <button
//               onClick={() => openModal("history")}
//               className="bg-black text-white font-semibold py-2 px-4 rounded-lg mt-4 transition duration-300"
//             >
//               View History
//             </button>
//           </section> */}
//         </div>

//         <div className="flex flex-col space-y-6">
//           {/* 3. User Panel */}
//           <section className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
//             <h3 className="text-2xl font-bold mb-4">Your Wallet</h3>
//             <div className="flex flex-col space-y-3">
//               <div>
//                 Address:{" "}
//                 <strong className="font-mono">0xWALLET...ADDRESS</strong>
//               </div>
//               <div className="flex justify-between items-center">
//                 <div className="text-lg font-bold">
//                   Total: {formatCurrency(1234.56)} USD
//                 </div>
//                 <select
//                   className="bg-gray-100 border border-gray-300 rounded-md p-2"
//                   value={selectedCurrency}
//                   onChange={(e) => setSelectedCurrency(e.target.value)}
//                 >
//                   <option>USD</option>
//                   <option>ETH</option>
//                   <option>BTC</option>
//                   <option>USDT</option>
//                 </select>
//               </div>
//               <div className="flex space-x-2 mt-4">
//                 <button className="bg-black text-white font-semibold py-2 px-4 w-full rounded-lg transition duration-300">
//                   Fund
//                 </button>
//                 <button
//                   onClick={() => openModal("withdrawRefund")}
//                   className="bg-black text-white font-semibold py-2 px-4 w-full rounded-lg transition duration-300"
//                 >
//                   Withdraw
//                 </button>
//               </div>
//             </div>
//           </section>

//           {/* 4. Ticket Purchase Box */}

//           {/* 5. My Tickets Section */}
//           <section className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
//             <h3 className="text-2xl font-bold mb-4">My Tickets</h3>
//             <div className="gap-4">
//               {/* Ticket Card */}
//               <div className="bg-white border border-black/20 shadow-sm rounded-lg p-2 flex items-center justify-center">
//                 <div className="w-full ">
//                   <div className="font-bold text-md">Ticket #001</div>
//                   <div className="text-[#0a090a]/60">$5</div>
//                 </div>
//                 <button
//                   disabled={!redeemable}
//                   className={`font-semibold py-2 px-4 text-sm rounded-lg w-full ${
//                     redeemable
//                       ? "bg-green-600 text-white cursor-pointer"
//                       : "bg-gray-400 text-white cursor-not-allowed"
//                   }`}
//                 >
//                   {countdown}
//                 </button>
//               </div>
//               {/* Add more ticket cards as needed */}
//             </div>
//           </section>
//         </div>
//       </main>

//       {/* Modals */}
//       <ConnectWalletModal
//         isOpen={modals.connectWallet}
//         onClose={() => closeModal("connectWallet")}
//       />
//       <BuyTicketModal
//         isOpen={modals.buyTicket}
//         onClose={() => closeModal("buyTicket")}
//       />
//       <WithdrawRefundModal
//         isOpen={modals.withdrawRefund}
//         onClose={() => closeModal("withdrawRefund")}
//       />
//       <ClaimPrizeModal
//         isOpen={modals.claimPrize}
//         onClose={() => closeModal("claimPrize")}
//       />
//       <TokenSelectorModal
//         isOpen={modals.tokenSelector}
//         onClose={() => closeModal("tokenSelector")}
//       />
//       <ParticipantsModal
//         isOpen={modals.participants}
//         onClose={() => closeModal("participants")}
//       />
//       <HistoryModal
//         isOpen={modals.history}
//         onClose={() => closeModal("history")}
//       />
//       <SettingsModal
//         isOpen={modals.settings}
//         onClose={() => closeModal("settings")}
//       />

//       {/* Footer */}
//       <footer className="flex flex-col justify-center items-center p-6 border-t border-gray-200 text-center">
//         <div className="text-sm font-medium mb-1">LotteryDApp</div>
//         <div className="text-xs text-gray-500">
//           © 2025 LotteryDApp. All rights reserved.
//         </div>
//       </footer>
//     </div>
//   );
// }

"use client";
import React, { useEffect, useState } from "react";
import BuyTicketModal from "./BuyTicketModal";
import ClaimPrizeModal from "./ClaimPrizeModal";
import ConnectWalletModal from "./ConnectWalletModal";
import HistoryModal from "./HistoryModal";
import ParticipantsModal from "./ParticipantsModal";
import SettingsModal from "./SettingsModal";
import TokenSelectorModal from "./TokenSelectorModal";
import WithdrawRefundModal from "./WithdrawRefundModal";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

type Ticket = {
  id: number;
  ticketNumber: string;
  price: number;
  endTime: string; // ISO
  token?: string;
  remaining?: string;
  redeemable?: boolean;
};

// Main Page Component
export default function HomePage() {
  const [modals, setModals] = useState({
    connectWallet: false,
    buyTicket: false,
    withdrawRefund: false,
    claimPrize: false,
    tokenSelector: false,
    participants: false,
    history: false,
    settings: false,
  });

  type ModalName =
    | "connectWallet"
    | "buyTicket"
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

  const isRoundEnded = true;
  const [selectedCurrency, setSelectedCurrency] = useState("ETH");

  // Mock tickets: two still counting down, one already redeemable
  const initialTickets: Ticket[] = [
    {
      id: 1,
      ticketNumber: "001",
      price: 5,
      // 2 hours from now
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
      token: "ETH",
    },
    {
      id: 2,
      ticketNumber: "002",
      price: 5,
      // 30 minutes from now
      endTime: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
      token: "USDT",
    },
    {
      id: 3,
      ticketNumber: "003",
      price: 5,
      // 5 minutes in the past => redeemable
      endTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      token: "BTC",
    },
  ];

  const [tickets, setTickets] = useState<Ticket[]>(
    initialTickets.map((t) => ({ ...t, remaining: "", redeemable: false }))
  );

  useEffect(() => {
    const tick = () => {
      const now = new Date().getTime();
      setTickets((prev) =>
        prev.map((t) => {
          const end = new Date(t.endTime).getTime();
          const diff = end - now;
          if (diff <= 0) {
            return { ...t, remaining: "Redeem Now", redeemable: true };
          }
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((diff / 1000 / 60) % 60);
          const seconds = Math.floor((diff / 1000) % 60);

          let remaining = "";
          if (days >= 1) {
            remaining = `${days}d ${hours}h`;
          } else {
            remaining = `${hours}h ${minutes}m ${seconds}s`;
          }

          return { ...t, remaining, redeemable: false };
        })
      );
    };

    // initial tick and interval
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      {/* Navigation Bar */}
      <nav className="flex justify-between items-center p-4 md:px-6 border-b border-gray-200">
        <div className="text-xl font-bold">LotteryDApp</div>
        <button
          onClick={() => openModal("connectWallet")}
          className="px-4 py-2 bg-black text-white border-none rounded-md cursor-pointer font-medium"
        >
          Connect Wallet
        </button>
      </nav>

      <main className="p-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 flex flex-col space-y-6">
          {/* 7. Winner Section */}
          {isRoundEnded && (
            <section className="bg-green-50 border border-green-300 rounded-lg p-6 shadow-lg">
              <h3 className="text-2xl font-bold mb-3 text-green-700">
                Round #123 Winner!
              </h3>
              <div className="flex flex-col space-y-2">
                <div>
                  Winning Address:{" "}
                  <strong className="font-mono">0xWIN...NER</strong>
                </div>
                <div>
                  Prize Amount: <strong className="text-green-600">$998</strong>
                </div>
                <button
                  onClick={() => openModal("claimPrize")}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg self-start mt-2 transition duration-300"
                >
                  Claim Prize
                </button>
              </div>
            </section>
          )}
          {/* 2. Round Summary Card */}
          <section className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
            <section className=" p-6 ">
              <h3 className="text-2xl font-bold mb-4">Buy Tickets</h3>
              <p className="mb-6 text-[#0a090a]/60">
                Buy. Play. Win Without Losing.
                <br />
                Enter with any token, let your stake earn yield, <br />
                at the end of the round one player wins the lottery and takes
                the yield
                <br />
                everyone else gets fully refunded.
              </p>
              <div className="flex justify-between items-center">
                <button
                  onClick={() => openModal("buyTicket")}
                  className="bg-black text-white font-bold py-3 px-6 rounded-lg transition duration-300 flex-grow"
                >
                  Buy
                </button>

                <div className="ml-4 flex gap-2 border border-[#0a090a]/10 p-2 rounded-lg bg-white">
                  <img
                    src="/path/to/token-a-icon.png"
                    alt="Token Icon"
                    className="h-6 w-6 rounded-full"
                  />
                  <select
                    className=""
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                  >
                    <option>USD</option>
                    <option>ETH</option>
                    <option>BTC</option>
                    <option>USDT</option>
                  </select>
                </div>
              </div>
            </section>
            <div className="grid grid-cols-4 gap-4 text-center border-t border-[#0a090a]/10 pt-6">
              <div>
                <span className="block text-sm text-gray-600">
                  Ticket amount
                </span>
                <strong className="text-xl">$5</strong>
              </div>

              <div>
                <span className="block text-sm text-gray-600">Round</span>
                <strong className="text-xl">#124</strong>
              </div>
              <div>
                <span className="block text-sm text-gray-600">Time Left</span>
                <strong className="text-xl">1d 12h 30m</strong>
              </div>
              <div>
                <div className="flex items-end justify-center gap-2">
                  <div>
                    <p className="block text-sm text-gray-600">
                    Participants
                  </p>
                  <strong className="text-xl">12</strong>
                  </div>
                  <button
                    onClick={() => openModal("participants")}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    view all
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="flex flex-col space-y-6">
          {/* 3. User Panel */}
          <section className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
            <h3 className="text-2xl font-bold mb-4">Your Wallet</h3>
            <div className="flex flex-col space-y-3">
              <div>
                Address:{" "}
                <strong className="font-mono">0xWALLET...ADDRESS</strong>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-lg font-bold">
                  Total: {formatCurrency(1234.56)} USD
                </div>
                <select
                  className="bg-white border border-gray-300 text-sm rounded-md p-2"
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                >
                  <option>USD</option>
                  <option>ETH</option>
                  <option>BTC</option>
                  <option>USDT</option>
                </select>
              </div>
              <div className="flex space-x-2 mt-4">
                <button className="bg-black text-white font-semibold py-2 px-4 w-full rounded-lg transition duration-300">
                  Fund
                </button>
                <button
                  onClick={() => openModal("withdrawRefund")}
                  className="bg-black text-white font-semibold py-2 px-4 w-full rounded-lg transition duration-300"
                >
                  Withdraw
                </button>
              </div>
            </div>
          </section>

          {/* 5. My Tickets Section */}
          <section className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
            <h3 className="text-2xl font-bold mb-4">My Tickets</h3>
            <div className="flex flex-col gap-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white border border-black/20 shadow-sm rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="w-2/3">
                    <div className="font-bold text-md">
                      Ticket #{ticket.ticketNumber}
                    </div>
                    <div className="text-[#0a090a]/60">
                      {ticket.token ?? ""} • {formatCurrency(ticket.price)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Ends: {new Date(ticket.endTime).toLocaleString()}
                    </div>
                  </div>

                  <div className="w-1/3 text-right">
                    {ticket.redeemable ? (
                      <button
                        onClick={() => openModal("withdrawRefund")}
                        className="font-semibold py-2 px-4 text-[11px] rounded-lg bg-[#0a090a] text-white transition duration-200"
                      >
                        Redeem Now
                      </button>
                    ) : (
                      <button
                        disabled
                        className="font-semibold py-2 px-4 text-[11px] rounded-lg bg-gray-200 text-gray-700 cursor-not-allowed"
                        title="Not redeemable yet"
                      >
                        {ticket.remaining}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Modals */}
      <ConnectWalletModal
        isOpen={modals.connectWallet}
        onClose={() => closeModal("connectWallet")}
      />
      <BuyTicketModal
        isOpen={modals.buyTicket}
        onClose={() => closeModal("buyTicket")}
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
      <footer className="flex flex-col justify-center items-center p-6 border-t border-gray-200 text-center">
        <div className="text-sm font-medium mb-1">LotteryDApp</div>
        <div className="text-xs text-gray-500">
          © 2025 LotteryDApp. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
