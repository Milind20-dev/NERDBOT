import express from "express";
import cors from "cors";
import ImageKit from "imagekit";
import mongoose from "mongoose";
import Chat from "./models/chat.js";
import UserChats from "./models/userChats.js";
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node'





const port = process.env.PORT || 3000;
const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials:true}));
app.use(express.json());

const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO);
        console.log("Connected to database");
        app.listen(port, () => {
            console.log(`Server running on ${port}`);
        });
    } catch (err) {
        console.log("Database connection error:", err);
    }
};

const imagekit = new ImageKit({
    urlEndpoint: process.env.IMAGE_KIT_ENDPOINT,
    publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
    privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
});

app.get("/api/upload", (req, res) => {
    const result = imagekit.getAuthenticationParameters();
    res.send(result);
});

/*app.get("/api/test", ClerkExpressRequireAuth(),(req,res) => {
    const userId = req.auth.userId;
    console.log(userId);
    res.send("Success");
});*/

app.post("/api/chats", ClerkExpressRequireAuth(), async (req, res) => {

    const userId = req.auth.userId;
    const { text } = req.body;

    if (!userId || !text) {
        return res.status(400).send({ error: "userId and text are required" });
    }
  
    try {
        const newChat = new Chat({
            userId,
            history: [{ role: "user", parts: [{ text }] }],
        });

        const savedChat = await newChat.save();

        const userChats = await UserChats.findOne({ userId });

        if (!userChats) {
            const newUserChats = new UserChats({
                userId,
                chats: [{ _id: savedChat._id, title: text.substring(0, 40) }],
            });
            await newUserChats.save();
        } else {
            await UserChats.updateOne(
                { userId },
                {
                    $push: {
                        chats: { _id: savedChat._id, title: text.substring(0, 40) },
                    },
                }
            );
        }

        res.status(201).send(savedChat._id);
    } catch (err) {
        console.log(err);
        res.status(500).send({ error: "Error creating chat", details: err.message });
    }
});


app.get("/api/userchats", ClerkExpressRequireAuth(), async(req,res) => {
    const userId = req.auth.userId;


    try{

        const userChats = await UserChats.find({userId});

        res.status(200).send(userChats[0].chats);

    }catch(err){
        console.log(err);
        res.status(500).send({ error: "Error fetching  userchats", details: err.message });
    }


});



app.get("/api/chats/:id", ClerkExpressRequireAuth(), async (req, res) => {
    const userId = req.auth.userId;
    try {
        const chat = await Chat.findOne({ _id: req.params.id, userId });
        if (!chat) {
            return res.status(404).send({ error: "Chat not found" });
        }
        res.status(200).send(chat);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Error fetching chat" });
    }
});



app.put("/api/chats/:id", ClerkExpressRequireAuth(), async (req, res) => {
    const userId = req.auth.userId;

    const { question, answer, img} = req.body;



    const newItems = [
        ...( question ? [{role: "user", parts: [{text:question}], ...(img && {img}) }] : []),
    ]



    try {

        const updatedChat = await Chat.updateOne({_id: req.params.id, userId},
            {
            $push: {
                history: {
                    $each: newItems
                },
            },
        });

        res.status(200).send(updatedChat);
    }catch(err){
        console.error(err);
        res.status(500).send({ error: "Error adding conversation!" });

    }
})






app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(401).send('Unauthenticated!')
  });



connect();
