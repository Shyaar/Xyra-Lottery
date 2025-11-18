"use client";
import React from 'react';
import Modal from './Modal';

interface WithdrawRefundProps {
    isOpen: boolean;
    onClose: () => void;
}


const WithdrawRefundModal = ({ isOpen, onClose }:WithdrawRefundProps) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Withdraw / Refund">
        <div className="flex flex-col space-y-4 text-gray-800">
            <p>Here are the details regarding your withdrawable and refundable amounts.</p>
            {/* Add details here */}
            <button className="bg-black hover:bg-gray-800 text-white font-bold rounded-lg p-3 transition duration-300 ease-in-out">Confirm Withdrawal</button>
        </div>
    </Modal>
);

export default WithdrawRefundModal;
