# gpt-playground
Simple HTML Openai API UI

### Usage

You can put your API key at the end of the URI fragment like so to connect automatically:

`https://minwidth0px.github.io/gpt-playground/#API_KEY`

### Development

If you wish to play around with this code, you may want to test the functionality without submiting API requests for each change. To do this, create a function like

<details>

<summary>Emulated Request</summary>

```js
function submitMessagesFake() {
        let query = getQuery();
        let interval;
        let i = 0;
        const strs = str();
        const chatScrollContainer = document.getElementById("chat-container");
        addNewChatBox("assistant");
        document.getElementById("add-message").classList.add("display-none");
        chatScrollContainer.scrollTop = chatScrollContainer.scrollHeight;
        const currentChat = document.querySelector(
          "#chat .chat-item:last-child textarea",
        );
        interval = setInterval(() => {
          if (breakStream || i >= strs.length) {
            document
              .getElementById("add-message")
              .classList.remove("display-none");
            const chatScrollContainer =
              document.getElementById("chat-container");
            chatScrollContainer.scrollTop = chatScrollContainer.scrollHeight;
            clearInterval(interval);
            breakStream = false;
            document.getElementById("submit-button").innerText = "submit";
            query.messages.push({ role: "assistant", content: strs });
            history.push(query);
            updateHistory();
          } else {
            const bottom =
              chatScrollContainer.scrollHeight -
              chatScrollContainer.scrollTop -
              chatScrollContainer.clientHeight;
            currentChat.value += strs[i++];
            const oldHeight = currentChat.style.height;
            currentChat.style.height = `${currentChat.scrollHeight}px`;
            const changed = oldHeight != currentChat.style.height;
            if (changed && bottom < 1) {
              chatScrollContainer.scrollTop = chatScrollContainer.scrollHeight;
            }
          }
        }, 1);
      }
```

</details>

and replace `submitRequest` with it
