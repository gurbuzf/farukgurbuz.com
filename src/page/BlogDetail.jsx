import { useParams, Link } from "react-router-dom";
import blogData from "../data/blogData";
import Main from "../layout/Main";
import BlogContent from "../components/BlogContent";

export default function BlogDetail() {
    const { id } = useParams();
    const post = blogData.find((p) => p.id === Number(id));

    if (!post) return <h2 className="text-center text-red-500">Blog post not found</h2>;

    return (
        <Main>
            <div className="max-w-[1200px] mx-auto mt-16 md:mt-32  p-4">
                <Link to="/blog" className="text-[#12223A] font-semibold mt-6 block">← Back to Blog</Link>
                <h1 className="text-4xl font-bold">{post.title}</h1>
                <p className="text-gray-500">{post.date}</p>
                <img src={post.image} alt={post.title} className="w-full h-60 object-cover rounded-md my-4"/>
                <div className="">
                    <BlogContent content={post.content}/>
                </div>
                
            </div>
        </Main>
    );
}