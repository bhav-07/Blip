package auth

import (
	"log"
	"server/config"
	"server/database"
	"server/models"
	"strconv"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

func SignUp(c *fiber.Ctx) error {
	var req models.AuthRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	if req.Username == "" || req.Password == "" {
		log.Println("Username or password is empty")
		return c.JSON(fiber.Map{
			"error":   true,
			"message": "Username and password are required fields.",
		})
	}

	var userExists database.DBUser
	if err := database.DB.Where("name = ?", req.Username).First(&userExists).Error; err == nil {
		log.Println("User already exists")
		return c.JSON(fiber.Map{
			"error":   true,
			"message": "Username already exists. Please choose a different one.",
		})
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Error hashing password: %v", err)
		return c.JSON(fiber.Map{
			"error":   true,
			"message": "An error occurred while processing your request. Please try again later.",
		})
	}

	user := database.DBUser{
		Name:     req.Username,
		Password: string(hashedPassword),
	}
	if err := database.DB.Create(&user).Error; err != nil {
		log.Printf("Error adding user to database: %v", err)
		return c.JSON(fiber.Map{
			"error":   true,
			"message": "An error occurred while processing your request. Please try again later.",
		})
	}
	return c.JSON(fiber.Map{
		"error":   false,
		"message": "Signup success",
	})
}

func LogIn(c *fiber.Ctx) error {
	var request models.AuthRequest
	if err := c.BodyParser(&request); err != nil {
		log.Printf("Error parsing request body for Login: %v", err)
		return c.JSON(fiber.Map{
			"error":   true,
			"message": "Invalid request format. Please check your data.",
		})
	}

	if request.Username == "" || request.Password == "" {
		log.Println("Username or password is empty")
		return c.JSON(fiber.Map{
			"error":   true,
			"message": "Username and password are required fields.",
		})
	}

	var user database.DBUser
	if err := database.DB.Where("name = ?", request.Username).First(&user).Error; err != nil {
		log.Printf("Error finding user in database: %v", err)
		return c.JSON(fiber.Map{
			"error":   true,
			"message": "User not found. Please check your credentials.",
		})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(request.Password)); err != nil {
		log.Printf("Password mismatch: %v", err)
		return c.JSON(fiber.Map{
			"error":   true,
			"message": "Invalid password. Please try again.",
		})
	}
	userID := strconv.FormatUint(uint64(user.ID), 10)
	token, err := GenerateJWT(userID, user.Name)
	if err != nil {
		log.Printf("Error generating JWT: %v", err)
		return c.JSON(fiber.Map{
			"error":   true,
			"message": "An error occurred while processing your request. Please try again later.",
		})
	}

	return c.JSON(fiber.Map{
		"error":   false,
		"message": "Login success",
		"token":   token,
	})
}

func GenerateJWT(userID string, username string) (string, error) {
	token := jwt.New(jwt.SigningMethodHS256)
	claims := token.Claims.(jwt.MapClaims)
	claims["userID"] = userID
	claims["username"] = username
	claims["exp"] = time.Now().Add(time.Hour * 24).Unix()

	return token.SignedString([]byte(config.Config.JwtSecret))
}
