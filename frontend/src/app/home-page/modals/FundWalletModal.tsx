// frontend/src/app/home-page/FundWalletModal.tsx
import React from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useAccount } from "wagmi";
import { Copy } from "lucide-react";
import { toast } from "react-toastify";

interface FundWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FundWalletModal({
  isOpen,
  onClose,
}: FundWalletModalProps) {
  const { address } = useAccount();

  if (!isOpen) return null;

  const handleCopyAddress = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        toast.success("Address copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy address: ", err);
        toast.error("Failed to copy address.");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-11/12 md:w-1/3 relative border border-yellow-400">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          &times;
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">
          Fund Your Wallet
        </h2>

        {/* QR Code */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-white p-2 rounded-lg mb-4">
            {address ? (
              <QRCodeCanvas value={address} size={128} level="H" />
            ) : (
              <div className="w-32 h-32 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No Address</span>
              </div>
            )}
          </div>
          <p className="text-gray-300 text-sm">Scan to deposit USDC</p>
        </div>

        {/* Full Address + Copy */}
        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-1 text-center">Address</p>
          <div className="flex items-center justify-center bg-gray-700 p-3 rounded-md text-white text-center break-all">
            <span className="flex-grow">
              {address || "Connect wallet to see address"}
            </span>
            {address && (
              <button
                onClick={handleCopyAddress}
                className="ml-2 p-1 rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                title="Copy address"
              >
                <Copy size={16} className="text-yellow-400" />
              </button>
            )}
          </div>
        </div>

        {/* Warning */}
        <p className="text-red-400 text-sm text-center">
          Send only USDC on the base network to this address. Incorrect
          deposits may be lost.
        </p>
      </div>
    </div>
  );
}
