"use client";

import { rpc } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
 
function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
}

export default function CommentsSection() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  interface UserData {
    username: string;
  }
  
  useEffect(() => {
    const userdataCookie = getCookie("userdata");
    let parsedData: UserData | null = null;
  
    if (userdataCookie) {
      try {
        const parsed = JSON.parse(decodeURIComponent(userdataCookie));
        
        if (typeof parsed.username === 'string') {
          parsedData = parsed as UserData;
        }
      } catch (e) {
        console.warn("Failed to parse userdata cookie", e);
      }
    }
  
    setUsername(parsedData?.username || null);
  }, []);
  const sendComment = async () => {
    if (!username) {
      alert("You must be logged in to post a comment.");
      return;
    }
    if (!title.trim() || !content.trim()) {
      alert("Please fill in both title and content.");
      return;
    }

    setLoading(true);
    try {
      await rpc.api.comment.post({
        author: username,
        content: content,
        title: title,
      }); 
      setTitle("");
      setContent("");
      alert("Comment posted successfully!");
      router.push("/dashboard")
    } catch (error) {
      console.error("Failed to post comment:", error);
      alert("Failed to post comment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="bg-black p-8 rounded-lg border border-neutral-800 shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-white">Comments Section</h2>

        <input
          className="w-full mb-3 p-3 bg-black text-white border border-neutral-800 rounded"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full mb-5 p-3 bg-black text-white border border-neutral-800 rounded"
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
        />

        <button
          onClick={sendComment}
          disabled={loading}
          className={`w-full py-3 rounded font-semibold transition ${
            loading
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-white text-black hover:bg-gray-200"
          }`}
        >
          {loading ? "Posting..." : "Done"}
        </button>
      </div>
    </div>
  );
}