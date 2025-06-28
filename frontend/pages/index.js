import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProjectCard from '../components/ProjectCard';
import Schedule from '../components/Schedule';

const projects = [
  {
    title: 'Crypto Trading Bot',
    description: 'Python automation for algorithmic trading using the Binance API.',
    image: '/pic01.jpg',
    codeLink: 'https://github.com/Ninvaxx/crypto-trading-bot',
    projectLink: '/projects/crypto-trading-bot.html',
  },
  {
    title: 'Barcode Catalog',
    description: 'iOS app to track store inventory with Swift.',
    image: '/pic02.jpg',
    codeLink: 'https://github.com/Ninvaxx/barcode-catalog',
    projectLink: '/projects/barcode-catalog.html',
  },
  {
    title: 'Independent Study',
    description: 'Self‑taught Python, Swift and network configuration.',
    image: '/pic04.jpg',
    codeLink: 'https://github.com/Ninvaxx',
    projectLink: '/projects/independent-study.html',
  },
];

export default function Home() {
  return (
    <>
      <Head>
        <title>Ninvax</title>
        <meta name="description" content="Ninvax modern site" />
        <link rel="icon" href="/logo.svg" />
      </Head>
      <Navbar />
      <main style={{ padding: '2rem' }}>
        <h1 style={{ textAlign: 'center' }}>Welcome to Ninvax</h1>
        <p style={{ textAlign: 'center' }}>
          Cybersecurity specialist, nuclear Navy veteran and data analyst. I build
          and break systems to protect what matters and design tools for minds like
          mine.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          {projects.map((proj) => (
            <ProjectCard key={proj.title} {...proj} />
          ))}
        </div>
        <Schedule />
      </main>
      <Footer />
    </>
  );
}
