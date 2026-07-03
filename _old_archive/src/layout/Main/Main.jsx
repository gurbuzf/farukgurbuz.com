import { Link } from "react-router-dom"
import { useState ,useEffect} from "react"
import ScrollToTopButton from "../../components/ScrollToTopButton";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai"


export default function Main ({ children })  {

    const [scrollPosition, setScrollPosition] = useState(0);
    const [hamburgerMenu, setHamburgerMenu] = useState(false)
    
    const handleMenu = () => {
        setHamburgerMenu(!hamburgerMenu)
    }

    useEffect(() => {
        setHamburgerMenu(false);
      }, [location]);  // location değiştiğinde menüyü kapat
    
    const toggleMenu = () => setMenuOpen(!menuOpen);

    useEffect(() => {
        const handleScroll = () => {
        setScrollPosition(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
        window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const getBackgroundColor = () => {
        return scrollPosition < 100 ? 'bg-transparent' : 'bg-[#12223A]/20  ';
        // text-white
    };
return (
    <>

        {/* <div className="w-full h-[90px] fixed top-0 left-0 z-50 bg-[#EBEDEE ]"> */}
        <div className={`w-full h-[90px] fixed top-0 left-0 z-50 transition-all duration-500 text-black ${getBackgroundColor()}`}>  
            <div className="max-w-[1240px] mx-auto px-4 flex  justify-between items-center h-full">
                <div className="logo">
                    {/* <img className="w-12 bg-[#12223A] text-white" src="/logo3.png" alt="logo" /> */}
                    <img className="w-15 text-white" src="/farukgurbuz-dark.png" alt="logo" />
                </div>

                <nav className="hidden md:flex">
                    <ul className="flex items-center">
                    <li className="link text-xl font-semibold text-[#12223A]  px-4">
                        <Link className="px-4 " smooth to="/home">Home</Link>
                        <Link className="" smooth to="/blog">My Blog</Link>
                    </li>
                    </ul>
                </nav>

                {/* mobile */}
                <div onClick={handleMenu} className="block  md:hidden">
                    {hamburgerMenu ? 
                        <AiOutlineClose size={36} className=""/>
                        :<AiOutlineMenu size={36} className=""/>    }
                    
                </div>
            </div>
            {hamburgerMenu && (
                <div className="md:hidden ">
                <ul className="flex flex-col space-y-4 text-lg font-medium text-white bg-[#12223A]/90 z-40 p-2 rounded shadow">
                    <li><Link to="/home" onClick={toggleMenu}>Home</Link></li>
                    <li><Link to="/blog" onClick={toggleMenu}>My Blog</Link></li>
                </ul>
                </div>
            )}
        </div>

        {/* Content section to display children passed to the Main component */}
        <div className="content">
            {children}
        </div>

        <ScrollToTopButton />

        <footer>
            <div className="w-full text-xs flex text-center justify-center  bottom-0 bg-[#12223A]/20 text-[#12223A] z-200">Copyright © 2025 Faruk Gurbuz</div>
        </footer>
    </>
)

}