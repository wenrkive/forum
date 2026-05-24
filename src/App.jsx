import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'forum-react-posts'

const initialPosts = [
  {
    id: 1,
    title: 'Boas-vindas ao fórum',
    category: 'Geral',
    author: 'Admin',
    content: 'Este é o ponto de partida para o seu fórum em React. Adicione novos tópicos e organize a comunidade.',
    likes: 12,
    comments: [
      {
        id: 1,
        author: 'Ana',
        content: 'Que bom ter um início pronto para evoluir!',
      },
    ],
  },
  {
    id: 2,
    title: 'Sugestões para melhorias',
    category: 'Feedback',
    author: 'Maria',
    content: 'Compartilhe ideias para tornar o fórum mais útil e simples de usar.',
    likes: 7,
    comments: [
      {
        id: 2,
        author: 'João',
        content: 'Gostaria de ver busca por tópico e ordenação.',
      },
    ],
  },
  {
    id: 3,
    title: 'Dicas de como começar',
    category: 'Ajuda',
    author: 'Carlos',
    content: 'Use categorias para organizar discussões e incentivar a participação da comunidade.',
    likes: 5,
    comments: [],
  },
]

const categories = ['Todas', 'Geral', 'Feedback', 'Ajuda']

const loadPosts = () => {
  if (typeof window === 'undefined') {
    return initialPosts
  }

  try {
    const savedPosts = window.localStorage.getItem(STORAGE_KEY)

    if (!savedPosts) {
      return initialPosts
    }

    const parsedPosts = JSON.parse(savedPosts)

    if (!Array.isArray(parsedPosts) || parsedPosts.length === 0) {
      return initialPosts
    }

    return parsedPosts
  } catch {
    return initialPosts
  }
}

function App() {
  const [posts, setPosts] = useState(loadPosts)
  const [selectedCategory, setSelectedCategory] = useState('Todas')
  const [isHydrated, setIsHydrated] = useState(false)
  const [form, setForm] = useState({
    title: '',
    category: 'Geral',
    author: '',
    content: '',
  })
  const [commentForms, setCommentForms] = useState({})

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) {
      return
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
  }, [posts, isHydrated])

  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'Todas') {
      return posts
    }

    return posts.filter((post) => post.category === selectedCategory)
  }, [posts, selectedCategory])

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!form.title || !form.author || !form.content) {
      return
    }

    const newPost = {
      id: Date.now(),
      title: form.title,
      category: form.category,
      author: form.author,
      content: form.content,
      likes: 0,
      comments: [],
    }

    setPosts((currentPosts) => [newPost, ...currentPosts])
    setForm({
      title: '',
      category: 'Geral',
      author: '',
      content: '',
    })
  }

  const handleLike = (postId) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: post.likes + 1,
            }
          : post,
      ),
    )
  }

  const handleCommentSubmit = (postId, event) => {
    event.preventDefault()

    const comment = commentForms[postId]?.trim()

    if (!comment) {
      return
    }

    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...post.comments,
                {
                  id: Date.now() + Math.random(),
                  author: 'Anônimo',
                  content: comment,
                },
              ],
            }
          : post,
      ),
    )

    setCommentForms((currentForms) => ({
      ...currentForms,
      [postId]: '',
    }))
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Forum React</p>
          <h1>Um fórum moderno para comunidade e discussões</h1>
          <p className="subtitle">
            Agora com tópicos salvos no navegador e comentários para cada discussão.
          </p>
          <p className="hero-note">Os dados ficam salvos em localStorage, então você pode recarregar a página sem perder o conteúdo.</p>
        </div>
      </header>

      <main className="content-grid">
        <section className="panel">
          <h2>Criar novo tópico</h2>
          <form className="post-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Título"
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({ ...current, title: event.target.value }))
              }
            />
            <input
              type="text"
              placeholder="Autor"
              value={form.author}
              onChange={(event) =>
                setForm((current) => ({ ...current, author: event.target.value }))
              }
            />
            <select
              value={form.category}
              onChange={(event) =>
                setForm((current) => ({ ...current, category: event.target.value }))
              }
            >
              {categories.slice(1).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <textarea
              placeholder="Escreva sua mensagem"
              rows="5"
              value={form.content}
              onChange={(event) =>
                setForm((current) => ({ ...current, content: event.target.value }))
              }
            />
            <button type="submit">Publicar tópico</button>
          </form>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Discussões recentes</h2>
              <p className="panel-caption">Filtre por categoria e participe das conversas.</p>
            </div>
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="post-list">
            {filteredPosts.map((post) => (
              <article key={post.id} className="post-card">
                <div>
                  <p className="post-meta">
                    {post.category} • {post.author} • {post.comments.length} comentário(s)
                  </p>
                  <h3>{post.title}</h3>
                  <p>{post.content}</p>
                </div>

                <div className="post-actions">
                  <span>{post.likes} curtidas</span>
                  <button type="button" onClick={() => handleLike(post.id)}>
                    Curtir
                  </button>
                </div>

                <div className="comments-section">
                  <h4>Comentários</h4>

                  <div className="comments-list">
                    {post.comments.length === 0 ? (
                      <p className="empty-comments">Ainda não há comentários neste tópico.</p>
                    ) : (
                      post.comments.map((comment) => (
                        <div key={comment.id} className="comment-item">
                          <p className="comment-author">{comment.author}</p>
                          <p>{comment.content}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <form
                    className="comment-form"
                    onSubmit={(event) => handleCommentSubmit(post.id, event)}
                  >
                    <input
                      type="text"
                      placeholder="Deixe seu comentário"
                      value={commentForms[post.id] ?? ''}
                      onChange={(event) =>
                        setCommentForms((currentForms) => ({
                          ...currentForms,
                          [post.id]: event.target.value,
                        }))
                      }
                    />
                    <button type="submit">Comentar</button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
