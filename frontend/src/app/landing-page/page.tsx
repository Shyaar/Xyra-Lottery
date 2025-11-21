"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useReadUser, useUserActions } from "../../../hooks/useUserRegistry";

// Utility functions to generate random username & avatar


export default function LandingPage() {
  const router = useRouter();

  // Wallet connection
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // User contract actions
  const { data: isRegistered, isLoading } = useReadUser(address);
  const { registerUser, isPending, isConfirming, isConfirmed, writeError } = useUserActions(address);

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
    <div className="flex flex-col min-h-screen bg-white text-[#0a090a]">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-4 md:px-6 border-b ">
        <div className="text-xl font-bold">LotteryDApp</div>
        {isConnected && address ? (
          <button
            onClick={() => disconnect()}
            className="px-8 py-3 btn-glow rounded-none font-semibold text-base"
          >
            {`${address.slice(0, 6)}...${address.slice(-4)}`}
          </button>
        ) : (
          <button
            onClick={initializeUser}
            className="px-8 py-3 btn-glow rounded-none font-semibold text-base"
          >
            Connect Wallet
          </button>
        )}
      </nav>

      {/* Hero */}
      <main className="flex flex-col justify-center items-center flex-1 p-12 text-center shadow-cyan-glow">
        <h1 className="text-5xl font-bold mb-4 max-w-xl">Win Without Losing.</h1>
        <p className="text-base text-gray-400 mb-8 max-w-xl leading-relaxed">
          A simple, no-loss crypto lottery where your funds are always safe — only the yield goes to the winner.
        </p>

        <button
            onClick={initializeUser}
            className="px-8 py-3 btn-glow rounded-none font-semibold text-base"
          >
            Connect Wallet
          </button>
      </main>

      {/* Footer */}
      <footer className="flex flex-col justify-center items-center p-6 border-t text-center">
        <div className="text-sm font-medium mb-1">LotteryDApp</div>
        <div className="text-xs text-gray-500">© 2025 LotteryDApp. All rights reserved.</div>
      </footer>
    </div>
  );
}
