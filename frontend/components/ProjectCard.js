import Image from 'next/image';
import Link from 'next/link';

export default function ProjectCard({ title, description, image, codeLink, projectLink }) {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', width: '300px', margin: '1rem' }}>
      {image && (
        <div style={{ position: 'relative', height: '180px' }}>
          <Image src={image} alt={title} fill style={{ objectFit: 'cover' }} />
        </div>
      )}
      <div style={{ padding: '1rem' }}>
        <h3>{title}</h3>
        <p>{description}</p>
        <p>
          {codeLink && (
            <a href={codeLink} target="_blank" rel="noopener noreferrer">Source</a>
          )}
          {projectLink && (
            <>
              {' '}|{' '}
              <Link href={projectLink}>Details</Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
