'use-client'

import React from "react";

interface UiButtonProps {
  text: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  active?: boolean;
}

const UiButton: React.FC<UiButtonProps> = ({
  text,
  onClick,
  disabled,
  loading,
  active,
}) => {
  const baseClasses =
    "text-center text-xs font-semibold uppercase tracking-wider w-full px-4 py-2 rounded-lg transition-all duration-300";

  const activeClasses = "bg-yellow-400 border-yellow-500 text-black";
  const inactiveClasses = "border-yellow-400/10 opacity-50 cursor-not-allowed";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!active || disabled || loading}
      className={`${baseClasses} ${
        active ? activeClasses : inactiveClasses
      }`}
    >
      {loading ? "Loading..." : text}
    </button>
  );
};

export default UiButton;

