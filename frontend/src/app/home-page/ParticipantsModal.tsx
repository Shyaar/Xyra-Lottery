"use client";
import React from 'react';
import Modal from './Modal';
import { useParticipants } from '../../../hooks/useReadLottery'; // Adjusted path

interface ParticipantsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ParticipantsModal = ({ isOpen, onClose }: ParticipantsModalProps) => {
    const { data: participants, isLoading, isError } = useParticipants();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="All Participants">
            <div className="flex flex-col space-y-2 h-64 overflow-y-auto">
                {isLoading && <p>Loading participants...</p>}
                {isError && <p className="text-red-500">Error loading participants.</p>}
                {!isLoading && !participants?.length && <p>No participants yet.</p>}
                {participants?.map((participant, i) => (
                    <div key={i} className="bg-gray-100 rounded-lg p-3 flex justify-between items-center">
                        <span>{participant ? `${participant.slice(0, 6)}...${participant.slice(-4)}` : 'Unknown Address'}</span>
                        {/* Assuming participant is just an address, if the contract returned more data for a participant, it would be displayed here */}
                        <span className="font-semibold">1 Ticket</span> {/* Placeholder, as we only have addresses */}
                    </div>
                ))}
            </div>
        </Modal>
    );
};

export default ParticipantsModal;