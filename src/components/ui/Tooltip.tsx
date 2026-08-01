import React, { ReactNode } from "react";

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export default function Tooltip({ content, children, position = "top" }: TooltipProps) {
  // Determine positioning classes
  const positionClasses = {
    top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
  };

  const arrowClasses = {
    top: "bottom-[-4px] left-1/2 -translate-x-1/2",
    bottom: "top-[-4px] left-1/2 -translate-x-1/2",
    left: "right-[-4px] top-1/2 -translate-y-1/2",
    right: "left-[-4px] top-1/2 -translate-y-1/2",
  };

  return (
    <div className="group/tooltip relative inline-flex justify-center items-center">
      {children}
      <div 
        className={`absolute whitespace-nowrap px-2.5 py-1.5 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-50 ${positionClasses[position]}`}
      >
        {content}
        {/* Triangle Arrow */}
        <div 
          className={`absolute w-2.5 h-2.5 bg-stone-900 rotate-45 rounded-sm ${arrowClasses[position]}`} 
        />
      </div>
    </div>
  );
}
