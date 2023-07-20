'use client'
import Image from 'next/image'
import { ChangeEvent, useEffect, useState } from 'react'
import context from './context'
import { auth_post, auth_post_form, auth_get, plain_get, plain_post, plain_post_form } from '../../util/auth'

const empty_profile_pic = 'https://i.ibb.co/VHWWb2s/cropped.jpg' // use this for default in app

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

const Register = ({ setToken }: { setToken: (s: string) => void }) => {
  const [ email, setEmail ] = useState('')
  const [ password, setPassword ] = useState('')
  const [ name, setName ] = useState('')
  const [ height, setHeight ] = useState(0)
  const [ weight, setWeight ] = useState(0)
  const [ about, setAbout ] = useState('')
  const [ gender, setGender ] = useState('n')
  const [ image, setImage ] = useState<File|undefined>()
  const [ error, setError ] = useState('')
  const attempt_register = async function()
  {
    let form = new FormData()
    form.append('Email', email)
    form.append('Password', password)
    form.append('Name', name)
    form.append('Weight', weight.toString())
    form.append('Height', height.toString())
    form.append('About', about)
    form.append('Gender', gender)
    if(image)
      form.append('Photo', image)
    const res = await plain_post_form('/Account/register', form)
    const json = await res.json()
    if(res.ok)
    {
      setError('')
      localStorage.setItem('token', json.authenticationToken)
      setToken(json.authenticationToken)
    }
    else
    {
      setError(res.statusText)
    }
  }
  return (
    <div className='mt-12'>
      Email: <input type='text' name='email' value={email} onChange={(e) => setEmail(e.target.value)} />
      Password: <input type='text' name='password' value={password} onChange={(e) => setPassword(e.target.value)} />
      Name: <input type='text' name='name' value={name} onChange={(e) => setName(e.target.value)} />
      Height: <input type='number' name='height' value={height} onChange={(e) => setHeight(Number(e.target.value))} />
      Weight: <input type='number' name='weight' value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
      About: <input type='text' name='about' value={about} onChange={(e) => setAbout(e.target.value)} />
      Gender:
      <select name='gender' value={gender} onChange={(e) => setGender(e.target.value)}>
        <option value='m'>Male</option>
        <option value='f'>Female</option>
        <option value='n'>Non-Binary</option>
      </select>
      Profile Pic: <input type='file' onChange={(e) => e.target.files? setImage(e.target.files[0]) : null} required/>
      <button onClick={() => attempt_register()}>submit</button>
      {error && <p>Error: {error}</p>}
    </div>
  )
}

const Nav = ({userData}: {userData: any}) => {
  console.log(userData)
  return ( !userData.profilePicture ? <></> : 
    <nav className='flex flex-row justify-center'>
      {userData.profilePicture && <img src={photoToSmall(userData.profilePicture)} />}
      {!userData.profilePicture && <img src={empty_profile_pic} />}
      <p>{userData.name}</p>
    </nav>
  )
}

const Upload = () => {
  const [ file, setFile ] = useState<File|undefined>()
  const [ result, setResult ] = useState("")
  const upload = async function()
  {
    if(file)
    {
      let data = new FormData()
      data.append('Image', file)
      const res = await auth_post_form("/Photos/profilePhoto", data)
      const json = await res.json()
      setResult(JSON.stringify(json))
    }
  }
  return (
    <>
      <input type='file' onChange={(e) => e.target.files? setFile(e.target.files[0]) : null} />
      <button onClick={() => upload()}>Change PFP</button>
      <p>{file?.toString()}</p>
      <p>Result: { result }</p>
    </>
  )
}

const NewPost = () => {
  const [ content, setContent ] = useState('')
  const [ photo1, setPhoto1 ] = useState<File|undefined>()
  const [ photo2, setPhoto2 ] = useState<File|undefined>()
  const [ photo3, setPhoto3 ] = useState<File|undefined>()
  const [ result, setResult ] = useState('')
  const upload = async function()
  {
    if(content)
    {
      let data = new FormData()
      data.append('Content', content)
      if(photo1)
        data.append('Photo1', photo1)
      if(photo2)
        data.append('Photo2', photo2)
      if(photo3)
        data.append('Photo3', photo3)
      const res = await auth_post_form("/Posts/post", data)
      const json = await res.json()
      setResult(JSON.stringify(json))
    }
  }
  return (
    <>
      About: <input type='text' value={content} onChange={(e) => setContent(e.target.value)} />
      <input type='file' onChange={(e) => e.target.files? setPhoto1(e.target.files[0]) : null} />
      <input type='file' onChange={(e) => e.target.files? setPhoto2(e.target.files[0]) : null} />
      <input type='file' onChange={(e) => e.target.files? setPhoto3(e.target.files[0]) : null} />
      <button onClick={() => upload()}>Create New Post</button>
      <p>Result: { result }</p>
    </>
  )
}

const Logout = ({ setToken }: { setToken: (s: string) => void } ) => {
  const fun = async function()
  {
    const res = await auth_get('/Account/logout')
    localStorage.removeItem('token')
    setToken('')
  }
  return (
    <div>
      <button onClick={() => fun()}>logout</button>
    </div>
  )
}

interface IComment
{
  id: number;
  userId: number;
  content: string;
  createdAt: string;
  replyToKey: number;
  replyType: number;
  username: string;
  userPhoto: string|undefined;
  subRepliesCount: number;
}

const ReplyComment = ({ id, userId, content, createdAt, replyToKey, replyType, username, userPhoto, subRepliesCount }: IComment) => {
  return (
    <>
    Id: {id}
    From: { username } / {userId}
    {userPhoto && <img src={photoToSmall(userPhoto)} className='max-h-10'/>}
    {!userPhoto && <img src={empty_profile_pic} className='max-h-10'/>}
    Content: {(new Buffer(content, 'base64')).toString('utf8')}
    Created At: { createdAt }
    </>
  )
}

const Comment = ({ id, userId, content, createdAt, replyToKey, replyType, username, userPhoto, subRepliesCount }: IComment) => {
  const [ replies, setReplies ] = useState<IComment[]>([])
  const [ replyContent, setReplyContent ] = useState('')
  const loadCommentReplies = async () => {
    const res = await plain_get(`/Comments/${id}/subReplies`)
    const json = await res.json()
    setReplies(json)
  }
  const postNewComment = async () => {
    let data = new FormData()
    data.append('Content', replyContent)
    data.append('ReplyKind', '2')
    data.append('PostOrCommentId', id.toString())
    const res = await auth_post_form('/Comments/post', data)
    const json = await res.json()
    alert(JSON.stringify(json))
  }
  return (
    <>
    Id: {id}
    From: { username } / {userId}
    {userPhoto && <img src={photoToSmall(userPhoto)} className='max-h-10'/>}
    {!userPhoto && <img src={empty_profile_pic} className='max-h-10'/>}
    Content: {(new Buffer(content, 'base64')).toString('utf8')}
    Created At: { createdAt }
    Replies: {subRepliesCount}
    { (subRepliesCount > 0 && replies.length < 1) && <p onClick={() => loadCommentReplies()}>Load {subRepliesCount} replies</p> }
    { replies.length > 0 && replies.map(reply => <ReplyComment {...reply} />)}
    Reply Comment:
    <input type='text' value={replyContent} onChange={(e) => setReplyContent(e.target.value)} />
    <button onClick={() => postNewComment()}>Reply</button>
    </>
  )
}

const Comments = ({ postID }: { postID: number}) => {
  const [ comments, setComments ] = useState<IComment[]>([])
  const [ remainingCount, setRemainingCount ] = useState(0)
  const grab_all_tl_comments = async () => {
    const res = await plain_get(`/Comments/${postID}/topLevelAll`)
    const json = await res.json()
    setComments(json)
    setRemainingCount(0)
  }
  useEffect(() => {
    const grab_some_tl_comments = async() => {
      const res = await plain_get(`/Comments/${postID}/topLevel`)
      const json = await res.json()
      setComments(json.comments)
      setRemainingCount(json.remaining)
    }
    grab_some_tl_comments()
  }, [])
  return (
    <>
      { remainingCount > 0 && <p onClick={() => grab_all_tl_comments()}>See {remainingCount} more comments</p>}
      { comments.map(comment => <Comment {...comment} />)}
    </>
  );
}

const Post = ({ id, userId, likes, content, postPhoto1, postPhoto2, postPhoto3, createdAt, liked, username, userPhoto } : { id: number,  userId: number, likes: number, content: string, postPhoto1: string|undefined, postPhoto2: string|undefined, postPhoto3: string|undefined, createdAt: string, liked: boolean, username: string, userPhoto: string|null }) => {
  const [ like, setLiked ] = useState(liked)
  const [ replyContent, setReplyContent ] = useState('')
  const likePost = async () => {
    const res = await auth_get(`/Posts/${id}/like`)
    const json = await res.json()
    setLiked(json.liked)
  }
  const postNewComment = async () => {
    let data = new FormData()
    data.append('Content', replyContent)
    data.append('ReplyKind', '1')
    data.append('PostOrCommentId', id.toString())
    const res = await auth_post_form('/Comments/post', data)
    const json = await res.json()
    alert(JSON.stringify(json))
  }
  return (
    <>
    ID: {id}
    From: {userId}
    {userPhoto && <img src={photoToSmall(userPhoto)} className='max-h-10'/>}
    {!userPhoto && <img src={empty_profile_pic} className='max-h-10'/>}
    <p>{username}</p>
    Content: {(new Buffer(content, 'base64')).toString('utf8')}
    {postPhoto1 && <img src={postPhoto1} className='max-h-64' />}
    {postPhoto2 && <img src={postPhoto2} className='max-h-64' />}
    {postPhoto3 && <img src={postPhoto3} className='max-h-64' />}
    Likes: {likes}
    Created: {createdAt}
    {like && <span onClick={() => likePost()}>❤️</span>}
    {!like && <span onClick={() => likePost()}>🖤</span>}
    Comments:
    <Comments postID={id} />
    Reply Post:
    <input type='text' value={replyContent} onChange={(e) => setReplyContent(e.target.value)} />
    <button onClick={() => postNewComment()}>Reply</button>
    </>
  )
}

const Posts = () => {
  const [ posts, setPosts ] = useState<any[]>([])
  const grabPosts = async () => {
    const res = await auth_get(`/Posts/${new Date(Date.now()).toISOString()}`)
    const json = await res.json()
    setPosts(json)
  }
  useEffect(() => {
    grabPosts()
  }, [])
  return (
    <>
    Posts:
    {posts.map(p => <Post {...p}/>)}
    </>
  );
}

const MessageDisplay = ({ messageInfo, onClick, userData }: { messageInfo: any, onClick: (m: any) => void, userData: any }) => {
  const display = messageInfo.messages[messageInfo.messages.length-1]
  const [ read, setRead ] = useState<boolean>(display.read)
  const who = display.userId == userData.id ? 'You' : messageInfo.username
  const workToDo = async () => {
    if(userData.id == display.toUserId)
    {
      const res = await auth_get(`/Messages/${display.id}/read`)
      const readDat = await res.json()
      if(readDat)
      {
        setRead(readDat.read)
      }
    }
    onClick(messageInfo)
  }
  return (
  <div onClick={() => workToDo()}>
    {messageInfo.userPhoto && <img src={photoToSmall(messageInfo.userPhoto)} className='max-h-8 object-contain rounded-full' /> }
    <p>{messageInfo.username}</p>
    <p className={ read ? '' : 'font-bold' }>{who}:{(new Buffer(display.content, 'base64')).toString('utf8')}</p>
  </div>)
}

const Dialogue = ({ context, userData } : { context: any, userData: any }) => {
  const [ messageContent, setMessageContent ] = useState('')
  const [ messages, setMessages ] = useState<any[]>([context.messages[context.messages.length-1]])
  const [ mostRecentId, setMostRecentId ] = useState<number>(context.messages[context.messages.length-1].id)
  const [ mostPastId, setMostPastId ] = useState<number>(context.messages[context.messages.length-1].id)
  const updateMessages = async () => {
    const res = await auth_get(`/Messages/subscribeAfter/${ mostRecentId }`)
    const newMessages = await res.json()
    if(newMessages.length > 0)
    {
      /*
      console.log('---message subscribe update---')
      console.log(recentMessages)
      recentMessages = [...recentMessages, ...newMessages]
      console.log(recentMessages)
      console.log('---done---')
      mostRecentId = recentMessages[recentMessages.length - 1].id
      setMessages(recentMessages)
      */
      setMostRecentId(newMessages[newMessages.length-1].id)
      setMessages((old) => [...old, ...newMessages])
    }
  }
  const sendMessage = async (id: number) => {
    let data = new FormData()
    data.append('Content', messageContent)
    data.append('ToUserId', id.toString())
    const res = await auth_post_form(`/Messages/post`, data)
    const msg = await res.json()
    if(res.ok)
    {
      setMessageContent('')
      setMostRecentId(msg.id)
      setMessages((msgs) => [...msgs, msg])
      //console.log('---updating messages after post---')
      //console.log(recentMessages)
      // updateMessages()
      //console.log(recentMessages)
      //console.log('---done---')
    }
  }
  const loadSpecificMessages = async () => {
    const res = await auth_get(`/Messages/${ context.userId }/${ mostPastId }/10`) // change this to 150
    const data = await res.json()
    if(data.length > 0)
    {
      /*
      const pastId = data[0].id
      console.log('loading specific info')
      console.log(recentMessages)
      recentMessages = [...data, ...recentMessages]
      console.log(recentMessages)
      console.log('---done---')
      setMessages(recentMessages)
      setMostPastId(pastId)*/
      setMostPastId(data[0].id)
      setMessages((old) => [...data, ...old])
    }
  }
  useEffect(() => {
    loadSpecificMessages()
    let interval = setInterval(() => {
      updateMessages()
    }, 5000)
    return () => clearInterval(interval)
  }, [mostRecentId])
  return (
    <>
        <button onClick={() => loadSpecificMessages()}>Load more dms</button>
        {messages.map(m => <p>{ m.userId == userData.id ? userData.name : context.username }:{(new Buffer(m.content, 'base64')).toString('utf8')}</p>)}
        New Message:
        <input type='text' value={messageContent} onChange={e => setMessageContent(e.target.value)} />
        <button onClick={() => sendMessage(context.userId)}>Message</button>
        Recent ID: {mostRecentId}
    </>
  )
}

const Messages = ({ userData } : { userData: any }) => {
  const [ messageInfos, setMessageInfos ] = useState<any[]>([])
  const [ dialogueContext, setDialgoueContext ] = useState<any>({})
  
  const fetchMessages = async () => {
    const res = await auth_get('/Messages/all/10')
    const msgs = await res.json()
    setMessageInfos(msgs)
  }
  useEffect(() => {
    fetchMessages()
  }, [])
  return (
    <>
    <h1>Messages</h1>
    { messageInfos.map(m => <MessageDisplay messageInfo={m} onClick={(mx) => setDialgoueContext(mx) } userData={userData} />) }
    { Object.keys(dialogueContext).length > 0 && <Dialogue context={dialogueContext} userData={userData} /> }
    </>
  )
}

const NotificationsUpdater = ({ notifications, updateNotifsParent } : { notifications: any[], updateNotifsParent: (n: any[]) => void }) => {
  const BACKOFF = 1000
  const INTERVAL = 2000
  let timeToNext = 0
  let fails = 0
  const [ tm, setTm ] = useState('')
  const [ mostRecentId, setMostRecentId ] = useState<number>(notifications[0].id)
  const updateNotifs = async () => {
    setTm(new Date(Date.now()).toTimeString())
    const res = await auth_get(`/Notifications/subscribeAfter/${mostRecentId}`)
    const notifs = await res.json()
    if(notifs.length > 0)
    {
      fails = 0
      setMostRecentId(notifs[0].id)
      const msg_froms = notifs.filter((n: any) => n.kind == "Message").map((n: any) => n.fromUserId)
      const updated_notifs = [...notifs, ...(notifications.filter(n => !(msg_froms.includes(n.fromUserId) && n.kind == "Message"))) ]
      updateNotifsParent(updated_notifs)
    }
    else
    {
      fails++
    }
  }
  const raf = async (time: number) => {
    if(timeToNext <= time) {
      await updateNotifs()
      timeToNext = Math.min(time + INTERVAL + fails * BACKOFF, time + INTERVAL + 30000)
    }
    requestAnimationFrame(raf)
  }
  useEffect(() => {
    let handle_id = requestAnimationFrame(raf)
    return () => cancelAnimationFrame(handle_id)
  }, [mostRecentId])
  const formatContent = (kind: string, content: string) => {
    if(kind == "CommentSub")
    {
      return "replied '" + (new Buffer(content, 'base64')).toString('utf8') + "'"
    }
    else if(kind == "CommentPost")
    {
      return "commented '" + (new Buffer(content, 'base64')).toString('utf8') + "' on your post"
    }
    else if(kind == "Message")
    {
      return "messaged '" + (new Buffer(content, 'base64')).toString('utf8') + "'"
    }
    else
    {
      return (new Buffer(content, 'base64')).toString('utf8')
    }
  }
  return (
    <>
      <p>Last updated: {tm}</p>
      <p>Recent ID: {mostRecentId}</p>
      { notifications.map(({ id, kind, content, timeSent, keyTo, fromUsername, fromUserId, fromProfilePicture, read }: { id: number, kind: string, content: string, timeSent: string, keyTo: number, fromUsername: string, fromUserId: number, fromProfilePicture: string|undefined, read: boolean }) =>
      <div>
        <p>Notification ID: {id}</p>
        {fromProfilePicture && <img src={photoToSmall(fromProfilePicture)} className='max-h-8 object-contain rounded-full' />}
        {!fromProfilePicture && <img src={empty_profile_pic} className='max-h-8 object-contain rounded-full' />}
        <p>{fromUsername}</p>
        Content: {formatContent(kind, content)}
        <p>When: {timeSent}</p>
        <p>ReferenceID: {keyTo}</p>
        <p>From: {fromUserId}</p>
        <p>Read: {read ? 'true' : 'false'}</p>
      </div>)}
    </>
  )
}

const Notifications = () => {
  const [ notifications, setNotifications ] = useState<any[]>([])
  const fetchNotifs = async () => {
    const res = await auth_get('/Notifications/all')
    const notifs = await res.json()
    if (notifs.length > 0)
    {
      setNotifications([...notifs])
    }
  }
  const readAllNotifications = async () => {
    const res = await auth_get('/Notifications/readAll')
    // const json = await res.json()
  }
  useEffect(() => {
    fetchNotifs()
  }, [])
  console.log(notifications)
  return (
  <>
    { notifications.length > 0 && <NotificationsUpdater notifications={notifications} updateNotifsParent={(notifs) => setNotifications(notifs)} /> }
    <button onClick={() => readAllNotifications()}>Read All</button>
  </>)
}

const photoToSmall = (photo_url: string) => (
  photo_url.replace(photo_url.slice(photo_url.lastIndexOf('.')), '-64' + photo_url.slice(photo_url.lastIndexOf('.')))
)

const UserInfo = ({ user, auth, reload } : { user: any, auth: boolean, reload: () => Promise<void> }) => {
  const [ messageContent, setMessageContent ] = useState('')
  const bmi = (703 * user.weight/(user.height*user.height))
  const mode = ((bmi < 19) ? 0: ((bmi < 25) ? 1 : 2));
  const color = mode == 1 ? 'text-green-600' : 'text-red-600'
  const sendFr = async (id: number) => {
    const res = await auth_get(`/Friends/request/${id}`)
    if(res.ok)
    {
      alert(await res.json())
    }
    reload()
  }
  const removeFriend = async (id: number) => {
    const res = await auth_get(`/Friends/remove/${id}`)
    if(res.ok)
    {
      alert(await res.json())
    }
    reload()
  }
  const removeFr = async (id: number) => {
    const res = await auth_get(`/Friends/removeRequest/${id}`)
    if(res.ok)
    {
      alert(await res.json())
    }
    reload()
  }
  const sendMessage = async (id: number) => {
    let data = new FormData()
    data.append('Content', messageContent)
    data.append('ToUserId', id.toString())
    const res = await auth_post_form(`/Messages/post`, data)
    if(res.ok)
    {
      alert(await res.json())
      setMessageContent('')
    }
  }
  if(!auth)
    return (
    <div className='mb-4'>
      { user.profilePicture ?
        <img src={photoToSmall(user.profilePicture)} /> : 
        <img src={empty_profile_pic} />
      }
      <p>{user.name} / {user.gender} / <span className={ color + ' italic font-semibold' }>{ bmi.toFixed(1) }</span></p>
      <p>about: {(new Buffer(user.about, 'base64')).toString('utf8')}</p>
      <p>user since: {user.registered}</p>
      <p>w: {user.weight}, h: {user.height} </p>
      <p>friends: {user.numFriends}</p>
    </div>);
  return (
    <div className='mb-4'>
      { user.profilePicture ?
        <img src={photoToSmall(user.profilePicture)} /> : 
        <img src={empty_profile_pic} /> 
      }
      <p>{user.name} / {user.gender} / <span className={ color + ' italic font-semibold' }>{ bmi.toFixed(1) }</span></p>
      <p>about: {(new Buffer(user.about, 'base64')).toString('utf8')}</p>
      <p>user since: {user.registered}</p>
      <p>w: {user.weight}, h: {user.height} </p>
      <p>friends: {user.numFriends}</p>
      {user.friend ? <p onClick={() => removeFriend(user.id)}>Friend</p>: <>
        {user.sentFr ? <p onClick={() => removeFr(user.id)}>Sent Friend Request</p>: user.receivedFr ? <p onClick={() => sendFr(user.id)}>Accept Friend Request</p>: <p onClick={() => sendFr(user.id)}>Send Friend Request</p>}
      </>}
      Message:
      <input type='text' value={messageContent} onChange={e => setMessageContent(e.target.value)} />
      <button onClick={() => sendMessage(user.id)}>Message</button>
    </div>
  )
}

const UserList = ({ auth } : {auth: boolean}) => {
  const [ users, setUsers ] = useState<any[]>([])
  const loadUsers = async function()
  {
    const res = auth ? await auth_get('/Users/all') : await plain_get('/Users/')
    const json = await res.json()
    setUsers(json)
  }
  useEffect(() => {
    loadUsers();
  }, [])
  return (
    <>
    UserList:{users.map(user => <UserInfo user={user} auth={auth} reload={loadUsers} />)}
    </>
    
  )
}

export default function Home() {
  const [ token, setToken ] = useState('')
  const [ userData, setUserData ] = useState({})
  const [ loaded, setLoaded ] = useState(false)
  useEffect(()=>{
    (async function(){
      if(context())
      {
        setToken(context()!)
        const res = await auth_get('/Account/')
        if(!res.ok)
        {
          setToken('')
          if(typeof window !== "undefined") {
            localStorage.removeItem('token')
          }
        }
        else
        {
          const json = await res.json()
          setUserData(json)
        }
      }
      setLoaded(true)
    })()
  }, [])
  if (!loaded)
    return (<>Loading...</>);
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {!token && 
      <>
        <Login setToken={setToken} />
        <Register setToken={setToken} />
      </>}
      {token &&
      <>
        <Nav userData={userData}/>
        <Upload />
        <Logout setToken={setToken} />
        <NewPost />
        <Notifications />
        <Posts />
        <Messages userData={userData} />
      </>}
      <UserList auth/>
    </main>
  )
}
