
import Link from "next/link";

export default function LandingPage() {
  return (
    <>
      <div className="flex flex-col min-h-screen bg-white text-black">
        {/* Navigation Bar */}
        <nav className="flex justify-between items-center p-4 md:px-6 border-b border-gray-200">
          <div className="text-xl font-bold">
            LotteryDApp
          </div>
          <Link href="/home-page">
            <button className="px-4 py-2 bg-black text-white border-none rounded-md cursor-pointer font-medium">
              Launch App
            </button>
          </Link>
        </nav>

        {/* Hero Section */}
        <main className="flex flex-col justify-center items-center flex-1 p-12 text-center">
          <h1 className="text-5xl font-bold mb-4 max-w-xl">
            Win Without Losing.
          </h1>
          <p className="text-base text-gray-600 mb-8 max-w-xl leading-relaxed">
            A simple, no-loss crypto lottery where your funds are always safe —
            only the yield goes to the winner.
          </p>
          <Link href="/home-page">
            <button className="px-8 py-3 bg-black text-white border-none rounded-md cursor-pointer font-semibold text-base">
              Enter App
            </button>
          </Link>
        </main>

        {/* Footer */}
        <footer className="flex flex-col justify-center items-center p-6 border-t border-gray-200 text-center">
          <div className="text-sm font-medium mb-1">
            LotteryDApp
          </div>
          <div className="text-xs text-gray-500">
            © 2025 LotteryDApp. All rights reserved.
          </div>
        </footer>
      </div>
    </>
  );
}
