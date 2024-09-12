package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type AppConfig struct {
	RedisHost        string
	RedisPort        string
	PostgresHost     string
	PostgresPort     string
	PostgresUser     string
	PostgresPassword string
	PostgresDatabase string
	JwtSecret        string
	KafkaHost        string
	KafkaPort        string
	KafkaTopic       string
	KafkaGroupID     string
	ServerPort       string
}

var Config AppConfig

func init() {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Initialize Configuration
	Config = AppConfig{
		JwtSecret:        getEnv("JWT_SECRET", ""),
		ServerPort:       getEnv("SERVER_PORT", "8080"),
		RedisHost:        getEnv("REDIS_HOST", "localhost"),
		RedisPort:        getEnv("REDIS_PORT", "6379"),
		KafkaHost:        getEnv("KAFKA_HOST", "localhost"),
		KafkaPort:        getEnv("KAFKA_PORT", "9092"),
		KafkaTopic:       getEnv("KAFKA_TOPIC", "default_topic"),
		KafkaGroupID:     getEnv("KAFKA_GROUP_ID", "default_group"),
		PostgresHost:     getEnv("POSTGRES_HOST", "localhost"),
		PostgresPort:     getEnv("POSTGRES_PORT", "5432"),
		PostgresUser:     getEnv("POSTGRES_USER", "postgres"),
		PostgresPassword: getEnv("POSTGRES_PASSWORD", ""),
		PostgresDatabase: getEnv("POSTGRES_DATABASE", "postgres"),
	}

	// Validate critical configuration
	if Config.PostgresHost == "" || Config.PostgresPassword == "" {
		log.Fatal("Critical environment variables not set")
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
