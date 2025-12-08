
// import fetch from 'node-fetch'; // Built-in in Node 22
// Note: Node 18+ has global fetch.

const BASE_URL = 'http://localhost:4000/api';

const run = async () => {
    // 1. Register
    console.log("Registering...");
    const phone = "9" + Math.floor(100000000 + Math.random() * 900000000);
    const reg = await fetch(BASE_URL + '/appUsers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: "Debug User",
            phone,
            password: "p",
            secretQuestion: "q",
            secretAnswer: "a"
        })
    }).then(r => r.json());
    console.log("Reg:", reg);

    // 2. Login
    console.log("Login...");
    const login = await fetch(BASE_URL + '/appUsers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password: "p" })
    }).then(r => r.json());
    console.log("Login:", login);
    const token = login.accessToken;

    // 3. Create Dept
    console.log("Create Dept...");
    const res = await fetch(BASE_URL + '/departments/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
            name: { en: "Debug Dept", mr: "मराठी" },
            level: "State"
        })
    });

    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Body:", text);
};

run().catch(console.error);
