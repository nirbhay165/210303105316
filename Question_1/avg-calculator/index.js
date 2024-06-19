const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;
const EXTERNAL_API_URL = 'http://20.244.56.144/test';  // Replace with the actual external API URL
const TIMEOUT = 500;
const accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzE4Nzc4OTYzLCJpYXQiOjE3MTg3Nzg2NjMsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjU1ZmYzOWZmLTQ0N2ItNDc2MS1hMGVmLTFlZWJhMGU4ZjVjNCIsInN1YiI6IjIxMDMwMzEwNTMxNkBwYXJ1bHVuaXZlcnNpdHkuYWMuaW4ifSwiY29tcGFueU5hbWUiOiJ5YXNoTWFydCIsImNsaWVudElEIjoiNTVmZjM5ZmYtNDQ3Yi00NzYxLWEwZWYtMWVlYmEwZThmNWM0IiwiY2xpZW50U2VjcmV0IjoiTVVURm9EZVlIQmR6SW9QVCIsIm93bmVyTmFtZSI6Ik5pcmJoYXkgUmFqb2RpeWEiLCJvd25lckVtYWlsIjoiMjEwMzAzMTA1MzE2QHBhcnVsdW5pdmVyc2l0eS5hYy5pbiIsInJvbGxObyI6IjIxMDMwMzEwNTMxNiJ9.6YJN30aAgweHsQcFop-Bj1nR_AeD3m5sFe4dVvaVYys";
const tokenType = 'Bearer';

let numbersWindow = [];

const fetchNumbers = async (numberId) => {
    try {
        console.log(`Fetching numbers with ID: ${numberId}`);
        const response = await axios.get(`${EXTERNAL_API_URL}/${numberId}`, {
            headers: {
                Authorization: `${tokenType} ${accessToken}`
            },
            timeout: TIMEOUT
        });
        
        if (response.status === 200 && Array.isArray(response.data.numbers)) {
            console.log(`Fetched numbers: ${response.data.numbers}`);
            return response.data.numbers;
        }
        console.log(`Unexpected response format: ${JSON.stringify(response.data)}`);
    } catch (error) {
        console.error(`Error fetching numbers: ${error.message}`);
    }
    return [];
};

const calculateAverage = (numbers) => {
    if (!numbers.length) return 0;
    return numbers.reduce((acc, num) => acc + num, 0) / numbers.length;
};

app.get('/numbers/:numberId', async (req, res) => {
    const numberId = req.params.numberId;
    const fetchedNumbers = await fetchNumbers(numberId);
    const windowPrevState = [...numbersWindow];

    fetchedNumbers.forEach(num => {
        if (num !== null && !numbersWindow.includes(num)) {
            if (numbersWindow.length >= WINDOW_SIZE) {
                numbersWindow.shift();
            }
            numbersWindow.push(num);
        }
    });

    const windowCurrState = [...numbersWindow];
    const avg = numbersWindow.length === WINDOW_SIZE ? calculateAverage(numbersWindow) : 0;

    res.json({
        windowPrevState,
        windowCurrState,
        numbers: fetchedNumbers,
        avg: parseFloat(avg.toFixed(2)),
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
