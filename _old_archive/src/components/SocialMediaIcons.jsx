import { IconGithub } from "../assets/IconGithub"
import { IconGooglescholar } from "../assets/IconGooglescholar"
import { IconLinkedin } from "../assets/IconLinkedin"


export default function SocialMediaIcons ()  {

    return (
        <>
        <div className="flex justify-center  mt-8 gap-8 text-4xl md:text-5xl">

            <a  className="hover:opacity-50 transition duration-500"
                href="https://scholar.google.com.tr/citations?user=CVfKPpUAAAAJ&hl=tr" target="_blank" rel="noopener noreferrer" >
                    <IconGooglescholar   />
            </a>
            <a  className="hover:opacity-50 transition duration-500"
                href="https://github.com/gurbuzf" target="_blank" rel="noopener noreferrer" >
                    <IconGithub className=""/>
            </a>
            <a  className="hover:opacity-50 transition duration-500"
                href="https://www.linkedin.com/in/faruk-gurbuz/" target="_blank" rel="noopener noreferrer" >
                    <IconLinkedin className=""/>
            </a>

        </div>
        </>
    )

}