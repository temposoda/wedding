const SHEET_ID = "105idB8rdnBT5nqC9DuUE495Nxp3CIJk-Z7q0umeMhC8";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Gem, Quote } from "lucide-react";
import Papa from "papaparse";

interface AdviceEntry {
  name: string;
  relationship: string;
  advice: string;
}

const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;

function useCyclicRandomSelector<T>(list: T[]) {
  const originalList = useRef([...list]);
  const currentList = useRef([...list]);

  useEffect(() => {
    originalList.current = [...list];
    currentList.current = [...list];
  }, [list]);

  const getNext = useCallback((): T => {
    // If we've used up all elements, reset currentList from original
    console.log(currentList.current);
    if (currentList.current.length === 0) {
      currentList.current = [...originalList.current];
    }

    // Select a random index and remove that element
    const randomIndex = Math.floor(Math.random() * currentList.current.length);
    const [selectedItem] = currentList.current.splice(randomIndex, 1);
    return selectedItem;
  }, []);

  return getNext;
}

const WeddingAdvice: React.FC = () => {
  const [advice, setAdvice] = useState<AdviceEntry[]>([]);
  const [currentAdvice, setCurrentAdvice] = useState<AdviceEntry | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const getNextItem = useCyclicRandomSelector(advice);

  useEffect(() => {
    setMounted(true);
    const fetchAdvice = async (): Promise<void> => {
      try {
        const response = await fetch(SHEET_URL);
        const csvText = await response.text();
        const { data } = Papa.parse(csvText, {
          header: false, // if your first row isn't headers
          skipEmptyLines: true,
        });
        const entries: AdviceEntry[] = (data as string[][])
          .slice(1) // Skip header row
          .map(([name, relationship, advice]) => ({
            name,
            relationship,
            advice,
          }))
          .filter((entry) => entry.name && entry.advice);

        setAdvice(entries);
        setCurrentAdvice(entries[Math.floor(Math.random() * entries.length)]);
        setLoading(false);
      } catch (err) {
        setError("Failed to load wedding advice");
        setLoading(false);
      }
    };

    fetchAdvice();
  }, []);

  const showNextQuote = () => {
    if (isAnimating || advice.length <= 1) return;

    setIsAnimating(true);
    const nextAdvice = getNextItem();
    setTimeout(() => {
      setCurrentAdvice(nextAdvice);
      setIsAnimating(false);
    }, 600); // Match this with animation duration
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Opening advice...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-amber-50 to-white opacity-0 transition-opacity duration-1000 ${
        mounted ? "opacity-100" : ""
      }`}
    >
      <style jsx="true">{`
        @keyframes bookReveal {
          0% {
            transform: perspective(2000px) rotateY(-90deg);
            transform-origin: left;
            opacity: 0;
          }
          100% {
            transform: perspective(2000px) rotateY(0deg);
            transform-origin: left;
            opacity: 1;
          }
        }

        @keyframes pageLeave {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

        @keyframes pageEnter {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        .animate-book-reveal {
          animation: bookReveal 1.2s ease-out forwards;
          backface-visibility: hidden;
        }

        .page-leave {
          animation: pageLeave 0.6s ease-in forwards;
        }

        .page-enter {
          animation: pageEnter 0.6s ease-out forwards;
        }

        .book-border {
          border: 2px solid #964b00;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          background: linear-gradient(45deg, #f3e7d9, #fff);
        }

        .drop-cap::first-letter {
          float: left;
          font-family: "Rouge Script", Baskerville, serif;
          font-size: 5.1em;
          margin: 0em 0.3em -0.3em 0;
          line-height: 1;
          color: rgb(180, 83, 9);
          font-weight: bold;
        }

        .drop-cap-y::first-letter {
          float: left;
          font-family: "Rouge Script", Baskerville, serif;
          font-size: 5.1em;
          margin: 0em 0.1em 0em 0;
          line-height: 1;
          color: rgb(180, 83, 9);
          font-weight: bold;
        }

        .legible {
          max-width: 80ch;
        }
      `}</style>

      <header className="text-center py-12">
        <Gem className="mx-auto text-amber-700 w-16 h-16 mb-4" />
        <h1
          className="text-4xl font-serif mb-2"
          style={{ fontFamily: "Baskerville, serif" }}
        >
          Kiley & Michael
        </h1>
        <p className="text-gray-600">Click or tap to see more advice...</p>
      </header>

      <main className="container mx-auto px-4 pb-16">
        {currentAdvice && (
          <div
            className={`cursor-pointer ${
              isAnimating ? "page-leave" : "page-enter"
            } flex justify-center items-center`}
            onClick={showNextQuote}
          >
            <Card className="bg-white shadow-lg legible">
              <CardContent className="p-6">
                <p
                  className={`text-gray-800 mb-4 italic font-serif text-lg ${
                    currentAdvice.advice.toLowerCase().startsWith("y")
                      ? "drop-cap-y"
                      : "drop-cap"
                  }`}
                >
                  {currentAdvice.advice}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default WeddingAdvice;
