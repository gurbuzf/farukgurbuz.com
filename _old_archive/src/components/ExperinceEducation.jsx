import timelineElements from "../data/Experine";
import { IconWorkAlt } from "../assets/Work";
import { IconUserGraduate } from "../assets/Graduate";
import { useState, useEffect } from "react";



export default function ExperinceEducation() {

    const [sortedItems, setSortedItems] = useState(timelineElements);

    useEffect(() => {
    const handleResize = () => {
        const isMobile = window.innerWidth < 768;
        const newOrder = isMobile
        ? [...timelineElements].sort((a, b) => b.id - a.id)
        : timelineElements;
        setSortedItems(newOrder);
    };

    handleResize(); // ilk yüklemede çalışsın
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <>
        <div className="mt-8 px-4 md:px-60 py-60 md:py-72 bg-white">
            <div className="w-full max-w-[1240px] mx-auto px-4 ">
            <h1 className="mb-8 text-4xl font-bold relative"><span className="py-[0.5px] px-2 text-5xl bg-[#12223A] text-white ">E</span>ducation & Experience</h1>
            <div className="flex flex-col md:flex-row item-start md:items-center justify-between w-full max-w-8xl mx-auto">
                      {/* <div className="hidden md:block absolute top-8 left-1/2 transform -translate-x-1/2 h-[calc(100%-40px)] w-[2px] bg-gray-300 z-0" /> */}
    
            

            {sortedItems.map((item, index) => (
                <div key={index} className="flex flex-row md:flex-col items-center relative gap-4 mb-2">
                
                {/* Icon */}
                <div className="w-8 h-8 mt-4 bg-[#12223A] rounded-full mb-4 z-10 flex  items-center justify-center text-white">
                    {item.icon === "Work" ? <IconWorkAlt size={16} /> : <IconUserGraduate size={16} />}
                </div>

                {/* Text */}
                <div className="text-start md:text-center">
                    <h3 className="text-lg font-medium">{item.title}</h3>
                    <h5 className="text-sm font-medium">{item.location}</h5>
                    <p className="text-sm text-gray-600">{item.date}</p>
                </div>
                </div>
            ))}
            </div>

            {/* Line */}
            <div className="hidden md:block w-full max-w-7xl mx-auto h-[2px] left-1/6 transform -translate-x-1/5  bg-gray-300 mt-4 relative -top-[140px]"></div>

            </div>
        </div>
        
        </>
    )
}