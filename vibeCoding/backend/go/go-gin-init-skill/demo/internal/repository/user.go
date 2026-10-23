package repository

import (
	"demo/internal/model"

	"gorm.io/gorm"
)

// UserRepository 用户仓储
type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(user *model.User) error {
	return r.db.Create(user).Error
}

func (r *UserRepository) FindByID(id uint) (*model.User, error) {
	var user model.User
	if err := r.db.First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// FindByUsername 按用户名查询，登录鉴权用
func (r *UserRepository) FindByUsername(username string) (*model.User, error) {
	var user model.User
	if err := r.db.Where("username = ?", username).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) List(page, size int) ([]model.User, int64, error) {
	var users []model.User
	var total int64
	r.db.Model(&model.User{}).Count(&total)
	offset := (page - 1) * size
	err := r.db.Offset(offset).Limit(size).Find(&users).Error
	return users, total, err
}

func (r *UserRepository) Update(user *model.User) error {
	return r.db.Save(user).Error
}

func (r *UserRepository) Delete(id uint) error {
	return r.db.Delete(&model.User{}, id).Error
}
