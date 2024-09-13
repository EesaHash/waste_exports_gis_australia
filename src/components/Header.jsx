import React from "react";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
export default function Header() {
  return (
    <div className="flex w-screen items-center cursor-pointer  justify-center ">
      <HoverBorderGradient
        onClick={() => {
          location.reload();
        }}
        className="bg-black border border-borderColor "
        containerClassName="flex cursor-pointer bg-standard text-lg font-bold h-12 border-none mt-4 mb-4 desktop:mb-0 desktop:mt-12 ml-5 mr-5"
      >
        <div>Australian Waste Exports GIS Dashboard</div>
        <ShootingStars />
      </HoverBorderGradient>
    </div>
  );
}
