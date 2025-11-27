"use client";
import React from 'react';
import Modal from './Modal';

interface ClaimPrizeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ClaimPrizeModal = ({ isOpen, onClose }: ClaimPrizeModalProps) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Claim Your Prize!">
        <div className="flex flex-col space-y-4 text-center">
            <p className="text-lg text-gray-800">🎉 Congratulations! You've won the prize! 🎉</p>
            <button className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg p-3 transition duration-300 ease-in-out">Claim Now</button>
        </div>
    </Modal>
);

export default ClaimPrizeModal;
