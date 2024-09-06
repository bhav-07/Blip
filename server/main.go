package main

import (
	"server/database"

	"github.com/gofiber/fiber/v3"
)

func main() {
	database.InitPostgres()
	app := fiber.New()
	app.Get("/", func(c fiber.Ctx) error {
		return c.JSON((fiber.Map{
			"message": "Hello",
		}))
	})

	app.Listen(":8080")
}
