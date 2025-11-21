"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useReadUser, useUserActions } from "../../../hooks/useUserRegistry";
import { ArrowRight, ChevronRight, TrendingUp, Wallet, Zap } from "lucide-react";

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
  }, [isConnected, isLoading, isPending, isConfirming, isConfirmed, writeError]);

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

  return (
    <div className="flex flex-col min-h-screen bg-zinc-800 text-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-4 md:px-8 border-b border-yellow-400">
        <div className="text-2xl font-bold tracking-tighter">Xyra</div>
        {isConnected && address ? (
          <button
            onClick={() => disconnect()}
            className="px-6 py-2 border border-yellow-400 rounded-md font-semibold bg-yellow-400 text-sm hover:bg-yellow-400/10 transition-colors"
          >
            {`${address.slice(0, 6)}...${address.slice(-4)}`}
          </button>
        ) : (
          <button
            onClick={initializeUser}
            className="px-6 py-2 bg-yellow-500 text-gray-900 rounded-md font-semibold text-sm hover:bg-yellow-400 transition-colors flex items-center"
          >
            Get Started <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        )}
      </nav>

      {/* Hero */}
      <main className="flex flex-col justify-center items-center flex-1 pt-24 pb-12 text-center">
        <h1 className="text-6xl font-extrabold mb-4 max-w-2xl tracking-tight">
          Win Without Losing
        </h1>
        <p className="text-lg text-gray-400 mb-8 max-w-2xl leading-relaxed">
          A simple, no-loss crypto lottery where your funds are always safe —
          only the yield goes to the winner.
        </p>
        <button
          onClick={initializeUser}
          className="px-10 py-4 bg-yellow-500 text-gray-900 rounded-md font-semibold text-lg hover:bg-yellow-400 transition-colors flex items-center"
        >
          Enter Now <ChevronRight className="w-5 h-5 ml-2" />
        </button>
      </main>



      {/* Footer */}
      <footer className="flex flex-col justify-center items-center p-8 border-t border-yellow-400">
        <div className="text-lg font-semibold mb-2">Xyra</div>
        <div className="text-sm text-gray-500">
          © 2025 Xyra. All rights reserved.
        </div>
      </footer>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <p className="text-lg font-semibold">{modalMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
