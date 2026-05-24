import type { ReactNode } from "react";

const Card = ({ children, title }: { children?: ReactNode; title: string }) => {
  return (
    <section className="bg-[#23293a] rounded-2xl px-4 py-2.5 md:py-6 md:px-8 w-full max-w-200 mb-0 flex gap-4">
      <h3 className="text-[22px] text-white font-bender-bold">{title}</h3>
      {children}
    </section>
  );
};

export default Card;
