package main

import (
	"chat-app/src/auth"
	"chat-app/src/config"
	"chat-app/src/database"
	"log"
	"os"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	database.InitPostgres()
	app := fiber.New()
	app.Use(logger.New())
	app.Get("/api/health", func(ctx *fiber.Ctx) error {
		server := os.Getenv("SERVER_NAME")
		return ctx.Status(fiber.StatusOK).JSON(fiber.Map{"status": "healthy", "server": server})
	})
	app.Get("api/users", func(ctx *fiber.Ctx) error {
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

	app.Use("/ws", upgradeToWebSocket)
	// app.Get("/ws/chat", websocket.New(chat.WebSocketHandler))

	port := ":" + config.Config.ServerPort
	log.Fatal(app.Listen(port))
}

func upgradeToWebSocket(context *fiber.Ctx) error {
	token := context.Query("token")
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
