import Main from "../layout/Main"
import Blog from "../components/Blog"
import blogData from "../data/blogData"
import { Link } from "react-router-dom"

export default function MyBlog() {

    return(
        <>
        <Main>
            <div className="relative h-[320px] md:h-[560px] overflow-hidden">
            {/* Arka plan görseli */}
            <img
                src="/bg7.png"
                alt="Hydrological Map"
                className="absolute inset-0 w-full h-full object-cover opacity-50"
            />

            {/* İçerik */}
            <div className="relative z-10 max-w-[1240px] h-full mx-auto flex flex-row items-end justify-between px-4">
                <div className="w-1/2">
                <div className="text-2xl text-[#12223A]">
                    <i className="fa-solid fa-quote-left"></i>
                </div>
                <h2 className="text-2xl font-semibold md:text-5xl md:font-bold md:leading-14  text-[#12223A]">
                    Data • GIS • Water —   <br />
                    Where  <br />
                    My Curiosity Flows
                </h2>
                <div className="text-2xl mt-4 grid justify-items-end text-[#12223A]">
                    <i className="fa-solid fa-quote-right"></i>
                </div>
                </div>

                <div className="flex-1"></div>
            </div>
            </div>
            <div className="max-w-[1240px] mx-auto  container scroll-offset m-12 p-4" id="myblog" >
                    <div className="flex items-center gap-4 mb-8">
                        <h1 className="text-4xl font-bold text-[#12223A] whitespace-nowrap">My Blog</h1>
                        <div className="flex-1 h-px mt-2 text-xs opacity-20 bg-[#12223A]"></div>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-8 md:p-0">
                        {blogData.map((post) => (
                            <div key={post.id} className="bg-white shadow-md p-4 rounded-lg">
                                <img src={post.image} alt={post.title} className="w-full h-60 object-cover rounded-md"/>
                                <div>
                                <h2 className="text-2xl font-semibold  text-[#12223A] mt-4">{post.title}</h2>
                                <p className="text-gray-500 text-xs">{post.date}</p>
                                <p className="text-[#12223A] mt-2">{post.description}</p>
                                <Link to={`/blog/${post.id}`} className="text-[#12223A] font-semibold mt-4 block">Read More →</Link>
                                </div>
                            </div>
                        ))}
                    </div>
            </div>
        </Main>
        </>
    )
}

