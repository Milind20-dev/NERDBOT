import { useEffect, useRef, useState } from 'react';
import './newPrompt.css';
import Upload from '../upload/Upload';
import { IKImage } from 'imagekitio-react';
import model from '../../lib/gemini';
import Markdown from "react-markdown"
import { useMutation, useQueryClient } from '@tanstack/react-query';

const NewPrompt = ({data}) => {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");

    const [img, setImg] = useState({
        isLoading: false,
        error: "",
        dbData: {},
        aiData: {}
    });
    

    const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: "Hello" }],
          },
          {
            role: "model",
            parts: [{ text: "Great to meet you. What would you like to know?" }],
          },
        ],
      });

    const endRef = useRef(null);
    const formRef = useRef(null);
    useEffect(() => {
        endRef.current.scrollIntoView({ behavior: "smooth" });
    }, [data,question,answer,img.dbData]);



    const queryClient = useQueryClient()





    const mutation = useMutation({
        mutationFn: () => {
            return fetch(`${import.meta.env.VITE_API_URL}/api/chats/${data._id}`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({question: question.length ? question:undefined,
                    answer,
                    img: img.dbData?.filePath || undefined,
                })
            }).then((res) => res.json());

        },
        onSuccess: () => {
          // Invalidate and refetch
          queryClient.invalidateQueries({ queryKey: ['chat', data._id] }).then(() => {
            formRef.current.reset()
            setQuestion ("");
            setImg({
                isLoading: false,
                error: "",
                dbData: {},
                aiData: {}
            });
          });
        },

        onError: (err) => {
            console.log(err);
        },

      });





    const add = async (text, isInitial) => {
        if(!isInitial) setQuestion(text);

        try{
           const result = await chat.sendMessageStream(Object.entries(img.aiData).length ? [img.aiData,text]: [text]);
           let accumulatedText = " ";
           for await (const chunk of result.stream) {
            const chunkText =chunk.text();
            console.log(chunkText);
            accumulatedText += chunkText;
            setAnswer( accumulatedText);
           }

           mutation.mutate();

        }catch(err) {
            console.log(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const text = e.target.text.value;
        if (!text) return;
        add(text,false);

        
    };

    useEffect(() => {
        if(data?.history?.length === 1) {
            add(data.history[0].parts[0].text, true);
        }
    },[])

    return (
        <div className="newPrompt">
            {img.isLoading && <div>Loading...</div>}
            {img.dbData?.filePath && (
                <IKImage
                    urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
                    path={img.dbData?.filePath}
                    width="350"
                    transformation={[{ width: 350 }]}
                />
            )}
            {question && <div className="message user">{question}</div>}
            {answer && <div className="message"><Markdown>{answer}</Markdown></div>}

            <div className="endChat" ref={endRef}></div>
            <form className="newform" onSubmit={handleSubmit} ref={formRef}>
                <Upload setImg={setImg} />
                <input id="file" type="file" multiple={false} hidden />
                <input type="text" name="text" placeholder="what can i help with..." />
                <button>
                    <img src="/arrow.png" alt="" />
                </button>
            </form>
        </div>
    );
};

export default NewPrompt;
/*import { useEffect, useRef, useState } from 'react';
import './newPrompt.css';
import Upload from '../upload/Upload';
import { IKImage } from 'imagekitio-react';
import model from '../../lib/gemini';
import Markdown from "react-markdown"
import { useMutation, useQueryClient } from '@tanstack/react-query';

const NewPrompt = ({ data }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const [img, setImg] = useState({
    isLoading: false,
    error: "",
    dbData: {},
    aiData: {}
  });

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "Hello" }],
      },
      {
        role: "model",
        parts: [{ text: "Great to meet you. What would you like to know?" }],
      },
    ],
  });

  const endRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data, question, answer, img.dbData]);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chats/${data._id}`, {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: question.length ? question : undefined,
            answer,
            img: img.dbData?.filePath || undefined,
          }),
        });
        return await response.json();
      } catch (error) {
        console.error(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', data._id] }).then(() => {
        formRef.current.reset();
        setQuestion("");
        setImg({
          isLoading: false,
          error: "",
          dbData: {},
          aiData: {}
        });
      });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const add = async (text, isInitial) => {
    if (!isInitial) setQuestion(text);

    try {
      const result = await chat.sendMessageStream(Object.entries(img.aiData).length ? [img.aiData, text] : [text]);
      let accumulatedText = "";
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        console.log(chunkText);
        accumulatedText += chunkText;
        setAnswer(accumulatedText);
      }

      mutation.mutate();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = e.target.text.value;
    if (!text) return;
    add(text, false);
  };

  useEffect(() => {
    if (data?.history?.length === 1) {
      add(data.history[0].parts[0].text, true);
    }
  }, [])

  return (
    <div className="newPrompt">
      {img.isLoading && <div>Loading...</div>}
      {img.dbData?.filePath && (
        <IKImage
          urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
          path={img.dbData?.filePath}
          width="350"
          transformation={[{ width: 350 }]}
        />
      )}
      {question && <div className="message user">{question}</div>}
      {answer && <div className="message"><Markdown>{answer}</Markdown></div>}

      <div className="endChat" ref={endRef}></div>
      <form className="newform" onSubmit={handleSubmit} ref={formRef}>
        <Upload setImg={setImg} />
        <input id="file" type="file" multiple={false} hidden />
        <input type="text" name="text" placeholder="what can i help with..." />
        <button>
          <img src="/arrow.png" alt="" />
        </button>
      </form>
    </div>
  );
};

export default NewPrompt;*/
