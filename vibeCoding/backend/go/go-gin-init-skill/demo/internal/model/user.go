package model

// User 用户模型
type User struct {
	ID        uint   `gorm:"primarykey" json:"id"`
	Username  string `gorm:"size:50;unique" json:"username"`
	Nickname  string `gorm:"size:50" json:"nickname"`
	Email     string `gorm:"size:100" json:"email"`
	Phone     string `gorm:"size:20" json:"phone"`
	Status    int    `gorm:"default:1" json:"status"`
	CreatedAt int64  `json:"createdAt"`
	UpdatedAt int64  `json:"updatedAt"`
}

func (User) TableName() string { return "wg_user" }
