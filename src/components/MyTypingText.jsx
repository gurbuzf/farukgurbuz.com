import { TypeAnimation } from 'react-type-animation';

const MyTypingText = () => {
  return (
    <TypeAnimation
      sequence={[
        'Engineer', 3000,
        'GIS Enthusiast', 3000,
        'Data Scientist', 3000,
      ]}
      speed={50}          // Yazma hızı (ms)
      repeat={Infinity}   // Sonsuz döngü
      wrapper="span"      // Sarma elementi (div / span vs.)
      className="text-[#12223A] text-2xl md:text-4xl"  // Tailwind class
    />
  );
}

export default MyTypingText;
