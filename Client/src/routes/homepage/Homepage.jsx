import { Link } from 'react-router-dom'
import './homepage.css'
import { TypeAnimation } from 'react-type-animation'
import { useState } from 'react'
const Homepage=()=>{


    const[typingStatus,setTypingStatus]=useState("Human1")



    return(
        <div className='homepage'>
            <img src="/orbital.png" alt="" className='orbital' />
            <div className="left">
                <h1>NERD-BOT</h1>
                <h2>Supercharge Your Creativity and Productivity</h2>
                <h3>NerdBot is an intelligent chatbot designed to provide quick, 
                    knowledgeable responses across various topics, tailored for tech 
                    enthusiasts and learners.
                </h3>
                <Link to="/dashboard">Get Started</Link>
            </div>
            <div className="right">
                <div className="imgContainer">
                    <div className="bgContainer">
                        <div className="bg"></div>
                    </div>
                    <img src="/bot.png" alt="" className='bot' />
                    <div className="Chat">
                        <img src={typingStatus==="Human1" ? "/human1.jpeg": typingStatus==="Human2" ? "/human2.jpeg": "/bot.png"}alt="" />
                    <TypeAnimation 
      sequence={[
        // Same substring at the start will only be typed out once, initially
        'Human:what is react in one line',
        1000, ()=>{
            setTypingStatus("bot")
        },
        'Bot:React is a JavaScript library for building user interfaces',
        1000,()=>{
            setTypingStatus("Human2")
        },
        'Human2:what is express in one line',
        1000,()=>{
            setTypingStatus("bot")
        },
        'Bot:Express is a minimal, flexible Node.js web application framework ',
        1000,()=>{
            setTypingStatus("Human1")
        },
      ]}
      wrapper="span"
      repeat={Infinity}
      cursor={true}
      omitDeletionAnimation={true}
                         />
                    </div>
                </div>
                <div className="terms">
                    <img src="/logo.png" alt="" />
                    <div className="links">
                        <Link to="/">Terms of sevice</Link>
                        <Link to="/">Privacy Policy</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Homepage