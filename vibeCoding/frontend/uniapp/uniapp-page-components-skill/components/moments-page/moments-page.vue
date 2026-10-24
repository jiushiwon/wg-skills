<!--
  MomentsPage 朋友圈组件化页面（参考微信朋友圈）
  ============================================================
  结构：封面头图（含本人头像昵称）+ 动态列表
  每条动态：左头像 -> 右昵称 + 正文(可折叠) + 九宫格图片 + 时间/位置 + more 按钮
  点击 more 展开：点赞列表 + 评论列表
  自由化：
    - header / feed / like / comment 均有 slot，可整体替换；
    - likeList / commentList 直接传数组即可渲染微信风格样式；
    - 图片支持 1~9 宫格，imageColumns 可调列数。
-->
<template>
  <view class="moments">
    <view class="moments-header">
      <slot name="header">
        <view class="moments-cover">
          <image
            v-if="coverImage && !coverError"
            class="moments-cover-img"
            :src="coverImage"
            mode="aspectFill"
            @error="coverError = true"
          />
          <view v-else class="moments-cover-ph" />
          <view class="moments-me">
            <text class="moments-me-name">{{ myNickname }}</text>
            <view class="moments-me-avatar" @click="$emit('meClick')">
              <base-avatar :src="myAvatar" :name="myNickname || '我'" size="lg" />
            </view>
          </view>
        </view>
      </slot>
    </view>

    <view class="moments-list">
      <template v-if="feedList.length">
        <view v-for="feed in feedList" :key="feedKey(feed)" class="moments-feed">
          <slot name="feed" :feed="feed">
            <view class="feed-avatar" @click="$emit('avatarClick', feed)">
              <base-avatar :src="feed.avatar" :name="feed.nickname || '好友'" size="md" />
            </view>

            <view class="feed-main">
              <text class="feed-name">{{ feed.nickname }}</text>

              <view class="feed-content" @click="onContentClick(feed)">
                <text class="feed-content-text">{{ feedContent(feed) }}</text>
                <text v-if="needExpand(feed)" class="feed-expand">{{ feedExpanded(feed) ? '收起' : '全文' }}</text>
              </view>

              <view v-if="feed.images && feed.images.length" class="feed-images">
                <image
                  v-for="(img, i) in feed.images"
                  :key="i"
                  class="feed-image"
                  :src="img"
                  :style="imageStyle"
                  mode="aspectFill"
                  :lazy-load="true"
                  @click="$emit('imageClick', feed, i)"
                  @error="onFeedImageError(feed, i)"
                />
                <view v-for="(img, i) in feed.images" :key="'ph-' + i">
                  <view v-if="isFeedImageError(feed, i)" class="feed-image-ph" :style="imageStyle">
                    <text class="feed-image-ph-text">加载失败</text>
                  </view>
                </view>
              </view>

              <view class="feed-meta">
                <text class="feed-time">{{ feed.time }}</text>
                <text v-if="feed.location" class="feed-location">{{ feed.location }}</text>
                <view class="feed-more" @click="onMoreClick(feed)">
                  <text class="feed-more-icon">⋯</text>
                </view>
              </view>

              <view v-if="isSocialOpen(feed)" class="feed-social">
                <slot name="like" :feed="feed">
                  <view v-if="feed.likeList && feed.likeList.length" class="feed-like">
                    <text class="feed-like-thumb">赞</text>
                    <text class="feed-like-names">{{ likeNames(feed) }}</text>
                  </view>
                </slot>

                <slot name="comment" :feed="feed">
                  <view v-if="feed.commentList && feed.commentList.length" class="feed-comments">
                    <view
                      v-for="c in feed.commentList"
                      :key="c.id"
                      class="feed-comment"
                      @click="$emit('commentClick', feed, c)"
                    >
                      <text class="feed-comment-name">{{ c.nickname }}</text>
                      <template v-if="c.replyTo">
                        <text class="feed-comment-sep">回复</text>
                        <text class="feed-comment-name">{{ c.replyTo }}</text>
                      </template>
                      <text class="feed-comment-content">：{{ c.content }}</text>
                    </view>
                  </view>
                </slot>
              </view>
            </view>
          </slot>
        </view>
      </template>

      <slot v-else name="empty">
        <view class="moments-empty">
          <text class="moments-empty-text">还没有动态</text>
        </view>
      </slot>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

interface CommentItem {
  id: string | number
  nickname: string
  content: string
  replyTo?: string
}

interface MomentsFeed {
  id: string | number
  nickname: string
  avatar?: string
  content?: string
  images?: string[]
  time?: string
  location?: string
  likeList?: { id: string | number; nickname: string }[]
  commentList?: CommentItem[]
  /** 预展开（为 true 时无需点击 more 即展示点赞/评论与全文） */
  expanded?: boolean
}

interface Props {
  /** 动态列表 */
  feedList?: MomentsFeed[]
  /** 封面图 */
  coverImage?: string
  /** 本人昵称 */
  myNickname?: string
  /** 本人头像 */
  myAvatar?: string
  /** 正文超过该字数折叠为"全文" */
  collapseLongText?: number
  /** 图片宫格列数（1-3） */
  imageColumns?: number
}

const props = withDefaults(defineProps<Props>(), {
  feedList: () => [],
  coverImage: '',
  myNickname: '我',
  myAvatar: '',
  collapseLongText: 200,
  imageColumns: 3,
})

const emit = defineEmits<{
  meClick: []
  avatarClick: [feed: MomentsFeed]
  contentClick: [feed: MomentsFeed]
  imageClick: [feed: MomentsFeed, index: number]
  moreClick: [feed: MomentsFeed]
  commentClick: [feed: MomentsFeed, comment: CommentItem]
}>()

const coverError = ref(false)
const expandedFeeds = reactive(new Set<string | number>())
const socialFeeds = reactive(new Set<string | number>())

const imageStyle = computed(() => {
  const cols = Math.max(1, Math.min(3, props.imageColumns))
  const gapTimes = cols - 1
  return {
    width: `calc((100% - ${gapTimes} * var(--space-2, 8rpx)) / ${cols})`,
    aspectRatio: '1',
  }
})

function feedKey(feed: MomentsFeed) {
  return String(feed.id)
}

function feedExpanded(feed: MomentsFeed) {
  return !!(feed.expanded || expandedFeeds.has(feed.id))
}

function needExpand(feed: MomentsFeed) {
  return !!feed.content && feed.content.length > props.collapseLongText
}

function feedContent(feed: MomentsFeed) {
  const full = feed.content || ''
  if (needExpand(feed) && !feedExpanded(feed)) {
    return full.slice(0, props.collapseLongText) + '...'
  }
  return full
}

function onContentClick(feed: MomentsFeed) {
  if (!needExpand(feed)) return
  if (expandedFeeds.has(feed.id)) expandedFeeds.delete(feed.id)
  else expandedFeeds.add(feed.id)
  emit('contentClick', feed)
}

function isSocialOpen(feed: MomentsFeed) {
  return !!(feed.expanded || socialFeeds.has(feed.id))
}

function onMoreClick(feed: MomentsFeed) {
  if (socialFeeds.has(feed.id)) socialFeeds.delete(feed.id)
  else socialFeeds.add(feed.id)
  emit('moreClick', feed)
}

function likeNames(feed: MomentsFeed) {
  return (feed.likeList || []).map((l) => l.nickname).join('，')
}
</script>

<style lang="scss" scoped>
.moments {
  min-height: 100%;
  background: var(--bg-page, #fafafa);
}

/* ---- 封面头图 ---- */
.moments-cover {
  position: relative;
  width: 100%;
  height: 480rpx;
  background: var(--bg-card, #ffffff);
}

.moments-cover-img {
  width: 100%;
  height: 100%;
}

.moments-cover-ph {
  width: 100%;
  height: 100%;
  background: var(--bg-light, #f5f5f5);
}

.moments-me {
  position: absolute;
  right: var(--space-8, 32rpx);
  bottom: var(--space-6, 24rpx);
  display: flex;
  align-items: center;
}

.moments-me-name {
  margin-right: var(--space-6, 24rpx);
  font-size: var(--font-xl, 32rpx);
  font-weight: 600;
  color: var(--text-inverse, #ffffff);
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.4);
}

.moments-me-avatar {
  border: 4rpx solid var(--text-inverse, #ffffff);
  border-radius: var(--radius-avatar, 9999rpx);
  overflow: hidden;
}

/* ---- 动态列表 ---- */
.moments-list {
  padding: var(--space-6, 24rpx) 0 var(--space-16, 64rpx);
}

.moments-feed {
  display: flex;
  align-items: flex-start;
  padding: var(--space-6, 24rpx) var(--space-8, 32rpx);
}

.feed-avatar {
  flex-shrink: 0;
  margin-right: var(--space-6, 24rpx);
}

.feed-main {
  flex: 1;
  min-width: 0;
}

.feed-name {
  font-size: var(--font-md, 28rpx);
  font-weight: 600;
  color: var(--color-primary, #14b8a6);
}

.feed-content {
  margin-top: var(--space-2, 8rpx);
}

.feed-content-text {
  font-size: var(--font-md, 28rpx);
  line-height: 1.6;
  color: var(--text-primary, #171717);
  word-break: break-all;
}

.feed-expand {
  margin-left: var(--space-2, 8rpx);
  font-size: var(--font-md, 28rpx);
  color: var(--color-primary, #14b8a6);
}

.feed-images {
  display: flex;
  flex-wrap: wrap;
  margin-top: var(--space-4, 16rpx);
}

.feed-image {
  margin-right: var(--space-2, 8rpx);
  margin-bottom: var(--space-2, 8rpx);
  border-radius: var(--radius-image, 16rpx);
  background: var(--bg-card, #ffffff);
}

.feed-image-ph {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-image, 16rpx);
  background: var(--bg-light, #f5f5f5);
}

.feed-image-ph-text {
  font-size: var(--font-xs, 24rpx);
  color: var(--text-tertiary, #a3a3a3);
}

.feed-meta {
  display: flex;
  align-items: center;
  margin-top: var(--space-4, 16rpx);
}

.feed-time {
  font-size: var(--font-xs, 24rpx);
  color: var(--text-tertiary, #a3a3a3);
}

.feed-location {
  margin-left: var(--space-6, 24rpx);
  font-size: var(--font-xs, 24rpx);
  color: var(--color-primary, #14b8a6);
}

.feed-more {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-width: 88rpx;
  min-height: 88rpx;
  margin: calc(-1 * var(--space-6, 24rpx)) 0;
}

.feed-more-icon {
  font-size: var(--font-xl, 32rpx);
  color: var(--text-secondary, #525252);
  line-height: 1;
}

/* ---- 点赞 + 评论 ---- */
.feed-social {
  margin-top: var(--space-4, 16rpx);
  border-radius: var(--radius-sm, 8rpx);
  background: var(--bg-light, #f5f5f5);
  overflow: hidden;
}

.feed-like {
  display: flex;
  align-items: flex-start;
  padding: var(--space-4, 16rpx) var(--space-6, 24rpx);
}

.feed-like-thumb {
  flex-shrink: 0;
  margin-right: var(--space-4, 16rpx);
  font-size: var(--font-md, 28rpx);
  color: var(--text-primary, #171717);
}

.feed-like-names {
  flex: 1;
  font-size: var(--font-md, 28rpx);
  line-height: 1.5;
  color: var(--color-primary, #14b8a6);
}

.feed-comments {
  padding: 0 var(--space-6, 24rpx) var(--space-4, 16rpx);
}

.feed-comment {
  display: flex;
  flex-wrap: wrap;
  margin-top: var(--space-4, 16rpx);
}

.feed-comment-name {
  font-size: var(--font-md, 28rpx);
  line-height: 1.5;
  color: var(--color-primary, #14b8a6);
}

.feed-comment-sep {
  font-size: var(--font-md, 28rpx);
  color: var(--text-tertiary, #a3a3a3);
  margin: 0 var(--space-2, 8rpx);
}

.feed-comment-content {
  flex: 1;
  font-size: var(--font-md, 28rpx);
  line-height: 1.5;
  color: var(--text-primary, #171717);
  word-break: break-all;
}

.moments-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-24, 96rpx) 0;
}

.moments-empty-text {
  font-size: var(--font-md, 28rpx);
  color: var(--text-tertiary, #a3a3a3);
}
</style>
