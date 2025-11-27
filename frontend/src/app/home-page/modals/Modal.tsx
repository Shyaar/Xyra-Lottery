"use client";
import React from 'react';

// A generic, reusable Modal component
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/10 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white border border-gray-200 rounded-lg p-8 z-10 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold text-black">{title}</h2>
          <button onClick={onClose} className="text-black hover:text-gray-600 font-bold text-2xl">&times;</button>
        </div>
        <div className="mt-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
