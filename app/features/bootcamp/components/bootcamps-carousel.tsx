import { useRef } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { BootcampCard } from "~/components/bootcamp/bootcamp-card";
import type { Bootcamp } from "~/types/api";

interface BootcampsCarouselProps {
  bootcamps: Bootcamp[];
}

export const BootcampsCarousel = ({ bootcamps }: BootcampsCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 320;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => scroll("left")}
        className="absolute left-[-1vw] top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center bg-accent text-white rounded-full shadow-md cursor-pointer"
      >
        <FaArrowLeft />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scroll-smooth hide-scrollbar"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {bootcamps.map((bootcamp) => (
          <div key={bootcamp.id} className="min-w-[280px] max-w-[280px] flex-shrink-0">
            <BootcampCard bootcamp={bootcamp} />
          </div>
        ))}
      </div>

      <button
        onClick={() => scroll("right")}
        className="absolute right-[-1vw] top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center bg-accent text-white rounded-full shadow-md cursor-pointer"
      >
        <FaArrowRight />
      </button>
    </div>
  );
};
