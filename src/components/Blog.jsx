import { Link } from "react-router-dom"
import { motion } from "framer-motion";

export default function Blog() {
    return (
        <>
      <div className="relative max-w-[1240px] mx-auto min-h-[700px] mt-2 md:mt-12 flex flex-col items-start justify-start">

        {/* Text Overlay - Animate After */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2 }}
          className=" z-20 w-full max-w-7xl bg-white/90   p-6 rounded-lg shadow-lg "
        >
          {/* <h2 className="text-4xl text-[#12223A] font-bold mb-4">Blog Yazılarım</h2> */}
          <h1 className="mb-8 text-4xl font-boldrelative"><span className="py-[0.5px] px-2 text-5xl bg-[#12223A] text-white ">B</span>log Yazılarım</h1>
          <p className="text-gray-800 leading-relaxed">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur atque aspernatur necessitatibus expedita, et, fugit provident ea dolorum excepturi aut omnis blanditiis quam accusamus vitae quis doloremque nihil rerum cum.
          </p>
          <Link to="/blog" className="text-[#12223A] font-semibold mt-4 block">
            Explore →
          </Link>
        </motion.div>
        {/* Images - Animate First */}
        <div className="relative w-full h-[500px] md:h-[600px] hidden md:block">

        <motion.img
          initial={{ opacity: 0, y: 500 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          src="/bg4.jpeg"
          alt="Map 1"
          className="absolute top-[-50%] left-[20%] w-80 h-96 object-cover rounded-md shadow-lg z-10"
        />

        <motion.img
          initial={{ opacity: 0, x: 500 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          src="/bg5.jpeg"
          alt="Map 2"
          className="absolute top-[-30%] left-[40%]   w-80 h-96 object-cover opacity-80 rounded-md shadow-lg"
        />

        <motion.img
          initial={{ opacity: 0, y: 500  }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          src="/bg5.jpeg"
          alt="Map 3"
          className="absolute top-[-40%] left-[60%] w-80 h-96 object-cover opacity-60 rounded-md shadow-lg"
        />
      </div>


      </div>
  
        </>
    )
}


    {/* Buraya Slider */}
    {/* <Carousel>
      <div className="bg-white p-4 rounded-md">
        <h3 className="font-bold text-lg">GIS ile Haritalama</h3>
        <p>Web tabanlı harita teknolojileri üzerine notlar.</p>
      </div>
    </Carousel> */}

    {/* <a href="/blog" className="inline-block mt-10 px-6 py-2 border border-white text-white rounded-md hover:bg-white hover:text-[#12223A] transition">
      Tüm Blog Yazıları
    </a> */}