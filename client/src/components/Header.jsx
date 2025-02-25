import Image from "next/image";
import logo from "../../public/assets/images/AMIT.png";
const HeaderComponent = () => {

  return (
    <header className="flex justify-center items-center py-2 h-16 shadow-md bg-white">
      {/* <Image src={logo} alt="logo" width={150} height={40} priority={true} /> */}
      <h1 className="text-4xl text-lg rounded mt-2 font-bold text-primary leading-relaxed tracking-wide">Talky</h1>
    </header>
  );
};

export default HeaderComponent;
