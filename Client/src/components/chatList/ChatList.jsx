
import { Link } from 'react-router-dom'
import './chatList.css'
import { useQuery } from '@tanstack/react-query'
const ChatList=()=>{


    const { isPending, error, data } = useQuery({
        queryKey: ['userChats'],
        queryFn: () =>
          fetch(`${import.meta.env.VITE_API_URL}/api/userchats`, {
            credentials:"include",
          }).then((res) =>
            res.json(),
          ),
      })

      const safeData = Array.isArray(data) ? data : []


    return(
        <div className='chatList'>
            <span className='title'>DASHBOARD</span>
            <Link to="/dashboard"> Create a new chat</Link>
            <Link to="/"> Explore Nerd-Bot</Link>
            <Link to="/"> Contact</Link>
            <hr/>
            <div className="title">RECENT CHATS</div>
            <div className='list'>
               { isPending ? "Loading.." : error ? "Something went wrong" : safeData.map((chat) => (
                 <Link to={`/dashboard/chats/${chat._id}`} key={chat._id}>
                    {chat.title}
                 </Link>
               ))};
            </div>
            <hr/>
            <div className="upgrade">
                <img src="/logo.png" alt="" />
                <div className="texts">
                    <span>Upgrade your Nerd-Bot to pro</span>
                    <span>Get unlimited accessto all features</span>
                </div>
            </div>
        </div>
    )
}

export default ChatList