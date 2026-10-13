package service

import (
	"demo/internal/model"
	"demo/internal/repository"
)

// UserService 用户业务逻辑
type UserService struct {
	repo *repository.UserRepository
}

func NewUserService(repo *repository.UserRepository) *UserService {
	return &UserService{repo: repo}
}

func (s *UserService) Create(user *model.User) error {
	return s.repo.Create(user)
}

func (s *UserService) Get(id uint) (*model.User, error) {
	return s.repo.FindByID(id)
}

func (s *UserService) List(page, size int) ([]model.User, int64, error) {
	return s.repo.List(page, size)
}

func (s *UserService) Update(user *model.User) error {
	return s.repo.Update(user)
}

func (s *UserService) Delete(id uint) error {
	return s.repo.Delete(id)
}
