import type { ReactNode } from "react";

const Card = ({ children, title }: { children?: ReactNode; title: string }) => {
  return (
    <section className="mb-0 flex w-full max-w-200 flex-col gap-4 rounded-2xl bg-[#23293a] px-4 py-4 md:px-8 md:py-6">
      <h3 className="text-[22px] text-white font-bender-bold">{title}</h3>
      {children}
    </section>
  );
};

export default Card;
