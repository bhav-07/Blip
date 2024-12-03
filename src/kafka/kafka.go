package kafka

import (
	"chat-app/src/config"
	"chat-app/src/models"
	"context"
	"encoding/json"
	"log"

	"github.com/segmentio/kafka-go"
)

type KafkaConfig struct {
	Host       string
	Port       string
	kafkaTopic string
	GroupID    string
}

var kafkaConfig KafkaConfig

func init() {
	kafkaConfig = KafkaConfig{
		Host:       config.Config.KafkaHost,
		Port:       config.Config.KafkaPort,
		kafkaTopic: config.Config.KafkaTopic,
		GroupID:    config.Config.KafkaGroupID,
	}
}

func PublishMessage(message models.Message) {
	w := kafka.NewWriter(kafka.WriterConfig{
		Brokers: []string{kafkaConfig.Host + ":" + kafkaConfig.Port},
		Topic:   kafkaConfig.kafkaTopic,
	})
	defer w.Close()

	messageBytes, err := json.Marshal(message)
	if err != nil {
		log.Println("Error marshalling message:", err)
		return
	}

	err = w.WriteMessages(context.Background(), kafka.Message{
		Value: messageBytes,
	})

	if err != nil {
		log.Println("Error publishing message to kafka:", err)
		return
	}
}
