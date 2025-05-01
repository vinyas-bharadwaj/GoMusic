package handlers

import (
	"net/http"
	"github.com/gin-gonic/gin"

	"gorm.io/gorm"
	"music-player-gin/internal/models"
)


type PlaylistHandler struct {
	db *gorm.DB
}

func NewPlaylistHandler(db *gorm.DB) *PlaylistHandler {
	return &PlaylistHandler{db: db}
}

func (h *PlaylistHandler) GetAllPlaylists(c *gin.Context) {
	var playlists []models.Playlist
	if err := h.db.Find(&playlists).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch playlists"})
		return
	}
	c.JSON(http.StatusOK, playlists)
}

func (h *PlaylistHandler) CreatePlaylist(c *gin.Context) {
	var playlist models.Playlist
	if err := c.ShouldBindJSON(&playlist); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	if err := h.db.Create(&playlist).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create playlist"})
		return
	}
	c.JSON(http.StatusCreated, playlist)
}

func (h *PlaylistHandler) AddSongToPlaylist(c *gin.Context) {
    type SongPlaylistRequest struct {
        PlaylistID uint `json:"playlist_id" binding:"required"`
        SongID     uint `json:"song_id" binding:"required"`
    }
    
    var request SongPlaylistRequest
	if err := c.ShouldBindJSON(&request); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format", "details": err.Error()})
        return
    }
    
    var playlist models.Playlist
    if err := h.db.First(&playlist, request.PlaylistID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Playlist not found"})
        return
    }
    
    var song models.Song
    if err := h.db.First(&song, request.SongID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Song not found"})
        return
    }
    
    // Use the Association method for cleaner many-to-many handling
    if err := h.db.Model(&playlist).Association("Songs").Append(&song); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add song to playlist"})
        return
    }
    
    // Return the updated playlist with songs
    if err := h.db.Preload("Songs").First(&playlist, request.PlaylistID).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch updated playlist"})
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "message": "Song added to playlist successfully",
        "playlist": playlist,
    })
}

func (h *PlaylistHandler) GetSongsFromPlaylist(c *gin.Context) {
	playlistID := c.Param("playlist_id")
	var playlist models.Playlist
	if err := h.db.Preload("Songs").First(&playlist, playlistID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Playlist not found"})
		return
	}
	c.JSON(http.StatusOK, playlist.Songs)

}