export default function SidebarTest({ activeView, setActiveView }) {
  const sidebarItems = [
    { icon: "/images/dashboard.png", label: "Dashboard" },
    { icon: "/images/tools.png", label: "Register" },
    { icon: "/images/tools.png", label: "Sessions" },
    { icon: "/images/tools.png", label: "VAWC Victims" },
    { icon: "/images/tools.png", label: "Log Out" },
  ];

  return (
    <div className="bg-[#48486e] w-[200px] text-white font-[Poppins]">
      {sidebarItems.map((item) => (
        <div
          key={item.label}
          className={`flex items-center gap-[15px] px-5 py-2 cursor-pointer transition ${
            activeView === item.label
              ? "bg-[#3f3f64] shadow-lg"
              : "hover:bg-[#3f3f64] hover:shadow-lg"
          }`}
          onClick={() => setActiveView(item.label)}
        >
          <img src={item.icon} alt={item.label} className="w-[25px] h-[25px]" />
          <p>{item.label}</p>
        </div>
      ))}
    </div>
  );
}
