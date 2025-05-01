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
	albumHandler := handlers.NewAlbumHandler(db)
	songHandler := handlers.NewSongHandler(db)
	playlistHandler := handlers.NewPlaylistHandler(db)
	
	// Routes
	albumRoutes := router.Group("/albums") 
	{
		albumRoutes.GET("/", albumHandler.GetAllAlbums)
		albumRoutes.GET("/:id", albumHandler.GetAlbumByID)
		albumRoutes.POST("/", albumHandler.CreateAlbum)
	}

	songRoutes := router.Group("/songs")
	{
		songRoutes.GET("", songHandler.GetAllSongs)
		songRoutes.GET("/:id", songHandler.GetSongByID)
		songRoutes.POST("", songHandler.UploadSong)
		songRoutes.GET("/upload", songHandler.ShowUploadForm)
	}

	playlistRoutes := router.Group("/playlists")
	{
		playlistRoutes.GET("", playlistHandler.GetAllPlaylists)
		playlistRoutes.POST("", playlistHandler.CreatePlaylist)
		playlistRoutes.POST("/add-song", playlistHandler.AddSongToPlaylist)
		playlistRoutes.GET("/:playlist_id/songs", playlistHandler.GetSongsFromPlaylist)
	}
}