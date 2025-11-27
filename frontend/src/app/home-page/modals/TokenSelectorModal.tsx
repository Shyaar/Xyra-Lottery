"use client";
import React from 'react';
import Modal from './Modal';

interface Token {
    name: string;
    icon: string;
}

const tokens: Token[] = [
    { name: 'Token A (TA)', icon: '/path/to/token-a-icon.png' },
    { name: 'Token B (TB)', icon: '/path/to/token-b-icon.png' },
    { name: 'Token C (TC)', icon: '/path/to/token-c-icon.png' },
];

interface TokenSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectToken: (token: Token) => void;
}

const TokenSelectorModal = ({ isOpen, onClose, onSelectToken }: TokenSelectorProps) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Select a Token">
        <div className="flex flex-col space-y-2">
            {tokens.map(token => (
                <button 
                    key={token.name} 
                    onClick={() => {
                        onSelectToken(token);
                        onClose();
                    }}
                    className="flex items-center space-x-3 bg-gray-100 hover:bg-gray-200 text-black font-semibold rounded-lg p-3 text-left transition duration-300 ease-in-out"
                >
                    <img src={token.icon} alt={`${token.name} icon`} className="h-8 w-8 rounded-full" />
                    <span>{token.name}</span>
                </button>
            ))}
        </div>
    </Modal>
);

export default TokenSelectorModal;
