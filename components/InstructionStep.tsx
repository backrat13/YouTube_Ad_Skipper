
import React from 'react';
import { CodeBlock } from './CodeBlock';

interface InstructionStepProps {
  step: string;
  title: string;
  description: string;
  code?: string;
  note?: string;
  children?: React.ReactNode;
}

export const InstructionStep: React.FC<InstructionStepProps> = ({ step, title, description, code, note, children }) => {
  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-cyan-400/10 text-cyan-400 font-bold text-xl flex-shrink-0">
        {step}
      </div>
      <div className="flex-grow pt-1">
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{description}</p>
        {code && <CodeBlock code={code} />}
        {children}
        {note && <p className="text-sm text-slate-500 mt-3 italic">{note}</p>}
      </div>
    </div>
  );
};
