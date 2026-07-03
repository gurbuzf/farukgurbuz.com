
import MyTypingText from "./MyTypingText"
import SocialMediaIcons from "./SocialMediaIcons"
import cv from "../assets/cv.pdf"
import { FiDownload } from "react-icons/fi";

export default function Hero() {
  

    return (
        <>
        <div className="relative max-w-[1240px] min-h-[700px] md:min-h-[1050px] mx-auto  mt-52" id="home">
            <div className=" pt-20 md:pt-32 flex flex-col justify-center items-center gap-8">
                <p className="text-center text-2xl md:text-4xl">Hi, I'm <span className="bg-[#12223A] text-white p-2 ">Faruk Gurbuz</span></p>
                <MyTypingText />
                <p className="w-[90%] text-sm md:text-xl leading-relaxed text-center">I'm someone who turns spatial data into stories—bridging science and strategy to make information useful, clear, and actionable.</p>
            </div>
            <SocialMediaIcons/>
        </div>

        <div className="flex items-center justify-center mt-4">
            <div className="flex flex-col md:flex-row items-center justify-center absolute
                         w-full max-w-7xl md:min-h-[400px] bg-[#12223A]  text-white md:translate-y-[-25%] rounded-2xl 
                         shadow-lg gap-2 md:gap-8 mx-4 transition-opacity duration-500"
            // style={{ backgroundColor: `rgba(18, 34, 58, ${opacity})` }}
            // bg-[#12223A]
            >
                <div className="relative text-xs p-4">
                    <h2 className="text-sm  md:text-2xl mb-4">About Me</h2>
                    <p className="text-sm md:text-xl  leading-relaxed max-w-5xl">I have a diverse background spanning data science, geospatial technologies, data visualization, and environmental modeling. My experience includes developing analytical workflows in Python, working with satellite and spatial datasets, contributing to decision-making processes, and both building tools and producing information to support data-driven strategies.</p>
                    <br />
                    <p className="text-sm md:text-xl  leading-relaxed max-w-5xl">In addition to technical roles, I’ve been actively involved in planning, coordination, and reporting processes, contributing to project execution and communication. I enjoy supporting efforts that bridge domain expertise with practical outcomes.</p>
                    <div className="mt-2 md:mt-4 flex items-center ">
                        <a 	className="px-2 py-2 text-sm md:text-xl text-white " href={cv} download>
                            download cv 
                        </a>        
                        <FiDownload />        
                    </div>
                </div>
                <div className=" md:static hidden md:block right-0 z-[-1] w-[20%] mr-4 rounded-full overflow-hidden relative">
                    <img 
                        src="/img5.png" 
                        alt="" 
                        className="object-cover w-full h-full grayscale transition-all duration-700" 
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#12223A] to-transparent opacity-5 mix-blend-multiply pointer-events-none"></div>
                </div>
            </div>

        </div>
        </>

    )
}