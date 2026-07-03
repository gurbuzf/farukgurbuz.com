import ExperinceEducation from "../components/ExperinceEducation"; 
import Hero from "../components/Hero";
import Main from "../layout/Main";
import Blog from "../components/Blog";

export default function Home() {

    return (<>
        <Main>
            <Hero/>
            <ExperinceEducation/>
            <Blog/>
        </Main>
    </>)
}