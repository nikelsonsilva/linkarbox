import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { FileItem } from '../types';
import { Sparkles, LoaderCircle } from 'lucide-react';

// This is a placeholder for the API key.
// In a real application, this should be handled securely and not be hardcoded.
const API_KEY = process.env.API_KEY;

interface AIAnalysisProps {
  item: FileItem;
}

const AIAnalysis: React.FC<AIAnalysisProps> = ({ item }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (!item.content || !API_KEY) {
      setError('No content to analyze or API key is missing.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSummary(null);

    try {
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Summarize the following document concisely for an architect. Focus on key decisions, action items, and important figures or dates. Here is the document content:\n\n---\n\n${item.content}`,
      });
      
      setSummary(response.text);
    } catch (e) {
      console.error('Gemini API error:', e);
      setError('Failed to get summary from AI. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [item.content, item.name]);

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-3">AI Assistant</h3>
      <p className="text-sm text-gray-500 mb-4">
        Generate a quick summary of this file's content to identify key points and decisions.
      </p>
      
      <button 
        onClick={handleAnalyze}
        disabled={isLoading || !item.content}
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
        <div className="mt-6 bg-primary/5 p-4 rounded-xl border border-primary/20">
            <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                AI Summary
            </h4>
            <div className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                {summary}
            </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
