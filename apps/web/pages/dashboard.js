import useSWR from 'swr';
import Navbar from '../components/Navbar';

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function Dashboard() {
  const { data } = useSWR('/api/data', fetcher);
  if (!data) return <div>Loading...</div>;

  return (
    <>
      <Navbar />
      <div style={{padding:'2rem'}}>
        <h1>Dashboard</h1>
        <h2>Mood Logs</h2>
        <ul>
          {data.mood_logs.map(m => (
            <li key={m.id}>{m.mood} - {m.score}</li>
          ))}
        </ul>
        <h2>Journal Entries</h2>
        <ul>
          {data.journal_entries.map(j => (
            <li key={j.id}>{j.content}</li>
          ))}
        </ul>
        <h2>Assistant Actions</h2>
        <ul>
          {data.assistant_actions.map(a => (
            <li key={a.id}>{a.action}</li>
          ))}
        </ul>
      </div>
    </>
  );
}
