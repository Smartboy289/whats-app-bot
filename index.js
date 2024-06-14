

async function main() {


    const qrcode = require('qrcode-terminal');
    const axios = require('axios');
    const express = require('express');
    require("dotenv").config();

    const OpenAIApi = require("openai");
    const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js')
    

    const client = new Client({
        authStrategy: new LocalAuth(),
    });
    const openai = new OpenAIApi.OpenAI({
        key: process.env.OPENAI_API_KEY,
    });
    const app = express();
    app.use(express.json());
    const port = process.env.PORT || 5000;
    app.listen(port, ()=> console.log(`Server is listening on port ${port}`));

    client.on('qr', (qr) => {
        qrcode.generate(qr, { small: true });
    });

    // ///////
    const welcomeMessage = {
        role: 'system',
        content: 'You are Bruce Wane, batman. But you\'ll act as a comedy character as if this was a parody. You\'ll greet as bruce wane and give some hints in a funny way as if you are batman, the idea is to make the user laugh when they know is a silly batman character ',
      }

    const messages = {}; 

    function saveMessage(id, role, content) {
        if (!messages[id]) messages[id] = [welcomeMessage]
        messages[id].push({
            role, content
        });
        return messages[id];
    }

    function getMessage(id) {
        return messages[id];
    }

    let chatlog;

    client.on('ready', async () => {
        console.log('Client is ready!');
        chatlog = await getUnreadMsg(client);
        
    });




    async function getUnreadMsg(client) {
        try {
          const allChats = await client.getChats();
          console.log(allChats);
          return allChats;
        } catch (e) {
          console.error(e);
        }
      }

    client.on('message', async message => {
        const content = message.body

        try{
          let chatMessages = saveMessage(message.from, "user", content); 
          const chatCompletion = await openai.chat.completions.create({
          messages: chatMessages,
          temperature: 0,
          model: 'gpt-3.5-turbo',
        });

            const response = chatCompletion?.choices[0]?.message.content;
            // Send the generated text as a message

        
            saveMessage(message.from, 'assistant', response)
            console.log(messages)
            client.sendMessage(message.from, response);
        }
            catch(error){
                return console.error(error)

            }
        
    });

    client.initialize();
}

main().catch(error => {
  console.error(error);
});


