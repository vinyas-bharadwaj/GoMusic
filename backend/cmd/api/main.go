package main

import (
	"log"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/glebarez/sqlite"
	"github.com/joho/godotenv"
	"gorm.io/gorm"

	"music-player-gin/internal/api/routes"
	"music-player-gin/internal/models"
)

func init() {
	// Load .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("Error loading .env file:", err)
	} else {
		log.Println("Environment variables loaded from .env file")
	}
}

func initDB() (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open("albums.db"), &gorm.Config{})
	if err != nil {
		return nil, err
	}
	
	// Auto migrating models
	err = db.AutoMigrate(&models.Song{}, &models.Playlist{}, &models.User{})
	if err != nil {
		return nil, err
	}

	return db, nil
}

func main() {
	db, err := initDB()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Initialize router
	router := gin.Default()

	// Configure CORS
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{
		"http://localhost:3000",
	}
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
    config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
    config.AllowCredentials = true
    router.Use(cors.New(config))

	// Homepage route
	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "Welcome to the Music Player API!"})
	})

	// Setup routes
	routes.SetupRoutes(router, db)

	// Start server
	router.Run(":8080")

}