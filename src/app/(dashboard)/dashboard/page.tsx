"use client";
import BigCalendar from "@/components/calendar";
import { SiteHeader } from "@/components/site-header";

const Page = () => {
  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col gap-4 p-2 pt-0">
        <BigCalendar />
      </div>
    </>
  );
};

export default Page;
