package chat

import (
	"chat-app/src/cache"
	"chat-app/src/kafka"
	"chat-app/src/models"
	"chat-app/src/utils"
	"context"
	"log"
	"os"
)

func JoinRoom(room string, user *models.User) {
	key := "room:" + room
	if err := addUserToRoomInRedis(key, user); err != nil {
		log.Println("Failed to add user to room:", err)
		utils.SendErrorMessage(user.Connection, "Unable to join room")
		return
	}

	cache.SubscribeToRoom(room, func(room string, message *models.Message) {
		BroadcastToRoom(room, *message)
	})

	message := models.Message{
		Sender:     user.ID,
		SenderName: user.Name,
		Room:       room,
		Type:       "join_room",
		Server:     os.Getenv("SERVER_NAME"),
	}
	cache.PublishMessage(room, &message)

	log.Printf("User %s joined room %s\n", user.ID, room)
	response := map[string]interface{}{
		"type":    "join_room",
		"room":    room,
		"success": true,
	}
	if err := user.Connection.WriteJSON(response); err != nil {
		log.Println("Error sending join room response:", err)
	}
}

func BroadcastToRoom(room string, message models.Message) {
	key := "room:" + room
	for _, userID := range getAllMembersInRoom(key) {
		// Get the websocket connection for the user from the local map
		if conn, exists := GetConnection(userID); exists {
			// Send the message to the user
			if err := conn.WriteJSON(message); err != nil {
				log.Printf("Error sending message to user %s: %v\n", userID, err)
				conn.Close()
				RemoveConnection(userID)
			}
		}
	}
}

func SendMessageToRoom(message models.Message, user *models.User) {
	cache.PublishMessage(message.Room, &message)
	kafka.PublishMessage(message)
}

func LeaveRoom(room string, user *models.User) {
	key := "room:" + room
	if err := removeUserFromRoomInRedis(key, user); err != nil {
		log.Println("Failed to remove user from room:", err)
		utils.SendErrorMessage(user.Connection, "Unable to leave room")
		return
	}

	cache.CheckAndUnsubscribeFromRoom(room)
	response := map[string]interface{}{
		"type":    "leave_room",
		"room":    room,
		"success": true,
	}
	if err := user.Connection.WriteJSON(response); err != nil {
		log.Println("Error sending leave room response:", err)
	}
}

func LeaveAllRooms(user *models.User) {
	for _, room := range cache.GetAllRooms() {
		isMember := isUserInRoom(room, user)
		if isMember {
			removeUserFromRoomInRedis(room, user)
		}
	}
}

func addUserToRoomInRedis(room string, user *models.User) error {
	ctx := context.Background()
	_, err := cache.RedisClient.SAdd(ctx, room, user.ID).Result()
	return err
}

func removeUserFromRoomInRedis(room string, user *models.User) error {
	ctx := context.Background()
	_, err := cache.RedisClient.SRem(ctx, room, user.ID).Result()
	return err
}

func isUserInRoom(room string, user *models.User) bool {
	ctx := context.Background()
	isMember, err := cache.RedisClient.SIsMember(ctx, room, user.ID).Result()
	if err != nil {
		log.Println(err)
		return false
	}
	return isMember
}

func getAllMembersInRoom(room string) []string {
	ctx := context.Background()
	members, err := cache.RedisClient.SMembers(ctx, room).Result()
	if err != nil {
		log.Println(err)
		return nil
	}
	return members
}
