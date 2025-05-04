package handlers

import (
	"music-player-gin/internal/models"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type SongHandler struct {
	db *gorm.DB
}

func NewSongHandler(db *gorm.DB) *SongHandler {
	return &SongHandler{db: db}
}

func (h *SongHandler) GetAllSongs(c *gin.Context) {
	var songs []models.Song
	if err := h.db.Find(&songs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch songs"})
		return
	}
	c.JSON(http.StatusOK, songs)
}


func (h *SongHandler) GetSongByID(c *gin.Context) {
	id := c.Param("id")
	var song models.Song
	if err := h.db.First(&song, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Song not found"})
		return
	}
	c.JSON(http.StatusOK, song)
}

func (h *SongHandler) UploadSong(c *gin.Context) {
	title := c.PostForm("title")
	artist := c.PostForm("artist")
	album := c.PostForm("album")
	genre := c.PostForm("genre")

	durationStr := c.PostForm("duration")
	duration := 0

	if durationStr != "" {
		var err error
		duration, err = strconv.Atoi(durationStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid duration"})
			return
		}
	}

	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File is required"})
		return
	}

	if !strings.HasSuffix(file.Filename, ".mp3") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only MP3 files are allowed"})
		return
	}

	uploadDir := "./uploads/songs"
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
		return
	}

	fileExt := filepath.Ext(file.Filename)
	fileName := strings.TrimSuffix(file.Filename, fileExt) + "_" + strconv.FormatInt(time.Now().Unix(), 10) + fileExt
	filePath := filepath.Join(uploadDir, fileName)

	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	song := models.Song{
		Title:    title,
		Artist:   artist,
		Album:    album,
		Genre:    genre,
		Duration: duration,
		FilePath: filePath,
		FileSize: file.Size,
	}

	if err := h.db.Create(&song).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create song"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Song uploaded successfully",
		"song":    song,
	})
}

func (h *SongHandler) PlaySong(c *gin.Context) {
	id := c.Param("id")

	var song models.Song
	if err := h.db.First(&song, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Song not found"})
		return
	}

	// Check if file exists
	if _, err := os.Stat(song.FilePath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
		return
	}

	// Set appropriate headers for MP3 file
	c.Header("Content-Description", "File Transfer")
	c.Header("Content-Transfer-Encoding", "binary")
	c.Header("Content-Disposition", "attachment; filename="+filepath.Base(song.FilePath))
	c.Header("Content-Type", "audio/mpeg")

	// Serve the file
	c.File(song.FilePath)
}

func (h *SongHandler) AddToFavourites(c *gin.Context) {
    userId, exists := c.Get("user_id")
    var isFavourited bool = false

    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
        return
    }

    songIDStr := c.Param("id")
    songID, err := strconv.Atoi(songIDStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid song ID"})
        return
    }

    // Check if the song exists
    var song models.Song
    if err := h.db.First(&song, songID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Song not found"})
        return
    }

    // Find the user
    var user models.User
    if err := h.db.First(&user, userId).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
        return
    }

    // Check if the song is already in favorites
    var count int64
    h.db.Table("user_favourite_songs").
        Where("user_id = ? AND song_id = ?", user.ID, song.ID).
        Count(&count)

    if count > 0 {
        // Song is already in favorites, remove it
        if err := h.db.Exec("DELETE FROM user_favourite_songs WHERE user_id = ? AND song_id = ?", user.ID, song.ID).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove song from favorites"})
            return
        }
    } else {
        // Song is not in favorites, add it
        if err := h.db.Exec("INSERT INTO user_favourite_songs (user_id, song_id) VALUES (?, ?)", user.ID, song.ID).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add song to favorites"})
            return
        }
        isFavourited = true
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "Song added to favorites",
        "song":    songID,
        "isFavourited": isFavourited,
    })
}

