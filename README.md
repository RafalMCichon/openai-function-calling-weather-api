# OpenAI Function Calling Chatbot with Weather API

This is a simple chatbot application that uses `gpt-3.5-turbo-0613` to interact with users and a weather API to provide real-time weather data. 

<p align="center">
  <img src="https://github.com/RafalMCichon/openai-function-calling-weather-api/blob/main/img/openai-function-calling-weather-api.png" width="292" height="430">
</p>

## Features
- Real-time messaging with Socket.IO
- Conversation history management
- Real-time weather data fetch

## Installation

Before you begin, make sure you have [Node.js](https://nodejs.org/en/download/) installed on your system.

1. Clone this repository: 

```bash
git clone https://github.com/your-repo-url
```

2. Install the necessary dependencies:

```bash
cd your-project-folder
npm install
```

3. Create a .env file in your root directory and add your OpenAI API Key and Weather API Key:

```bash
OPENAI_API_KEY=your_openai_api_key
WEATHER_API_KEY=your_weather_api_key
```

4. Start the application:

```bash
npm start
```

Then, navigate to http://localhost:3000/ in your browser to use the chatbot.

## Usage
Send a message to the chatbot using the input field at the bottom of the page.
You can ask the bot about the weather in any location.

## Contributions
Contributions, issues, and feature requests are welcome!

## License
This project is licensed under the terms of the MIT license.

```bash
Remember to replace "your-repo-url" and "your-project-folder" with the URL of your repository and the name of your project's folder, respectively.
```
