require("dotenv").config(); 

const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3000;
const WINDOW_SIZE = 10;
const numberStore = [];

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const API_ENDPOINTS = {
    p: "http://20.244.56.144/test/primes",
    f: "http://20.244.56.144/test/fibo",
    e: "http://20.244.56.144/test/even",
    r: "http://20.244.56.144/test/rand"
};
async function fetchNumbers(type) {
    if (!API_ENDPOINTS[type]) return [];

    try {
        const response = await axios.get(API_ENDPOINTS[type], {
            timeout: 500,
            headers: {
                Authorization: `Bearer ${process.env.AUTH_TOKEN}`
            }
        });
        return response.data.numbers || [];
    } catch (error) {
        console.error("Error fetching numbers:", error.message);
        return [];
    }
}
function updateWindow(newNumbers) {
    const prevState = [...numberStore];
    newNumbers.forEach(num => {
        if (!numberStore.includes(num)) {
            if (numberStore.length >= WINDOW_SIZE) {
                numberStore.shift();
            }
            numberStore.push(num);
        }
    });

    return prevState;
}
app.get("/numbers/:type", async (req, res) => {
    const { type } = req.params;
    const prevState = updateWindow([]);
    const newNumbers = await fetchNumbers(type);
    updateWindow(newNumbers);
    const avg = numberStore.length > 0
        ? (numberStore.reduce((a, b) => a + b, 0) / numberStore.length).toFixed(2)
        : 0;

    res.json({
        windowPrevState: prevState,
        windowCurrState: numberStore,
        numbers: newNumbers,
        avg: avg
    });
});
