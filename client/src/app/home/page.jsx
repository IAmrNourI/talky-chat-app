"use client";
import Sidebar from "../../components/Sidebar";
import Image from "next/image";
import logo from "../../../public/assets/images/AMIT.png";
const Page = () => {
  return (
    <div className="flex justify-center items-center flex-col gap-2">
      <div>
        {/* <Image src={logo} width={200} height={80} alt="logo" /> */}
        <h1 className="text-4xl text-lg rounded mt-2 font-bold text-primary leading-relaxed tracking-wide">Talky</h1>

      </div>
      <p className="text-2xl font-semibold mt-3 text-slate-400">
        Select User to send message
      </p>
    </div>
  );
};

export default Page;
