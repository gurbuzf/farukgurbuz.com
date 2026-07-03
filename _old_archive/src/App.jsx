import './App.css'
import 'react-vertical-timeline-component/style.min.css';
import { BrowserRouter, Route,Routes } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop';
import Home from './page/Home';
import MyBlog from './page/MyBlog';
import BlogDetail from './page/BlogDetail';

function App() {


  return (
    <>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/blog" element={<MyBlog />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
        </Routes>

      </BrowserRouter>
    </>
  )
}

export default App
