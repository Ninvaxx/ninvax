import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email, password})
    });
    if (res.ok) router.push('/dashboard');
    else alert('Login failed');
  }

  return (
    <form onSubmit={handleSubmit} style={{padding:'2rem'}}>
      <h1>Login</h1>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <br />
      <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
      <br />
      <button type="submit">Login</button>
    </form>
  );
}
