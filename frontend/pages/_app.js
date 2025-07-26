import Head from 'next/head';
import Script from 'next/script';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-sA+9cx4vXK6D8W1+D3OdqfPF41ZJLdnOjFkWDXM8mY4="
          crossOrigin=""
        />
      </Head>
      <Script
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-oE8A2s36NVRWTVD2p4sxF1nQ37knKKSY9yDPZU9HgGU="
        crossOrigin=""
      />
      <Component {...pageProps} />
    </>
  );
}
