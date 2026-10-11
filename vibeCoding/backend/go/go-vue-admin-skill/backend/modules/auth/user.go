package auth

import (
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// SysUser 用户表
type SysUser struct {
	ID        uint      `gorm:"primarykey" json:"id"`
	Username  string    `gorm:"size:50;unique;not null" json:"username"`
	Password  string    `gorm:"size:128;not null" json:"-"`
	Nickname  string    `gorm:"size:50" json:"nickname"`
	Phone     string    `gorm:"size:20" json:"phone"`
	Email     string    `gorm:"size:100" json:"email"`
	Avatar    string    `gorm:"size:255" json:"avatar"`
	Status    int       `gorm:"default:1" json:"status"`
	DeptID    *uint     `json:"deptId"`
	LoginIP   string    `gorm:"size:50" json:"loginIp"`
	LoginDate *time.Time `json:"loginDate"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func (SysUser) TableName() string { return "sys_user" }

func (u *SysUser) BeforeSave(tx *gorm.DB) error {
	if u.Password != "" {
		hash, _ := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
		u.Password = string(hash)
	}
	return nil
}

func (u *SysUser) CheckPassword(password string) bool {
	return bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password)) == nil
}

// SysRole 角色表
type SysRole struct {
	ID          uint      `gorm:"primarykey" json:"id"`
	Name        string    `gorm:"size:50;not null" json:"name"`
	Code        string    `gorm:"size:50;not null" json:"code"`
	Description string    `gorm:"size:255" json:"description"`
	Status      int       `gorm:"default:1" json:"status"`
	Sort        int       `json:"sort"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

func (SysRole) TableName() string { return "sys_role" }

// SysMenu 菜单表
type SysMenu struct {
	ID        uint      `gorm:"primarykey" json:"id"`
	ParentID  uint      `json:"parentId"`
	Name      string    `gorm:"size:50;not null" json:"name"`
	Path      string    `gorm:"size:255" json:"path"`
	Component string    `gorm:"size:255" json:"component"`
	MenuType  string    `gorm:"size:1;default:M" json:"menuType"`
	Title     string    `gorm:"size:50" json:"title"`
	Icon      string    `gorm:"size:50" json:"icon"`
	Sort      int       `json:"sort"`
	Visible   int       `gorm:"default:1" json:"visible"`
	Perms    string    `gorm:"size:100" json:"perms"`
	KeepAlive int      `gorm:"default:1" json:"keepAlive"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func (SysMenu) TableName() string { return "sys_menu" }

// SysDept 部门表
type SysDept struct {
	ID        uint      `gorm:"primarykey" json:"id"`
	ParentID  uint      `json:"parentId"`
	Name      string    `gorm:"size:50;not null" json:"name"`
	Leader    string    `gorm:"size:50" json:"leader"`
	Phone     string    `gorm:"size:20" json:"phone"`
	Email     string    `gorm:"size:100" json:"email"`
	Sort      int       `json:"sort"`
	Status    int       `gorm:"default:1" json:"status"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func (SysDept) TableName() string { return "sys_dept" }

// SysApp 应用表
type SysApp struct {
	ID          uint      `gorm:"primarykey" json:"id"`
	AppName    string    `gorm:"size:100;not null" json:"appName"`
	AppKey     string    `gorm:"size:64;unique;not null" json:"appKey"`
	OwnerID    uint      `gorm:"not null" json:"ownerId"`
	Description string   `gorm:"size:255" json:"description"`
	Status     int       `gorm:"default:1" json:"status"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

func (SysApp) TableName() string { return "sys_app" }

// SysAppKey 应用密钥表
type SysAppKey struct {
	ID        uint      `gorm:"primarykey" json:"id"`
	AppID    uint      `gorm:"not null" json:"appId"`
	APIKey   string    `gorm:"size:64;unique;not null" json:"apiKey"`
	APISecret string   `gorm:"size:128;not null" json:"apiSecret"`
	Status    int       `gorm:"default:1" json:"status"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func (SysAppKey) TableName() string { return "sys_app_key" }

// SysAppBinding 用户绑定表
type SysAppBinding struct {
	ID        uint      `gorm:"primarykey" json:"id"`
	UserID    uint      `gorm:"not null" json:"userId"`
	AppID     uint      `gorm:"not null" json:"appId"`
	AppUserID string    `gorm:"size:128" json:"appUserID"`
	BindType  string    `gorm:"size:20" json:"bindType"`
	UnionID   string    `gorm:"size:128" json:"unionID"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func (SysAppBinding) TableName() string { return "sys_app_binding" }

// SysBindCode 绑定码表
type SysBindCode struct {
	ID        uint      `gorm:"primarykey" json:"id"`
	Code      string    `gorm:"size:64;unique;not null" json:"code"`
	UserID    uint      `gorm:"not null" json:"userId"`
	AppID     uint      `gorm:"not null" json:"appId"`
	BindType  string    `gorm:"size:20" json:"bindType"`
	ExpiresAt time.Time `json:"expiresAt"`
	Status    int       `gorm:"default:1" json:"status"`
	CreatedAt time.Time `json:"createdAt"`
}

func (SysBindCode) TableName() string { return "sys_bind_code" }
