package models

import (
	"gorm.io/gorm"
)

type Song struct {
	gorm.Model
	Title       string `json:"title"`
	Artist      string `json:"artist"`
	Album       string `json:"album"`
	Genre       string `json:"genre"`
	Duration    int    `json:"duration"` 
	FilePath    string    `json:"file_path"`     // Path to the stored MP3 file
    FileSize    int64     `json:"file_size"`     // Size of the file in bytes
	Playlists   []Playlist `json:"playlists" gorm:"many2many:playlist_songs;"` // Many-to-many relationship with playlists
}

type Playlist struct {
    gorm.Model
    Name        string `json:"name"`
    Description string `json:"description,omitempty"`
	UserID      uint   `json:"user_id"`
    Songs       []Song `json:"songs" gorm:"many2many:playlist_songs;"` // Many-to-many relationship with songs
}