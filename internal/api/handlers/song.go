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

func (h *SongHandler) ShowUploadForm(c *gin.Context) {
	html := `
    <!DOCTYPE html>
    <html>
        <head>
            <title>Upload Song</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                h2 {
                    color: #333;
                }
                div {
                    margin-bottom: 15px;
                }
                label {
                    display: block;
                    margin-bottom: 5px;
                }
                input[type="text"],
                input[type="number"] {
                    width: 100%;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }
                button {
                    background-color: #4CAF50;
                    color: white;
                    padding: 10px 15px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                button:hover {
                    background-color: #45a049;
                }
            </style>
        </head>
        <body>
            <h2>Upload MP3 Song</h2>
            <form action="/songs" method="post" enctype="multipart/form-data">
                <div>
                    <label for="title">Title:</label>
                    <input type="text" name="title" required>
                </div>
                <div>
                    <label for="artist">Artist:</label>
                    <input type="text" name="artist" required>
                </div>
                <div>
                    <label for="album">Album:</label>
                    <input type="text" name="album">
                </div>
                <div>
                    <label for="genre">Genre:</label>
                    <input type="text" name="genre">
                </div>
                <div>
                    <label for="duration">Duration (seconds):</label>
                    <input type="number" name="duration">
                </div>
                <div>
                    <label for="file">MP3 File:</label>
                    <input type="file" name="file" accept=".mp3" required>
                </div>
                <button type="submit">Upload</button>
            </form>
        </body>
    </html>
    `
	c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(html))
}

