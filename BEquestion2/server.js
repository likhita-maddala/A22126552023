require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const API_BASE_URL = 'http://20.244.56.144/test';
const TOKEN = process.env.API_TOKEN; 

app.get('/users', async (req, res) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/users`, {
            headers: { Authorization: `Bearer ${TOKEN}` }
        });
        const users = response.data.users;
        const userPostCounts = await Promise.all(Object.keys(users).map(async userId => {
            const postsResponse = await axios.get(`${API_BASE_URL}/users/${userId}/posts`, {
                headers: { Authorization: `Bearer ${TOKEN}` }
            });
            return { name: users[userId], postCount: postsResponse.data.posts.length };
        }));
        userPostCounts.sort((a, b) => b.postCount - a.postCount);
        res.json(userPostCounts.slice(0, 5));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/posts', async (req, res) => {
    try {
        const type = req.query.type || 'latest';
        const usersResponse = await axios.get(`${API_BASE_URL}/users`, {
            headers: { Authorization: `Bearer ${TOKEN}` }
        });
        const users = usersResponse.data.users;
        let posts = [];
        for (const userId of Object.keys(users)) {
            const postsResponse = await axios.get(`${API_BASE_URL}/users/${userId}/posts`, {
                headers: { Authorization: `Bearer ${TOKEN}` }
            });
            posts.push(...postsResponse.data.posts);
        }
        if (type === 'popular') {
            for (let post of posts) {
                const commentsResponse = await axios.get(`${API_BASE_URL}/posts/${post.id}/comments`, {
                    headers: { Authorization: `Bearer ${TOKEN}` }
                });
                post.commentCount = commentsResponse.data.comments.length;
            }
            posts.sort((a, b) => b.commentCount - a.commentCount);
        } else {
            posts.sort((a, b) => b.id - a.id);
        }
        res.json(posts.slice(0, 5));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
