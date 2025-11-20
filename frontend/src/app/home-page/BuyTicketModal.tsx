"use client";
import React, { useState } from 'react';
import Modal from './Modal';
import TokenSelectorModal from './TokenSelectorModal';

interface Token {
    name: string;
    icon: string;
}

interface BuyTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const BuyTicketModal = ({ isOpen, onClose }: BuyTicketModalProps) => {
    const [isTokenSelectorOpen, setTokenSelectorOpen] = useState(false);
    const [selectedToken, setSelectedToken] = useState<Token>({ name: 'Token A (TA)', icon: '/path/to/token-a-icon.png' });

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Buy Ticket">
            <div className="flex flex-col space-y-4">
                <p className="text-center text-gray-600">
                    Buy. Play. Win Without Losing.<br />
                    Enter with any token, let your stake earn yield, and at the end of the round one player takes all the profits—everyone else gets fully refunded.
                </p>
                <div className="flex justify-between items-center">
                    <button 
                        className="bg-black/10 hover:bg-gray-800 text-white font-bold rounded-lg p-3 transition duration-300 ease-in-out flex-grow"
                    >
                        Buy
                    </button>
                    {/* <div className="relative ml-4">
                        <button 
                            onClick={() => setTokenSelectorOpen(true)}
                            className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-black font-bold rounded-lg p-3 transition duration-300 ease-in-out"
                        >
                            <img src={selectedToken.icon} alt="Token Icon" className="h-6 w-6 rounded-full" />
                            <span>{selectedToken.name.split(' ')[0]}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div> */}
                </div>
            </div>
            <TokenSelectorModal 
                isOpen={isTokenSelectorOpen} 
                onClose={() => setTokenSelectorOpen(false)} 
                onSelectToken={setSelectedToken}
            />
        </Modal>
    );
};

export default BuyTicketModal;
