"use client";
import React from 'react';
import Modal from './Modal';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
        <div className="flex flex-col space-y-4 text-gray-800">
            <p>Dark/Light Mode Toggle</p>
            <p>Notification Preferences</p>
        </div>
    </Modal>
);

export default SettingsModal;
