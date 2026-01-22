
// 🔥 設定區：請填入你的 Render 網址 (不含 https://)
// 例如: my-chat-app.onrender.com
const backendUrl = "online-chat-backend-g9mo.onrender.com";

// 變數準備
let socket;
let myName = "";
const wsUrl = "wss://" + backendUrl + "/nigg";

// 進入聊天室
function enterChat() {
    const input = document.getElementById("username-input");
    if (input.value.trim() === "") {
        alert("請輸入名字！");
        return;
    }
    myName = input.value;

    // 切換畫面
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("chat-container").style.display = "flex";

    // 啟動連線
    connectWebSocket();
}

function connectWebSocket() {
    socket = new WebSocket(wsUrl);

    socket.onopen = function () {
        document.getElementById("status-dot").style.color = "#43b581"; // 綠燈
        appendSystemMessage("系統: 連線成功！");
    };

    socket.onmessage = function (event) {
        // 收到訊息，嘗試解析 JSON
        try {
            const data = JSON.parse(event.data);
            appendMessage(data.username, data.message);
        } catch (e) {
            // 如果後端傳來的不是 JSON (例如舊的程式碼)，就當作普通文字處理
            console.log("非 JSON 訊息:", event.data);
            appendMessage("未知", event.data);
        }
    };

    socket.onclose = function () {
        document.getElementById("status-dot").style.color = "red"; // 紅燈
        appendSystemMessage("系統: 連線已斷開，嘗試重新連線...");
        setTimeout(connectWebSocket, 3000); // 3秒後自動重連
    };
}

function sendMessage() {
    const input = document.getElementById("input-msg");
    if (input.value && socket) {
        // 🔥 重點：把 名字 和 訊息 包成 JSON 物件傳給後端
        const payload = {
            username: myName,
            message: input.value
        };

        // 轉成字串發送
        socket.send(JSON.stringify(payload));
        input.value = "";
    }
}

// 按 Enter 也可以發送
function handleKeyPress(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
}

// 顯示訊息 (區分自己與別人)
function appendMessage(senderName, text) {
    const area = document.getElementById("message-area");

    // 建立訊息列
    const row = document.createElement("div");
    row.className = "message-row";

    // 判斷是誰發的
    if (senderName === myName) {
        row.classList.add("self"); // 自己 (靠右)
    } else {
        row.classList.add("other"); // 別人 (靠左)
    }

    // 名字
    const nameDiv = document.createElement("div");
    nameDiv.className = "username";
    nameDiv.innerText = senderName;

    // 氣泡
    const bubbleDiv = document.createElement("div");
    bubbleDiv.className = "bubble";
    bubbleDiv.innerText = text;

    row.appendChild(nameDiv);
    row.appendChild(bubbleDiv);
    area.appendChild(row);

    // 自動捲動到底部
    area.scrollTop = area.scrollHeight;
}

function appendSystemMessage(text) {
    const area = document.getElementById("message-area");
    const div = document.createElement("div");
    div.className = "system-msg";
    div.innerText = text;
    area.appendChild(div);
}
