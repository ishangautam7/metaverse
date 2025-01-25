const axios2 = require("axios");

const BACKEND_URL = "http://localhost:3000";

const axios = {
    post: async (...args) => {
        try {
            const res = await axios2.post(...args);
            return res;
        } catch (e) {
            return e.response;
        }
    },
    get: async (...args) => {
        try {
            const res = await axios2.get(...args);
            return res;
        } catch (e) {
            return e.response;
        }
    },
};

describe("Authentication Tests", () => {
    test("User can register successfully", async () => {
        const email = `user@example.com`;
        const username = `user`;
        const password = "password123";

        const response = await axios.post(`${BACKEND_URL}/api/auth/register`, {
            username,
            email,
            password,
        });
        expect(response.status).toBe(201);
    });

    test("User cannot register with an existing email", async () => {
        const email = "existing@example.com";
        const username = "existingUser";
        const password = "password123";

        // First registration
        await axios.post(`${BACKEND_URL}/api/auth/register`, {
            username,
            email,
            password,
        });

        // Attempt to register again with the same email
        const response = await axios.post(`${BACKEND_URL}/api/auth/register`, {
            username: "newUser",
            email,
            password,
        });

        expect(response.status).toBe(409);
    });

    test("User can log in successfully with correct credentials", async () => {
        const email = `user1@example.com`;
        const username = `user1`;
        const password = "password123";

        // Register user first
        await axios.post(`${BACKEND_URL}/api/auth/register`, {
            username,
            email,
            password,
        });

        // Log in
        const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
            email,
            password,
        });

        expect(response.status).toBe(200);
        expect(response.data.msg).toBe("Login successful");
        expect(response.data.token).toBeDefined();
    });

    test("Login fails with incorrect password", async () => {
        const email = `user1@example.com`;
        const username = `user1`;
        const password = "password123";

        // Attempt to log in with the wrong password
        const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
            email,
            password: "wrongPassword",
        });

        expect(response.status).toBe(400);
        expect(response.data.msg).toBe("Invalid credentials");
    });

    test("Token validation works correctly", async () => {
        const email = `user1@example.com`;
        const username = `user1`;
        const password = "password123";


        // Log in to get the token
        const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
            email,
            password,
        });
        const token = loginResponse.data.token;
        console.log("I am token", token)
        // Validate the token
        const response = await axios.get(`${BACKEND_URL}/api/auth/validate-token`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log("I am response", response)

        expect(response.status).toBe(200);
    });

    test("Token validation fails with invalid token", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/auth/validate-token`, {
            headers: {
                Authorization: `Bearer invalid_token`,
            },
        });

        expect(response.status).toBe(403);
    });
});
