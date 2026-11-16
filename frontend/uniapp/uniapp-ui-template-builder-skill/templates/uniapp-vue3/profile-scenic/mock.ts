import type { ScenicProfile, ScenicId } from './types'
const presets: ScenicProfile[] = [
  {
    "id": "glacier",
    "theme": "fresh",
    "title": "冰川玻璃",
    "english": "GLACIER CLUB",
    "slogan": "探索生活的另一种可能",
    "description": "会员服务与预约，安排好每一天",
    "nickname": "林间来信",
    "subtitle": "编辑资料 · 本地模拟用户",
    "avatar": "",
    "image": {
      "backgroundSrc": "/static/profile-scenic/glacier-background.jpg"
    },
    "modules": [
      {
        "id": "stats",
        "kind": "stats",
        "title": "我的数据",
        "items": [
          {
            "id": "0",
            "label": "可用积分",
            "icon": "eye",
            "value": "1,280"
          },
          {
            "id": "1",
            "label": "优惠礼券",
            "icon": "eye",
            "value": "08"
          },
          {
            "id": "2",
            "label": "服务预约",
            "icon": "eye",
            "value": "03"
          }
        ]
      },
      {
        "id": "member",
        "kind": "banner",
        "title": "解锁你的专属礼遇",
        "subtitle": "本月会员精选，为你准备",
        "action": {
          "id": "membership",
          "label": "查看权益",
          "icon": "gem"
        }
      },
      {
        "id": "tools",
        "kind": "grid",
        "title": "常用服务",
        "items": [
          {
            "id": "appointment",
            "label": "我的预约",
            "icon": "calendar-days"
          },
          {
            "id": "tickets",
            "label": "我的礼券",
            "icon": "ticket"
          },
          {
            "id": "perks",
            "label": "会员权益",
            "icon": "gem"
          },
          {
            "id": "support",
            "label": "专属客服",
            "icon": "headset"
          }
        ]
      },
      {
        "id": "account",
        "kind": "list",
        "title": "更多与我有关",
        "items": [
          {
            "id": "favorites",
            "label": "我的收藏",
            "icon": "heart"
          },
          {
            "id": "security",
            "label": "账号与安全",
            "icon": "shield-check"
          },
          {
            "id": "settings",
            "label": "设置与帮助",
            "icon": "settings"
          }
        ]
      }
    ]
  },
  {
    "id": "coral",
    "theme": "warm",
    "title": "珊瑚潮流",
    "english": "STYLE & MORE",
    "slogan": "把喜欢的日常装进口袋",
    "description": "好物、礼券和订单，都在这里",
    "nickname": "小可的好物间",
    "subtitle": "编辑资料 · 本地模拟用户",
    "avatar": "",
    "image": {
      "backgroundSrc": "/static/profile-scenic/coral-background.jpg"
    },
    "modules": [
      {
        "id": "member",
        "kind": "banner",
        "title": "STYLE CLUB 会员",
        "subtitle": "本月专享礼券已到账",
        "action": {
          "id": "membership",
          "label": "查看权益",
          "icon": "gem"
        }
      },
      {
        "id": "orders",
        "kind": "grid",
        "title": "我的订单",
        "items": [
          {
            "id": "unpaid",
            "label": "待付款",
            "icon": "wallet"
          },
          {
            "id": "packing",
            "label": "待发货",
            "icon": "package"
          },
          {
            "id": "shipping",
            "label": "待收货",
            "icon": "truck"
          },
          {
            "id": "review",
            "label": "待评价",
            "icon": "message-square"
          }
        ]
      },
      {
        "id": "duo",
        "kind": "duo",
        "title": "我的资产",
        "items": [
          {
            "id": "coupons",
            "label": "6 张优惠券",
            "icon": "ticket",
            "description": "有 2 张即将到期"
          },
          {
            "id": "points",
            "label": "积分好礼",
            "icon": "gift",
            "description": "今天也有小惊喜"
          }
        ]
      },
      {
        "id": "account",
        "kind": "list",
        "title": "更多与我有关",
        "items": [
          {
            "id": "favorites",
            "label": "收藏好物",
            "icon": "heart"
          },
          {
            "id": "address",
            "label": "收货地址",
            "icon": "map-pin"
          },
          {
            "id": "aftercare",
            "label": "售后与客服",
            "icon": "headset"
          }
        ]
      }
    ]
  },
  {
    "id": "aurora",
    "theme": "dark",
    "title": "极光夜色",
    "english": "NIGHT EXPLORER",
    "slogan": "保持热爱，探索未知",
    "description": "记录创作，遇见同频的伙伴",
    "nickname": "夜航者",
    "subtitle": "编辑资料 · 本地模拟用户",
    "avatar": "",
    "image": {
      "backgroundSrc": "/static/profile-scenic/aurora-background.jpg"
    },
    "modules": [
      {
        "id": "stats",
        "kind": "stats",
        "title": "我的数据",
        "items": [
          {
            "id": "0",
            "label": "作品",
            "icon": "eye",
            "value": "28"
          },
          {
            "id": "1",
            "label": "关注者",
            "icon": "eye",
            "value": "1.2k"
          },
          {
            "id": "2",
            "label": "收藏",
            "icon": "eye",
            "value": "96"
          }
        ]
      },
      {
        "id": "member",
        "kind": "banner",
        "title": "夜航通行证",
        "subtitle": "解锁社群活动与专属装扮",
        "action": {
          "id": "membership",
          "label": "查看权益",
          "icon": "gem"
        }
      },
      {
        "id": "studio",
        "kind": "grid",
        "title": "创作工作台",
        "items": [
          {
            "id": "creation",
            "label": "我的创作",
            "icon": "edit"
          },
          {
            "id": "materials",
            "label": "素材收藏",
            "icon": "layers"
          },
          {
            "id": "community",
            "label": "我的社群",
            "icon": "message-square"
          },
          {
            "id": "badges",
            "label": "成就徽章",
            "icon": "gem"
          }
        ]
      },
      {
        "id": "challenge",
        "kind": "feature",
        "title": "今晚的灵感",
        "subtitle": "为你的世界加一点光",
        "action": {
          "id": "challenge",
          "label": "查看创作挑战",
          "icon": "edit"
        }
      },
      {
        "id": "account",
        "kind": "list",
        "title": "更多与我有关",
        "items": [
          {
            "id": "favorites",
            "label": "我的收藏",
            "icon": "heart"
          },
          {
            "id": "security",
            "label": "账号与安全",
            "icon": "shield-check"
          },
          {
            "id": "settings",
            "label": "设置与帮助",
            "icon": "settings"
          }
        ]
      }
    ]
  },
  {
    "id": "forest",
    "theme": "fresh",
    "title": "森林露营",
    "english": "INTO THE WILD",
    "slogan": "下一站，去有风的地方",
    "description": "收藏路线，安排下一次出发",
    "nickname": "山野有风",
    "subtitle": "编辑资料 · 本地模拟用户",
    "avatar": "",
    "image": {
      "backgroundSrc": "/static/profile-scenic/forest-background.jpg"
    },
    "modules": [
      {
        "id": "trip",
        "kind": "feature",
        "title": "MY NEXT ESCAPE",
        "subtitle": "周末，去山里坐坐",
        "action": {
          "id": "trip",
          "label": "查看我的行程",
          "icon": "map-pin"
        }
      },
      {
        "id": "stats",
        "kind": "stats",
        "title": "我的数据",
        "items": [
          {
            "id": "0",
            "label": "探索目的地",
            "icon": "eye",
            "value": "12"
          },
          {
            "id": "1",
            "label": "户外时长",
            "icon": "eye",
            "value": "36"
          },
          {
            "id": "2",
            "label": "同行伙伴",
            "icon": "eye",
            "value": "08"
          }
        ]
      },
      {
        "id": "duo",
        "kind": "duo",
        "title": "我的出行",
        "items": [
          {
            "id": "booking",
            "label": "活动预约",
            "icon": "calendar-days",
            "description": "下次出发就在周六"
          },
          {
            "id": "routes",
            "label": "收藏路线",
            "icon": "map-pin",
            "description": "把想去的地方存起来"
          }
        ]
      },
      {
        "id": "account",
        "kind": "list",
        "title": "更多与我有关",
        "items": [
          {
            "id": "orders",
            "label": "我的订单",
            "icon": "receipt"
          },
          {
            "id": "travelers",
            "label": "出行人信息",
            "icon": "contact"
          },
          {
            "id": "leader",
            "label": "联系领队",
            "icon": "headset"
          }
        ]
      }
    ]
  },
  {
    "id": "cloud",
    "theme": "glass",
    "title": "奶油云朵",
    "english": "A LITTLE EVERY DAY",
    "slogan": "慢慢来，每一步都算数",
    "description": "阅读、记录与日常的小小坚持",
    "nickname": "小满同学",
    "subtitle": "编辑资料 · 本地模拟用户",
    "avatar": "",
    "image": {
      "backgroundSrc": "/static/profile-scenic/cloud-background.jpg"
    },
    "modules": [
      {
        "id": "growth",
        "kind": "progress",
        "title": "今天也有一点进步",
        "subtitle": "连续打卡，小小坚持",
        "streakDays": 21,
        "progress": 68
      },
      {
        "id": "duo",
        "kind": "duo",
        "title": "我的日常",
        "items": [
          {
            "id": "books",
            "label": "我的书架",
            "icon": "layers",
            "description": "正在读 3 本书"
          },
          {
            "id": "notes",
            "label": "灵感手记",
            "icon": "edit",
            "description": "记录了 16 个瞬间"
          }
        ]
      },
      {
        "id": "member",
        "kind": "banner",
        "title": "给自己一份小奖励",
        "subtitle": "320 成长积分，去兑换好心情",
        "action": {
          "id": "membership",
          "label": "查看权益",
          "icon": "gem"
        }
      },
      {
        "id": "daily",
        "kind": "grid",
        "title": "我的日常",
        "items": [
          {
            "id": "favorites",
            "label": "我的收藏",
            "icon": "heart"
          },
          {
            "id": "plans",
            "label": "打卡计划",
            "icon": "calendar-days"
          },
          {
            "id": "badges",
            "label": "成长徽章",
            "icon": "gem"
          },
          {
            "id": "groups",
            "label": "我的小组",
            "icon": "message-square"
          }
        ]
      },
      {
        "id": "account",
        "kind": "list",
        "title": "更多与我有关",
        "items": [
          {
            "id": "favorites",
            "label": "我的收藏",
            "icon": "heart"
          },
          {
            "id": "security",
            "label": "账号与安全",
            "icon": "shield-check"
          },
          {
            "id": "settings",
            "label": "设置与帮助",
            "icon": "settings"
          }
        ]
      }
    ]
  },
  {
    "id": "solid",
    "theme": "business",
    "backgroundMode": "solid-rings",
    "title": "个人中心",
    "english": "MY EVERYDAY",
    "slogan": "你好，欢迎回来",
    "description": "把常用服务放在手边",
    "nickname": "微信用户",
    "subtitle": "编辑资料 · 本地模拟用户",
    "avatar": "",
    "image": {
      "backgroundSrc": ""
    },
    "modules": [
      {
        "id": "tools",
        "kind": "grid",
        "title": "常用服务",
        "items": [
          {
            "id": "favorites",
            "label": "我的收藏",
            "icon": "heart"
          },
          {
            "id": "history",
            "label": "浏览足迹",
            "icon": "eye"
          },
          {
            "id": "following",
            "label": "我的关注",
            "icon": "contact"
          },
          {
            "id": "appointments",
            "label": "我的预约",
            "icon": "calendar-days"
          }
        ]
      },
      {
        "id": "settings",
        "kind": "list",
        "title": "我的账户",
        "items": [
          {
            "id": "address",
            "label": "地址管理",
            "icon": "map-pin"
          },
          {
            "id": "security",
            "label": "账号与安全",
            "icon": "shield-check"
          },
          {
            "id": "support",
            "label": "帮助与客服",
            "icon": "headset"
          },
          {
            "id": "settings",
            "label": "设置",
            "icon": "settings"
          }
        ]
      }
    ]
  }
]
export const scenicOptions = presets.map(({id,title})=>({id,title}))
export function createScenicProfile(id: ScenicId): ScenicProfile {
 const value=presets.find(item=>item.id===id)
 if(!value) throw new Error('未知场景：'+id)
 return JSON.parse(JSON.stringify(value))
}
