import React from 'react'
import './style-1.css'

interface ArticleDetailProps {
  title?: string
  author?: { name: string; avatar: string }
  date?: string
  category?: string
  cover?: string
  content?: string
  tags?: string[]
}

export default function ArticleDetail({
  title = '文章标题',
  author = { name: '作者', avatar: '' },
  date = '2024-01-01',
  category = '分类',
  cover = '',
  content = '文章内容...',
  tags = []
}: ArticleDetailProps) {
  return (
    <div className="article-detail">
      <article className="article-detail__content">
        <header className="article-detail__header">
          <div className="article-detail__meta">
            <span className="article-detail__category">{category}</span>
            <span className="article-detail__date">{date}</span>
          </div>
          <h1 className="article-detail__title">{title}</h1>
          <div className="article-detail__author">
            <span className="article-detail__avatar" style={author.avatar ? { backgroundImage: `url(${author.avatar})` } : {}}>{author.avatar ? '' : author.name[0]}</span>
            <span className="article-detail__author-name">{author.name}</span>
          </div>
        </header>
        {cover && <div className="article-detail__cover"><img src={cover} alt={title} /></div>}
        <div className="article-detail__body">
          {content.split('\n').map((p, i) => <p key={i}>{p}</p>)}
          <div className="article-detail__tags">
            {tags.map(tag => <span key={tag} className="article-detail__tag">{tag}</span>)}
          </div>
        </div>
      </article>
    </div>
  )
}
