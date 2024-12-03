package main

import (
	"chat-app/src/auth"
	"chat-app/src/cache"
	"chat-app/src/chat"
	"chat-app/src/config"
	"chat-app/src/database"
	"fmt"
	"log"
	"os"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	app := fiber.New()

	cache.InitRedis()
	database.InitPostgres()

	app.Use(logger.New())

	allowedOrigin := os.Getenv("ALLOWED_ORIGIN")
	if allowedOrigin == "" {
		allowedOrigin = "http://localhost:3000"
	}

	app.Use(cors.New(cors.Config{
		AllowCredentials: true,
		AllowOrigins:     allowedOrigin, // Use environment-based origin
		AllowMethods:     "GET,POST,HEAD,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, Set-Cookie",
		ExposeHeaders:    "Set-Cookie",
		MaxAge:           3600,
	}))

	app.Use(func(c *fiber.Ctx) error {
		if c.Method() == "OPTIONS" {
			c.Set("Access-Control-Allow-Origin", allowedOrigin)
			c.Set("Access-Control-Allow-Credentials", "true")
			c.Set("Access-Control-Allow-Methods", "GET,POST,HEAD,PUT,DELETE,OPTIONS")
			c.Set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, Set-Cookie")
			c.Set("Access-Control-Expose-Headers", "Set-Cookie")
			c.Set("Access-Control-Max-Age", "3600")
			return c.SendStatus(fiber.StatusOK)
		}
		return c.Next()
	})

	app.Get("/api/health", func(ctx *fiber.Ctx) error {
		server := os.Getenv("SERVER_NAME")
		return ctx.Status(fiber.StatusOK).JSON(fiber.Map{"status": "healthy", "server": server})
	})
	app.Get("/api/users", func(ctx *fiber.Ctx) error {
		var users []database.DBUser
		result := database.DB.Find(&users)
		if result.Error != nil {
			return ctx.SendString("Error while fetching users")
		}

		return ctx.JSON(fiber.Map{
			"users": users,
		})
	})

	app.Post("/api/auth/signup", auth.SignUp)
	app.Post("/api/auth/login", auth.LogIn)

	// app.Use("/ws/chat", AuthMiddleware)
	app.Use("/ws", upgradeToWebSocket)
	app.Get("/ws/chat", websocket.New(chat.WebSocketHandler))

	port := ":" + config.Config.ServerPort
	log.Fatal(app.Listen(port))
}

func AuthMiddleware(c *fiber.Ctx) error {
	token := c.Cookies("auth_token")
	fmt.Println(token)
	if token == "" {
		return c.Status(fiber.StatusUnauthorized).SendString("Unauthorized")
	}

	userID, userName := auth.ParseJWTToken(token)

	c.Locals("userID", userID)
	c.Locals("userName", userName)

	return c.Next()
}

func upgradeToWebSocket(context *fiber.Ctx) error {
	token := context.Cookies("auth_token")
	if token == "" {
		log.Println("No token provided")
		return fiber.ErrUnauthorized
	}

	// Validate JWT token
	if err := auth.ValidateJWTToken(token); err != nil {
		log.Println("Error validating JWT token:", err)
		return fiber.ErrUnauthorized
	}

	userID, userName := auth.ParseJWTToken(token)
	if websocket.IsWebSocketUpgrade(context) {
		context.Locals("allowed", true)
		context.Locals("userID", userID)
		context.Locals("userName", userName)
		return context.Next()
	}
	return fiber.ErrUpgradeRequired
}
