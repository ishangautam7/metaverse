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
    delete: async (...args) => {
        try {
            const res = await axios2.delete(...args);
            return res;
        } catch (e) {
            return e.response;
        }
    },
};

describe("Space Controller Tests", () => {
    let mapId;

    beforeAll(async () => {
        const email = `user1@example.com`;
        const username = `user1`;
        const password = "password123";
        // Register user first
        await axios.post(`${BACKEND_URL}/api/auth/user/register`, {
            username,
            email,
            password,
        });

        // Log in
        const response = await axios.post(`${BACKEND_URL}/api/auth/user/login`, {
            email,
            password,
        });

        const map = await axios.post(`${BACKEND_URL}/api/admin/map`, {
            width:500, height:500, name:"Daaoaaaaaaana 1", userId: response.data.user.id
        })
        const mapResponse = await axios.post(`${BACKEND_URL}/api/space`, {
            name: "Test Map",
            width: 1000,
            height: 1000,
            mapId: map.data.id
        });
        mapaId = mapResponse.data.space.mapId;
    });

    afterAll(async () => {
        await axios.delete(`${BACKEND_URL}/deletemap/${mapId}`);
    });

    describe("POST /createspace", () => {
        test("should create a new space", async () => {
            const response = await axios.post(`${BACKEND_URL}/api/space/`, {
                name: "Space",
                height: 500,
                width: 500,
                mapId: mapaId,
            });
            expect(response.status).toBe(200);
        });

        test("should return error if mapId is not valid", async () => {
            const response = await axios.post(`${BACKEND_URL}/api/space/`, {
                name: "Invalid Space",
                height: 500,
                width: 500,
                mapId: "invalid_map_id",
            });
            expect(response.status).toBe(400);
        });
    });

    describe("DELETE /deletespace/:id", () => {
        let spaceId;

        beforeEach(async () => {
            const response = await axios.post(`${BACKEND_URL}/api/space/`, {
                name: "Space to be deleted",
                width: 500,
                height: 500,
                mapId: mapaId,
            });
            spaceId = response.data.space._id;
        });

        test("should delete a space", async () => {
            const response = await axios.delete(`${BACKEND_URL}/api/space/:${spaceId}`);

            expect(response.status).toBe(200);
            expect(response.data.msg).toBe("Space deleted successfully");
        });

        test("should return error if space not found", async () => {
            const response = await axios.delete(`${BACKEND_URL}/deletespace/invalid_space_id`);

            expect(response.status).toBe(400);
            expect(response.data.msg).toBe("No map found");
        });
    });

    describe("GET /getallspace", () => {
        test("should get all spaces", async () => {
            const response = await axios.get(`${BACKEND_URL}/getallspace`);

            expect(response.status).toBe(200);
            expect(response.data.msg).toBe("Spaces retrieved successfully");
            expect(response.data.spaces.length).toBeGreaterThan(0);
        });
    });

    describe("POST /addelement", () => {
        let spaceId;
        let elementId;

        beforeEach(async () => {
            const spaceResponse = await axios.post(`${BACKEND_URL}/createspace`, {
                name: "Space for Element",
                width: 500,
                height: 500,
                mapId,
            });
            spaceId = spaceResponse.data.space._id;

            const elementResponse = await axios.post(`${BACKEND_URL}/createelement`, {
                width: 50,
                height: 50,
                imageUrl: "http://example.com/element.png",
            });
            elementId = elementResponse.data.element._id;
        });

        test("should add an element to a space", async () => {
            const response = await axios.post(`${BACKEND_URL}/addelement`, {
                elementId,
                spaceId,
                x: 100,
                y: 100,
                width: 50,
                height: 50,
            });

            expect(response.status).toBe(200);
            expect(response.data.msg).toBe("Element added successfully");
        });

        test("should return error if element is out of bounds", async () => {
            const response = await axios.post(`${BACKEND_URL}/addelement`, {
                elementId,
                spaceId,
                x: 500,
                y: 500,
                width: 50,
                height: 50,
            });

            expect(response.status).toBe(400);
            expect(response.data.msg).toBe("Element is out of bound");
        });

        test("should return error if element collides", async () => {
            await axios.post(`${BACKEND_URL}/addelement`, {
                elementId,
                spaceId,
                x: 100,
                y: 100,
                width: 50,
                height: 50,
            });

            const response = await axios.post(`${BACKEND_URL}/addelement`, {
                elementId,
                spaceId,
                x: 120,
                y: 120,
                width: 50,
                height: 50,
            });

            expect(response.status).toBe(400);
            expect(response.data.msg).toBe("Element collides with other element");
        });
    });
});
