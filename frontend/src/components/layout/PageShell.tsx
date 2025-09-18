import { ReactNode } from 'react';

interface PageShellProps {
  header: ReactNode;
  children: ReactNode;
}

const PageShell = ({ header, children }: PageShellProps) => {
  return (
    <div className="min-h-screen bg-black text-[#E6E6E6] font-sans">
      <header className="bg-[#0b0f10] border-b border-[#1f2a32]">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-6">
          {header}
        </div>
      </header>
      {children}
    </div>
  );
};

export default PageShell;
