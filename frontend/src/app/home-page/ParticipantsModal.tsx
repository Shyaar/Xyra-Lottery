"use client";
import React from 'react';
import Modal from './Modal';

interface ParticipantsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ParticipantsModal = ({ isOpen, onClose }: ParticipantsModalProps) => (
    <Modal isOpen={isOpen} onClose={onClose} title="All Participants">
        <div className="flex flex-col space-y-2 h-64 overflow-y-auto">
            {[...Array(20)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-lg p-3 flex justify-between items-center">
                    <span>0xABC...DEF</span>
                    <span className="font-semibold">{Math.floor(Math.random() * 100)} Tickets</span>
                </div>
            ))}
        </div>
    </Modal>
);

export default ParticipantsModal;
