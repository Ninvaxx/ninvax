import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getAllPosts, getPostBySlug } from '../../lib/posts';

export default function Post({ post }) {
  return (
    <>
      <Navbar />
      <main style={{ padding: '2rem' }}>
        <h1>{post.title}</h1>
        <p>{post.date}</p>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </main>
      <Footer />
    </>
  );
}

export async function getStaticPaths() {
  const posts = getAllPosts();
  const paths = posts.map((post) => ({ params: { slug: post.slug } }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const post = getPostBySlug(params.slug);
  return { props: { post } };
}
