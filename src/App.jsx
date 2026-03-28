import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import ChatPage from "./pages/ChatPage";
import "./tokens.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"             element={<Landing />} />
        <Route path="/scholarships" element={<ChatPage feature="scholarships" />} />
        <Route path="/fafsa"        element={<ChatPage feature="fafsa" />} />
        <Route path="/essay"        element={<ChatPage feature="essay" />} />
        <Route path="/roadmap"      element={<ChatPage feature="roadmap" />} />
      </Routes>
    </BrowserRouter>
  );
}
