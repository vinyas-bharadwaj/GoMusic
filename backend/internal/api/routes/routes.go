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

	// Song routes
	songRoutes := router.Group("/songs")
	{
		songRoutes.GET("", songHandler.GetAllSongs)
		songRoutes.GET("/:id", songHandler.GetSongByID)
		songRoutes.POST("", songHandler.UploadSong)
		songRoutes.GET("/upload", songHandler.ShowUploadForm)
		songRoutes.GET("/:id/play", songHandler.PlaySong)
		songRoutes.GET("/:id/player", songHandler.ShowPlayer)
		songRoutes.GET("/list", songHandler.ShowSongList)
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
	}
}