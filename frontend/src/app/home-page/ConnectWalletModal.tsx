"use client";
import React from 'react';
import Modal from './Modal';

interface ConnectWalletModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ConnectWalletModal = ({ isOpen, onClose }: ConnectWalletModalProps) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Connect Wallet">
    <div className="flex flex-col space-y-4">
      {['Phantom', 'MetaMask', 'Coinbase Wallet'].map(wallet => (
        <button key={wallet} className="bg-gray-100 hover:bg-gray-200 text-black font-semibold rounded-lg p-3 transition duration-300 ease-in-out">{wallet}</button>
      ))}
    </div>
  </Modal>
);

export default ConnectWalletModal;
