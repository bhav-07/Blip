package main

import (
	"server/auth"
	"server/database"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	database.InitPostgres()
	app := fiber.New()
	app.Use(logger.New())
	app.Get("/api/health", func(ctx *fiber.Ctx) error {
		return ctx.SendString("hello")
	})

	app.Post("/api/auth/signup", auth.SignUp)
	app.Listen(":8080")
}
