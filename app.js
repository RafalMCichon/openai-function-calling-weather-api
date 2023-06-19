import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import chalk from 'chalk'; // For colorful console output

// Load Environment Variables
dotenv.config();
const { OPENAI_API_KEY, WEATHER_API_KEY } = process.env;
if (!OPENAI_API_KEY || !WEATHER_API_KEY) {
    throw new Error('Missing environment variable OPENAI_API_KEY or WEATHER_API_KEY');
}

// Set up headers for OpenAI API
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
};

// Function to fetch data from API
const fetchData = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.error) {
        throw new Error(`API error: ${data.error}`);
    }
    return data;
};

// Function to get current weather
const get_current_weather = async (location, unit = 'fahrenheit') => {
    console.log(`get_current_weather: ${location}, ${unit}`);
    const url = `http://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(location)}&aqi=no`;
    const data = await fetchData(url);

    if (!data.current) {
        throw new Error(`Failed to retrieve weather data for location: ${location}`);
    }

    const temperature = unit === 'fahrenheit' ? data.current.temp_f : data.current.temp_c;
    const weather_info = {
        'location': data.location.name,
        'temperature': temperature.toString(),
        'unit': unit,
        'forecast': [data.current.condition.text],
    };
    return JSON.stringify(weather_info);
};

// Function to get forecast for n days
const get_n_day_weather_forecast = async (location, unit = 'fahrenheit', num_days) => {
    console.log(`get_n_day_weather_forecast: ${location}, ${unit}, ${num_days}`);
    const url = `http://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(location)}&days=${num_days}&aqi=no`;
    const data = await fetchData(url);

    if (!data.forecast) {
        throw new Error(`Failed to retrieve forecast data for location: ${location}`);
    }

    const forecast_info = data.forecast.forecastday.map(day => ({
        'date': day.date,
        'temperature': unit === 'fahrenheit' ? day.day.avgtemp_f : day.day.avgtemp_c,
        'forecast': day.day.condition.text,
    }));

    return JSON.stringify(forecast_info);
};

// Main function to run conversation
const run_conversation = async (query, conversation_history) => {
    console.log(chalk.blue("-----------------------------------start-----------------------------------"));
    conversation_history.push({ "role": "user", "content": query });

    const firstResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            'model': 'gpt-3.5-turbo-0613',
            'messages': conversation_history,
            'functions': [{
                'name': 'get_current_weather',
                'description': 'Get the current weather in a given location',
                'parameters': {
                    'type': 'object',
                    'properties': {
                        'location': { 'type': 'string', 'description': 'The city and state, e.g., San Francisco, CA' },
                        'unit': { 'type': 'string', 'enum': ['celsius', 'fahrenheit'] },
                    },
                    'required': ['location'],
                },
            },
            {
                'name': 'get_n_day_weather_forecast',
                'description': 'Get an N-day weather forecast',
                'parameters': {
                    'type': 'object',
                    'properties': {
                        'location': { 'type': 'string', 'description': 'The city and state, e.g., San Francisco, CA' },
                        'unit': { 'type': 'string', 'enum': ['celsius', 'fahrenheit'] },
                        'num_days': { 'type': 'integer', 'description': 'The number of days to forecast' },
                    },
                    'required': ['location', 'unit', 'num_days'],
                },
            }],
            'function_call': 'auto',
        }),
    }).then(res => res.json());

    const message = firstResponse.choices[0].message;
    conversation_history.push(message);
    if (message.content !== null) {
        console.log("firstResponse:", message.content);
    }

    if (message.function_call) {
        const function_name = message.function_call.name;
        const function_args = JSON.parse(message.function_call.arguments);

        let function_response;

        if (function_name === 'get_current_weather') {
            function_response = await get_current_weather(
                function_args.location,
                function_args.unit
            );
        } else if (function_name === 'get_n_day_weather_forecast') {
            function_response = await get_n_day_weather_forecast(
                function_args.location,
                function_args.unit,
                function_args.num_days
            );
        } else {
            throw new Error(`Unsupported function: ${function_name}`);
        }

        conversation_history.push({ 'role': 'function', 'name': function_name, 'content': function_response });

        const secondResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                'model': 'gpt-3.5-turbo-0613',
                'messages': [...conversation_history],
            }),
        }).then(res => res.json());

        console.log("secondResponse:", secondResponse.choices[0].message.content);
        const message2 = secondResponse.choices[0].message;
        conversation_history.push(message2);

    } else if (message.content === "") {
        throw new Error(`Received empty response from API.`);
    }

    console.log(chalk.blue("------------------------------------end------------------------------------"));
    return conversation_history;
};

let conversation_history = [
    { "role": "system", "content": "Don't make assumptions about what values to plug into functions. Ask for clarification if a user request is ambiguous." },
];

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('chat message', async (msg) => {
        console.log('message: ' + msg);
        try {
            conversation_history = await run_conversation(msg, conversation_history);
            const bot_reply = conversation_history[conversation_history.length - 1].content;
            io.emit('bot message', bot_reply);
        } catch (error) {
            console.error(chalk.red(error));
            io.emit('bot message', "Error occurred while processing your message");
        }
    });
});

server.listen(3000, () => {
    console.log('listening on http://localhost:3000/');
});
