import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <>
      <Head>
        <title>Ninvax</title>
        <meta name="description" content="Ninvax modern site" />
      </Head>
      <Navbar />
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Welcome to Ninvax</h1>
        <p>Site under construction.</p>
      </main>
      <Footer />
    </>
  );
}
