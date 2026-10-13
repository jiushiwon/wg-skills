package utils

import "github.com/gin-gonic/gin"

type Resp struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

func Success(c *gin.Context, data interface{}) {
	c.JSON(200, Resp{Code: 0, Message: "ok", Data: data})
}

func Fail(c *gin.Context, status int, msg string) {
	c.JSON(status, Resp{Code: status, Message: msg})
}
