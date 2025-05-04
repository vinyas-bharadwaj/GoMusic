package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"music-player-gin/internal/api/handlers"
	"music-player-gin/internal/api/middleware"
)

func SetupRoutes(router *gin.Engine, db *gorm.DB) {
	// Middleware
	router.Use(middleware.LoggerMiddleware())

	// Initialize handlers
	songHandler := handlers.NewSongHandler(db)
	playlistHandler := handlers.NewPlaylistHandler(db)
	authHandler := handlers.NewAuthHandler(db)

	// Auth routes
	authRoutes := router.Group("/auth")
	{
		authRoutes.POST("/register", authHandler.Register)
		authRoutes.POST("/login", authHandler.Login)
	}

	
	// Protected routes
	protected := router.Group("/")
	protected.Use(middleware.AuthMiddleware())
	{
		// Playlist routes
		playlistRoutes := protected.Group("/playlists")
		{
			playlistRoutes.GET("", playlistHandler.GetAllPlaylists)
			playlistRoutes.POST("", playlistHandler.CreatePlaylist)
			playlistRoutes.POST("/add-song", playlistHandler.AddSongToPlaylist)
			playlistRoutes.GET("/:playlist_id/songs", playlistHandler.GetSongsFromPlaylist)
		}

		// Song routes
		songRoutes := protected.Group("/songs")
		{
			songRoutes.GET("", songHandler.GetAllSongs)
			songRoutes.GET("/:id", songHandler.GetSongByID)
			songRoutes.POST("", songHandler.UploadSong)
			songRoutes.GET("/:id/play", songHandler.PlaySong)
		}
	}
}