import Link from "next/link";

interface NavLinkProps {
    href: string;
    icon: React.ReactNode;
    text: string;
  }
  
const NavLink = ({ href, icon, text }: NavLinkProps) => (
<Link 
    href={href}
    className="flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 text-gray-300 hover:bg-gray-800 hover:text-pink-400"
>
    <span className="mr-1.5 text-pink-400">{icon}</span>
    {text}
</Link>
);

export default NavLink;