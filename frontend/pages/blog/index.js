import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getAllPosts } from '../../lib/posts';

export default function Blog({ posts }) {
  return (
    <>
      <Navbar />
      <main style={{ padding: '2rem' }}>
        <h1>Blog</h1>
        <ul>
          {posts.map((post) => (
            <li key={post.slug} style={{ marginBottom: '1rem' }}>
              <h2>
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p>{post.date}</p>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  );
}

export async function getStaticProps() {
  const posts = getAllPosts();
  return { props: { posts } };
}
