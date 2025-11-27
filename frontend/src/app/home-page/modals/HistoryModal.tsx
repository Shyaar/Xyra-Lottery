"use client";
import React from 'react';
import Modal from './Modal';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const HistoryModal = ({ isOpen, onClose }: HistoryModalProps) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Transaction History">
        <div className="flex flex-col space-y-3">
            <p className="border-b border-gray-200 pb-2 text-gray-800">Round #123 ended.</p>
            <p className="border-b border-gray-200 pb-2 text-gray-800">You bought 10 tickets.</p>
            <p className="border-b border-gray-200 pb-2 text-gray-800">You claimed a refund.</p>
        </div>
    </Modal>
);

export default HistoryModal;
