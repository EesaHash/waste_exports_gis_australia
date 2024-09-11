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
        containerClassName="flex cursor-pointer  text-lg font-bold h-12 border-none rounded-lg m-3 ml-5 mr-5"
      >
        <div>Australian Waste Exports GIS Dashboard</div>
        <ShootingStars />
      </HoverBorderGradient>
    </div>
  );
}
