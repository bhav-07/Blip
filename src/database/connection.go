package database

import (
	"chat-app/src/config"
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type PostgresConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Database string
}

var DB *gorm.DB

var postgresConfig PostgresConfig

func init() {
	postgresConfig = PostgresConfig{
		Host:     config.Config.PostgresHost,
		Port:     config.Config.PostgresPort,
		User:     config.Config.PostgresUser,
		Password: config.Config.PostgresPassword,
		Database: config.Config.PostgresDatabase,
	}
}

func InitPostgres() {
	var err error
	dsn := "host=" + postgresConfig.Host + " user=" + postgresConfig.User + " password=" + postgresConfig.Password + " dbname=" + postgresConfig.Database + " port=" + postgresConfig.Port + " sslmode=require"
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	fmt.Println("Connected to DB")

	// Migrate the schema
	DB.Exec("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";")
	DB.AutoMigrate(&DBUser{}, &DBMessage{})
}
