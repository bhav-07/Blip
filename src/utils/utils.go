package utils

import (
	"chat-app/src/models"
	"log"

	"github.com/gofiber/contrib/websocket"
	gonanoid "github.com/matoous/go-nanoid/v2"
)

func SendErrorMessage(conn *websocket.Conn, errMsg string) {
	errMessage := models.ErrorMessage{
		Error:   true,
		Message: errMsg,
	}

	if err := conn.WriteJSON(errMessage); err != nil {
		log.Println(err)
	}
}

func GenerateUserID() string {
	id, _ := gonanoid.New()
	return id
}
