import React, { useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import img1  from "../assests/icons/css.png";
import img2  from "../assests/icons/express.png";
import img3  from "../assests/icons/github.png";
import img4  from "../assests/icons/html.png";
import img5  from "../assests/icons/js.png";
import img6  from "../assests/icons/mogo.png";
import img7  from "../assests/icons/node.png";
import img8  from "../assests/icons/python.png";
import img9  from "../assests/icons/react.png";
import img10 from "../assests/icons/mysql.png";
import img11 from "../assests/icons/kafka.png";
import img12 from "../assests/icons/zookeeper.png";
import img13 from "../assests/icons/microservices.png";
import img14 from "../assests/icons/nginx.png";
import img15 from "../assests/icons/GraphQL.png";
import img16 from "../assests/icons/NextJS.png";
import img17 from "../assests/icons/Expo.png";
import img18 from "../assests/icons/CPanel_logo.png";
import { useSectionReveal } from "../hooks/useSectionReveal";

const skills = [
  { name: "React",               img: img9  },
  { name: "NextJS",              img: img16 },
  { name: "Node.js",             img: img7  },
  { name: "Express",             img: img2  },
  { name: "MongoDB",             img: img6  },
  { name: "JavaScript",          img: img5  },
  { name: "React Native Expo",   img: img17 },
  { name: "Python",              img: img8  },
  { name: "HTML5",               img: img4  },
  { name: "CSS3",                img: img1  },
  { name: "GitHub",              img: img3  },
  { name: "MySQL",               img: img10 },
  { name: "Kafka",               img: img11 },
  { name: "Apache Zookeeper",    img: img12 },
  { name: "Microservices",       img: img13 },
  { name: "Nginx",               img: img14 },
  { name: "GraphQL",             img: img15 },
  { name: "CPanel",              img: img18 },
];

// Split into two rows; duplicate each row so the marquee loops seamlessly
const row1 = skills.slice(0, 9);
const row2 = skills.slice(9);

const SkillChip = ({ skill }) => (
  <motion.div
    whileHover={{ y: -3, scale: 1.04 }}
    whileTap={{ scale: 0.94 }}
    transition={{ type: "spring", stiffness: 400, damping: 20 }}
    className="flex items-center gap-3 px-5 py-3 bg-dark-card border border-gray-800/60 rounded-2xl shrink-0 hover:border-green-500/40 hover:bg-[#151515] transition-colors duration-300 cursor-default group"
  >
    <div className="w-7 h-7 flex items-center justify-center filter grayscale group-hover:grayscale-0 transition-all duration-300 shrink-0">
      <Image
        src={skill.img}
        alt={skill.name}
        width={28}
        height={28}
        className="max-w-full max-h-full object-contain"
      />
    </div>
    <span className="text-sm font-semibold text-gray-400 group-hover:text-green-400 transition-colors whitespace-nowrap">
      {skill.name}
    </span>
  </motion.div>
);

const MarqueeRow = ({ items, reverse = false }) => {
  // Repeat items many times to ensure no gaps even on ultra-wide screens
  const repeated = [...items, ...items, ...items, ...items, ...items, ...items];
  return (
    <div className="overflow-hidden w-full select-none py-2">
      <div className={`flex gap-4 w-max will-change-transform ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}>
        {repeated.map((skill, i) => (
          <SkillChip key={`${skill.name}-${i}`} skill={skill} />
        ))}
      </div>
    </div>
  );
};

const MySkills = () => {
  const containerRef = useRef(null);
  useSectionReveal(containerRef, { target: ".reveal-item", stagger: 0.08, start: "top 95%", y: 15 });

  return (
    <section
      ref={containerRef}
      className="py-24 bg-dark-bg border-t border-gray-800/50 overflow-hidden"
      id="skills"
    >
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-16 reveal-item">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Technical <span className="text-emerald-500">Competencies</span>
          </h2>
          <p className="text-gray-400">
            Core technologies and tools I leverage to build scalable frontend
            architectures and robust backend systems.
          </p>
        </div>
      </div>

      {/* Full-bleed marquee rows (no container constraint) */}
      <div className="flex flex-col gap-5 reveal-item">
        <MarqueeRow items={row1} reverse={false} />
        <MarqueeRow items={row2} reverse={true} />
      </div>
    </section>
  );
};

export default MySkills;
