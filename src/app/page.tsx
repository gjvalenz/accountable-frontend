'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import context from './context'
import { auth_post, auth_get, plain_get, plain_post } from '../../util/auth'

const Login = ({ setToken }: { setToken: (s: string) => void }) => {
  const [ email, setEmail ] = useState('')
  const [ password, setPassword ] = useState('')
  const fun = async function()
  {
    const res = await plain_post('/Account/login', {email, password})
    const json = await res.json()
    if(res.ok)
    {
      localStorage.setItem('token', json.authenticationToken)
      setToken(json.authenticationToken)
    }
  }
  return (
    <div>
      Email: <input type='text' name='email' value={email} onChange={(e) => setEmail(e.target.value)} />
      Password: <input type='text' name='password' value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={() => fun()}>submit</button>
    </div>
  )
}

const Data = () => {
  const [ data, setData ] = useState('')
  const fun = async function()
  {
    const res = await auth_get('/Account/')
    const json = await res.json()
    setData(JSON.stringify(json))
  }
  return (
    <>
      <p>Data here: {data}</p>
      <button onClick={() => fun()}>Get Data</button>
    </>
  )
}

const Logout = ({ setToken }: { setToken: (s: string) => void } ) => {
  const fun = async function()
  {
    const res = await auth_get('/Account/logout')
    if(res.ok)
    {
      localStorage.removeItem('token')
      setToken('')
    }
  }
  return (
    <div>
      <button onClick={() => fun()}>logout</button>
    </div>
  )
}

export default function Home() {
  const [token, setToken] = useState('');
  useEffect(()=>{
    (function(){
      if(context())
        setToken(context()!)
    })();
  }, []);
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {!token && <Login setToken={setToken} />}
      {token && 
      <>
        <Data />
        <Logout setToken={setToken} />
      </>}
    </main>
  )
}
