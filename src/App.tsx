import { useState, useCallback } from 'react'
import './App.css'
import { analyzeSentenceWithGPT } from './utils/openai'
import { exampleSentences } from './data/exampleSentences'

// 防抖函数
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  };
}

function App() {
  const [sentence, setSentence] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isExample, setIsExample] = useState(false)
  const [showWechatQR, setShowWechatQR] = useState(false)
  const [hasInvalidChars, setHasInvalidChars] = useState(false)
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

  const tryExample = () => {
    const randomIndex = Math.floor(Math.random() * exampleSentences.length)
    const example = exampleSentences[randomIndex]
    setSentence(example.sentence)
    setAnalysis(example.analysis)
    setIsExample(true)
  }

  const handleSentenceChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newSentence = e.target.value
    setSentence(newSentence)
    
    // 检查是否包含中文或特殊字符
    const hasNonEnglishChars = /[^\x00-\x7F]|[^a-zA-Z0-9\s.,!?"'()\-]/.test(newSentence)
    setHasInvalidChars(hasNonEnglishChars)
    
    // 检查新输入的句子是否是示例句子
    const isExampleSentence = exampleSentences.some(example => example.sentence === newSentence)
    setIsExample(isExampleSentence)
  })

  return (
    <div className="container">
      <div className="title-section">
        <h1>SentenceFlow句流</h1>
        <p className="subtitle">基于AI的英语句子分析助手</p>
      </div>
      <div className="input-section">
        <textarea
          value={sentence}
          onChange={handleSentenceChange}
          placeholder="请输入要分析的英语句子..."
          rows={4}
          disabled={isLoading}
        />
        {hasInvalidChars && (
          <div className="error-message" style={{ color: 'red', marginTop: '8px' }}>
            请只输入英文字符、标点符号和数字，避免使用中文或其他特殊字符
          </div>
        )}
        <div className="button-group">
          <button 
            onClick={analyzeSentence} 
            disabled={isLoading || isExample || hasInvalidChars || !sentence.trim()} 
            className="analyze-btn"
          >
            {isLoading ? '分析中...' : '分析句子'}
          </button>
          <button onClick={tryExample} disabled={isLoading} className="try-btn">
            随便试试
          </button>
        </div>
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
          <p>Developed by 一个和长难句死磕的高中生<br/>每次看到从句就头皮发麻？<br/>明明检查了三遍作文还是被圈红？<br/>这个我用课余时间开发的工具，专治各种手残党专属语法病！<br/>如果你也对编程感兴趣，欢迎点击下方加我微信一起交流</p>
          <div className="social-links">
            <a href="https://github.com/anyuxurl" target="_blank" rel="noopener noreferrer">
              <img src="/github.svg" alt="GitHub" className="social-icon" />
            </a>
            <a href="https://twitter.com/yourusername" target="_blank" rel="noopener noreferrer">
              <img src="/twitter.svg" alt="Twitter" className="social-icon" />
            </a>
            <button onClick={() => setShowWechatQR(true)} className="wechat-btn">
              <img src="/wechat.svg" alt="WeChat" className="social-icon" />
            </button>
          </div>

          {showWechatQR && (
            <div className="qr-modal-overlay" onClick={() => setShowWechatQR(false)}>
              <div className="qr-modal" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={() => setShowWechatQR(false)}>&times;</button>
                <img src="/wechat-qr.jpeg" alt="微信二维码" className="modal-qr-code" />
                <p>扫码添加我的微信</p>
              </div>
            </div>
          )}
        </div>

        <div className="donate-section">
          <h3>赞赏支持</h3>
          <p>如果这个工具对你有帮助，欢迎赞赏支持～<br/>这个工具每月要喝掉我三杯奶茶钱（API真的好贵😭），如果它也让你的英语作业少挨几个红圈圈，欢迎扫码请开发者续杯珍珠奶茶～</p>
          <div className="qr-codes">
            <div className="qr-code-item">
              <img src="/wechat-qr-m.jpeg" alt="微信赞赏码" className="qr-code" />
              <span>微信赞赏</span>
            </div>
            <div className="qr-code-item">
              <img src="/alipay.jpeg" alt="支付宝收款码" className="qr-code" />
              <span>支付宝</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
