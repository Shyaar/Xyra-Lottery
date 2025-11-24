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
  PiggyBank,
  Trophy,
  ShieldCheck,
  Lock,
  CheckCircle,
} from "lucide-react";
import { useViemClients } from "../../../hooks/useViem";

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

  const { publicClient, walletClient } = useViemClients();

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
    publicClient,
    walletClient,
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
    <div className="relative flex flex-col min-h-screen bg-black text-white overflow-hidden">
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

        {isConnected && address ? (
          <button
            onClick={handleDisconnect}
            className=" px-12 py-5 bg-yellow-400 text-black rounded font-semibold text-sm hover:bg-yellow-500 transition-all transform hover:scale-105 uppercase tracking-wide"
          >
            {`${address.slice(0, 6)}...${address.slice(-4)}`}
          </button>
        ) : (
          <button
            onClick={initializeUser}
            className=" px-12 py-5 bg-yellow-400 text-black rounded font-semibold text-sm hover:bg-yellow-500 transition-all transform hover:scale-105 uppercase tracking-wide"
          >
            Get started
          </button>
        )}
      </nav>

      <main className="relative z-10 flex-grow">
        {/* Hero Section */}
        <section className="flex flex-col justify-center items-center flex-1 px-6 py-24 text-center">
          <div className="max-w-5xl">
            <div className="mb-6 text-xs uppercase tracking-widest text-yellow-400 font-semibold">
              ⚡ We lot -- we Win
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-light mb-8 leading-tight">
              <span className="block">Xyra Lottery</span>
              <span className="block italic font-serif text-yellow-400">
                Win Without Losing
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
              A simple, no-loss crypto lottery where your funds are always safe
              —only the yield goes to the winner.
            </p>
            <button
              onClick={initializeUser}
              className="group px-12 py-5 bg-yellow-400 text-black rounded font-semibold text-base hover:bg-yellow-500 transition-all transform hover:scale-105 inline-flex items-center uppercase tracking-wider shadow-2xl shadow-yellow-400/20"
            >
              <span>Launch App</span>
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-md text-gray-400 mb-12">
              A simple and transparent process to win without risking your
              initial funds.
            </p>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center">
                <div className="w-18 h-18 p-3 mb-6 bg-yellow-400/10 border border-yellow-400 rounded-full flex items-center justify-center">
                  <PiggyBank className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  1. Deposit Funds
                </h3>
                <p className="text-gray-400 text-center">
                  Deposit your USDC into the secure vault to get lottery
                  tickets.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-18 h-18 p-3 mb-6 bg-yellow-400/10 border border-yellow-400 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">2. Earn Yield</h3>
                <p className="text-gray-400 text-center">
                  The deposited funds are put into a yield-bearing protocol to
                  generate interest.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-18 h-18 p-3 mb-6 bg-yellow-400/10 border border-yellow-400 rounded-full flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">3. Win Prizes</h3>
                <p className="text-gray-400 text-center">
                  A lucky winner takes home all the generated yield, and
                  everyone else gets their initial deposit back.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Xyra is Different Section */}
        <section className="py-20 px-6 bg-black/40 ">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-12">Why Xyra is Different</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-black/40 border border-yellow-400 p-8 rounded-lg">
                <ShieldCheck className="w-8 h-8 text-yellow-400 my-6 mx-auto" />
                <h3 className="text-xl font-semibold mb-2">No-Loss Lottery</h3>
                <p className="text-gray-400">
                  You never lose your initial deposit. It's a risk-free way to
                  play.
                </p>
              </div>
              <div className="bg-black/40 border border-yellow-400 p-8 rounded-lg">
                <Zap className="w-8 h-8 text-yellow-400 my-6 mx-auto" />
                <h3 className="text-xl font-semibold mb-2">
                  Yield-Powered Prizes
                </h3>
                <p className="text-gray-400">
                  The prize pool is generated from the yield of all deposits,
                  creating a win-win situation.
                </p>
              </div>
              <div className="bg-black/40 border border-yellow-400 p-8 rounded-lg">
                <Lock className="w-8 h-8 text-yellow-400 my-6 mx-auto" />
                <h3 className="text-xl font-semibold mb-2">
                  Secure & Transparent
                </h3>
                <p className="text-gray-400">
                  Built on audited smart contracts, ensuring fairness and
                  security.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* A New Era of Lottery Section */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-4">
                  A New Era of Lottery
                </h2>
                <p className="text-lg text-gray-400 mb-6">
                  Xyra is designed to be a fair, transparent, and exciting
                  platform for everyone. We believe in the power of decentralized
                  finance to create a better financial future.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-yellow-400 mr-4" />
                    <span>Your funds are always safe and withdrawable.</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-yellow-400 mr-4" />
                    <span>
                      The prize pool is generated by a sustainable yield
                      source.
                    </span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-yellow-400 mr-4" />
                    <span>
                      The entire process is governed by smart contracts.
                    </span>
                  </li>
                </ul>
              </div>
              <div>
                <img
                  src="/security.png"
                  alt="Xyra Security"
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Win?</h2>
          <p className="text-lg text-gray-400 mb-8">
            Join Xyra today and start playing the lottery without the risk.
          </p>
          <button
            onClick={initializeUser}
            className="group px-12 py-5 bg-yellow-400 text-black rounded font-semibold text-base hover:bg-yellow-500 transition-all transform hover:scale-105 inline-flex items-center uppercase tracking-wider shadow-2xl shadow-yellow-400/20"
          >
            <span>Get Started Now</span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </section>
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
