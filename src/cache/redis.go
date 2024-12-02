package cache

import (
	"chat-app/src/config"
	"context"
	"fmt"

	"github.com/go-redis/redis/v8"
)

type RedisConfig struct {
	Host string
	Port string
}

var redisConfig RedisConfig
var RedisClient *redis.Client
var PubSubConnection *redis.PubSub

func init() {
	redisConfig = RedisConfig{
		Host: config.Config.RedisHost,
		Port: config.Config.RedisPort,
	}
}

func InitRedis() {
	RedisClient = redis.NewClient(&redis.Options{
		Addr: fmt.Sprintf("%s:%s", redisConfig.Host, redisConfig.Port),
	})

	ctx := context.Background()
	PubSubConnection = RedisClient.Subscribe(ctx)

	if err := RedisClient.Ping(ctx).Err(); err != nil {
		panic(err)
	}
}
