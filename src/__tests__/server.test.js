import request from "supertest";
import { app } from "../backend/server.js";

describe("Server API Tests", () => {
  let testUserId;

  // Test user creation
  it("should create a new user", async () => {
    const response = await request(app).post("/api/users").send({
      username: "testuser",
      email: "testuser@example.com",
      password: "password123",
    });
    expect(response.status).toBe(201);
    expect(response.body.message).toBe("User created successfully");
  });

  // Test user login
  it("should log in the user", async () => {
    const response = await request(app).post("/api/login").send({
      email: "testuser@example.com",
      password: "password123",
    });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Login successful");
    testUserId = response.body.user.id; // Save user ID for later tests
  });

  // Test fetching user profile
  it("should fetch the user profile", async () => {
    const response = await request(app).get(`/api/users/${testUserId}`);
    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe("testuser@example.com");
  });

  // Test fetching recipes
  it("should fetch recipes", async () => {
    const response = await request(app).get("/api/recipes");
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Fetched recipes from database");
  });

  // Test generating recommendations
  it("should generate recipe recommendations", async () => {
    // Mock the app's response for /api/recommendations
    jest.spyOn(app, "get").mockImplementationOnce((path, handler) => {
      if (path === "/api/recommendations") {
        handler({}, {
          status: jest.fn().mockReturnThis(),
          json: jest.fn().mockImplementation((data) => {
            expect(data.message).toBe("Recommendations generated successfully");
            expect(data.data.recipes).toBeDefined();
            expect(data.data.recipes[0].name).toBe("Miso Glazed Salmon");
          }),
        });
      }
    });

    const response = await request(app).get("/api/recommendations");
    expect(response.status).toBe(200);
  });

  // Test deleting the user
  it("should delete the user", async () => {
    const response = await request(app).delete(`/api/users/${testUserId}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("User deleted");
  });
});
