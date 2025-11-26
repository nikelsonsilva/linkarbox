import React, { useState, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { FileItem } from '../types';
import { Sparkles, LoaderCircle } from 'lucide-react';

// SECURITY: API key is now loaded from environment variables
// Add VITE_GEMINI_API_KEY to your .env.local file
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

interface AIAnalysisProps {
  item: FileItem;
  onFetchContent?: (item: FileItem) => Promise<string | null>;
}

const AIAnalysis: React.FC<AIAnalysisProps> = ({ item, onFetchContent }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSummary(null);

    try {
      let contentToAnalyze = item.content;

      // If no content (cloud file), try to fetch it
      if (!contentToAnalyze && onFetchContent) {
        contentToAnalyze = await onFetchContent(item) || undefined;
      }

      if (!contentToAnalyze) {
        throw new Error("Could not retrieve file content for analysis.");
      }

      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent(`Summarize the following document concisely for an architect.Focus on key decisions, action items, and important figures or dates.Here is the document content: \n\n-- -\n\n${contentToAnalyze.substring(0, 10000)} `);
      const response = await result.response;
      const text = response.text();

      setSummary(text);
    } catch (e: any) {
      console.error('Gemini API error:', e);
      setError(e.message || 'Failed to get summary from AI. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [item, onFetchContent]);

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-3">AI Assistant</h3>
      <p className="text-sm text-gray-500 mb-4">
        Generate a quick summary of this file's content to identify key points and decisions.
      </p>

      <button
        onClick={handleAnalyze}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-full text-sm font-semibold hover:bg-primary-hover transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <LoaderCircle className="w-5 h-5 animate-spin" />
        ) : (
          <Sparkles className="w-5 h-5" />
        )}
        <span>{isLoading ? 'Analyzing...' : 'Analyze with IA'}</span>
      </button>

      {error && <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

      {summary && (
        <div className="mt-6 bg-primary/5 p-4 rounded-xl border border-primary/20 animate-fade-in">
          <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI Summary
          </h4>
          <div className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
            {summary}
          </div>
        </div>
      )}
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
        }
       `}</style>
    </div>
  );
};

export default AIAnalysis;
