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
              <image
                v-if="myAvatar && !meAvatarError"
                class="moments-me-avatar-img"
                :src="myAvatar"
                mode="aspectFill"
                @error="meAvatarError = true"
              />
              <view v-else class="moments-me-avatar-ph">
                <text class="moments-me-avatar-ph-text">{{ (myNickname || '我').slice(0, 1) }}</text>
              </view>
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
              <image
                v-if="feed.avatar && !isFeedAvatarError(feed)"
                class="feed-avatar-img"
                :src="feed.avatar"
                mode="aspectFill"
                @error="onFeedAvatarError(feed)"
              />
              <view v-else class="feed-avatar-ph">
                <text class="feed-avatar-ph-text">{{ (feed.nickname || '好友').slice(0, 1) }}</text>
              </view>
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
const meAvatarError = ref(false)
const feedAvatarErrors = reactive(new Set<string | number>())
const feedImageErrors = reactive(new Set<string>())
const expandedFeeds = reactive(new Set<string | number>())
const socialFeeds = reactive(new Set<string | number>())

const imageStyle = computed(() => {
  const cols = Math.max(1, Math.min(3, props.imageColumns))
  const gapTimes = cols - 1
  return {
    width: `calc((100% - ${gapTimes} * var(--spacing-xs)) / ${cols})`,
    aspectRatio: '1',
  }
})

function feedKey(feed: MomentsFeed) {
  return String(feed.id)
}

function isFeedAvatarError(feed: MomentsFeed) {
  return feedAvatarErrors.has(feed.id)
}

function onFeedAvatarError(feed: MomentsFeed) {
  feedAvatarErrors.add(feed.id)
}

function feedImageKey(feed: MomentsFeed, i: number) {
  return `${feed.id}:${i}`
}

function isFeedImageError(feed: MomentsFeed, i: number) {
  return feedImageErrors.has(feedImageKey(feed, i))
}

function onFeedImageError(feed: MomentsFeed, i: number) {
  feedImageErrors.add(feedImageKey(feed, i))
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
  background: var(--color-bg-page);
}

/* ---- 封面头图 ---- */
.moments-cover {
  position: relative;
  width: 100%;
  height: 480rpx;
  background: var(--color-bg-surface);
}

.moments-cover-img {
  width: 100%;
  height: 100%;
}

.moments-cover-ph {
  width: 100%;
  height: 100%;
  background: var(--color-bg-tinted);
}

.moments-me {
  position: absolute;
  right: var(--spacing-lg);
  bottom: var(--spacing-md);
  display: flex;
  align-items: center;
}

.moments-me-name {
  margin-right: var(--spacing-md);
  font-size: var(--font-xl);
  font-weight: 600;
  color: var(--white);
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.4);
}

.moments-me-avatar {
  width: var(--height-avatar-lg);
  height: var(--height-avatar-lg);
  border-radius: var(--radius-avatar);
  border: 4rpx solid var(--white);
  overflow: hidden;
}

.moments-me-avatar-img {
  width: 100%;
  height: 100%;
}

.moments-me-avatar-ph {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: var(--color-bg-tinted);
}

.moments-me-avatar-ph-text {
  font-size: var(--font-2xl);
  color: var(--color-primary);
}

/* ---- 动态列表 ---- */
.moments-list {
  padding: var(--spacing-md) 0 var(--spacing-2xl);
}

.moments-feed {
  display: flex;
  align-items: flex-start;
  padding: var(--spacing-md) var(--spacing-lg);
}

.feed-avatar {
  flex-shrink: 0;
  width: var(--height-avatar-md);
  height: var(--height-avatar-md);
  border-radius: var(--radius-avatar);
  overflow: hidden;
  margin-right: var(--spacing-md);
}

.feed-avatar-img {
  width: 100%;
  height: 100%;
}

.feed-avatar-ph {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: var(--color-bg-tinted);
}

.feed-avatar-ph-text {
  font-size: var(--font-lg);
  color: var(--color-primary);
}

.feed-main {
  flex: 1;
  min-width: 0;
}

.feed-name {
  font-size: var(--font-md);
  font-weight: 600;
  color: var(--color-primary);
}

.feed-content {
  margin-top: var(--spacing-xs);
}

.feed-content-text {
  font-size: var(--font-md);
  line-height: 1.6;
  color: var(--color-text-primary);
  word-break: break-all;
}

.feed-expand {
  margin-left: var(--spacing-xs);
  font-size: var(--font-md);
  color: var(--color-primary);
}

.feed-images {
  display: flex;
  flex-wrap: wrap;
  margin-top: var(--spacing-sm);
}

.feed-image {
  margin-right: var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
  border-radius: var(--radius-image);
  background: var(--color-bg-surface);
}

.feed-image-ph {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-image);
  background: var(--color-bg-tinted);
}

.feed-image-ph-text {
  font-size: var(--font-xs);
  color: var(--color-text-tertiary);
}

.feed-meta {
  display: flex;
  align-items: center;
  margin-top: var(--spacing-sm);
}

.feed-time {
  font-size: var(--font-xs);
  color: var(--color-text-tertiary);
}

.feed-location {
  margin-left: var(--spacing-md);
  font-size: var(--font-xs);
  color: var(--color-primary);
}

.feed-more {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-width: 88rpx;
  min-height: 88rpx;
  margin: calc(-1 * var(--spacing-md)) 0;
}

.feed-more-icon {
  font-size: var(--font-xl);
  color: var(--color-text-secondary);
  line-height: 1;
}

/* ---- 点赞 + 评论 ---- */
.feed-social {
  margin-top: var(--spacing-sm);
  border-radius: var(--radius-sm);
  background: var(--color-bg-tinted);
  overflow: hidden;
}

.feed-like {
  display: flex;
  align-items: flex-start;
  padding: var(--spacing-sm) var(--spacing-md);
}

.feed-like-thumb {
  flex-shrink: 0;
  margin-right: var(--spacing-sm);
  font-size: var(--font-md);
  color: var(--color-text-primary);
}

.feed-like-names {
  flex: 1;
  font-size: var(--font-md);
  line-height: 1.5;
  color: var(--color-primary);
}

.feed-comments {
  padding: 0 var(--spacing-md) var(--spacing-sm);
}

.feed-comment {
  display: flex;
  flex-wrap: wrap;
  margin-top: var(--spacing-sm);
}

.feed-comment-name {
  font-size: var(--font-md);
  line-height: 1.5;
  color: var(--color-primary);
}

.feed-comment-sep {
  font-size: var(--font-md);
  color: var(--color-text-tertiary);
  margin: 0 var(--spacing-xs);
}

.feed-comment-content {
  flex: 1;
  font-size: var(--font-md);
  line-height: 1.5;
  color: var(--color-text-primary);
  word-break: break-all;
}

.moments-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl) 0;
}

.moments-empty-text {
  font-size: var(--font-md);
  color: var(--color-text-tertiary);
}
</style>
