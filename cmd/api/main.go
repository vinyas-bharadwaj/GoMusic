package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"github.com/glebarez/sqlite"

	"music-player-gin/internal/api/routes"
	"music-player-gin/internal/models"
)

func initDB() (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open("albums.db"), &gorm.Config{})
	if err != nil {
		return nil, err
	}
	
	// Auto migrating models
	err = db.AutoMigrate(&models.Album{}, &models.Song{}, &models.Playlist{})
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

	// Homepage route
	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "Welcome to the Music Player API!"})
	})

	// Setup routes
	routes.SetupRoutes(router, db)

	// Start server
	router.Run(":8080")

}