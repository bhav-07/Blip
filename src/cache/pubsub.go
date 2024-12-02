package cache

import (
	"chat-app/src/models"
	"context"
	"encoding/json"
	"log"
	"sync"
)

var roomsMutex = &sync.Mutex{}
var subscribedRooms = make(map[string]bool)

var messageHandlerCallback models.MessageHandlerCallbackType

func SubscribeToRoom(room string, callback models.MessageHandlerCallbackType) {
	roomsMutex.Lock()
	defer roomsMutex.Unlock()

	if !subscribedRooms[room] {
		ctx := context.Background()
		PubSubConnection.Subscribe(ctx, room)
		subscribedRooms[room] = true

		messageHandlerCallback = callback
		go listenForMessages()
	}
}

func listenForMessages() {
	channel := PubSubConnection.Channel()
	for message := range channel {
		log.Printf("Received message from channel: %s\n", message.Payload)
		var chatMessage models.Message
		err := json.Unmarshal([]byte(message.Payload), &chatMessage)
		if err != nil {
			log.Printf("Error decoding message from channel: %v\n", err)
			continue
		}

		if messageHandlerCallback != nil {
			messageHandlerCallback(message.Channel, &chatMessage)
		}
	}
}

func CheckAndUnsubscribeFromRoom(room string) {
	roomsMutex.Lock()
	defer roomsMutex.Unlock()

	if subscribedRooms[room] {
		ctx := context.Background()
		key := "room:" + room
		members, _ := RedisClient.SCard(ctx, key).Result()

		if members == 0 {
			PubSubConnection.Unsubscribe(ctx, room)
			delete(subscribedRooms, room)
		}
	}
}

func PublishMessage(room string, message *models.Message) {
	ctx := context.Background()
	msg, err := json.Marshal(message)
	if err != nil {
		log.Println(err)
		return
	}
	RedisClient.Publish(ctx, room, msg)
	log.Printf("Published message: %s to channel: %s\n", msg, room)
}

func GetAllRooms() []string {
	ctx := context.Background()
	keys, err := RedisClient.Keys(ctx, "room:*").Result()
	if err != nil {
		log.Println(err)
		return nil
	}
	return keys
}
