package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"music-player-gin/internal/models"
)

type AlbumHandler struct {
	db *gorm.DB
}


func NewAlbumHandler(db *gorm.DB) *AlbumHandler {
	return &AlbumHandler{db: db}
}

func (h *AlbumHandler) GetAllAlbums(c *gin.Context) {
	var albums []models.Album
	if err := h.db.Find(&albums).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch albums"})
		return
	}
	c.JSON(http.StatusOK, albums)
}

func (h *AlbumHandler) GetAlbumByID(c *gin.Context) {
	id := c.Param("id")
	var album models.Album
	if err := h.db.First(&album, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Album not found"})
		return
	}
	c.JSON(http.StatusOK, album)
}

func (h *AlbumHandler) CreateAlbum(c *gin.Context) {
	var album models.Album
	if err := c.ShouldBindJSON(&album); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	if err := h.db.Create(&album).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create album"})
		return
	}
	c.JSON(http.StatusCreated, album)
}