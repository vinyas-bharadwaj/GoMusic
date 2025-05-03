package handlers

import (
	"fmt"
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

// Add this function to your SongHandler
func (h *SongHandler) ShowPlayer(c *gin.Context) {
    id := c.Param("id")
    
    var song models.Song
    if err := h.db.First(&song, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Song not found"})
        return
    }
    
    html := fmt.Sprintf(`
    <!DOCTYPE html>
    <html>
        <head>
            <title>%s - %s | GoMusic Player</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f5f5f5;
                }
                .player-container {
                    background-color: #fff;
                    border-radius: 8px;
                    padding: 20px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .song-info {
                    margin-bottom: 20px;
                }
                h2 {
                    margin: 0;
                    color: #333;
                }
                .artist {
                    color: #666;
                    margin: 5px 0;
                }
                .album {
                    color: #888;
                    font-style: italic;
                }
                audio {
                    width: 100%%;
                    margin-top: 15px;
                }
                .controls {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 10px;
                }
                button {
                    background-color: #4CAF50;
                    color: white;
                    border: none;
                    padding: 8px 15px;
                    border-radius: 4px;
                    cursor: pointer;
                }
                button:hover {
                    background-color: #45a049;
                }
            </style>
        </head>
        <body>
            <div class="player-container">
                <div class="song-info">
                    <h2>%s</h2>
                    <p class="artist">%s</p>
                    <p class="album">Album: %s</p>
                    <p>Genre: %s</p>
                </div>
                <audio controls autoplay>
                    <source src="/songs/%s/play" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>
                <div class="controls">
                    <button onclick="window.history.back()">Back</button>
                    <button onclick="document.querySelector('audio').play()">Play</button>
                </div>
            </div>
        </body>
    </html>
    `, song.Title, song.Artist, song.Title, song.Artist, song.Album, song.Genre, id)
    
    c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(html))
}

// Add this function to your SongHandler
func (h *SongHandler) ShowSongList(c *gin.Context) {
    var songs []models.Song
    if err := h.db.Find(&songs).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch songs"})
        return
    }
    
    // Start building the HTML
    html := `
    <!DOCTYPE html>
    <html>
        <head>
            <title>GoMusic - Song Library</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }
                h1 {
                    color: #333;
                }
                .song-list {
                    list-style: none;
                    padding: 0;
                }
                .song-item {
                    border-bottom: 1px solid #eee;
                    padding: 15px 10px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .song-info {
                    flex-grow: 1;
                }
                .song-title {
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .song-artist {
                    color: #666;
                    font-size: 0.9em;
                }
                .song-album {
                    color: #888;
                    font-size: 0.8em;
                    font-style: italic;
                }
                .play-button {
                    background-color: #4CAF50;
                    color: white;
                    border: none;
                    padding: 8px 15px;
                    border-radius: 4px;
                    text-decoration: none;
                    font-size: 0.9em;
                }
                .play-button:hover {
                    background-color: #45a049;
                }
                .add-new {
                    margin-top: 20px;
                    text-align: right;
                }
                .add-button {
                    background-color: #2196F3;
                    color: white;
                    text-decoration: none;
                    padding: 10px 15px;
                    border-radius: 4px;
                    display: inline-block;
                }
                .add-button:hover {
                    background-color: #0b7dda;
                }
            </style>
        </head>
        <body>
            <h1>GoMusic Song Library</h1>
            <ul class="song-list">
    `
    
    // Add each song to the list
    for _, song := range songs {
        songHTML := fmt.Sprintf(`
        <li class="song-item">
            <div class="song-info">
                <div class="song-title">%s</div>
                <div class="song-artist">%s</div>
                <div class="song-album">%s</div>
            </div>
            <a href="/songs/%d/player" class="play-button">Play</a>
        </li>
        `, song.Title, song.Artist, song.Album, song.ID)
        
        html += songHTML
    }
    
    // Close the HTML
    html += `
            </ul>
            <div class="add-new">
                <a href="/songs/upload" class="add-button">Upload New Song</a>
            </div>
        </body>
    </html>
    `
    
    c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(html))
}