const express = require('express');
const fs = require('fs');
const app = express();
const http = require('http').createServer(app);

app.use(express.json());
app.use(express.static(__dirname + '/public'));

// 🔒 PASSWORDS: Aapka 'Rani' aur aapki GF ka 'History'
const PASSWORD_BOYFRIEND = "Rani";    
const PASSWORD_GIRLFRIEND = "History"; 
const MESSAGES_FILE = './messages.json';

function getMessages() {
    if (!fs.existsSync(MESSAGES_FILE)) return [];
    return JSON.parse(fs.readFileSync(MESSAGES_FILE));
}

function saveMessages(msgs) {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(msgs, null, 2));
}

app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === PASSWORD_BOYFRIEND) {
        res.json({ success: true, role: "Boyfriend" });
    } else if (password === PASSWORD_GIRLFRIEND) {
        res.json({ success: true, role: "Girlfriend" });
    } else { res.status(401).json({ success: false, message: "Wrong Code!" }); }
});

app.post('/api/get-messages', (req, res) => {
    const { password } = req.body;
    if (password !== PASSWORD_BOYFRIEND && password !== PASSWORD_GIRLFRIEND) {
        return res.status(401).send("Unauthorized");
    }
    res.json(getMessages());
});

app.post('/api/send-message', (req, res) => {
    const { password, text } = req.body;
    let sender = "";
    if (password === PASSWORD_BOYFRIEND) sender = "Boyfriend";
    else if (password === PASSWORD_GIRLFRIEND) sender = "Girlfriend";
    else return res.status(401).send("Unauthorized");

    if (!text.trim()) return res.json({ success: false });
    const msgs = getMessages();
    msgs.push({
        sender: sender, text: text,
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    });
    saveMessages(msgs);
    res.json({ success: true });
});

app.post('/api/clear-chat', (req, res) => {
    const { password } = req.body;
    if (password !== PASSWORD_BOYFRIEND && password !== PASSWORD_GIRLFRIEND) { return res.status(401).send("Unauthorized"); }
    saveMessages([]);
    res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, '0.0.0.0', () => console.log(`Server running`));
