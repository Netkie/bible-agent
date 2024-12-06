document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    const statusMessage = document.getElementById('api-status');

    if (!userInput.value.trim()) return; // Prevent sending empty messages

    // Show loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.textContent = '正在處理請求...';
    loadingIndicator.style.color = '#007BFF'; // Color for visibility
    chatBox.appendChild(loadingIndicator);

    // Get the user's preferred language
    const userLanguage = navigator.language || navigator.userLanguage; // e.g., "en-US", "zh-TW"

    try {
        // Send user input and language preference to the server
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userInput.value, language: userLanguage })
        });

        const data = await response.json();

        // Check if the response is okay
        if (response.ok) {
            statusMessage.textContent = "API OK!";
        } else {
            statusMessage.textContent = "API not linked";
        }

        // Remove loading indicator
        chatBox.removeChild(loadingIndicator);

        // Display the user's query in a different color at the top of the chat box
        const userMessageDiv = document.createElement('div');
        userMessageDiv.style.color = '#008000'; // Green color for user queries
        userMessageDiv.textContent = `你：${userInput.value}`;
        
        chatBox.appendChild(userMessageDiv);

        // Display the assistant's response in chat box with improved formatting
        const assistantMessageDiv = document.createElement('div');
        
	assistantMessageDiv.style.border = "1px solid #ccc";
	assistantMessageDiv.style.padding = "10px";
	assistantMessageDiv.style.marginTop = "10px";
	assistantMessageDiv.style.color = "#555555"; // Dark gray for agent responses
	
	assistantMessageDiv.innerHTML = `聖經巴特:<br>${data.message.replace(/<br>/g, '<br>')}`;
	
	chatBox.appendChild(assistantMessageDiv);

	// Automatically scroll to the latest message
	chatBox.scrollTop = chatBox.scrollHeight;

	// Clear user input
	userInput.value = '';
    } catch (error) {
        console.error("Error:", error);
        statusMessage.textContent = "API not linked";
        chatBox.removeChild(loadingIndicator);
    }
}

// Function to fetch and display upcoming Christian holidays on page load
async function fetchUpcomingHolidays() {
   const userLanguage = navigator.language.startsWith('zh') ? 'zh' : 'en'; // Detect if user prefers Chinese or default to English
   const response = await fetch(`/api/upcoming-holidays?language=${userLanguage}`);
   const holidays = await response.json();

   if (response.ok) {
       const holidayList = holidays.map(holiday => `<li>${holiday.date}: ${holiday.name}</li>`).join('');
       document.getElementById('upcoming-events').innerHTML = `<strong>Upcoming Christian Holidays:</strong><ul>${holidayList}</ul>`;
   } else {
       document.getElementById('upcoming-events').innerHTML = `<strong>Error fetching holidays.</strong>`;
   }
}

// Call function on page load
fetchUpcomingHolidays();