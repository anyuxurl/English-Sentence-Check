import { useState } from 'react'
import './App.css'
import { analyzeSentenceWithGPT } from './utils/openai'

function App() {
  const [sentence, setSentence] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState<{
    components: string[]
    clauses: string[]
    errors: { message: string; suggestion: string }[]
  } | null>(null)

  const analyzeSentence = async () => {
    if (!sentence.trim()) {
      alert('请输入要分析的句子')
      return
    }

    setIsLoading(true)
    try {
      const result = await analyzeSentenceWithGPT(sentence)
      setAnalysis(result)
    } catch (error) {
      console.error('分析句子时出错:', error)
      alert('分析句子时出错，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="title-section">
        <h1>SentenceFlow句流</h1>
        <p className="subtitle">基于AI的英语句子分析助手</p>
      </div>
      <div className="input-section">
        <textarea
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
          placeholder="请输入要分析的英语句子..."
          rows={4}
          disabled={isLoading}
        />
        <button onClick={analyzeSentence} disabled={isLoading}>
          {isLoading ? '分析中...' : '分析句子'}
        </button>
      </div>
      
      {analysis && (
        <div className="analysis-section">
          <div className="analysis-block">
            <h2>句子成分</h2>
            <ul>
              {analysis.components.map((component, index) => (
                <li key={index}>{component}</li>
              ))}
            </ul>
          </div>
          
          <div className="analysis-block">
            <h2>从句分析</h2>
            <div className="clauses-list">
              {analysis.clauses.map((clause, index) => (
                <div key={index} className="clause-item">
                  <div className="clause-type">{clause.type}</div>
                  <div className="clause-content">{clause.content}</div>
                  <div className="clause-description">{clause.description}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="analysis-block">
            <h2>语法检查</h2>
            {analysis.errors.map((error, index) => (
              <div key={index} className="error-item">
                <p className="error-message">{error.message}</p>
                <p className="error-suggestion">{error.suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <footer className="footer">
        <div className="author-section">
          <h3>关于作者</h3>
          <p>Kevin Cheng，</p>
          <div className="social-links">
            <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer">
              <img src="/github.svg" alt="GitHub" className="social-icon" />
            </a>
            <a href="https://twitter.com/yourusername" target="_blank" rel="noopener noreferrer">
              <img src="/twitter.svg" alt="Twitter" className="social-icon" />
            </a>
          </div>
        </div>

        <div className="donate-section">
          <h3>赞赏支持</h3>
          <p>如果这个工具对你有帮助，欢迎赞赏支持～</p>
          <div className="qr-codes">
            <div className="qr-code-item">
              <img src="/wechat-qr.svg" alt="微信赞赏码" className="qr-code" />
              <span>微信赞赏</span>
            </div>
            <div className="qr-code-item">
              <img src="/alipay-qr.svg" alt="支付宝收款码" className="qr-code" />
              <span>支付宝</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
