"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useReadUser, useUserActions } from "../../../hooks/useUserRegistry";
import {
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  // Wallet connection
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // User contract actions
  const { data: isRegistered, isLoading } = useReadUser(address);
  const { registerUser, isPending, isConfirming, isConfirmed, writeError } =
    useUserActions(address);

  const hasRegistered = useRef(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // Main effect to handle user registration & connection
  useEffect(() => {
    if (isConnected && isLoading) {
      setShowModal(true);
      setModalMessage("Checking your account...");
    } else if ((isConnected && isPending) || isConfirming) {
      setShowModal(true);
      setModalMessage("Please wait while we create your account...");
    } else if ((isConnected && isConfirmed) || writeError) {
      setShowModal(false);
    }

    if (isConnected) initializeUser();
  }, [
    isConnected,
    isLoading,
    isPending,
    isConfirming,
    isConfirmed,
    writeError,
  ]);

  // Function to connect wallet and register user
  async function initializeUser() {
    if (isLoading || hasRegistered.current) return;

    // Connect wallet if not connected
    if (!isConnected || !address) {
      try {
        const injected = connectors.find((c) => c.id === "injected");
        if (!injected) throw new Error("No wallet found");
        const { accounts } = await connectAsync({ connector: injected });
        toast.success(`Connected: ${accounts[0].slice(0, 6)}...`);
        return;
      } catch (err) {
        toast.error("Wallet connection failed");
        return;
      }
    }

    // If user is registered, redirect to dashboard
    if (isRegistered) {
      toast.success(`Welcome back!`);
      setShowModal(false);
      router.push("/home-page");
      return;
    }

    // Register new user
    if (!isRegistered && !hasRegistered.current) {
      hasRegistered.current = true;

      setShowModal(true);
      setModalMessage("Please wait while we create your account...");

      try {
        await registerUser();
        toast.success(`Welcome`);
        router.push("/home-page");
      } catch (err) {
        toast.error("Registration failed");
        await disconnect();
      } finally {
        setShowModal(false);
      }
    }
  }

  function handleDisconnect() {
    disconnect();
    router.push("/");
  }

  return (
    // <div className="flex flex-col min-h-screen bg-zinc-800 text-white">
    //   {/* Navigation */}
    //   <nav className="flex justify-between items-center p-4 md:px-8 border-b border-yellow-400">
    //     <div className="text-2xl font-bold tracking-tighter">Xyra</div>
    //     {isConnected && address ? (
    //       <button
    //         onClick={handleDisconnect}
    //         className="px-6 py-2 border border-yellow-400 rounded-md font-semibold bg-yellow-400 text-sm hover:bg-yellow-400/10 transition-colors"
    //       >
    //         {`${address.slice(0, 6)}...${address.slice(-4)}`}
    //       </button>
    //     ) : (
    //       <button
    //         onClick={initializeUser}
    //         className="px-6 py-2 bg-yellow-500 text-gray-900 rounded-md font-semibold text-sm hover:bg-yellow-400 transition-colors flex items-center"
    //       >
    //         Get Started <ArrowRight className="w-5 h-5 ml-2" />
    //       </button>
    //     )}
    //   </nav>

    //   {/* Hero */}
    //   <main className="flex flex-col justify-center items-center flex-1 pt-24 pb-12 text-center">
    //     <h1 className="text-6xl font-extrabold mb-4 max-w-2xl tracking-tight">
    //       Win Without Losing
    //     </h1>
    //     <p className="text-lg text-gray-400 mb-8 max-w-2xl leading-relaxed">
    //       A simple, no-loss crypto lottery where your funds are always safe —
    //       only the yield goes to the winner.
    //     </p>
    //     <button
    //       onClick={initializeUser}
    //       className="px-10 py-4 bg-yellow-500 text-gray-900 rounded-md font-semibold text-lg hover:bg-yellow-400 transition-colors flex items-center"
    //     >
    //       Enter Now <ChevronRight className="w-5 h-5 ml-2" />
    //     </button>
    //   </main>

    //   {/* Footer */}
    //   <footer className="flex flex-col justify-center items-center p-8 border-t border-yellow-400">
    //     <div className="text-lg font-semibold mb-2">Xyra</div>
    //     <div className="text-sm text-gray-500">
    //       © 2025 Xyra. All rights reserved.
    //     </div>
    //   </footer>

    //   {/* Modal */}
    //   {showModal && (
    //     <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
    //       <div className="bg-gray-800 p-8 rounded-lg text-center">
    //         <p className="text-lg font-semibold">{modalMessage}</p>
    //       </div>
    //     </div>
    //   )}
    // </div>

     <div className="relative flex flex-col min-h-screen bg-black text-white overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(234,179,8,0.05),transparent_50%)]" />
        <div className="absolute inset-0 opacity-30" style={{
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
          )`
        }} />
      </div>

      <nav className="relative z-10 flex justify-between items-center px-6 md:px-16 py-4 border-b border-yellow-400/20 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-yellow-400 rounded transform rotate-45" />
          <span className="text-2xl font-bold tracking-tight">Xyra</span>
        </div>

        {isConnected && address ? (
          <button
            onClick={handleDisconnect}
            className=" px-12 py-5 bg-yellow-400 text-black rounded font-semibold text-sm hover:bg-yellow-500 transition-all transform hover:scale-105 uppercase tracking-wide">
            {`${address.slice(0, 6)}...${address.slice(-4)}`}
          </button>
        ) : (
          <button
            onClick={initializeUser}
            className=" px-12 py-5 bg-yellow-400 text-black rounded font-semibold text-sm hover:bg-yellow-500 transition-all transform hover:scale-105 uppercase tracking-wide">
            Get started
          </button>
        )}
      </nav>

      <main className="relative z-10 flex flex-col justify-center items-center flex-1 px-6 py-24 text-center mx">
        <div className="max-w-5xl">
          <div className="mb-6 text-xs uppercase tracking-widest text-yellow-400 font-semibold">
            ⚡ We lot -- we Win
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light mb-8 leading-tight">
            <span className="block">Xyra Lottery</span>
            <span className="block italic font-serif text-yellow-400">Win Without Losing</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
           A simple, no-loss crypto lottery where your funds are always safe —only the yield goes to the winner.
          </p>
          <button
            onClick={initializeUser}
            className="group px-12 py-5 bg-yellow-400 text-black rounded font-semibold text-base hover:bg-yellow-500 transition-all transform hover:scale-105 inline-flex items-center uppercase tracking-wider shadow-2xl shadow-yellow-400/20"
          >
            <span>Launch App</span>
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </main>

      <footer className="relative z-10 flex flex-col md:flex-row justify-between items-center px-6 md:px-16 py-8 border-t border-yellow-400/20 backdrop-blur-sm">
        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <div className="w-6 h-6 bg-yellow-400 rounded transform rotate-45" />
          <span className="text-xl font-bold">Xyra</span>
        </div>
        <div className="text-sm text-gray-500 uppercase tracking-wider">
          © 2025 Xyra. All rights reserved.
        </div>
      </footer>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-zinc-900 border border-yellow-400/30 p-10 rounded-lg text-center shadow-2xl shadow-yellow-400/10 animate-in fade-in duration-200">
            <p className="text-lg font-medium text-gray-100">{modalMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
